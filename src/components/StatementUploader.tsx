"use client";

import { useRef, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fmtBytes } from "@/lib/formatters";
import { MODELS } from "@/lib/types";
import { Upload, FileText, Trash2, Loader2, Cpu } from "lucide-react";

interface StatementUploaderProps {
  file: File | null;
  model: string;
  loading: boolean;
  onFileChange: (file: File | null) => void;
  onModelChange: (modelId: string) => void;
  onParse: () => void;
}

export function StatementUploader({
  file,
  model,
  loading,
  onFileChange,
  onModelChange,
  onParse,
}: StatementUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFileChange(dropped);
    },
    [onFileChange]
  );

  const handleClearFile = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFileChange(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [onFileChange]
  );

  const selectedModel = MODELS.find((m) => m.id === model) || MODELS[0];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Upload Statement</CardTitle>
        <CardDescription className="text-xs">
          Select a bank statement PDF or image to extract structured metrics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`
            relative flex cursor-pointer flex-col items-center justify-center gap-2
            rounded-lg border border-dashed p-6 text-center transition-colors
            ${
              dragOver
                ? "border-primary bg-muted/60"
                : file
                ? "border-primary/50 bg-muted/30"
                : "border-border bg-muted/20 hover:bg-muted/40"
            }
          `}
        >
          {file ? (
            <div className="flex w-full items-center justify-between rounded-md bg-background border p-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-foreground">
                  <FileText className="size-4" />
                </div>
                <div className="text-left truncate">
                  <p className="font-medium text-foreground text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtBytes(file.size)} • Ready to process
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearFile}
                className="text-muted-foreground hover:text-destructive shrink-0 ml-2"
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex size-10 items-center justify-center rounded-full border bg-background text-muted-foreground">
                <Upload className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  Click to upload <span className="text-muted-foreground font-normal">or drag and drop</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, PNG, JPG, JPEG or WEBP statements
                </p>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileChange(f);
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <Select value={model} onValueChange={(val) => val && onModelChange(val)}>
              <SelectTrigger className="w-full h-10">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Cpu className="size-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm">{selectedModel.label}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted font-normal text-muted-foreground ml-auto">
                      {selectedModel.badge}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex flex-col gap-0.5 py-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{m.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-normal text-muted-foreground">
                          {m.badge}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{m.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={onParse}
            disabled={!file || loading}
            className="h-10 px-6 font-medium shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Parsing Statement...
              </>
            ) : (
              "Parse Statement"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
