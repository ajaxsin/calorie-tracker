"use client";

import { DEFAULT_MACRO_TARGETS, MACRO_COLORS } from "@/constants/macros";

interface DailyBalanceCardProps {
  dateKey: string;
  isToday: boolean;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fibre: number;
    fats: number;
  };
}

const MacroRow = ({
  label,
  value,
  target,
  unit = "g",
  color,
}: {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color: string;
}) => (
  <div className="macro-row" data-testid={`daily-${label.toLowerCase()}-summary`}>
    <div className="macro-label">
      <span className="dot" style={{ background: color }} />
      {label}
      <strong>
        {Math.round(value)}
        {unit}
      </strong>
    </div>
    <div className="progress">
      <span
        style={{
          width: `${Math.min((value / target) * 100, 100)}%`,
          background: color,
        }}
      />
    </div>
    <small>
      {Math.round(target - value > 0 ? target - value : 0)}
      {unit} remaining
    </small>
  </div>
);

export default function DailyBalanceCard({
  dateKey,
  isToday,
  totals,
}: DailyBalanceCardProps) {
  return (
    <div className="summary">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{isToday ? "TODAY" : dateKey}</p>
          <h3>Daily balance</h3>
        </div>
        <span className="calorie-total" data-testid="daily-calories-total">
          <strong>{Math.round(totals.calories)}</strong> / 2,000 kcal
        </span>
      </div>

      <div className="macro-list">
        <MacroRow
          label="Protein"
          value={totals.protein}
          target={DEFAULT_MACRO_TARGETS.protein}
          color={MACRO_COLORS.protein}
        />
        <MacroRow
          label="Carbs"
          value={totals.carbs}
          target={DEFAULT_MACRO_TARGETS.carbs}
          color={MACRO_COLORS.carbs}
        />
        <MacroRow
          label="Fibre"
          value={totals.fibre}
          target={DEFAULT_MACRO_TARGETS.fibre}
          color={MACRO_COLORS.fibre}
        />
        <MacroRow
          label="Fats"
          value={totals.fats}
          target={DEFAULT_MACRO_TARGETS.fats}
          color={MACRO_COLORS.fats}
        />
      </div>
    </div>
  );
}
