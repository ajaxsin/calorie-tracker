"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CumulativeDeficitChartProps {
  loading: boolean;
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

export default function CumulativeDeficitChart({
  loading,
  trackedDays,
  chartData,
}: CumulativeDeficitChartProps) {
  return (
    <section className="chart-card" data-testid="cumulative-chart">
      <div className="chart-head">
        <div>
          <p className="eyebrow">RUNNING TOTAL</p>
          <h3>Cumulative deficit</h3>
        </div>
        <div className="legend-inline">
          <span>
            <i style={{ background: "#2D6A4F" }} />
            Cumulative
          </span>
          <span>
            <i style={{ background: "#D4A373" }} />
            Daily deficit
          </span>
        </div>
      </div>

      <div className="chart-body">
        {!loading && trackedDays > 0 && (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D6A4F" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2D6A4F" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                formatter={(v) => `${Number(v).toLocaleString()} kcal`}
              />
              <ReferenceLine y={0} stroke="#c4cfc8" />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#2D6A4F"
                strokeWidth={2.5}
                fill="url(#cumFill)"
                name="Cumulative deficit"
              />
              <Line
                type="monotone"
                dataKey="deficit"
                stroke="#D4A373"
                strokeWidth={1.6}
                dot={{ r: 2.5 }}
                name="Daily deficit"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {!loading && trackedDays === 0 && <p className="empty-note">—</p>}
      </div>
    </section>
  );
}
