"use client";

import { cn } from "@/lib/utils";

interface DeficitStatsGridProps {
  avgIntake: number;
  avgBurn: number;
  avgDeficit: number;
  totalIntake: number;
  totalBurn: number;
  weightKg?: number | null;
}

export default function DeficitStatsGrid({
  avgIntake,
  avgBurn,
  avgDeficit,
  totalIntake,
  totalBurn,
  weightKg,
}: DeficitStatsGridProps) {
  return (
    <div className="deficit-stats">
      <div>
        <span>Avg intake</span>
        <strong data-testid="avg-intake">
          {avgIntake.toLocaleString()}
          <em>kcal / day</em>
        </strong>
      </div>
      <div>
        <span>Avg burn</span>
        <strong data-testid="avg-burn">
          {avgBurn.toLocaleString()}
          <em>kcal / day</em>
        </strong>
      </div>
      <div>
        <span>Avg deficit</span>
        <strong
          data-testid="avg-deficit"
          className={avgDeficit >= 0 ? "value-good" : "value-warn"}
        >
          {avgDeficit >= 0 ? "−" : "+"}
          {Math.abs(avgDeficit).toLocaleString()}
          <em>kcal / day</em>
        </strong>
      </div>
      <div>
        <span>Total intake</span>
        <strong data-testid="total-intake">
          {totalIntake.toLocaleString()}
          <em>kcal</em>
        </strong>
      </div>
      <div>
        <span>Total burn</span>
        <strong data-testid="total-burn">
          {totalBurn.toLocaleString()}
          <em>kcal</em>
        </strong>
      </div>
      <div>
        <span>Weight used</span>
        <strong>
          {weightKg ? `${weightKg} kg` : "—"}
          <em>current</em>
        </strong>
      </div>
    </div>
  );
}
