"use client";

import { Loader2 } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface IntakeBurnChartProps {
  loading: boolean;
  monthLabel: string;
  trackedDays: number;
  chartData: Array<{
    day: string;
    intake: number | null;
    burn: number | null;
    deficit: number | null;
    cumulative: number;
    tracked: boolean;
  }>;
}

export default function IntakeBurnChart({
  loading,
  monthLabel,
  trackedDays,
  chartData,
}: IntakeBurnChartProps) {
  return (
    <section className="chart-card" data-testid="deficit-chart">
      <div className="chart-head">
        <div>
          <p className="eyebrow">DAILY BREAKDOWN</p>
          <h3>Intake vs burn</h3>
        </div>
        <div className="legend-inline">
          <span>
            <i style={{ background: "#E07A5F" }} />
            Intake
          </span>
          <span>
            <i style={{ background: "#2D6A4F" }} />
            Burn
          </span>
          <span>
            <i style={{ background: "#95a99b", height: 2 }} />
            Baseline 2,000
          </span>
        </div>
      </div>

      <div className="chart-body">
        {loading && (
          <div className="chart-loading">
            <Loader2 className="spin" size={22} />
          </div>
        )}

        {!loading && trackedDays === 0 && (
          <p className="empty-note" data-testid="deficit-empty-note">
            No meals logged for {monthLabel} yet.
          </p>
        )}

        {!loading && trackedDays > 0 && (
          <ResponsiveContainer width="100%" height={320}>
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
              <ReferenceLine y={2000} stroke="#95a99b" strokeDasharray="5 5" />
              <Bar
                dataKey="intake"
                fill="#E07A5F"
                radius={[4, 4, 0, 0]}
                name="Intake (kcal)"
              />
              <Bar
                dataKey="burn"
                fill="#2D6A4F"
                radius={[4, 4, 0, 0]}
                name="Burn (kcal)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
