"use client";

import { useEffect, useState } from "react";
import { HistoryDocument, ParseResponse, ParsedStatement } from "@/lib/types";
import { fmtCurrency } from "@/lib/formatters";
import {
  IconHistory,
  IconRefresh,
  IconFileText,
} from "@tabler/icons-react";

interface RecentHistoryCardProps {
  onSelectDocument: (result: ParseResponse) => void;
  refreshTrigger?: unknown;
}

interface HistoryItem extends HistoryDocument {
  parsedData?: ParsedStatement | null;
}

export function RecentHistoryCard({ onSelectDocument, refreshTrigger }: RecentHistoryCardProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (showLoading = false) => {
    if (showLoading || history.length === 0) setLoading(true);
    try {
      const res = await fetch("/api/history");
      const data = (await res.json()) as { success?: boolean; history?: HistoryDocument[] };
      if (data.success && Array.isArray(data.history)) {
        const parsedItems: HistoryItem[] = data.history.map((doc) => {
          let parsedData: ParsedStatement | null = null;
          try {
            parsedData = JSON.parse(doc.raw_json);
          } catch {}
          return { ...doc, parsedData };
        });
        setHistory(parsedItems);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  return (
    <div className="card sticky-top" style={{ top: "1.5rem" }}>
      <div className="card-header d-flex align-items-center justify-content-between">
        <h3 className="card-title d-flex align-items-center gap-2 mb-0">
          <IconHistory size={18} className="text-secondary" />
          Recent Statements
        </h3>
        <button
          type="button"
          className="btn-icon-clean"
          onClick={() => fetchHistory(true)}
          disabled={loading}
          title="Refresh History"
        >
          <IconRefresh size={18} className={loading ? "spin" : ""} />
        </button>
      </div>

      {history.length === 0 && !loading ? (
        <div className="card-body text-center text-secondary py-4">
          <small>No saved statements found.</small>
        </div>
      ) : (
        <div className="list-group list-group-flush list-group-hoverable overflow-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
          {history.map((doc) => (
            <div
              key={doc.id}
              className="list-group-item cursor-pointer p-3"
              onClick={() => {
                if (doc.parsedData) {
                  onSelectDocument({
                    success: true,
                    data: doc.parsedData,
                    is_cached: true,
                    model_used: doc.model_used,
                    processing_time_ms: 0,
                  });
                }
              }}
            >
              <div className="row align-items-center">
                <div className="col-auto">
                  <IconFileText size={20} className="text-secondary" />
                </div>
                <div className="col text-truncate">
                  <div className="font-weight-bold text-body text-truncate d-block" style={{ fontSize: "0.88rem" }}>
                    {doc.file_name}
                  </div>
                  <div className="text-secondary text-truncate" style={{ fontSize: "0.78rem" }}>
                    {doc.bank_name ? `${doc.bank_name} • ` : ""}{new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
