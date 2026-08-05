"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Cpu } from "lucide-react";
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
    <Card className="p-3.5 border shadow-sm mb-6 bg-card">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Loader2 className="size-4 animate-spin text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground truncate">
            {currentStage.label}
          </span>
        </div>
        <span className="text-xs font-mono font-medium text-muted-foreground shrink-0">
          {progress}%
        </span>
      </div>

      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mb-2">
        <div
          className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="truncate">
          Processing {fileName ? <span className="font-medium text-foreground">{fileName}</span> : "statement"}
        </span>
        <span className="shrink-0 flex items-center gap-1">
          <Cpu className="size-3 text-muted-foreground" />
          {modelLabel}
        </span>
      </div>
    </Card>
  );
}
