export interface ParsedStatement {
  is_bank_statement?: boolean;
  rejection_reason?: string | null;
  bank_name: string | null;
  account_number_mask: string | null;
  statement_period: string | null;
  total_deposits: number | null;
  total_withdrawals: number | null;
  nsf_count: number | null;
}

export interface ModelOption {
  id: string;
  label: string;
  tier: "FAST" | "REASONING";
  badge: string;
  description: string;
}

export const MODELS: ModelOption[] = [
  {
    id: "@cf/meta/llama-3.2-3b-instruct",
    label: "Llama 3.2 3B",
    tier: "FAST",
    badge: "Fast Tier (2-4s)",
    description: "Lightweight, ultra-fast extraction for digital statements.",
  },
  {
    id: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
    label: "DeepSeek R1 32B",
    tier: "REASONING",
    badge: "Reasoning (12-15s)",
    description: "Advanced chain-of-thought reasoning for complex bank statements.",
  },
  {
    id: "@cf/qwen/qwq-32b",
    label: "Qwen QwQ 32B",
    tier: "REASONING",
    badge: "Analytical (12-15s)",
    description: "High-precision analytical reasoning for multi-page statements.",
  },
];

export interface HistoryDocument {
  id: string;
  file_name: string;
  bank_name: string | null;
  statement_period: string | null;
  total_deposits: number | null;
  total_withdrawals: number | null;
  model_used: string;
  created_at: string;
  raw_json: string;
}

export interface ParseResponse {
  success: boolean;
  data?: ParsedStatement;
  error?: string;
  is_cached: boolean;
  model_used: string;
  processing_time_ms: number;
}

