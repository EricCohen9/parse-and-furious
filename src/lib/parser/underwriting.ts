import { ParsedStatement } from "@/lib/types";

export interface UnderwritingSummary {
  riskScore: number;
  riskTier: "LOW" | "MEDIUM" | "HIGH";
  recommendation: "APPROVED" | "CONDITIONAL" | "DECLINED";
  recommendedFunding: number;
  reasons: string[];
}

export function calculateUnderwritingSummary(data: ParsedStatement): UnderwritingSummary {
  let score = 0;
  const reasons: string[] = [];

  const deposits = data.total_deposits ?? 0;
  const withdrawals = data.total_withdrawals ?? 0;
  const adb = data.avg_daily_balance ?? 0;
  const nsf = data.nsf_count ?? 0;
  const isStacking = !!data.mca_stacking_detected;

  if (isStacking) {
    score += 40;
    reasons.push("Multiple active MCA daily/weekly ACH debits detected (Stacking Risk).");
  }

  if (nsf >= 5) {
    score += 35;
    reasons.push(`High NSF/Overdraft count (${nsf} instances detected).`);
  } else if (nsf >= 3) {
    score += 25;
    reasons.push(`Moderate NSF/Overdraft count (${nsf} instances).`);
  } else if (nsf >= 1) {
    score += 15;
    reasons.push(`Minor NSF/Overdraft count (${nsf} instance).`);
  }

  const netFlow = deposits - withdrawals;
  if (deposits > 0) {
    const netFlowRatio = netFlow / deposits;
    if (netFlowRatio < 0) {
      score += 25;
      reasons.push("Negative monthly net cash flow (withdrawals exceed deposits).");
    } else if (netFlowRatio < 0.1) {
      score += 10;
      reasons.push("Tight net cash flow margin (under 10% retained balance).");
    }
  }

  if (deposits > 0) {
    const adbRatio = adb / deposits;
    if (adbRatio < 0.05 || adb < 1000) {
      score += 15;
      reasons.push("Low Average Daily Balance buffer relative to monthly deposit volume.");
    }
  }

  score = Math.min(100, Math.max(0, score));

  let riskTier: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let recommendation: "APPROVED" | "CONDITIONAL" | "DECLINED" = "APPROVED";
  let fundingMultiplier = 1.0;

  if (score >= 65) {
    riskTier = "HIGH";
    recommendation = "DECLINED";
    fundingMultiplier = 0.0;
  } else if (score >= 35) {
    riskTier = "MEDIUM";
    recommendation = "CONDITIONAL";
    fundingMultiplier = 0.5;
  } else {
    riskTier = "LOW";
    recommendation = "APPROVED";
    fundingMultiplier = 1.0;
  }

  const baseCap = deposits * 0.12;
  const recommendedFunding = Math.round(baseCap * fundingMultiplier);

  if (reasons.length === 0) {
    reasons.push("Strong deposit volume with clean account history and positive cash flow.");
  }

  return {
    riskScore: score,
    riskTier,
    recommendation,
    recommendedFunding,
    reasons,
  };
}
