"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, UploadCloud, X, AlertCircle } from "lucide-react";
import { useImportMeals } from "@/hooks/useImportMeals";

interface ImportCsvModalProps {
  onClose: () => void;
}

export default function ImportCsvModal({ onClose }: ImportCsvModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportMeals();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setSuccessMessage("");
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith(".csv")) {
        setError("Please select a valid CSV file (.csv).");
        return;
      }
      setFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (!dropped.name.toLowerCase().endsWith(".csv")) {
        setError("Please drop a valid CSV file (.csv).");
        return;
      }
      setFile(dropped);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const res = await importMutation.mutateAsync(file);
      setSuccessMessage(res.message || "Successfully imported meals!");
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to import CSV file. Please check the file format.");
    }
  };

  return (
    <div className="modal-backdrop" data-testid="import-dialog" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">IMPORT · CSV</p>
            <h3>Import meal data</h3>
          </div>
          <button
            className="modal-close"
            data-testid="close-import-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        <p className="modal-note">
          Upload your calorie and activity CSV. The file should include:
          <br />
          <code>Date, Segment, Meal, Calories, Protein, Carbs, Fibre, Fats, Steps</code>
        </p>

        <div
          className="import-dropzone"
          data-testid="import-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            data-testid="import-file-input"
            accept=".csv,text/csv"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          {file ? (
            <div className="import-file-selected">
              <FileText size={28} className="import-icon active" />
              <div>
                <strong>{file.name}</strong>
                <small>{(file.size / 1024).toFixed(1)} KB</small>
              </div>
            </div>
          ) : (
            <div className="import-prompt">
              <UploadCloud size={32} className="import-icon" />
              <p>
                <strong>Click to browse</strong> or drag & drop CSV here
              </p>
              <small>Accepts .csv files</small>
            </div>
          )}
        </div>

        {error && (
          <div className="import-alert error" data-testid="import-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="import-alert success" data-testid="import-success">
            <CheckCircle2 size={15} />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: 20 }}>
          <button
            className="save"
            data-testid="submit-import-button"
            onClick={handleUpload}
            disabled={!file || importMutation.isPending}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {importMutation.isPending ? (
              <Loader2 className="spin" size={16} />
            ) : (
              <UploadCloud size={16} />
            )}
            {importMutation.isPending ? "Importing data..." : "Import Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
