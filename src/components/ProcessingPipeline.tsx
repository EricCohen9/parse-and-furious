"use client";

import { useEffect, useState } from "react";
import { IconLoader2, IconCpu } from "@tabler/icons-react";
import { MODELS } from "@/lib/types";

interface ProcessingPipelineProps {
  fileName?: string;
  modelId: string;
}

const STAGES = [
  { label: "Validating file & generating SHA-256 hash...", targetProgress: 15 },
  { label: "Extracting document text via Workers AI OCR...", targetProgress: 35 },
  { label: "Running LLM financial metrics & NSF extraction...", targetProgress: 75 },
  { label: "Structuring bank statement metrics & verifying schema...", targetProgress: 90 },
  { label: "Saving parsed statement to Cloudflare D1 database...", targetProgress: 98 },
];

export function ProcessingPipeline({ fileName, modelId }: ProcessingPipelineProps) {
  const [progress, setProgress] = useState(5);
  const [stageIndex, setStageIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const modelLabel = MODELS.find((m) => m.id === modelId)?.label ?? modelId;
  const isFastModel = modelId.includes("3b");

  useEffect(() => {
    const timeline = {
      showDelay: 350,
      progressInterval: isFastModel ? 150 : 380,
      stageDelays: isFastModel ? [500, 2200, 5000, 6500] : [800, 3500, 12000, 15000],
    };

    const showTimer = setTimeout(() => setVisible(true), timeline.showDelay);
    const stageTimers = timeline.stageDelays.map((delay, index) =>
      setTimeout(() => setStageIndex(index + 1), delay),
    );

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;

        const step = prev > 88 ? 1 : 2;
        return Math.min(98, prev + step);
      });
    }, timeline.progressInterval);

    return () => {
      clearTimeout(showTimer);
      stageTimers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [isFastModel]);

  if (!visible) return null;

  const currentStage = STAGES[stageIndex] || STAGES[0];

  return (
    <div className="card mb-4">
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2 text-truncate">
            <IconLoader2 size={18} className="text-primary spin flex-shrink-0" />
            <span className="font-weight-bold text-truncate" style={{ fontSize: "0.85rem" }}>
              {currentStage.label}
            </span>
          </div>
          <span className="badge bg-primary-lt font-monospace">{progress}%</span>
        </div>

        <div className="progress progress-sm mb-2">
          <div
            className="progress-bar bg-primary"
            style={{ width: `${progress}%`, transition: "width 0.3s ease" }}
          />
        </div>

        <div className="d-flex align-items-center justify-content-between text-secondary" style={{ fontSize: "0.75rem" }}>
          <span className="text-truncate">
            Processing {fileName ? <strong>{fileName}</strong> : "statement"}
          </span>
          <span className="d-flex align-items-center gap-1 flex-shrink-0">
            <IconCpu size={14} />
            {modelLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
