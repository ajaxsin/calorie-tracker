import { useEffect, useMemo, useState } from "react";
import "@/App.css";
import axios from "axios";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkPlus, Check, ChevronDown, Download, Footprints, Loader2, Plus, Settings, Sparkles, Trash2, Utensils, X } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import Sidebar from "@/components/Sidebar";
import History from "@/pages/History";
import Deficit from "@/pages/Deficit";

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

const EstimateMetric = ({ label, value, unit, onChange, testId }) => (
  <div><span>{label}</span><strong><input data-testid={testId} type="number" min="0" step="0.1" value={value} onChange={(event) => onChange(Number(event.target.value))} /><small>{unit}</small></strong></div>
);

const ExportDialog = ({ dateKey, onClose }) => {
  const [start, setStart] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [end, setEnd] = useState(dateKey);
  const url = `${API}/export/meals.csv?start=${start}&end=${end}`;
  return (
    <div className="modal-backdrop" data-testid="export-dialog" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><p className="eyebrow">EXPORT · CSV</p><h3>Download your log</h3></div>
          <button className="modal-close" data-testid="close-export-button" onClick={onClose} aria-label="Close"><X size={17} /></button>
        </div>
        <p className="modal-note">Pick a date range. You’ll get one row per meal with calories, macros and your steps.</p>
        <div className="modal-inputs">
          <label><span>From</span><input data-testid="export-start-date" type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
          <label><span>To</span><input data-testid="export-end-date" type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        </div>
        <a className="save" data-testid="download-csv-button" href={url} download onClick={onClose}><Download size={16} /> Download CSV</a>
      </div>
    </div>
  );
};

const Home = () => {
  const [date, setDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [segment, setSegment] = useState("Breakfast");
  const [text, setText] = useState("");
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState(0);
  const [weight, setWeight] = useState("");
  const [weightSaved, setWeightSaved] = useState(false);
  const [presets, setPresets] = useState([]);
  const [presetSaved, setPresetSaved] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [renaming, setRenaming] = useState(null); // presetId currently being renamed
  const [renameValue, setRenameValue] = useState("");
  const [showExport, setShowExport] = useState(false);
  const dateKey = format(date, "yyyy-MM-dd");
  const totals = useMemo(() => meals.reduce((sum, meal) => Object.keys(blank).reduce((s, key) => ({ ...s, [key]: s[key] + Number(meal[key] || 0) }), sum), { ...blank }), [meals]);
  const loadMeals = async () => { try { const [mealRes, activityRes, settingsRes] = await Promise.all([axios.get(`${API}/meals`, { params: { date: dateKey } }), axios.get(`${API}/activity`, { params: { date: dateKey } }), axios.get(`${API}/settings`)]); setMeals(mealRes.data); setSteps(activityRes.data.steps || 0); if (settingsRes.data.weight_kg) setWeight(settingsRes.data.weight_kg); } catch { setError("Could not load your saved meals."); } };
  const loadPresets = async () => { try { const res = await axios.get(`${API}/presets`); setPresets(res.data); } catch { /* silent */ } };
  useEffect(() => { loadMeals(); setEstimate(null); }, [dateKey]);
  useEffect(() => { loadPresets(); }, []);
  const calculate = async () => { if (!text.trim()) return; setLoading(true); setError(""); try { const res = await axios.post(`${API}/nutrition/estimate`, { meal_text: text }); setEstimate(res.data); } catch (e) { setError(e.response?.data?.detail || "Could not calculate this meal."); } finally { setLoading(false); } };
  const saveMeal = async () => { if (!estimate) return; setSaving(true); setError(""); try { await axios.post(`${API}/meals`, { meal_text: text, segment, date: dateKey, ...estimate }); setText(""); setEstimate(null); await loadMeals(); } catch (e) { setError(e.response?.data?.detail || "Could not save this meal."); } finally { setSaving(false); } };
  const removeMeal = async (id) => { await axios.delete(`${API}/meals/${id}`); setMeals((items) => items.filter((meal) => meal.id !== id)); };
  const saveWalking = async () => { if (!weight || Number(weight) <= 0) { setError("Add your current weight first."); return; } try { await Promise.all([axios.put(`${API}/settings`, { weight_kg: Number(weight) }), axios.put(`${API}/activity`, { date: dateKey, steps: Number(steps) || 0 })]); setWeightSaved(true); setTimeout(() => setWeightSaved(false), 1800); } catch { setError("Could not save your walking details."); } };
  const saveAsPreset = async () => {
    if (!estimate || !text.trim()) return;
    setError("");
    try {
      await axios.post(`${API}/presets`, { name: presetName.trim() || null, meal_text: text, ...estimate });
      setPresetSaved(true);
      setPresetName("");
      setTimeout(() => setPresetSaved(false), 1800);
      await loadPresets();
    } catch (e) {
      setError(e.response?.data?.detail || "Could not save preset.");
    }
  };
  const startRename = (preset) => { setRenaming(preset.id); setRenameValue(preset.name || ""); };
  const cancelRename = () => { setRenaming(null); setRenameValue(""); };
  const commitRename = async (presetId) => {
    try {
      await axios.patch(`${API}/presets/${presetId}`, { name: renameValue.trim() || null });
      setRenaming(null); setRenameValue("");
      await loadPresets();
    } catch (e) {
      setError(e.response?.data?.detail || "Could not rename preset.");
    }
  };
  const logPreset = async (presetId, targetSegment) => {
    setError("");
    try {
      await axios.post(`${API}/presets/${presetId}/log`, { date: dateKey, segment: targetSegment });
      await Promise.all([loadMeals(), loadPresets()]);
    } catch (e) {
      setError(e.response?.data?.detail || "Could not log preset.");
    }
  };
  const removePreset = async (presetId) => {
    try { await axios.delete(`${API}/presets/${presetId}`); setPresets((items) => items.filter((p) => p.id !== presetId)); } catch { /* silent */ }
  };
  const walkingCalories = Math.round(Number(steps || 0) * Number(weight || 0) * 0.0005);
  const totalBurn = 2000 + walkingCalories;
  const deficit = totalBurn - totals.calories;
  const estimatedLoss = Math.abs(deficit) / 7700;
  const updateEstimate = (field, value) => setEstimate((current) => ({ ...current, [field]: value }));

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <div><p className="eyebrow">YOUR NUTRITION, SIMPLIFIED</p><h1>Daily dashboard</h1></div>
          <div className="topbar-actions">
            <button className="export-btn" data-testid="open-export-button" onClick={() => setShowExport(true)}><Download size={15} />Export CSV</button>
            <div className="date-picker">
              <button data-testid="previous-day-button" onClick={() => setDate(subDays(date, 1))}><ArrowLeft size={17} /></button>
              <span data-testid="selected-date">{format(date, "EEEE, MMM d")}{dateKey === format(new Date(), "yyyy-MM-dd") && <em>Today</em>}</span>
              <button data-testid="next-day-button" onClick={() => setDate(addDays(date, 1))}><ArrowRight size={17} /></button>
            </div>
          </div>
        </header>
        <section className="hero-band">
          <div className="hero-copy">
            <span className="kicker"><Sparkles size={14} /> POWERED BY GPT-5.4</span>
            <h2>What did you eat?</h2>
            <p>Tell us about one meal in your own words. We’ll estimate the rest.</p>
            <div className="entry-box">
              <textarea data-testid="meal-description-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. 140g air fried chicken + 100g boiled black chana + salad" />
              <div className="entry-footer">
                <div className="segment-select"><span>Meal</span><select data-testid="meal-segment-select" value={segment} onChange={(e) => setSegment(e.target.value)}>{segments.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div>
                <button className="calculate" data-testid="calculate-nutrition-button" onClick={calculate} disabled={loading || !text.trim()}>{loading ? <Loader2 className="spin" size={17} /> : <Sparkles size={17} />} {loading ? "Estimating..." : "Calculate nutrition"}</button>
              </div>
            </div>
          </div>
          <img className="hero-image" alt="Healthy chicken and salad bowl" src="https://images.unsplash.com/photo-1574926054530-540288c8e678?auto=format&fit=crop&w=900&q=80" />
        </section>
        {presets.length > 0 && (
          <section className="presets" data-testid="presets-strip">
            <div className="section-heading">
              <div><p className="eyebrow">ONE-TAP LOG</p><h3>Your saved meals</h3></div>
              <span className="meal-count">{presets.length} preset{presets.length === 1 ? "" : "s"}</span>
            </div>
            <div className="preset-list">
              {presets.map((p) => (
                <div className="preset-card" key={p.id} data-testid={`preset-${p.id}`}>
                  <div className="preset-head">
                    <Bookmark size={14} />
                    {renaming === p.id ? (
                      <input
                        className="preset-rename-input"
                        data-testid={`rename-preset-${p.id}-input`}
                        value={renameValue}
                        maxLength={60}
                        autoFocus
                        placeholder="Give it a nickname"
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitRename(p.id); if (e.key === "Escape") cancelRename(); }}
                        onBlur={() => commitRename(p.id)}
                      />
                    ) : (
                      <button className="preset-title" data-testid={`rename-preset-${p.id}-button`} onClick={() => startRename(p)} title="Rename">
                        {p.name || <span className="preset-title-muted">Add nickname</span>}
                      </button>
                    )}
                    <button className="preset-remove" data-testid={`delete-preset-${p.id}`} onClick={() => removePreset(p.id)} aria-label="Delete preset"><Trash2 size={13} /></button>
                  </div>
                  <p className="preset-text" title={p.meal_text}>{p.meal_text}</p>
                  <div className="preset-macros">
                    <strong>{Math.round(p.calories)} kcal</strong>
                    <span>P {Math.round(p.protein)}g · C {Math.round(p.carbs)}g · F {Math.round(p.fats)}g</span>
                  </div>
                  <div className="preset-actions">
                    {segments.map((seg) => (
                      <button key={seg} data-testid={`log-preset-${p.id}-${seg.toLowerCase()}`} onClick={() => logPreset(p.id, seg)} className="preset-log">
                        <Plus size={12} />{seg}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {error && <div className="error" data-testid="nutrition-error">{error}</div>}
        {estimate && (
          <section className="estimate" data-testid="nutrition-estimate-card">
            <div>
              <p className="eyebrow">ESTIMATE READY · {segment.toUpperCase()}</p>
              <h3>Here’s the nutrition read</h3>
              <p className="estimate-note">{estimate.note || "Based on typical preparation and serving sizes."}</p>
              <p className="edit-hint">Review or adjust any number before saving.</p>
            </div>
            <div className="estimate-grid">
              {[["Calories", estimate.calories, "kcal", "calories"], ["Protein", estimate.protein, "g", "protein"], ["Carbs", estimate.carbs, "g", "carbs"], ["Fibre", estimate.fibre, "g", "fibre"], ["Fats", estimate.fats, "g", "fats"]].map(([label, value, unit, field]) => (
                <EstimateMetric key={label} label={label} value={value} unit={unit} onChange={(nextValue) => updateEstimate(field, nextValue)} testId={`edit-${field}-input`} />
              ))}
            </div>
            <div className="estimate-actions">
              <button className="save" data-testid="save-meal-button" onClick={saveMeal} disabled={saving}><Check size={17} /> {saving ? "Saving..." : "Save to today"}</button>
              <div className="preset-save-row">
                <input className="preset-name-input" data-testid="preset-name-input" type="text" maxLength={60} placeholder="Optional nickname" value={presetName} onChange={(e) => setPresetName(e.target.value)} />
                <button className="save-secondary" data-testid="save-preset-button" onClick={saveAsPreset}>{presetSaved ? <Check size={15} /> : <BookmarkPlus size={15} />} {presetSaved ? "Saved" : "Save preset"}</button>
              </div>
            </div>
          </section>
        )}
        <section className="walking-card" data-testid="walking-tracker-card">
          <div className="walking-head"><div className="walking-title"><span className="walk-icon"><Footprints size={19} /></span><div><p className="eyebrow">DAILY MOVEMENT</p><h3>Walking & deficit</h3></div></div><Settings size={17} className="settings-icon" /></div>
          <div className="walking-inputs">
            <label><span>Steps walked</span><input data-testid="steps-input" type="number" min="0" value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="e.g. 8000" /></label>
            <label><span>Current weight</span><div className="unit-input"><input data-testid="weight-input" type="number" min="1" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Enter kg" /><small>kg</small></div></label>
            <button data-testid="save-walking-button" className="save-walking" onClick={saveWalking}><Check size={16} /> {weightSaved ? "Saved" : "Save activity"}</button>
          </div>
          <div className="deficit-strip">
            <div><span>Walking burn</span><strong data-testid="walking-calories">+{walkingCalories} kcal</strong></div>
            <div><span>Daily burn</span><strong>{totalBurn.toLocaleString()} kcal</strong></div>
            <div className={deficit >= 0 ? "deficit-positive" : "deficit-negative"}><span>{deficit >= 0 ? "Today’s deficit" : "Over baseline"}</span><strong data-testid="daily-deficit">{deficit >= 0 ? "−" : "+"}{Math.abs(Math.round(deficit)).toLocaleString()} kcal</strong></div>
            <div><span>Est. weight change</span><strong data-testid="estimated-weight-loss">{deficit >= 0 ? "−" : "+"}{estimatedLoss.toFixed(2)} kg</strong><small>{deficit >= 0 ? "based on 7,700 kcal / kg" : "estimated gain if repeated"}</small></div>
          </div>
        </section>
        <section className="content-grid">
          <div className="summary">
            <div className="section-heading"><div><p className="eyebrow">{dateKey === format(new Date(), "yyyy-MM-dd") ? "TODAY" : format(date, "MMM d, yyyy").toUpperCase()}</p><h3>Daily balance</h3></div><span className="calorie-total" data-testid="daily-calories-total"><strong>{Math.round(totals.calories)}</strong> / 2,000 kcal</span></div>
            <div className="macro-list"><Macro label="Protein" value={totals.protein} target={130} color="#2D6A4F" /><Macro label="Carbs" value={totals.carbs} target={220} color="#D4A373" /><Macro label="Fibre" value={totals.fibre} target={30} color="#74A57F" /><Macro label="Fats" value={totals.fats} target={65} color="#E07A5F" /></div>
          </div>
          <div className="meals">
            <div className="section-heading"><div><p className="eyebrow">YOUR LOG</p><h3>Meals today</h3></div><span className="meal-count" data-testid="meal-count">{meals.length} {meals.length === 1 ? "meal" : "meals"}</span></div>
            {segments.map((seg) => (
              <div className="meal-row" key={seg} data-testid={`meal-segment-${seg.toLowerCase()}`}>
                <div className="meal-name">
                  <span className={`meal-icon ${seg.toLowerCase()}`}>{seg === "Snacks" ? <Plus size={16} /> : <Utensils size={16} />}</span>
                  <div><strong>{seg}</strong>{meals.filter((m) => m.segment === seg).map((meal) => <p key={meal.id}>{meal.meal_text}</p>)}</div>
                </div>
                <div className="meal-value">
                  {meals.filter((m) => m.segment === seg).reduce((sum, m) => sum + Number(m.calories), 0) > 0 ? `${Math.round(meals.filter((m) => m.segment === seg).reduce((sum, m) => sum + Number(m.calories), 0))} kcal` : "—"}
                  {meals.filter((m) => m.segment === seg).map((meal) => <button key={meal.id} className="delete" data-testid={`delete-meal-${meal.id}`} onClick={() => removeMeal(meal.id)} aria-label={`Delete ${seg} meal`}><Trash2 size={15} /></button>)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      {showExport && <ExportDialog dateKey={dateKey} onClose={() => setShowExport(false)} />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/deficit" element={<Deficit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
