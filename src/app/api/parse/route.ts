import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { MODELS, ParseResponse } from "@/lib/types";
import { hashFile } from "@/lib/parser/hash";
import { getCachedDocument, saveDocument } from "@/lib/parser/db";
import { extractText } from "@/lib/parser/extractor";
import { runLLM } from "@/lib/parser/llm";

export const dynamic = "force-dynamic";

function createResponse(
  success: boolean,
  modelId: string,
  startTime: number,
  options: { data?: ParseResponse["data"]; error?: string; is_cached?: boolean; status?: number }
) {
  const { data, error, is_cached = false, status = 200 } = options;
  return NextResponse.json<ParseResponse>(
    {
      success,
      data,
      error,
      is_cached,
      model_used: modelId,
      processing_time_ms: Date.now() - startTime,
    },
    { status }
  );
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let modelId = MODELS[0].id;

  try {
    const { env, ctx } = getCloudflareContext();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    modelId = (formData.get("model") as string) || MODELS[0].id;

    if (!file || !MODELS.some((m) => m.id === modelId)) {
      return createResponse(false, modelId, startTime, {
        error: !file ? "No file uploaded." : "Invalid model selected.",
        status: 400,
      });
    }

    const buffer = await file.arrayBuffer();
    const fileHash = await hashFile(buffer);

    const cached = await getCachedDocument(env.DB, fileHash);
    if (cached) {
      return createResponse(true, cached.model_used, startTime, {
        data: JSON.parse(cached.raw_json),
        is_cached: true,
      });
    }

    const extractedText = await extractText(env.AI, file, buffer);
    if (!extractedText || extractedText.trim().length < 30) {
      return createResponse(false, modelId, startTime, {
        error: "Could not extract text from this document. Please upload a clear bank statement PDF or image.",
        status: 422,
      });
    }

    const MAX_TEXT_LENGTH = 100000;
    if (extractedText.length > MAX_TEXT_LENGTH) {
      return createResponse(false, modelId, startTime, {
        error: "Extracted document text exceeds the maximum allowed limit (100,000 characters). Please upload a standard bank statement.",
        status: 422,
      });
    }

    const parsed = await runLLM(env.AI, modelId, extractedText);
    if (!parsed) {
      const is3BModel = modelId.includes("3b");
      const errorMessage = is3BModel
        ? "This document is too complex or large for the 3B model. Please select a larger model like DeepSeek Reasoning or Qwen Reasoning from the dropdown above."
        : "AI could not parse this document into valid JSON. Please try a different model.";

      return createResponse(false, modelId, startTime, {
        error: errorMessage,
        status: 422,
      });
    }

    if (parsed.is_bank_statement === false || (!parsed.bank_name && !parsed.total_deposits && !parsed.total_withdrawals)) {
      return createResponse(false, modelId, startTime, {
        error: parsed.rejection_reason || "This document does not appear to be a valid bank statement.",
        status: 422,
      });
    }

    ctx.waitUntil(saveDocument(env.DB, fileHash, file.name, parsed, modelId));

    return createResponse(true, modelId, startTime, { data: parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An internal error occurred.";
    return createResponse(false, modelId, startTime, {
      error: `Server Error: ${message}`,
      status: 500,
    });
  }
}
