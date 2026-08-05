import { ParsedStatement } from "@/lib/types";
import { calculateUnderwritingSummary } from "@/lib/parser/underwriting";
import { fmtCurrency } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, AlertTriangle, DollarSign, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface UnderwritingCardProps {
  data: ParsedStatement;
}

export function UnderwritingCard({ data }: UnderwritingCardProps) {
  const summary = calculateUnderwritingSummary(data);

  const getTierBadge = () => {
    switch (summary.riskTier) {
      case "LOW":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium">
            <ShieldCheck className="size-3.5 mr-1" />
            Low Risk ({summary.riskScore}/100)
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-medium">
            <AlertTriangle className="size-3.5 mr-1" />
            Medium Risk ({summary.riskScore}/100)
          </Badge>
        );
      case "HIGH":
        return (
          <Badge variant="destructive" className="font-medium">
            <ShieldAlert className="size-3.5 mr-1" />
            High Risk ({summary.riskScore}/100)
          </Badge>
        );
    }
  };

  const getRecommendationBadge = () => {
    switch (summary.recommendation) {
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle2 className="size-3 mr-1" />
            Approved
          </Badge>
        );
      case "CONDITIONAL":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <AlertCircle className="size-3 mr-1" />
            Conditional Review
          </Badge>
        );
      case "DECLINED":
        return (
          <Badge variant="destructive">
            <XCircle className="size-3 mr-1" />
            Declined
          </Badge>
        );
    }
  };

  return (
    <Card className="border-l-4 border-l-primary/80 shadow-sm">
      <CardHeader className="py-4 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            Underwriting Risk & Funding Decision
          </CardTitle>
          <CardDescription className="text-xs">
            Automated MCA underwriting evaluation based on statement cash flow & risk indicators
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {getTierBadge()}
          {getRecommendationBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/40 p-3 rounded-lg border">
          <div>
            <span className="text-xs text-muted-foreground font-medium block mb-1">
              Max Recommended Advance
            </span>
            <div className="text-lg font-bold text-foreground flex items-center gap-1">
              <DollarSign className="size-4 text-emerald-600 -mr-1" />
              {summary.recommendedFunding > 0 ? fmtCurrency(summary.recommendedFunding) : "$0 (Decline)"}
            </div>
            <span className="text-[11px] text-muted-foreground">
              {summary.recommendation === "APPROVED"
                ? "Based on 12% baseline deposit capacity"
                : summary.recommendation === "CONDITIONAL"
                ? "50% risk-adjusted reduction applied"
                : "No funding recommended due to high risk"}
            </span>
          </div>

          <div>
            <span className="text-xs text-muted-foreground font-medium block mb-1">
              MCA Debt Stacking
            </span>
            <div className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-1">
              {data.mca_stacking_detected ? (
                <Badge variant="destructive" className="text-xs">
                  Stacking Flagged
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                  Clean (No Stacking)
                </Badge>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground">
              {data.mca_stacking_detected
                ? "Multiple concurrent daily ACH MCA debits detected"
                : "No evidence of multi-lender daily debit stacking"}
            </span>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-foreground block mb-2">
            Underwriting Insights & Risk Triggers
          </span>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {summary.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {data.mca_explanation && (
          <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 space-y-1">
            <span className="text-xs font-semibold text-primary block flex items-center gap-1.5">
              <span>🧠</span> AI Reasoning & Explanation
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {data.mca_explanation}
            </p>
            {data.mca_lenders_detected && data.mca_lenders_detected.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-medium text-foreground">Detected Lenders:</span>
                {data.mca_lenders_detected.map((lender, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] py-0 px-1.5">
                    {lender}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
