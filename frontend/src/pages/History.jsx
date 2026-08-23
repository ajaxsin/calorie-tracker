import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, ArrowRight, Flame, Loader2, Utensils } from "lucide-react";
import { format } from "date-fns";
import Sidebar from "@/components/Sidebar";
import { Bar, BarChart, CartesianGrid, Legend, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const monthLabel = (year, month) => new Date(year, month - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });

const macroColors = { calories: "#2D6A4F", protein: "#2D6A4F", carbs: "#D4A373", fibre: "#74A57F", fats: "#E07A5F" };

const History = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chartMode, setChartMode] = useState("macros"); // "macros" | "calories"

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get(`${API}/summary/monthly`, { params: { year, month } });
      setData(res.data);
    } catch (e) { setError("Could not load monthly summary."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [year, month]);

  const goPrev = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); };
  const goNext = () => { if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1); };

  const chartData = useMemo(() => (data?.days || []).map((d) => ({
    day: String(d.day).padStart(2, "0"),
    date: d.date,
    calories: Math.round(d.calories),
    protein: Math.round(d.protein),
    carbs: Math.round(d.carbs),
    fibre: Math.round(d.fibre),
    fats: Math.round(d.fats),
    steps: d.steps,
  })), [data]);

  const tracked = useMemo(() => (data?.days || []).filter((d) => d.calories > 0), [data]);
  const totals = useMemo(() => {
    const t = { calories: 0, protein: 0, carbs: 0, fibre: 0, fats: 0, steps: 0 };
    tracked.forEach((d) => { t.calories += d.calories; t.protein += d.protein; t.carbs += d.carbs; t.fibre += d.fibre; t.fats += d.fats; t.steps += d.steps; });
    return t;
  }, [tracked]);
  const avgCal = tracked.length ? Math.round(totals.calories / tracked.length) : 0;
  const avgSteps = tracked.length ? Math.round(totals.steps / tracked.length) : 0;

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <div><p className="eyebrow">MONTHLY VIEW</p><h1>Meal history</h1></div>
          <div className="topbar-actions">
            <div className="date-picker" data-testid="month-picker">
              <button data-testid="previous-month-button" onClick={goPrev}><ArrowLeft size={17} /></button>
              <span data-testid="selected-month">{monthLabel(year, month)}{isCurrentMonth && <em>This month</em>}</span>
              <button data-testid="next-month-button" onClick={goNext}><ArrowRight size={17} /></button>
            </div>
          </div>
        </header>

        <section className="month-stats" data-testid="month-stats">
          <div><span>Tracked days</span><strong data-testid="stat-days">{tracked.length}</strong></div>
          <div><span>Avg calories</span><strong data-testid="stat-avg-calories">{avgCal.toLocaleString()} kcal</strong></div>
          <div><span>Avg steps</span><strong data-testid="stat-avg-steps">{avgSteps.toLocaleString()}</strong></div>
          <div><span>Total meals</span><strong data-testid="stat-total-meals">{tracked.reduce((s, d) => s + Object.values(d.segments).reduce((a, b) => a + b.length, 0), 0)}</strong></div>
        </section>

        <section className="chart-card" data-testid="monthly-chart">
          <div className="chart-head">
            <div><p className="eyebrow">AT A GLANCE</p><h3>{chartMode === "calories" ? "Daily calories" : "Daily macros"}</h3></div>
            <div className="chart-toggle" role="tablist">
              <button data-testid="chart-toggle-macros" className={chartMode === "macros" ? "on" : ""} onClick={() => setChartMode("macros")}>Macros</button>
              <button data-testid="chart-toggle-calories" className={chartMode === "calories" ? "on" : ""} onClick={() => setChartMode("calories")}>Calories</button>
            </div>
          </div>
          <div className="chart-body">
            {loading && <div className="chart-loading"><Loader2 className="spin" size={22} /></div>}
            {!loading && tracked.length === 0 && <p className="empty-note" data-testid="empty-month-note">No meals logged for {monthLabel(year, month)} yet.</p>}
            {!loading && tracked.length > 0 && (
              <ResponsiveContainer width="100%" height={320}>
                {chartMode === "calories" ? (
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eaefe9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#738078" }} tickLine={false} axisLine={{ stroke: "#e4ebe6" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#738078" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #dce9df" }} labelFormatter={(l) => `Day ${l}`} />
                    <Bar dataKey="calories" fill={macroColors.calories} radius={[4, 4, 0, 0]} name="Calories (kcal)" />
                    <Line type="monotone" dataKey={() => 2000} stroke="#c36f5d" strokeDasharray="5 5" dot={false} name="Baseline 2,000" />
                  </ComposedChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eaefe9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#738078" }} tickLine={false} axisLine={{ stroke: "#e4ebe6" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#738078" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #dce9df" }} labelFormatter={(l) => `Day ${l}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                    <Bar dataKey="protein" stackId="m" fill={macroColors.protein} name="Protein (g)" />
                    <Bar dataKey="carbs" stackId="m" fill={macroColors.carbs} name="Carbs (g)" />
                    <Bar dataKey="fibre" stackId="m" fill={macroColors.fibre} name="Fibre (g)" />
                    <Bar dataKey="fats" stackId="m" fill={macroColors.fats} name="Fats (g)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
            {!loading && tracked.length === 0 && chartData.length > 0 && null}
          </div>
        </section>

        {error && <div className="error" data-testid="history-error">{error}</div>}

        <section className="day-log" data-testid="day-log">
          <div className="section-heading">
            <div><p className="eyebrow">DAY BY DAY</p><h3>What you ate</h3></div>
            <span className="meal-count">{tracked.length} day{tracked.length === 1 ? "" : "s"}</span>
          </div>
          <div className="day-list">
            {tracked.map((d) => {
              const dt = new Date(d.date);
              return (
                <article className="day-card" key={d.date} data-testid={`day-card-${d.date}`}>
                  <header className="day-head">
                    <div className="day-cal">
                      <span className="day-num">{format(dt, "d")}</span>
                      <div><strong>{format(dt, "EEEE")}</strong><small>{format(dt, "MMM yyyy")}</small></div>
                    </div>
                    <div className="day-macros" data-testid={`day-macros-${d.date}`}>
                      <span><em>{Math.round(d.calories)}</em>kcal</span>
                      <span><em>{Math.round(d.protein)}</em>P</span>
                      <span><em>{Math.round(d.carbs)}</em>C</span>
                      <span><em>{Math.round(d.fibre)}</em>Fi</span>
                      <span><em>{Math.round(d.fats)}</em>Fa</span>
                      {d.steps > 0 && <span className="day-steps"><em>{d.steps.toLocaleString()}</em>steps</span>}
                    </div>
                  </header>
                  <div className="day-segments">
                    {["Breakfast", "Lunch", "Dinner", "Snacks"].map((seg) => {
                      const items = d.segments?.[seg] || [];
                      return (
                        <div className="day-seg" key={seg} data-testid={`day-${d.date}-${seg.toLowerCase()}`}>
                          <div className="day-seg-head"><span className={`meal-icon ${seg.toLowerCase()}`}><Utensils size={13} /></span><strong>{seg}</strong></div>
                          {items.length === 0 ? (
                            <p className="empty-seg">—</p>
                          ) : (
                            items.map((meal) => (
                              <p key={meal.id}>{meal.meal_text}<em>{Math.round(meal.calories)} kcal</em></p>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default History;
