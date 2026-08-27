"use client";

import { useState } from "react";
import { Bookmark, Plus, Trash2 } from "lucide-react";
import { Preset } from "@/models/presets";
import { MEAL_SEGMENTS } from "@/constants/segments";

interface PresetStripProps {
  presets: Preset[];
  onLogPreset: (id: string, segment: string) => void;
  onRenamePreset: (id: string, name: string) => void;
  onDeletePreset: (id: string) => void;
}

export default function PresetStrip({
  presets,
  onLogPreset,
  onRenamePreset,
  onDeletePreset,
}: PresetStripProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const startRename = (preset: Preset) => {
    setRenamingId(preset.id);
    setRenameValue(preset.name || "");
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const commitRename = (presetId: string) => {
    onRenamePreset(presetId, renameValue.trim());
    setRenamingId(null);
    setRenameValue("");
  };

  if (!presets || presets.length === 0) return null;

  return (
    <section className="presets" data-testid="presets-strip">
      <div className="section-heading">
        <div>
          <p className="eyebrow">ONE-TAP LOG</p>
          <h3>Your saved meals</h3>
        </div>
        <span className="meal-count">
          {presets.length} preset{presets.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="preset-list">
        {presets.map((p) => (
          <div className="preset-card" key={p.id} data-testid={`preset-${p.id}`}>
            <div className="preset-head">
              <Bookmark size={14} />
              {renamingId === p.id ? (
                <input
                  className="preset-rename-input"
                  data-testid={`rename-preset-${p.id}-input`}
                  value={renameValue}
                  maxLength={60}
                  autoFocus
                  placeholder="Give it a nickname"
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename(p.id);
                    if (e.key === "Escape") cancelRename();
                  }}
                  onBlur={() => commitRename(p.id)}
                />
              ) : (
                <button
                  className="preset-title"
                  data-testid={`rename-preset-${p.id}-button`}
                  onClick={() => startRename(p)}
                  title="Rename"
                >
                  {p.name || <span className="preset-title-muted">Add nickname</span>}
                </button>
              )}
              <button
                className="preset-remove"
                data-testid={`delete-preset-${p.id}`}
                onClick={() => onDeletePreset(p.id)}
                aria-label="Delete preset"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <p className="preset-text" title={p.meal_text}>
              {p.meal_text}
            </p>

            <div className="preset-macros">
              <strong>{Math.round(p.calories)} kcal</strong>
              <span>
                P {Math.round(p.protein)}g · C {Math.round(p.carbs)}g · F {Math.round(p.fats)}g
              </span>
            </div>

            <div className="preset-actions">
              {MEAL_SEGMENTS.map((seg) => (
                <button
                  key={seg}
                  data-testid={`log-preset-${p.id}-${seg.toLowerCase()}`}
                  onClick={() => onLogPreset(p.id, seg)}
                  className="preset-log"
                >
                  <Plus size={12} />
                  {seg}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
