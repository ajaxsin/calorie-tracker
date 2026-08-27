"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { Download, X } from "lucide-react";
import { exportService } from "@/services/export";

interface ExportCsvModalProps {
  dateKey: string;
  onClose: () => void;
}

export default function ExportCsvModal({ dateKey, onClose }: ExportCsvModalProps) {
  const [start, setStart] = useState(() => format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [end, setEnd] = useState(dateKey);

  const downloadUrl = exportService.getExportCsvUrl(start, end);

  return (
    <div className="modal-backdrop" data-testid="export-dialog" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">EXPORT · CSV</p>
            <h3>Download your log</h3>
          </div>
          <button
            className="modal-close"
            data-testid="close-export-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>
        <p className="modal-note">
          Pick a date range. You’ll get one row per meal with calories, macros and your steps.
        </p>
        <div className="modal-inputs">
          <label>
            <span>From</span>
            <input
              data-testid="export-start-date"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            <span>To</span>
            <input
              data-testid="export-end-date"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>
        <a
          className="save"
          data-testid="download-csv-button"
          href={downloadUrl}
          download
          onClick={onClose}
        >
          <Download size={16} /> Download CSV
        </a>
      </div>
    </div>
  );
}
