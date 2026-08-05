import { ParsedStatement } from "@/lib/types";

export async function getCachedDocument(db: D1Database, fileHash: string) {
  return db
    .prepare("SELECT raw_json, model_used FROM documents WHERE file_hash = ?")
    .bind(fileHash)
    .first<{ raw_json: string; model_used: string }>();
}

export async function saveDocument(
  db: D1Database,
  fileHash: string,
  fileName: string,
  parsed: ParsedStatement,
  modelId: string
) {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO documents (
        id, file_hash, file_name, bank_name, account_number_mask,
        statement_period, total_deposits, total_withdrawals, nsf_count,
        raw_json, model_used
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      fileHash,
      fileName,
      parsed.bank_name ?? null,
      parsed.account_number_mask ?? null,
      parsed.statement_period ?? null,
      parsed.total_deposits ?? null,
      parsed.total_withdrawals ?? null,
      parsed.nsf_count ?? null,
      JSON.stringify(parsed),
      modelId
    )
    .run();
}

export async function getRecentDocuments(db: D1Database, limit: number = 10) {
  const { results } = await db
    .prepare(
      `SELECT id, file_name, bank_name, statement_period, total_deposits, total_withdrawals, raw_json, model_used, created_at
       FROM documents
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .bind(limit)
    .all();
  return (results || []) as unknown as import("@/lib/types").HistoryDocument[];
}

