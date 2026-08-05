"use client";

import { useState } from "react";
import { ParseResponse, MODELS } from "@/lib/types";
import { fmtCurrency } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KpiCard } from "@/components/KpiCard";
import { UnderwritingCard } from "@/components/UnderwritingCard";
import { StatementDetailsGrid } from "@/components/StatementDetailsGrid";
import {
  FileText,
  Clock,
  Check,
  Copy,
  Download,
  Database,
  Layers,
  Code2,
} from "lucide-react";

interface ResultsDashboardProps {
  result: ParseResponse;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  const [copied, setCopied] = useState(false);

  if (!result.success || !result.data) return null;

  const data = result.data;
  const modelLabel = MODELS.find((m) => m.id === result.model_used)?.label ?? result.model_used;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parsed-statement-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const rows = [
      ["Metric", "Extracted Value"],
      ["Bank Name", data.bank_name || ""],
      ["Statement Period", data.statement_period || ""],
      ["Account Mask", data.account_number_mask || ""],
      ["Total Deposits", data.total_deposits ?? ""],
      ["Total Withdrawals", data.total_withdrawals ?? ""],
      ["Deposit Count", data.deposit_count ?? ""],
      ["Withdrawal Count", data.withdrawal_count ?? ""],
      ["Average Daily Balance", data.avg_daily_balance ?? ""],
      ["NSF Overdraft Count", data.nsf_count ?? 0],
      ["MCA Stacking Detected", data.mca_stacking_detected ? "Yes" : "No"],
      ["MCA Lenders Detected", (data.mca_lenders_detected || []).join("; ")],
      ["MCA Explanation", data.mca_explanation || ""],
    ];

    const csvContent = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statement-analysis-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            Extracted Statement Results
          </CardTitle>
          <CardDescription className="text-xs">
            Processed via {modelLabel}
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {result.is_cached ? (
            <Badge variant="secondary" className="text-xs font-normal">
              <Database className="size-3 mr-1 text-muted-foreground" />
              D1 Cache Hit
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs font-normal">
              Workers AI Engine
            </Badge>
          )}
          <Badge variant="outline" className="text-xs font-normal">
            <Clock className="size-3 mr-1 text-muted-foreground" />
            {result.processing_time_ms}ms
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJSON}
            className="h-8 text-xs font-medium"
          >
            {copied ? <Check className="size-3.5 mr-1" /> : <Copy className="size-3.5 mr-1" />}
            {copied ? "Copied" : "Copy JSON"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJSON}
            className="h-8 text-xs font-medium"
          >
            <Download className="size-3.5 mr-1" />
            JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCSV}
            className="h-8 text-xs font-medium"
          >
            <Download className="size-3.5 mr-1" />
            CSV
          </Button>
        </div>
      </CardHeader>


      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview" className="text-xs">
              <Layers className="size-3.5 mr-1.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="json" className="text-xs">
              <Code2 className="size-3.5 mr-1.5" />
              Raw JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Bank Name"
                value={data.bank_name || "—"}
                subtitle="Extracted Institution"
              />
              <KpiCard
                title="Statement Period"
                value={data.statement_period || "—"}
                subtitle="Statement Date Range"
              />
              <KpiCard
                title="Total Deposits"
                value={fmtCurrency(data.total_deposits) ?? "—"}
                subtitle={data.deposit_count !== null ? `${data.deposit_count} deposits` : "Count unavailable"}
              />
              <KpiCard
                title="Total Withdrawals"
                value={fmtCurrency(data.total_withdrawals) ?? "—"}
                subtitle={data.withdrawal_count !== null ? `${data.withdrawal_count} withdrawals` : "Count unavailable"}
              />
            </div>

            <UnderwritingCard data={data} />

            <StatementDetailsGrid data={data} />
          </TabsContent>
          <TabsContent value="json" className="mt-0">
            <div className="rounded-md border bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto max-h-96">
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
