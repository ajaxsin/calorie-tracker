"use client";

interface MonthStatsCardsProps {
  trackedDaysCount: number;
  avgCalories: number;
  avgSteps: number;
  totalMealsCount: number;
}

export default function MonthStatsCards({
  trackedDaysCount,
  avgCalories,
  avgSteps,
  totalMealsCount,
}: MonthStatsCardsProps) {
  return (
    <section className="month-stats" data-testid="month-stats">
      <div>
        <span>Tracked days</span>
        <strong data-testid="stat-days">{trackedDaysCount}</strong>
      </div>
      <div>
        <span>Avg calories</span>
        <strong data-testid="stat-avg-calories">{avgCalories.toLocaleString()} kcal</strong>
      </div>
      <div>
        <span>Avg steps</span>
        <strong data-testid="stat-avg-steps">{avgSteps.toLocaleString()}</strong>
      </div>
      <div>
        <span>Total meals</span>
        <strong data-testid="stat-total-meals">{totalMealsCount}</strong>
      </div>
    </section>
  );
}
