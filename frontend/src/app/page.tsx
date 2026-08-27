"use client";

import { useEffect, useMemo, useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { ArrowLeft, ArrowRight, Download, Upload } from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import HeroMealInput from "@/components/dashboard/HeroMealInput";
import NutritionEstimateCard from "@/components/dashboard/NutritionEstimateCard";
import PresetStrip from "@/components/dashboard/PresetStrip";
import WalkingDeficitCard from "@/components/dashboard/WalkingDeficitCard";
import DailyBalanceCard from "@/components/dashboard/DailyBalanceCard";
import MealLogSection from "@/components/dashboard/MealLogSection";
import ExportCsvModal from "@/components/dashboard/ExportCsvModal";
import ImportCsvModal from "@/components/dashboard/ImportCsvModal";

import { MealSegment } from "@/constants/segments";
import { EstimateResponse } from "@/models/estimate";

import { useMeals, useCreateMeal, useDeleteMeal } from "@/hooks/useMeals";
import {
  usePresets,
  useCreatePreset,
  useDeletePreset,
  useRenamePreset,
  useLogPreset,
} from "@/hooks/usePresets";
import { useActivity, useUpdateActivity } from "@/hooks/useActivity";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useNutritionEstimate } from "@/hooks/useNutritionEstimate";

export default function DashboardPage() {
  const [date, setDate] = useState(new Date());
  const [segment, setSegment] = useState<MealSegment>("Breakfast");
  const [text, setText] = useState("");
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
  const [error, setError] = useState("");
  const [stepsInput, setStepsInput] = useState<string>("0");
  const [weightInput, setWeightInput] = useState<string>("");
  const [weightSaved, setWeightSaved] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetSaved, setPresetSaved] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);


  const dateKey = format(date, "yyyy-MM-dd");
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const isToday = dateKey === todayKey;

  const jumpToToday = () => {
    if (dateKey !== todayKey) setDate(new Date());
  };

  // Queries
  const { data: meals = [] } = useMeals(dateKey);
  const { data: presets = [] } = usePresets();
  const { data: activity } = useActivity(dateKey);
  const { data: settings } = useSettings();

  // Mutations
  const createMealMutation = useCreateMeal(dateKey);
  const deleteMealMutation = useDeleteMeal(dateKey);
  const createPresetMutation = useCreatePreset();
  const deletePresetMutation = useDeletePreset();
  const renamePresetMutation = useRenamePreset();
  const logPresetMutation = useLogPreset(dateKey);
  const updateActivityMutation = useUpdateActivity(dateKey);
  const updateSettingsMutation = useUpdateSettings();
  const estimateMutation = useNutritionEstimate();

  // Sync inputs from server data
  useEffect(() => {
    if (activity) {
      setStepsInput(String(activity.steps || 0));
    }
  }, [activity]);

  useEffect(() => {
    if (settings && settings.weight_kg) {
      setWeightInput(String(settings.weight_kg));
    }
  }, [settings]);

  // Handle midnight / tab focus
  useEffect(() => {
    const onFocus = () => {
      if (format(date, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd")) {
        setDate(new Date());
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [date]);

  // Totals rollup
  const totals = useMemo(() => {
    return meals.reduce(
      (sum, m) => ({
        calories: sum.calories + Number(m.calories || 0),
        protein: sum.protein + Number(m.protein || 0),
        carbs: sum.carbs + Number(m.carbs || 0),
        fibre: sum.fibre + Number(m.fibre || 0),
        fats: sum.fats + Number(m.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fibre: 0, fats: 0 }
    );
  }, [meals]);

  // Actions
  const handleCalculate = async () => {
    if (!text.trim()) return;
    setError("");
    try {
      const res = await estimateMutation.mutateAsync({ meal_text: text });
      setEstimate(res);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Could not calculate this meal.");
    }
  };

  const handleUpdateEstimateMetric = (field: keyof EstimateResponse, val: number) => {
    if (!estimate) return;
    setEstimate({ ...estimate, [field]: val });
  };

  const handleSaveMeal = async () => {
    if (!estimate) return;
    setError("");
    const targetDate = todayKey;
    try {
      await createMealMutation.mutateAsync({
        meal_text: text,
        segment,
        date: targetDate,
        calories: estimate.calories,
        protein: estimate.protein,
        carbs: estimate.carbs,
        fibre: estimate.fibre,
        fats: estimate.fats,
        confidence: estimate.confidence,
      });
      setText("");
      setEstimate(null);
      if (dateKey !== targetDate) {
        setDate(new Date());
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || "Could not save this meal.");
    }
  };

  const handleSavePreset = async () => {
    if (!estimate || !text.trim()) return;
    setError("");
    try {
      await createPresetMutation.mutateAsync({
        name: presetName.trim() || null,
        meal_text: text,
        calories: estimate.calories,
        protein: estimate.protein,
        carbs: estimate.carbs,
        fibre: estimate.fibre,
        fats: estimate.fats,
        confidence: estimate.confidence,
      });
      setPresetSaved(true);
      setPresetName("");
      setTimeout(() => setPresetSaved(false), 1800);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Could not save preset.");
    }
  };

  const handleLogPreset = async (presetId: string, targetSegment: string) => {
    setError("");
    const targetDate = todayKey;
    try {
      await logPresetMutation.mutateAsync({
        id: presetId,
        input: { date: targetDate, segment: targetSegment },
      });
      if (dateKey !== targetDate) {
        setDate(new Date());
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || "Could not log preset.");
    }
  };

  const handleRenamePreset = async (presetId: string, name: string) => {
    try {
      await renamePresetMutation.mutateAsync({
        id: presetId,
        input: { name: name || null },
      });
    } catch (e: any) {
      setError(e.response?.data?.detail || "Could not rename preset.");
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      await deletePresetMutation.mutateAsync(presetId);
    } catch {
      /* silent */
    }
  };

  const handleSaveWalking = async () => {
    const w = Number(weightInput);
    if (!w || w <= 0) {
      setError("Add your current weight first.");
      return;
    }
    try {
      await Promise.all([
        updateSettingsMutation.mutateAsync({ weight_kg: w }),
        updateActivityMutation.mutateAsync({
          date: dateKey,
          steps: Number(stepsInput) || 0,
        }),
      ]);
      setWeightSaved(true);
      setTimeout(() => setWeightSaved(false), 1800);
    } catch {
      setError("Could not save your walking details.");
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await deleteMealMutation.mutateAsync(id);
    } catch {
      setError("Could not delete meal.");
    }
  };

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR NUTRITION, SIMPLIFIED</p>
            <h1>Daily dashboard</h1>
          </div>
          <div className="topbar-actions">
            <button
              className="export-btn"
              data-testid="open-import-button"
              onClick={() => setShowImport(true)}
            >
              <Upload size={15} />
              Import CSV
            </button>
            <button
              className="export-btn"
              data-testid="open-export-button"
              onClick={() => setShowExport(true)}
            >
              <Download size={15} />
              Export CSV
            </button>
            <div className="date-picker">
              <button
                data-testid="previous-day-button"
                onClick={() => setDate(subDays(date, 1))}
              >
                <ArrowLeft size={17} />
              </button>
              <span data-testid="selected-date">
                {format(date, "EEEE, MMM d")}
                {isToday && <em>Today</em>}
              </span>
              <button
                data-testid="next-day-button"
                onClick={() => setDate(addDays(date, 1))}
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </header>

        <HeroMealInput
          text={text}
          setText={setText}
          segment={segment}
          setSegment={setSegment}
          loading={estimateMutation.isPending}
          onCalculate={handleCalculate}
          onFocus={jumpToToday}
        />

        <PresetStrip
          presets={presets}
          onLogPreset={handleLogPreset}
          onRenamePreset={handleRenamePreset}
          onDeletePreset={handleDeletePreset}
        />

        {error && (
          <div className="error" data-testid="nutrition-error">
            {error}
          </div>
        )}

        {estimate && (
          <NutritionEstimateCard
            segment={segment}
            estimate={estimate}
            onUpdateMetric={handleUpdateEstimateMetric}
            onSaveMeal={handleSaveMeal}
            savingMeal={createMealMutation.isPending}
            presetName={presetName}
            setPresetName={setPresetName}
            onSavePreset={handleSavePreset}
            presetSaved={presetSaved}
          />
        )}

        <WalkingDeficitCard
          steps={stepsInput}
          setSteps={setStepsInput}
          weight={weightInput}
          setWeight={setWeightInput}
          onSaveWalking={handleSaveWalking}
          weightSaved={weightSaved}
          totalIntakeCalories={totals.calories}
        />

        <section className="content-grid">
          <DailyBalanceCard
            dateKey={format(date, "MMM d, yyyy").toUpperCase()}
            isToday={isToday}
            totals={totals}
          />

          <MealLogSection
            meals={meals}
            onDeleteMeal={handleDeleteMeal}
          />
        </section>
      </main>

      {showExport && (
        <ExportCsvModal
          dateKey={dateKey}
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
