"use client";

import { useState } from "react";
import { ParseResponse } from "@/lib/types";
import { fmtCurrency } from "@/lib/formatters";
import { IconCopy, IconCheck, IconCode } from "@tabler/icons-react";

interface ResultsDashboardProps {
  result: ParseResponse;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!result.success || !result.data) return null;

  const data = result.data;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const detailsList = [
    { label: "Bank Name", value: data.bank_name || "—" },
    { label: "Statement Period", value: data.statement_period || "—" },
    { label: "Account", value: data.account_number_mask || "—" },
    { label: "Total Deposits", value: fmtCurrency(data.total_deposits) ?? "—" },
    { label: "Total Withdrawals", value: fmtCurrency(data.total_withdrawals) ?? "—" },
    { label: "NSF / Overdraft Count", value: data.nsf_count != null ? `${data.nsf_count}` : "—" },
  ];

  return (
    <div className="card mb-4">
      <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <h3 className="card-title mb-0 font-weight-bold">Statement Results</h3>
          {result.is_cached && (
            <small className="text-secondary font-weight-normal ms-1">• Cached result</small>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-1 px-2"
            onClick={handleCopyJSON}
          >
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            <span>{copied ? "Copied" : "Copy JSON"}</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${showJson ? "btn-secondary" : "btn-outline-secondary"} d-flex align-items-center gap-1 py-1 px-2`}
            onClick={() => setShowJson(!showJson)}
          >
            <IconCode size={14} />
            <span>{showJson ? "Hide JSON" : "View JSON"}</span>
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* Clean Extracted Statement Details Table */}
        {!showJson && (
          <div className="table-responsive border rounded">
            <table className="table table-vcenter card-table table-striped mb-0">
              <thead>
                <tr>
                  <th>FIELD METRIC</th>
                  <th>EXTRACTED VALUE</th>
                </tr>
              </thead>
              <tbody>
                {detailsList.map((item, idx) => (
                  <tr key={idx}>
                    <td className="text-secondary font-weight-medium">{item.label}</td>
                    <td className="font-weight-bold">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Optional JSON Viewer */}
        {showJson && (
          <div className="mt-2">
            <h4 className="card-title text-secondary mb-2" style={{ fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Raw Structured JSON
            </h4>
            <pre className="p-3 rounded mb-0 text-start font-monospace border bg-dark text-light" style={{ fontSize: "0.8rem", maxHeight: "400px", overflow: "auto" }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
