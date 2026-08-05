"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { fmtBytes } from "@/lib/formatters";
import { MODELS } from "@/lib/types";
import {
  IconUpload,
  IconFileText,
  IconTrash,
  IconArrowUpRight,
  IconLoader2,
  IconCpu,
  IconChevronDown,
  IconCheck,
} from "@tabler/icons-react";

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
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedModel = MODELS.find((m) => m.id === model) || MODELS[0];

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="card mb-4">
      <div className="card-status-top bg-primary"></div>
      <div className="card-header">
        <h3 className="card-title d-flex align-items-center gap-2">
          <IconUpload size={20} className="text-primary" />
          Upload & Process Bank Statement
        </h3>
      </div>

      <div className="card-body">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`p-4 text-center border-dashed rounded mb-3 cursor-pointer transition-colors ${
            dragOver ? "bg-primary-lt border-primary" : "bg-body-tertiary"
          }`}
          style={{ borderStyle: "dashed", borderWidth: "2px" }}
        >
          {file ? (
            <div className="d-flex align-items-center justify-content-between bg-body p-3 rounded border">
              <div className="d-flex align-items-center gap-3 text-start min-w-0">
                <span className="avatar bg-blue-lt">
                  <IconFileText size={20} />
                </span>
                <div className="text-truncate">
                  <div className="font-weight-bold text-reset text-truncate">{file.name}</div>
                  <small className="text-secondary">
                    {fmtBytes(file.size)} • Ready to process
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-icon btn-ghost-danger ms-2"
                onClick={handleClearFile}
                title="Remove file"
              >
                <IconTrash size={18} />
              </button>
            </div>
          ) : (
            <div className="py-2">
              <IconUpload className="text-secondary mb-2" size={36} />
              <p className="mb-1 text-body font-weight-bold">
                Click to upload <span className="text-secondary font-weight-normal">or drag and drop</span>
              </p>
              <small className="text-secondary">PDF, PNG, JPG, JPEG or WEBP statements</small>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="d-none"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileChange(f);
            }}
          />
        </div>

        <div className="row g-2 align-items-center">
          <div className="col-md-7" ref={containerRef}>
            <div className="dropdown position-relative">
              <button
                type="button"
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-between px-3 py-2 text-start bg-body"
                onClick={() => setOpen(!open)}
              >
                <div className="d-flex align-items-center gap-2 text-truncate">
                  <IconCpu size={18} className="text-primary shrink-0" />
                  <span className="font-weight-bold text-body text-truncate" style={{ fontSize: "0.88rem" }}>
                    {selectedModel.label}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2 shrink-0">
                  <span className={`badge ${selectedModel.tier === "FAST" ? "bg-green-lt" : "bg-blue-lt"}`}>
                    {selectedModel.badge}
                  </span>
                  <IconChevronDown size={16} className="text-secondary" />
                </div>
              </button>

              {open && (
                <div
                  className="dropdown-menu show w-100 shadow-lg p-1 mt-1 border"
                  style={{ zIndex: 1050, position: "absolute", top: "100%", left: 0 }}
                >
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`dropdown-item d-flex align-items-center justify-content-between p-2 rounded mb-1 text-start ${
                        model === m.id ? "active bg-primary-lt text-primary font-weight-bold" : ""
                      }`}
                      onClick={() => {
                        onModelChange(m.id);
                        setOpen(false);
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 text-truncate me-2">
                        {model === m.id ? (
                          <IconCheck size={16} className="text-primary shrink-0" />
                        ) : (
                          <span style={{ width: 16 }} />
                        )}
                        <span className="text-truncate">{m.label}</span>
                      </div>
                      <span className={`badge shrink-0 ${m.tier === "FAST" ? "bg-green-lt" : "bg-blue-lt"}`}>
                        {m.badge}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-md-5">
            <button
              type="button"
              className="btn btn-primary w-100 py-2 font-weight-bold d-flex align-items-center justify-content-center gap-2"
              onClick={onParse}
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <IconLoader2 size={18} className="spin" />
                  <span>Parsing...</span>
                </>
              ) : (
                <>
                  <IconArrowUpRight size={18} />
                  <span>Parse Statement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
