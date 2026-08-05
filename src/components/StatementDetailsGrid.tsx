import { ParsedStatement } from "@/lib/types";
import { fmtCurrency } from "@/lib/formatters";

interface StatementDetailsGridProps {
  data: ParsedStatement;
}

function renderConfidenceBadge(score?: number | null) {
  if (score === undefined || score === null) {
    return null;
  }

  const pct = Math.round(score > 1 ? score : score * 100);

  if (pct >= 90) {
    return <span className="badge bg-success-lt">{pct}% Confidence</span>;
  }

  if (pct >= 75) {
    return <span className="badge bg-warning-lt">{pct}% Confidence</span>;
  }

  return <span className="badge bg-danger-lt">{pct}% Low Confidence</span>;
}

export function StatementDetailsGrid({ data }: StatementDetailsGridProps) {
  const cs = data.confidence_scores;

  const details = [
    { label: "Bank Name", value: data.bank_name || "—", confidence: cs?.bank_name },
    { label: "Statement Period", value: data.statement_period || "—", confidence: cs?.statement_period },
    { label: "Account Number (Masked)", value: data.account_number_mask || "—" },
    { label: "Average Daily Balance", value: fmtCurrency(data.avg_daily_balance) ?? "—", confidence: cs?.avg_daily_balance },
    { label: "Total Deposits", value: fmtCurrency(data.total_deposits) ?? "—", confidence: cs?.total_deposits },
    { label: "Total Withdrawals", value: fmtCurrency(data.total_withdrawals) ?? "—", confidence: cs?.total_withdrawals },
    { label: "Deposit Count", value: data.deposit_count !== null ? `${data.deposit_count} deposits` : "—" },
    { label: "Withdrawal Count", value: data.withdrawal_count !== null ? `${data.withdrawal_count} withdrawals` : "—" },
    {
      label: "NSF / Overdraft Count",
      value: data.nsf_count !== null ? String(data.nsf_count) : "0",
      badge: data.nsf_count && data.nsf_count > 0 ? "Flagged" : null,
      confidence: cs?.nsf_count,
    },
  ];

  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="card-title mb-0">Extracted Statement Details</h3>
        <small className="text-secondary">AI Confidence & Uncertainty Scores</small>
      </div>
      <div className="table-responsive">
        <table className="table table-vcenter card-table">
          <thead>
            <tr>
              <th>Field Metric</th>
              <th>Extracted Value</th>
              <th className="text-end">AI Confidence</th>
            </tr>
          </thead>
          <tbody>
            {details.map((item) => (
              <tr key={item.label}>
                <td className="text-secondary font-weight-bold">{item.label}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className="font-weight-bold">{item.value}</span>
                    {item.badge && <span className="badge bg-red-lt">{item.badge}</span>}
                  </div>
                </td>
                <td className="text-end">{renderConfidenceBadge(item.confidence)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
