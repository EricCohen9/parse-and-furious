import { ParsedStatement } from "@/lib/types";

const SYSTEM_PROMPT = `You are an expert financial document parser and MCA underwriting assistant.

Task 1: Determine if the provided text is from a Bank Statement or Financial Account Statement.
- A valid bank statement contains bank branding, account identifiers, statement periods, or financial summaries (deposits/withdrawals).
- Invoices, utility bills, receipts, tax forms (W2/1099), resumes, or letters are NOT bank statements. If invalid, set "is_bank_statement": false and provide a concise "rejection_reason".

Task 2: If it IS a bank statement, extract all financial metrics with high precision.
- NSF / Overdraft Count: Look for line items or fee summaries with terms like "NSF FEE", "RETURN ITEM FEE", "OVERDRAFT FEE", or "INSUFFICIENT FUNDS". Count total occurrences (0 if none found).
- MCA (Merchant Cash Advance) Stacking:
  - Check for recurring daily (Monday-Friday) or weekly ACH debit payments made to short-term business lenders or cash advance companies (e.g., RapidAdvance, Yellowstone, OnDeck, Kabbage, Fundbox, Forward Financing, Libertas, Biz2Credit, etc.).
  - Set "mca_stacking_detected": true if 2 or more distinct lenders or daily payment streams are identified. Otherwise set false.
  - List detected lender names in "mca_lenders_detected" array.
  - Provide a concise summary of detected MCA activity in "mca_explanation" (e.g. "Detected 2 active daily MCA debits from RapidAdvance ($300/day) and Yellowstone ($450/day)").

- Task 3: Output a "confidence_scores" object with float ratings from 0.00 to 1.00 for key extracted fields based on text clarity and presence.

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
  "deposit_count": number or null,
  "withdrawal_count": number or null,
  "avg_daily_balance": number or null,
  "nsf_count": number or null,
  "mca_stacking_detected": boolean or null,
  "mca_lenders_detected": string[] or null,
  "mca_explanation": string or null,
  "confidence_scores": {
    "bank_name": number or null,
    "statement_period": number or null,
    "total_deposits": number or null,
    "total_withdrawals": number or null,
    "avg_daily_balance": number or null,
    "nsf_count": number or null,
    "mca_stacking_detected": number or null
  }
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
  const cleanText = text.length > 15000 ? text.slice(0, 15000) : text;
  const isFastModel = modelId.includes("3b");
  const maxTokens = isFastModel ? 1024 : 3072;

  try {
    const res = (await ai.run(modelId as Parameters<typeof ai.run>[0], {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: cleanText },
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
