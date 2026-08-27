"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Download, Upload } from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import MonthStatsCards from "@/components/history/MonthStatsCards";
import MonthlyChart from "@/components/history/MonthlyChart";
import DayByDayList from "@/components/history/DayByDayList";
import ExportCsvModal from "@/components/dashboard/ExportCsvModal";
import ImportCsvModal from "@/components/dashboard/ImportCsvModal";

import { useMonthlySummary } from "@/hooks/useMonthlySummary";

const getMonthLabel = (year: number, month: number) =>
  new Date(year, month - 1, 1).toLocaleString("en", {
    month: "long",
    year: "numeric",
  });

export default function HistoryPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const { data, isLoading, error } = useMonthlySummary(year, month);

  const goPrev = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goNext = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const chartData = useMemo(
    () =>
      (data?.days || []).map((d) => ({
        day: String(d.day).padStart(2, "0"),
        date: d.date,
        calories: Math.round(d.calories),
        protein: Math.round(d.protein),
        carbs: Math.round(d.carbs),
        fibre: Math.round(d.fibre),
        fats: Math.round(d.fats),
        steps: d.steps,
      })),
    [data]
  );

  const trackedDays = useMemo(
    () => (data?.days || []).filter((d) => d.calories > 0),
    [data]
  );

  const totals = useMemo(() => {
    const t = { calories: 0, steps: 0, mealsCount: 0 };
    trackedDays.forEach((d) => {
      t.calories += d.calories;
      t.steps += d.steps;
      t.mealsCount += Object.values(d.segments || {}).reduce(
        (acc, list) => acc + list.length,
        0
      );
    });
    return t;
  }, [trackedDays]);

  const avgCalories = trackedDays.length
    ? Math.round(totals.calories / trackedDays.length)
    : 0;
  const avgSteps = trackedDays.length
    ? Math.round(totals.steps / trackedDays.length)
    : 0;

  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  const currentDateKey = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">MONTHLY VIEW</p>
            <h1>Meal history</h1>
          </div>
          <div className="topbar-actions">
            <button
              className="export-btn"
              data-testid="history-open-import-button"
              onClick={() => setShowImport(true)}
            >
              <Upload size={15} />
              Import CSV
            </button>
            <button
              className="export-btn"
              data-testid="history-open-export-button"
              onClick={() => setShowExport(true)}
            >
              <Download size={15} />
              Export CSV
            </button>
            <div className="date-picker" data-testid="month-picker">
              <button
                data-testid="previous-month-button"
                onClick={goPrev}
              >
                <ArrowLeft size={17} />
              </button>
              <span data-testid="selected-month">
                {getMonthLabel(year, month)}
                {isCurrentMonth && <em>This month</em>}
              </span>
              <button data-testid="next-month-button" onClick={goNext}>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </header>

        <MonthStatsCards
          trackedDaysCount={trackedDays.length}
          avgCalories={avgCalories}
          avgSteps={avgSteps}
          totalMealsCount={totals.mealsCount}
        />

        <MonthlyChart
          loading={isLoading}
          monthLabel={getMonthLabel(year, month)}
          hasTrackedDays={trackedDays.length > 0}
          chartData={chartData}
        />

        {error && (
          <div className="error" data-testid="history-error">
            Could not load monthly summary.
          </div>
        )}

        <DayByDayList trackedDays={trackedDays} />
      </main>

      {showExport && (
        <ExportCsvModal
          dateKey={currentDateKey}
          onClose={() => setShowExport(false)}
        />
      )}

      {showImport && (
        <ImportCsvModal
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
