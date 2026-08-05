import { ParsedStatement } from "@/lib/types";
import { calculateUnderwritingSummary } from "@/lib/parser/underwriting";
import { fmtCurrency } from "@/lib/formatters";
import {
  IconShieldCheck,
  IconShieldExclamation,
  IconAlertTriangle,
  IconCheck,
  IconAlertCircle,
  IconX,
  IconCurrencyDollar,
  IconBrain,
} from "@tabler/icons-react";

interface UnderwritingCardProps {
  data: ParsedStatement;
}

export function UnderwritingCard({ data }: UnderwritingCardProps) {
  const summary = calculateUnderwritingSummary(data);

  const getStatusColorClass = () => {
    switch (summary.riskTier) {
      case "LOW":
        return "bg-success";
      case "MEDIUM":
        return "bg-warning";
      case "HIGH":
        return "bg-danger";
    }
  };

  const getTierBadge = () => {
    switch (summary.riskTier) {
      case "LOW":
        return (
          <span className="badge bg-green-lt d-flex align-items-center gap-1 p-2">
            <IconShieldCheck size={16} /> Low Risk ({summary.riskScore}/100)
          </span>
        );
      case "MEDIUM":
        return (
          <span className="badge bg-warning-lt d-flex align-items-center gap-1 p-2">
            <IconAlertTriangle size={16} /> Medium Risk ({summary.riskScore}/100)
          </span>
        );
      case "HIGH":
        return (
          <span className="badge bg-red-lt d-flex align-items-center gap-1 p-2">
            <IconShieldExclamation size={16} /> High Risk ({summary.riskScore}/100)
          </span>
        );
    }
  };

  const getRecommendationBadge = () => {
    switch (summary.recommendation) {
      case "APPROVED":
        return (
          <span className="badge bg-success-lt d-flex align-items-center gap-1 p-2">
            <IconCheck size={16} /> Approved
          </span>
        );
      case "CONDITIONAL":
        return (
          <span className="badge bg-warning-lt d-flex align-items-center gap-1 p-2">
            <IconAlertCircle size={16} /> Conditional Review
          </span>
        );
      case "DECLINED":
        return (
          <span className="badge bg-danger-lt d-flex align-items-center gap-1 p-2">
            <IconX size={16} /> Declined
          </span>
        );
    }
  };

  return (
    <div className="card mt-4">
      <div className={`card-status-start ${getStatusColorClass()}`}></div>
      <div className="card-header d-flex align-items-center justify-content-between">
        <div>
          <h3 className="card-title mb-0">Underwriting Risk & Funding Decision</h3>
          <small className="text-secondary">
            Automated MCA underwriting evaluation based on statement cash flow & risk indicators
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          {getTierBadge()}
          {getRecommendationBadge()}
        </div>
      </div>

      <div className="card-body">
        <div className="row g-3 mb-4 bg-body-tertiary p-3 rounded border">
          <div className="col-md-6">
            <div className="subheader mb-1">Max Recommended Advance</div>
            <div className="h2 m-0 text-success d-flex align-items-center gap-1">
              <IconCurrencyDollar size={24} />
              {summary.recommendedFunding > 0 ? fmtCurrency(summary.recommendedFunding) : "$0 (Decline)"}
            </div>
            <small className="text-secondary">
              {summary.recommendation === "APPROVED"
                ? "Based on 12% baseline deposit capacity"
                : summary.recommendation === "CONDITIONAL"
                ? "50% risk-adjusted reduction applied"
                : "No funding recommended due to high risk"}
            </small>
          </div>

          <div className="col-md-6">
            <div className="subheader mb-1">MCA Debt Stacking</div>
            <div className="mt-1">
              {data.mca_stacking_detected ? (
                <span className="badge bg-red-lt p-2">Stacking Flagged</span>
              ) : (
                <span className="badge bg-green-lt p-2">Clean (No Stacking)</span>
              )}
            </div>
            <small className="text-secondary d-block mt-1">
              {data.mca_stacking_detected
                ? "Multiple concurrent daily ACH MCA debits detected"
                : "No evidence of multi-lender daily debit stacking"}
            </small>
          </div>
        </div>

        <div className="mb-3">
          <div className="font-weight-bold text-body mb-2">Underwriting Insights & Risk Triggers</div>
          <ul className="list-unstyled mb-0 space-y-1">
            {summary.reasons.map((reason, idx) => (
              <li key={idx} className="d-flex align-items-start gap-2 mb-1">
                <span className="badge bg-primary rounded-circle p-1 mt-1"></span>
                <span className="text-secondary" style={{ fontSize: "0.85rem" }}>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {data.mca_explanation && (
          <div className="alert alert-info bg-blue-lt border-blue mb-0">
            <div className="d-flex align-items-center gap-2 font-weight-bold mb-1">
              <IconBrain size={18} />
              <span>AI Reasoning & Explanation</span>
            </div>
            <p className="mb-1 text-secondary" style={{ fontSize: "0.85rem" }}>
              {data.mca_explanation}
            </p>
            {data.mca_lenders_detected && data.mca_lenders_detected.length > 0 && (
              <div className="d-flex align-items-center gap-2 mt-2">
                <span className="text-body font-weight-bold" style={{ fontSize: "0.75rem" }}>
                  Detected Lenders:
                </span>
                {data.mca_lenders_detected.map((lender, i) => (
                  <span key={i} className="badge bg-blue-lt">
                    {lender}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
