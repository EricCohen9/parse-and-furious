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
  { label: "Evaluating MCA stacking & underwriting risk score...", targetProgress: 90 },
  { label: "Saving parsed statement to Cloudflare D1 database...", targetProgress: 98 },
];

export function ProcessingPipeline({ fileName, modelId }: ProcessingPipelineProps) {
  const [progress, setProgress] = useState(5);
  const [stageIndex, setStageIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const modelLabel = MODELS.find((m) => m.id === modelId)?.label ?? modelId;
  const isFastModel = modelId.includes("3b");

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 350);

    const t1Delay = isFastModel ? 500 : 800;
    const t2Delay = isFastModel ? 2200 : 3500;
    const t3Delay = isFastModel ? 5000 : 12000;
    const t4Delay = isFastModel ? 6500 : 15000;
    const tickInterval = isFastModel ? 150 : 380;

    const t1 = setTimeout(() => setStageIndex(1), t1Delay);
    const t2 = setTimeout(() => setStageIndex(2), t2Delay);
    const t3 = setTimeout(() => setStageIndex(3), t3Delay);
    const t4 = setTimeout(() => setStageIndex(4), t4Delay);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 98) {
          const step = prev > 88 ? 1 : 2;
          return Math.min(98, prev + step);
        }
        return prev;
      });
    }, tickInterval);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
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
            <IconLoader2 size={18} className="text-primary spin shrink-0" />
            <span className="font-weight-bold text-truncate" style={{ fontSize: "0.85rem" }}>
              {currentStage.label}
            </span>
          </div>
          <span className="badge bg-primary-lt font-mono">{progress}%</span>
        </div>

        <div className="progress progress-sm mb-2">
          <div
            className="progress-bar bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="d-flex align-items-center justify-content-between text-secondary" style={{ fontSize: "0.75rem" }}>
          <span className="text-truncate">
            Processing {fileName ? <strong>{fileName}</strong> : "statement"}
          </span>
          <span className="d-flex align-items-center gap-1 shrink-0">
            <IconCpu size={14} />
            {modelLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
