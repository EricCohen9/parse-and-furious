"use client";

import { useEffect, useState, useCallback } from "react";
import { HistoryDocument, ParseResponse } from "@/lib/types";
import { fmtCurrency } from "@/lib/formatters";
import {
  IconHistory,
  IconRefresh,
  IconFileText,
  IconChevronRight,
  IconDatabase,
} from "@tabler/icons-react";

interface RecentHistoryCardProps {
  onSelectDocument: (result: ParseResponse) => void;
}

export function RecentHistoryCard({ onSelectDocument }: RecentHistoryCardProps) {
  const [history, setHistory] = useState<HistoryDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/history");
      const data = (await res.json()) as { success?: boolean; history?: HistoryDocument[] };
      if (data.success && Array.isArray(data.history)) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="card sticky-top" style={{ top: "1.5rem" }}>
      <div className="card-header d-flex align-items-center justify-content-between">
        <h3 className="card-title d-flex align-items-center gap-2 mb-0">
          <IconHistory size={18} className="text-primary" />
          Recent Database Statements
        </h3>
        <button
          type="button"
          className="btn btn-sm btn-icon btn-ghost-secondary"
          onClick={fetchHistory}
          disabled={loading}
          title="Refresh History"
        >
          <IconRefresh size={16} className={loading ? "spin" : ""} />
        </button>
      </div>

      <div className="card-body py-2 px-3 bg-body-tertiary border-bottom">
        <small className="text-secondary d-flex align-items-center gap-1">
          <IconDatabase size={14} /> D1 Database Cache Log
        </small>
      </div>

      {history.length === 0 && !loading ? (
        <div className="card-body text-center text-secondary py-4">
          <small>No saved statements found in D1 DB.</small>
        </div>
      ) : (
        <div className="list-group list-group-flush list-group-hoverable overflow-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
          {history.map((doc) => {
            let parsedData;
            try {
              parsedData = JSON.parse(doc.raw_json);
            } catch {
              parsedData = null;
            }

            return (
              <div
                key={doc.id}
                className="list-group-item cursor-pointer p-3"
                onClick={() => {
                  if (parsedData) {
                    onSelectDocument({
                      success: true,
                      data: parsedData,
                      is_cached: true,
                      model_used: doc.model_used,
                      processing_time_ms: 0,
                    });
                    setTimeout(() => {
                      const target = document.getElementById("results-dashboard-section");
                      if (target) {
                        target.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }, 50);
                  }
                }}
              >
                <div className="row align-items-center">
                  <div className="col-auto">
                    <span className="avatar bg-blue-lt rounded">
                      <IconFileText size={20} />
                    </span>
                  </div>
                  <div className="col text-truncate">
                    <div className="font-weight-bold text-reset text-truncate d-block">
                      {doc.file_name}
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <span className="badge bg-green-lt p-1">D1 Stored</span>
                      <small className="text-secondary">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    {doc.bank_name && (
                      <div className="text-secondary text-truncate mt-1" style={{ fontSize: "0.75rem" }}>
                        Bank: <strong>{doc.bank_name}</strong>
                      </div>
                    )}
                  </div>
                  <div className="col-auto text-end">
                    {doc.total_deposits !== null && (
                      <div className="badge bg-success-lt font-weight-bold d-block mb-1">
                        {fmtCurrency(doc.total_deposits)}
                      </div>
                    )}
                    <button className="btn btn-sm btn-icon btn-ghost-secondary">
                      <IconChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
