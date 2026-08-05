"use client";

import { useRef, useState } from "react";
import { fmtBytes } from "@/lib/formatters";
import { MODELS } from "@/lib/types";
import { IconTrash, IconChevronDown } from "@tabler/icons-react";

interface StatementUploaderProps {
  file: File | null;
  model: string;
  loading: boolean;
  onFileChange: (file: File | null) => void;
  onModelChange: (modelId: string) => void;
  onParse: () => void;
  onError?: (error: string) => void;
}

export function StatementUploader({
  file,
  model,
  loading,
  onFileChange,
  onModelChange,
  onParse,
  onError,
}: StatementUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedModel = MODELS.find((m) => m.id === model) || MODELS[0];

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleSelectFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      onError?.("File is too large. Maximum allowed size is 10MB.");
      return;
    }
    onFileChange(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleSelectFile(e.dataTransfer.files[0]);
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3 className="card-title mb-0 font-weight-bold">Upload Bank Statement</h3>
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
          className={`p-4 text-center rounded mb-3 cursor-pointer ${
            dragOver ? "bg-primary-lt border-primary" : "bg-body-tertiary border"
          }`}
          style={{ borderStyle: "dashed", borderWidth: "2px", transition: "all 0.2s ease" }}
        >
          {file ? (
            <div className="d-flex align-items-center justify-content-between bg-body p-3 rounded border">
              <div className="text-start text-truncate min-w-0">
                <div className="font-weight-bold text-truncate">{file.name}</div>
                <small className="text-secondary">{fmtBytes(file.size)}</small>
              </div>
              <button
                type="button"
                className="btn-trash-clean ms-2"
                onClick={handleClearFile}
                title="Remove file"
              >
                <IconTrash size={18} />
              </button>
            </div>
          ) : (
            <div className="py-3">
              <p className="mb-1 text-body font-weight-bold">
                Click to select a file <span className="text-secondary font-weight-normal">or drag and drop</span>
              </p>
              <small className="text-secondary">PDF, PNG, JPG, or WEBP statements</small>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="d-none"
            onChange={(e) => handleSelectFile(e.target.files?.[0])}
          />
        </div>

        <div className="row g-2 align-items-center">
          <div className="col-md-7">
            <div className="position-relative">
              <button
                type="button"
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-between px-3 py-2 text-start bg-body"
                style={{ minHeight: "42px", borderRadius: "6px" }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={loading}
              >
                <span className="font-weight-bold text-body text-truncate" style={{ fontSize: "0.88rem" }}>
                  {selectedModel.label}
                </span>
                <IconChevronDown
                  size={16}
                  className="text-secondary ms-2 flex-shrink-0"
                  style={{
                    transform: dropdownOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="dropdown-menu show w-100 shadow p-1 mt-1 border rounded-2"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    zIndex: 1050,
                    backgroundColor: "var(--tblr-bg-surface, #ffffff)",
                  }}
                >
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`dropdown-item p-2 rounded mb-1 text-start ${
                        model === m.id ? "active bg-primary-lt text-primary font-weight-bold" : ""
                      }`}
                      onClick={() => {
                        onModelChange(m.id);
                        setDropdownOpen(false);
                      }}
                    >
                      <span className="text-truncate" style={{ fontSize: "0.88rem" }}>
                        {m.label}
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
              className="btn btn-primary w-100 py-2 font-weight-bold"
              style={{ minHeight: "42px", borderRadius: "6px" }}
              onClick={onParse}
              disabled={!file || loading}
            >
              {loading ? "Parsing Statement..." : "Parse Statement"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
