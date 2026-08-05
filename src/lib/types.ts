export interface ParsedStatement {
  is_bank_statement?: boolean;
  rejection_reason?: string | null;
  bank_name: string | null;
  account_number_mask: string | null;
  statement_period: string | null;
  total_deposits: number | null;
  total_withdrawals: number | null;
  deposit_count: number | null;
  withdrawal_count: number | null;
  avg_daily_balance: number | null;
  nsf_count: number | null;
  mca_stacking_detected: boolean | null;
  mca_explanation?: string | null;
  mca_lenders_detected?: string[] | null;
  confidence_scores?: ConfidenceScores | null;
}

export interface ConfidenceScores {
  bank_name?: number | null;
  statement_period?: number | null;
  total_deposits?: number | null;
  total_withdrawals?: number | null;
  avg_daily_balance?: number | null;
  nsf_count?: number | null;
  mca_stacking_detected?: number | null;
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
    description: "Advanced chain-of-thought for complex or stacked MCA debits.",
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

