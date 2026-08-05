import { ParsedStatement } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { fmtCurrency } from "@/lib/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface StatementDetailsGridProps {
  data: ParsedStatement;
}

function renderConfidenceBadge(score?: number | null) {
  if (score === undefined || score === null) {
    return null;
  }

  const pct = Math.round(score > 1 ? score : score * 100);

  if (pct >= 90) {
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
        {pct}% Confidence
      </Badge>
    );
  }

  if (pct >= 75) {
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal bg-amber-500/10 text-amber-600 border-amber-500/20">
        {pct}% Confidence
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-normal">
      {pct}% Low Confidence
    </Badge>
  );
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
    <Card>
      <CardHeader className="py-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Extracted Statement Details</CardTitle>
        <span className="text-xs text-muted-foreground font-normal">AI Uncertainty Metrics</span>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            {details.map((item) => (
              <TableRow key={item.label}>
                <TableCell className="font-medium text-muted-foreground text-xs w-1/3">
                  {item.label}
                </TableCell>
                <TableCell className="text-sm text-foreground">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span>{item.value}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-normal">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {renderConfidenceBadge(item.confidence)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
