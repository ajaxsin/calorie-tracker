import { useEffect, useMemo, useState } from "react";
import "@/App.css";
import axios from "axios";
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleHelp, Flame, Leaf, Loader2, Plus, Sparkles, Trash2, Utensils } from "lucide-react";
import { format, addDays, subDays } from "date-fns";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const segments = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const blank = { calories: 0, protein: 0, carbs: 0, fibre: 0, fats: 0 };

const Macro = ({ label, value, target, unit = "g", color }) => (
  <div className="macro-row" data-testid={`daily-${label.toLowerCase()}-summary`}>
    <div className="macro-label"><span className="dot" style={{ background: color }} />{label}<strong>{Math.round(value)}{unit}</strong></div>
    <div className="progress"><span style={{ width: `${Math.min((value / target) * 100, 100)}%`, background: color }} /></div>
    <small>{Math.round(target - value > 0 ? target - value : 0)}{unit} remaining</small>
  </div>
);

const Home = () => {
  const [date, setDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [segment, setSegment] = useState("Breakfast");
  const [text, setText] = useState("");
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dateKey = format(date, "yyyy-MM-dd");
  const totals = useMemo(() => meals.reduce((sum, meal) => Object.keys(blank).reduce((s, key) => ({ ...s, [key]: s[key] + Number(meal[key] || 0) }), sum), { ...blank }), [meals]);
  const loadMeals = async () => { try { const res = await axios.get(`${API}/meals`, { params: { date: dateKey } }); setMeals(res.data); } catch { setError("Could not load your saved meals."); } };
  useEffect(() => { loadMeals(); setEstimate(null); }, [dateKey]);
  const calculate = async () => { if (!text.trim()) return; setLoading(true); setError(""); try { const res = await axios.post(`${API}/nutrition/estimate`, { meal_text: text }); setEstimate(res.data); } catch (e) { setError(e.response?.data?.detail || "Could not calculate this meal."); } finally { setLoading(false); } };
  const saveMeal = async () => { if (!estimate) return; setSaving(true); setError(""); try { await axios.post(`${API}/meals`, { meal_text: text, segment, date: dateKey, ...estimate }); setText(""); setEstimate(null); await loadMeals(); } catch (e) { setError(e.response?.data?.detail || "Could not save this meal."); } finally { setSaving(false); } };
  const removeMeal = async (id) => { await axios.delete(`${API}/meals/${id}`); setMeals((items) => items.filter((meal) => meal.id !== id)); };

  return (
    <div className="shell">
      <aside className="sidebar"><div className="brand"><span className="brand-mark"><Leaf size={18} /></span><span>nutripaste<span className="brand-dot">.</span></span></div><nav><button className="nav-active" data-testid="dashboard-navigation"><Utensils size={18} />Daily dashboard</button><button data-testid="history-navigation"><Flame size={18} />Meal history</button></nav><div className="side-note"><div className="note-icon"><Sparkles size={16} /></div><p><strong>Good food, clear data.</strong><br />Paste what you ate and let your day take shape.</p></div><div className="help"><CircleHelp size={16} />Nutrition estimates are a guide</div></aside>
      <main className="main"><header className="topbar"><div><p className="eyebrow">YOUR NUTRITION, SIMPLIFIED</p><h1>Daily dashboard</h1></div><div className="date-picker"><button data-testid="previous-day-button" onClick={() => setDate(subDays(date, 1))}><ArrowLeft size={17} /></button><span data-testid="selected-date">{format(date, "EEEE, MMM d")}{dateKey === format(new Date(), "yyyy-MM-dd") && <em>Today</em>}</span><button data-testid="next-day-button" onClick={() => setDate(addDays(date, 1))}><ArrowRight size={17} /></button></div></header>
        <section className="hero-band"><div className="hero-copy"><span className="kicker"><Sparkles size={14} /> POWERED BY GPT-5.4</span><h2>What did you eat?</h2><p>Tell us about one meal in your own words. We’ll estimate the rest.</p><div className="entry-box"><textarea data-testid="meal-description-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. 140g air fried chicken + 100g boiled black chana + salad" /><div className="entry-footer"><div className="segment-select"><span>Meal</span><select data-testid="meal-segment-select" value={segment} onChange={(e) => setSegment(e.target.value)}>{segments.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div><button className="calculate" data-testid="calculate-nutrition-button" onClick={calculate} disabled={loading || !text.trim()}>{loading ? <Loader2 className="spin" size={17} /> : <Sparkles size={17} />} {loading ? "Estimating..." : "Calculate nutrition"}</button></div></div></div><img className="hero-image" alt="Healthy chicken and salad bowl" src="https://images.unsplash.com/photo-1574926054530-540288c8e678?auto=format&fit=crop&w=900&q=80" /></section>
        {error && <div className="error" data-testid="nutrition-error">{error}</div>}
        {estimate && <section className="estimate" data-testid="nutrition-estimate-card"><div><p className="eyebrow">ESTIMATE READY · {segment.toUpperCase()}</p><h3>Here’s the nutrition read</h3><p className="estimate-note">{estimate.note || "Based on typical preparation and serving sizes."}</p></div><div className="estimate-grid">{[["Calories", estimate.calories, "kcal"], ["Protein", estimate.protein, "g"], ["Carbs", estimate.carbs, "g"], ["Fibre", estimate.fibre, "g"], ["Fats", estimate.fats, "g"]].map(([label, value, unit]) => <div key={label}><span>{label}</span><strong>{value}<small>{unit}</small></strong></div>)}</div><button className="save" data-testid="save-meal-button" onClick={saveMeal} disabled={saving}><Check size={17} /> {saving ? "Saving..." : "Save to today"}</button></section>}
        <section className="content-grid"><div className="summary"><div className="section-heading"><div><p className="eyebrow">{dateKey === format(new Date(), "yyyy-MM-dd") ? "TODAY" : format(date, "MMM D, YYYY").toUpperCase()}</p><h3>Daily balance</h3></div><span className="calorie-total" data-testid="daily-calories-total"><strong>{Math.round(totals.calories)}</strong> / 2,000 kcal</span></div><div className="macro-list"><Macro label="Protein" value={totals.protein} target={130} color="#2D6A4F" /><Macro label="Carbs" value={totals.carbs} target={220} color="#D4A373" /><Macro label="Fibre" value={totals.fibre} target={30} color="#74A57F" /><Macro label="Fats" value={totals.fats} target={65} color="#E07A5F" /></div></div><div className="meals"><div className="section-heading"><div><p className="eyebrow">YOUR LOG</p><h3>Meals today</h3></div><span className="meal-count" data-testid="meal-count">{meals.length} {meals.length === 1 ? "meal" : "meals"}</span></div>{segments.map((seg) => <div className="meal-row" key={seg} data-testid={`meal-segment-${seg.toLowerCase()}`}><div className="meal-name"><span className={`meal-icon ${seg.toLowerCase()}`}>{seg === "Snacks" ? <Plus size={16} /> : <Utensils size={16} />}</span><div><strong>{seg}</strong>{meals.filter((m) => m.segment === seg).map((meal) => <p key={meal.id}>{meal.meal_text}</p>)}</div></div><div className="meal-value">{meals.filter((m) => m.segment === seg).reduce((sum, m) => sum + Number(m.calories), 0) > 0 ? `${Math.round(meals.filter((m) => m.segment === seg).reduce((sum, m) => sum + Number(m.calories), 0))} kcal` : "—"}{meals.filter((m) => m.segment === seg).map((meal) => <button key={meal.id} className="delete" data-testid={`delete-meal-${meal.id}`} onClick={() => removeMeal(meal.id)} aria-label={`Delete ${seg} meal`}><Trash2 size={15} /></button>)}</div></div>)}</div></section>
      </main>
    </div>
  );
};

function App() {
  return <Home />;
}

export default App;
