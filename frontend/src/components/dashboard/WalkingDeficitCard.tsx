"use client";

import { Check, Footprints, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalkingDeficitCardProps {
  steps: number | string;
  setSteps: (val: string) => void;
  weight: number | string;
  setWeight: (val: string) => void;
  onSaveWalking: () => void;
  weightSaved: boolean;
  totalIntakeCalories: number;
}

export default function WalkingDeficitCard({
  steps,
  setSteps,
  weight,
  setWeight,
  onSaveWalking,
  weightSaved,
  totalIntakeCalories,
}: WalkingDeficitCardProps) {
  const stepsNum = Number(steps) || 0;
  const weightNum = Number(weight) || 0;

  const walkingCalories = Math.round(stepsNum * weightNum * 0.0005);
  const totalBurn = 2000 + walkingCalories;
  const deficit = totalBurn - totalIntakeCalories;
  const estimatedLoss = Math.abs(deficit) / 7700;

  return (
    <section className="walking-card" data-testid="walking-tracker-card">
      <div className="walking-head">
        <div className="walking-title">
          <span className="walk-icon">
            <Footprints size={19} />
          </span>
          <div>
            <p className="eyebrow">DAILY MOVEMENT</p>
            <h3>Walking & deficit</h3>
          </div>
        </div>
        <Settings size={17} className="settings-icon" />
      </div>

      <div className="walking-inputs">
        <label>
          <span>Steps walked</span>
          <input
            data-testid="steps-input"
            type="number"
            min="0"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="e.g. 8000"
          />
        </label>
        <label>
          <span>Current weight</span>
          <div className="unit-input">
            <input
              data-testid="weight-input"
              type="number"
              min="1"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter kg"
            />
            <small>kg</small>
          </div>
        </label>
        <button
          data-testid="save-walking-button"
          className="save-walking"
          onClick={onSaveWalking}
        >
          <Check size={16} /> {weightSaved ? "Saved" : "Save activity"}
        </button>
      </div>

      <div className="deficit-strip">
        <div>
          <span>Walking burn</span>
          <strong data-testid="walking-calories">+{walkingCalories} kcal</strong>
        </div>
        <div>
          <span>Daily burn</span>
          <strong>{totalBurn.toLocaleString()} kcal</strong>
        </div>
        <div className={deficit >= 0 ? "deficit-positive" : "deficit-negative"}>
          <span>{deficit >= 0 ? "Today’s deficit" : "Over baseline"}</span>
          <strong data-testid="daily-deficit">
            {deficit >= 0 ? "−" : "+"}
            {Math.abs(Math.round(deficit)).toLocaleString()} kcal
          </strong>
        </div>
        <div>
          <span>Est. weight change</span>
          <strong data-testid="estimated-weight-loss">
            {deficit >= 0 ? "−" : "+"}
            {estimatedLoss.toFixed(2)} kg
          </strong>
          <small>
            {deficit >= 0
              ? "based on 7,700 kcal / kg"
              : "estimated gain if repeated"}
          </small>
        </div>
      </div>
    </section>
  );
}
