"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MACRO_COLORS } from "@/constants/macros";

interface MonthlyChartProps {
  loading: boolean;
  monthLabel: string;
  hasTrackedDays: boolean;
  chartData: Array<{
    day: string;
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fibre: number;
    fats: number;
    steps: number;
  }>;
}

export default function MonthlyChart({
  loading,
  monthLabel,
  hasTrackedDays,
  chartData,
}: MonthlyChartProps) {
  const [chartMode, setChartMode] = useState<"macros" | "calories">("macros");

  return (
    <section className="chart-card" data-testid="monthly-chart">
      <div className="chart-head">
        <div>
          <p className="eyebrow">AT A GLANCE</p>
          <h3>{chartMode === "calories" ? "Daily calories" : "Daily macros"}</h3>
        </div>
        <div className="chart-toggle" role="tablist">
          <button
            data-testid="chart-toggle-macros"
            className={chartMode === "macros" ? "on" : ""}
            onClick={() => setChartMode("macros")}
          >
            Macros
          </button>
          <button
            data-testid="chart-toggle-calories"
            className={chartMode === "calories" ? "on" : ""}
            onClick={() => setChartMode("calories")}
          >
            Calories
          </button>
        </div>
      </div>

      <div className="chart-body">
        {loading && (
          <div className="chart-loading">
            <Loader2 className="spin" size={22} />
          </div>
        )}

        {!loading && !hasTrackedDays && (
          <p className="empty-note" data-testid="empty-month-note">
            No meals logged for {monthLabel} yet.
          </p>
        )}

        {!loading && hasTrackedDays && (
          <ResponsiveContainer width="100%" height={320}>
            {chartMode === "calories" ? (
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#eaefe9"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#738078" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e4ebe6" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#738078" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 6,
                    border: "1px solid #dce9df",
                  }}
                  labelFormatter={(l) => `Day ${l}`}
                />
                <Bar
                  dataKey="calories"
                  fill={MACRO_COLORS.calories}
                  radius={[4, 4, 0, 0]}
                  name="Calories (kcal)"
                />
                <Line
                  type="monotone"
                  dataKey={() => 2000}
                  stroke="#c36f5d"
                  strokeDasharray="5 5"
                  dot={false}
                  name="Baseline 2,000"
                />
              </ComposedChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#eaefe9"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#738078" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e4ebe6" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#738078" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 6,
                    border: "1px solid #dce9df",
                  }}
                  labelFormatter={(l) => `Day ${l}`}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                <Bar
                  dataKey="protein"
                  stackId="m"
                  fill={MACRO_COLORS.protein}
                  name="Protein (g)"
                />
                <Bar
                  dataKey="carbs"
                  stackId="m"
                  fill={MACRO_COLORS.carbs}
                  name="Carbs (g)"
                />
                <Bar
                  dataKey="fibre"
                  stackId="m"
                  fill={MACRO_COLORS.fibre}
                  name="Fibre (g)"
                />
                <Bar
                  dataKey="fats"
                  stackId="m"
                  fill={MACRO_COLORS.fats}
                  name="Fats (g)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
