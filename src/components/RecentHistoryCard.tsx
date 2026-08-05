"use client";

import { useEffect, useState, useCallback } from "react";
import { HistoryDocument, ParseResponse } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtCurrency } from "@/lib/formatters";
import { History, Database, ArrowRight, RefreshCw, FileText } from "lucide-react";

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

  if (history.length === 0 && !loading) {
    return null;
  }

  return (
    <Card className="border-dashed bg-muted/30">
      <CardHeader className="py-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <History className="size-4 text-primary" />
            Recent Database Statements (D1 Cache)
          </CardTitle>
          <CardDescription className="text-xs">
            Statements stored in SQLite D1 DB. Click any record to inspect instant cached extraction.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchHistory}
          disabled={loading}
          className="size-8"
          title="Refresh History"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        <div className="divide-y rounded-md border bg-background text-xs">
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
                className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 font-medium truncate">
                    <FileText className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{doc.file_name}</span>
                    <Badge variant="outline" className="text-[10px] px-1 py-0 font-normal shrink-0">
                      <Database className="size-2.5 mr-1" />
                      D1 Stored
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-[11px]">
                    <span>Bank: <strong className="text-foreground">{doc.bank_name || "Unknown"}</strong></span>
                    {doc.total_deposits !== null && (
                      <span>Deposits: <strong className="text-emerald-600">{fmtCurrency(doc.total_deposits)}</strong></span>
                    )}
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
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
                  className="h-7 text-xs shrink-0"
                >
                  View Details
                  <ArrowRight className="size-3 ml-1" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
