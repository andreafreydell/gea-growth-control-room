"use client";

import { useCallback, useState, DragEvent } from "react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import type { DataSource, ValidationResult } from "@/lib/adapters/types";

interface FileUploaderProps {
  source: DataSource;
  label: string;
  requiredColumns: string[];
  onData: (raw: string) => void;
  validation: ValidationResult | null;
}

export function FileUploader({
  source,
  label,
  requiredColumns,
  onData,
  validation,
}: FileUploaderProps) {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onData(text);
      };
      reader.readAsText(file);
    },
    [onData]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handlePaste = useCallback(
    (text: string) => {
      if (text.trim()) {
        setFileName("pasted data");
        onData(text);
      }
    },
    [onData]
  );

  const statusBadge = validation ? (
    validation.valid ? (
      <Badge variant="success">Valid</Badge>
    ) : (
      <Badge variant="danger">Invalid</Badge>
    )
  ) : fileName ? (
    <Badge variant="warning">Parsing...</Badge>
  ) : null;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium uppercase tracking-wide text-gea-muted">
            {label}
          </span>
          {statusBadge}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setMode("upload")}
            className={`px-2 py-1 text-xs ${
              mode === "upload"
                ? "text-gea-accent border-b border-gea-accent"
                : "text-gea-muted"
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setMode("paste")}
            className={`px-2 py-1 text-xs ${
              mode === "paste"
                ? "text-gea-accent border-b border-gea-accent"
                : "text-gea-muted"
            }`}
          >
            Paste
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border border-dashed p-6 text-center text-sm transition-colors ${
            dragging
              ? "border-gea-accent bg-gea-accent/5"
              : "border-gea-border"
          }`}
        >
          {fileName ? (
            <p className="text-gea-text">{fileName}</p>
          ) : (
            <>
              <p className="text-gea-muted mb-2">
                Drag & drop CSV or click to browse
              </p>
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                className="text-xs text-gea-muted"
              />
            </>
          )}
        </div>
      ) : (
        <textarea
          placeholder={`Paste ${source} CSV data here...`}
          rows={5}
          className="w-full border border-gea-border bg-gea-bg p-3 text-sm font-mono resize-y focus:outline-none focus:border-gea-accent"
          onChange={(e) => handlePaste(e.target.value)}
        />
      )}

      <div className="text-xs text-gea-muted">
        Expected columns: {requiredColumns.join(", ")}
      </div>

      {validation && validation.errors.length > 0 && (
        <div className="text-xs text-gea-danger space-y-1">
          {validation.errors.map((e, i) => (
            <p key={i}>{e}</p>
          ))}
        </div>
      )}
      {validation && validation.warnings.length > 0 && (
        <div className="text-xs text-gea-warning space-y-1">
          {validation.warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}
    </Card>
  );
}
