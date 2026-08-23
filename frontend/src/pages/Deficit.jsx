import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, ArrowRight, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Area, Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const monthLabel = (y, m) => new Date(y, m - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });

const Deficit = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get(`${API}/deficit/monthly`, { params: { year, month } });
      setData(res.data);
    } catch {
      setError("Could not load your deficit data.");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [year, month]);

  const goPrev = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); };
  const goNext = () => { if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1); };

  const trackedDays = data?.tracked_days || 0;
  const isDeficit = (data?.net_deficit || 0) >= 0;
  const chartData = useMemo(() => (data?.days || []).map((d) => ({
    day: String(d.day).padStart(2, "0"),
    intake: d.tracked ? d.intake : null,
    burn: d.tracked ? d.burn : null,
    deficit: d.tracked ? d.deficit : null,
    cumulative: d.cumulative_deficit,
    tracked: d.tracked,
  })), [data]);

  const avgIntake = trackedDays ? Math.round((data.total_intake || 0) / trackedDays) : 0;
  const avgBurn = trackedDays ? Math.round((data.total_burn || 0) / trackedDays) : 0;
  const avgDeficit = trackedDays ? Math.round((data.net_deficit || 0) / trackedDays) : 0;
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <div><p className="eyebrow">DEFICIT ANALYSIS</p><h1>Calorie deficit</h1></div>
          <div className="topbar-actions">
            <div className="date-picker" data-testid="deficit-month-picker">
              <button data-testid="deficit-prev-month" onClick={goPrev}><ArrowLeft size={17} /></button>
              <span data-testid="deficit-selected-month">{monthLabel(year, month)}{isCurrentMonth && <em>This month</em>}</span>
              <button data-testid="deficit-next-month" onClick={goNext}><ArrowRight size={17} /></button>
            </div>
          </div>
        </header>

        {!loading && data && !data.weight_kg && (
          <div className="notice" data-testid="deficit-weight-warning">
            Add your current weight on the daily dashboard to include walking burn in this calculation.
          </div>
        )}

        <section className="deficit-hero" data-testid="deficit-hero">
          <div className={`deficit-hero-card ${isDeficit ? "positive" : "negative"}`}>
            <p className="eyebrow">{isDeficit ? "MONTH DEFICIT" : "MONTH SURPLUS"}</p>
            <div className="deficit-hero-value">
              {isDeficit ? <TrendingDown size={28} /> : <TrendingUp size={28} />}
              <strong data-testid="net-deficit">{Math.abs(data?.net_deficit || 0).toLocaleString()}<small> kcal</small></strong>
            </div>
            <p className="deficit-hero-note">
              Est. weight change: <strong data-testid="est-weight-change">{isDeficit ? "−" : "+"}{Math.abs(data?.estimated_weight_change_kg || 0).toFixed(2)} kg</strong>
              <br /><small>based on 7,700 kcal / kg over {trackedDays} tracked day{trackedDays === 1 ? "" : "s"}</small>
            </p>
          </div>
          <div className="deficit-stats">
            <div><span>Avg intake</span><strong data-testid="avg-intake">{avgIntake.toLocaleString()}<em>kcal / day</em></strong></div>
            <div><span>Avg burn</span><strong data-testid="avg-burn">{avgBurn.toLocaleString()}<em>kcal / day</em></strong></div>
            <div><span>Avg deficit</span><strong data-testid="avg-deficit" className={avgDeficit >= 0 ? "value-good" : "value-warn"}>{avgDeficit >= 0 ? "−" : "+"}{Math.abs(avgDeficit).toLocaleString()}<em>kcal / day</em></strong></div>
            <div><span>Total intake</span><strong data-testid="total-intake">{(data?.total_intake || 0).toLocaleString()}<em>kcal</em></strong></div>
            <div><span>Total burn</span><strong data-testid="total-burn">{(data?.total_burn || 0).toLocaleString()}<em>kcal</em></strong></div>
            <div><span>Weight used</span><strong>{data?.weight_kg ? `${data.weight_kg} kg` : "—"}<em>current</em></strong></div>
          </div>
        </section>

        <section className="chart-card" data-testid="deficit-chart">
          <div className="chart-head">
            <div><p className="eyebrow">DAILY BREAKDOWN</p><h3>Intake vs burn</h3></div>
            <div className="legend-inline">
              <span><i style={{ background: "#E07A5F" }} />Intake</span>
              <span><i style={{ background: "#2D6A4F" }} />Burn</span>
              <span><i style={{ background: "#95a99b", height: 2 }} />Baseline 2,000</span>
            </div>
          </div>
          <div className="chart-body">
            {loading && <div className="chart-loading"><Loader2 className="spin" size={22} /></div>}
            {!loading && trackedDays === 0 && <p className="empty-note" data-testid="deficit-empty-note">No meals logged for {monthLabel(year, month)} yet.</p>}
            {!loading && trackedDays > 0 && (
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaefe9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#738078" }} tickLine={false} axisLine={{ stroke: "#e4ebe6" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#738078" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #dce9df" }} labelFormatter={(l) => `Day ${l}`} />
                  <ReferenceLine y={2000} stroke="#95a99b" strokeDasharray="5 5" />
                  <Bar dataKey="intake" fill="#E07A5F" radius={[4, 4, 0, 0]} name="Intake (kcal)" />
                  <Bar dataKey="burn" fill="#2D6A4F" radius={[4, 4, 0, 0]} name="Burn (kcal)" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="chart-card" data-testid="cumulative-chart">
          <div className="chart-head">
            <div><p className="eyebrow">RUNNING TOTAL</p><h3>Cumulative deficit</h3></div>
            <div className="legend-inline">
              <span><i style={{ background: "#2D6A4F" }} />Cumulative</span>
              <span><i style={{ background: "#D4A373" }} />Daily deficit</span>
            </div>
          </div>
          <div className="chart-body">
            {!loading && trackedDays > 0 && (
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2D6A4F" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2D6A4F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaefe9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#738078" }} tickLine={false} axisLine={{ stroke: "#e4ebe6" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#738078" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #dce9df" }} labelFormatter={(l) => `Day ${l}`} formatter={(v) => `${Number(v).toLocaleString()} kcal`} />
                  <ReferenceLine y={0} stroke="#c4cfc8" />
                  <Area type="monotone" dataKey="cumulative" stroke="#2D6A4F" strokeWidth={2.5} fill="url(#cumFill)" name="Cumulative deficit" />
                  <Line type="monotone" dataKey="deficit" stroke="#D4A373" strokeWidth={1.6} dot={{ r: 2.5 }} name="Daily deficit" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
            {!loading && trackedDays === 0 && <p className="empty-note">—</p>}
          </div>
        </section>

        {error && <div className="error" data-testid="deficit-error">{error}</div>}
      </main>
    </div>
  );
};

export default Deficit;
