"use client";

import { useState } from "react";
import { MODELS, ParseResponse } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { HeroHeader } from "@/components/HeroHeader";
import { StatementUploader } from "@/components/StatementUploader";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { ProcessingPipeline } from "@/components/ProcessingPipeline";
import { RecentHistoryCard } from "@/components/RecentHistoryCard";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState(MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParseResponse | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    setResult(null);
  };

  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", model);

      const res = await fetch("/api/parse", { method: "POST", body: formData });
      const text = await res.text();
      let data: ParseResponse;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || `Server error (${res.status})`);
      }
      setResult(data);
      if (data.success) {
        setHistoryKey((k) => k + 1);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to parse file";
      setResult({
        success: false,
        error: message,
        is_cached: false,
        model_used: model,
        processing_time_ms: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page bg-body">
      <Navbar />
      <div className="page-wrapper">
        <div className="container-xl py-4">
          <HeroHeader />
          <div className="row g-4">
            <div className="col-md-4">
              <RecentHistoryCard key={historyKey} onSelectDocument={setResult} />
            </div>

            <div className="col-md-8">
              <div id="results-top" />
              <StatementUploader
                file={file}
                model={model}
                loading={loading}
                onFileChange={handleFileChange}
                onModelChange={setModel}
                onParse={handleParse}
              />
              {loading && (
                <ProcessingPipeline fileName={file?.name} modelId={model} />
              )}
              {result && !result.success && result.error && (
                <ErrorAlert error={result.error} />
              )}
              {result?.success && !loading && (
                <div id="results-dashboard-section">
                  <ResultsDashboard result={result} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
