import { ParsedStatement } from "@/lib/types";

const SYSTEM_PROMPT = `You are an expert financial document parser.

Task 1: Determine if the provided text is from a Bank Statement or Financial Account Statement.
- A valid bank statement contains bank branding, account identifiers, statement periods, or financial summaries (deposits/withdrawals).
- Invoices, utility bills, receipts, tax forms (W2/1099), resumes, or letters are NOT bank statements. If invalid, set "is_bank_statement": false and provide a concise "rejection_reason".

Task 2: If it IS a bank statement, extract all financial metrics with high precision.
- bank_name: Name of the banking institution (e.g. Bank of America, Chase, Wells Fargo).
- account_number_mask: Masked account number (e.g. ****1234) if visible.
- statement_period: Full date range of the statement (e.g. "July 1, 2021 through July 31, 2021").
- total_deposits: Total amount of deposits/credits as a number (float/int).
- total_withdrawals: Total amount of withdrawals/debits as a number (float/int).
- nsf_count: Count of NSF/Overdraft fee occurrences (0 if none found).

Rules:
- Return ONLY valid raw JSON matching the schema below with no markdown formatting (\`\`\`json) or extra text.
- Use null for any numeric or string fields that cannot be reliably found.

Schema:
{
  "is_bank_statement": boolean,
  "rejection_reason": string or null,
  "bank_name": string or null,
  "account_number_mask": string or null,
  "statement_period": string or null,
  "total_deposits": number or null,
  "total_withdrawals": number or null,
  "nsf_count": number or null
}`;

function parseJSON(text: string): ParsedStatement | null {
  if (typeof text !== "string") return null;
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.substring(start, end + 1));
    } catch (err) {
      console.warn("Failed to parse extracted JSON from LLM response:", err);
    }
  }
  return null;
}

export async function runLLM(
  ai: Ai,
  modelId: string,
  text: string
): Promise<ParsedStatement | null> {
  const isFastModel = modelId.includes("3b");
  const maxTokens = isFastModel ? 1024 : 3072;

  try {
    const res = (await ai.run(modelId as Parameters<typeof ai.run>[0], {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text.trim().slice(0, 100000) },
      ],
      max_tokens: maxTokens,
      temperature: 0,
    })) as { response?: string } | string;

    const rawText = typeof res === "string" ? res : res?.response || "";
    return parseJSON(rawText);
  } catch (err) {
    console.error(`LLM execution error [${modelId}]:`, err);
    return null;
  }
}
