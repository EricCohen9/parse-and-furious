"use client";

import { useState } from "react";
import { ParseResponse, MODELS } from "@/lib/types";
import { fmtCurrency } from "@/lib/formatters";
import { KpiCard } from "@/components/KpiCard";
import { UnderwritingCard } from "@/components/UnderwritingCard";
import { StatementDetailsGrid } from "@/components/StatementDetailsGrid";
import {
  IconFileText,
  IconClock,
  IconCheck,
  IconCopy,
  IconDownload,
  IconDatabase,
  IconLayoutDashboard,
  IconCode,
} from "@tabler/icons-react";

interface ResultsDashboardProps {
  result: ParseResponse;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "json">("overview");

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
    <div className="card mb-4">
      <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h3 className="card-title d-flex align-items-center gap-2 mb-0">
            <IconFileText size={20} className="text-primary" />
            Extracted Statement Results
          </h3>
          <small className="text-secondary">Processed via {modelLabel}</small>
        </div>

        <div className="d-flex align-items-center flex-wrap gap-2">
          {result.is_cached ? (
            <span className="badge bg-green-lt d-flex align-items-center gap-1 p-2">
              <IconDatabase size={14} /> D1 Cache Hit
            </span>
          ) : (
            <span className="badge bg-blue-lt d-flex align-items-center gap-1 p-2">
              Workers AI Engine
            </span>
          )}
          <span className="badge bg-secondary-lt d-flex align-items-center gap-1 p-2">
            <IconClock size={14} /> {result.processing_time_ms}ms
          </span>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={handleCopyJSON}
          >
            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            <span>{copied ? "Copied" : "Copy JSON"}</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={handleDownloadJSON}
          >
            <IconDownload size={16} />
            <span>JSON</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={handleDownloadCSV}
          >
            <IconDownload size={16} />
            <span>CSV</span>
          </button>
        </div>
      </div>

      <div className="card-header border-bottom-0">
        <ul className="nav nav-tabs card-header-tabs">
          <li className="nav-item">
            <button
              className={`nav-link d-flex align-items-center gap-1.5 ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <IconLayoutDashboard size={16} />
              <span>Parsed Summary & Underwriting</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link d-flex align-items-center gap-1.5 ${activeTab === "json" ? "active" : ""}`}
              onClick={() => setActiveTab("json")}
            >
              <IconCode size={16} />
              <span>Raw JSON Output</span>
            </button>
          </li>
        </ul>
      </div>

      <div className="card-body">
        {activeTab === "overview" && (
          <div>
            <div className="row g-3">
              <div className="col-sm-6 col-lg-3">
                <KpiCard
                  title="Bank Name"
                  value={data.bank_name || "—"}
                  subtitle="Extracted Institution"
                />
              </div>
              <div className="col-sm-6 col-lg-3">
                <KpiCard
                  title="Statement Period"
                  value={data.statement_period || "—"}
                  subtitle="Statement Date Range"
                />
              </div>
              <div className="col-sm-6 col-lg-3">
                <KpiCard
                  title="Total Deposits"
                  value={fmtCurrency(data.total_deposits) ?? "—"}
                  valueClass="text-success"
                  subtitle={data.deposit_count !== null ? `${data.deposit_count} deposits` : "Count unavailable"}
                />
              </div>
              <div className="col-sm-6 col-lg-3">
                <KpiCard
                  title="Total Withdrawals"
                  value={fmtCurrency(data.total_withdrawals) ?? "—"}
                  subtitle={data.withdrawal_count !== null ? `${data.withdrawal_count} withdrawals` : "Count unavailable"}
                />
              </div>
            </div>

            <UnderwritingCard data={data} />
            <StatementDetailsGrid data={data} />
          </div>
        )}

        {activeTab === "json" && (
          <div>
            <pre className="bg-body-tertiary p-3 rounded mb-0 text-start font-mono" style={{ fontSize: "0.8rem", maxHeight: "450px", overflow: "auto" }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
