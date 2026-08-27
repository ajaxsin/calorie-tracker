"use client";

import { BookmarkPlus, Check } from "lucide-react";
import { EstimateResponse } from "@/models/estimate";
import { MealSegment } from "@/constants/segments";

interface NutritionEstimateCardProps {
  segment: MealSegment;
  estimate: EstimateResponse;
  onUpdateMetric: (field: keyof EstimateResponse, value: number) => void;
  onSaveMeal: () => void;
  savingMeal: boolean;
  presetName: string;
  setPresetName: (val: string) => void;
  onSavePreset: () => void;
  presetSaved: boolean;
}

export default function NutritionEstimateCard({
  segment,
  estimate,
  onUpdateMetric,
  onSaveMeal,
  savingMeal,
  presetName,
  setPresetName,
  onSavePreset,
  presetSaved,
}: NutritionEstimateCardProps) {
  const metrics: [string, number, string, keyof EstimateResponse][] = [
    ["Calories", estimate.calories, "kcal", "calories"],
    ["Protein", estimate.protein, "g", "protein"],
    ["Carbs", estimate.carbs, "g", "carbs"],
    ["Fibre", estimate.fibre, "g", "fibre"],
    ["Fats", estimate.fats, "g", "fats"],
  ];

  return (
    <section className="estimate" data-testid="nutrition-estimate-card">
      <div>
        <p className="eyebrow">ESTIMATE READY · {segment.toUpperCase()}</p>
        <h3>Here’s the nutrition read</h3>
        <p className="estimate-note">
          {estimate.note || "Based on typical preparation and serving sizes."}
        </p>
        <p className="edit-hint">Review or adjust any number before saving.</p>
      </div>

      <div className="estimate-grid">
        {metrics.map(([label, value, unit, field]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>
              <input
                data-testid={`edit-${field}-input`}
                type="number"
                min="0"
                step="0.1"
                value={value}
                onChange={(e) => onUpdateMetric(field, Number(e.target.value) || 0)}
              />
              <small>{unit}</small>
            </strong>
          </div>
        ))}
      </div>

      <div className="estimate-actions">
        <button
          className="save"
          data-testid="save-meal-button"
          onClick={onSaveMeal}
          disabled={savingMeal}
        >
          <Check size={17} /> {savingMeal ? "Saving..." : "Save to today"}
        </button>
        <div className="preset-save-row">
          <input
            className="preset-name-input"
            data-testid="preset-name-input"
            type="text"
            maxLength={60}
            placeholder="Optional nickname"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
          <button
            className="save-secondary"
            data-testid="save-preset-button"
            onClick={onSavePreset}
          >
            {presetSaved ? <Check size={15} /> : <BookmarkPlus size={15} />}{" "}
            {presetSaved ? "Saved" : "Save preset"}
          </button>
        </div>
      </div>
    </section>
  );
}
