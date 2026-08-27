"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Download, Upload } from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import DeficitHeroCard from "@/components/deficit/DeficitHeroCard";
import DeficitStatsGrid from "@/components/deficit/DeficitStatsGrid";
import IntakeBurnChart from "@/components/deficit/IntakeBurnChart";
import CumulativeDeficitChart from "@/components/deficit/CumulativeDeficitChart";
import ExportCsvModal from "@/components/dashboard/ExportCsvModal";
import ImportCsvModal from "@/components/dashboard/ImportCsvModal";

import { useDeficitMonthly } from "@/hooks/useDeficitMonthly";

const getMonthLabel = (y: number, m: number) =>
  new Date(y, m - 1, 1).toLocaleString("en", {
    month: "long",
    year: "numeric",
  });

export default function DeficitPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const { data, isLoading, error } = useDeficitMonthly(year, month);

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

  const trackedDays = data?.tracked_days || 0;

  const chartData = useMemo(
    () =>
      (data?.days || []).map((d) => ({
        day: String(d.day).padStart(2, "0"),
        intake: d.tracked ? d.intake : null,
        burn: d.tracked ? d.burn : null,
        deficit: d.tracked ? d.deficit : null,
        cumulative: d.cumulative_deficit,
        tracked: d.tracked,
      })),
    [data]
  );

  const avgIntake = trackedDays
    ? Math.round((data?.total_intake || 0) / trackedDays)
    : 0;
  const avgBurn = trackedDays
    ? Math.round((data?.total_burn || 0) / trackedDays)
    : 0;
  const avgDeficit = trackedDays
    ? Math.round((data?.net_deficit || 0) / trackedDays)
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
            <p className="eyebrow">DEFICIT ANALYSIS</p>
            <h1>Calorie deficit</h1>
          </div>
          <div className="topbar-actions">
            <button
              className="export-btn"
              data-testid="deficit-open-import-button"
              onClick={() => setShowImport(true)}
            >
              <Upload size={15} />
              Import CSV
            </button>
            <button
              className="export-btn"
              data-testid="deficit-open-export-button"
              onClick={() => setShowExport(true)}
            >
              <Download size={15} />
              Export CSV
            </button>
            <div className="date-picker" data-testid="deficit-month-picker">
              <button
                data-testid="deficit-prev-month"
                onClick={goPrev}
              >
                <ArrowLeft size={17} />
              </button>
              <span data-testid="deficit-selected-month">
                {getMonthLabel(year, month)}
                {isCurrentMonth && <em>This month</em>}
              </span>
              <button
                data-testid="deficit-next-month"
                onClick={goNext}
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </header>

        {!isLoading && data && !data.weight_kg && (
          <div className="notice" data-testid="deficit-weight-warning">
            Add your current weight on the daily dashboard to include walking burn in this calculation.
          </div>
        )}

        <section className="deficit-hero" data-testid="deficit-hero">
          <DeficitHeroCard
            netDeficit={data?.net_deficit || 0}
            estimatedWeightChangeKg={data?.estimated_weight_change_kg || 0}
            trackedDays={trackedDays}
          />

          <DeficitStatsGrid
            avgIntake={avgIntake}
            avgBurn={avgBurn}
            avgDeficit={avgDeficit}
            totalIntake={data?.total_intake || 0}
            totalBurn={data?.total_burn || 0}
            weightKg={data?.weight_kg}
          />
        </section>

        <IntakeBurnChart
          loading={isLoading}
          monthLabel={getMonthLabel(year, month)}
          trackedDays={trackedDays}
          chartData={chartData}
        />

        <CumulativeDeficitChart
          loading={isLoading}
          trackedDays={trackedDays}
          chartData={chartData}
        />

        {error && (
          <div className="error" data-testid="deficit-error">
            Could not load your deficit data.
          </div>
        )}
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
