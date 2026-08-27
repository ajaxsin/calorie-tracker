"use client";

import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import { MEAL_SEGMENTS, MealSegment } from "@/constants/segments";

interface HeroMealInputProps {
  text: string;
  setText: (text: string) => void;
  segment: MealSegment;
  setSegment: (segment: MealSegment) => void;
  loading: boolean;
  onCalculate: () => void;
  onFocus: () => void;
}

export default function HeroMealInput({
  text,
  setText,
  segment,
  setSegment,
  loading,
  onCalculate,
  onFocus,
}: HeroMealInputProps) {
  return (
    <section className="hero-band">
      <div className="hero-copy">
        <span className="kicker">
          <Sparkles size={14} /> POWERED BY AI NUTRITION
        </span>
        <h2>What did you eat?</h2>
        <p>Tell us about one meal in your own words. We’ll estimate the rest.</p>
        <div className="entry-box">
          <textarea
            data-testid="meal-description-input"
            value={text}
            onFocus={onFocus}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. 140g air fried chicken + 100g boiled black chana + salad"
          />
          <div className="entry-footer">
            <div className="segment-select">
              <span>Meal</span>
              <select
                data-testid="meal-segment-select"
                value={segment}
                onChange={(e) => setSegment(e.target.value as MealSegment)}
              >
                {MEAL_SEGMENTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </div>
            <button
              className="calculate"
              data-testid="calculate-nutrition-button"
              onClick={onCalculate}
              disabled={loading || !text.trim()}
            >
              {loading ? (
                <Loader2 className="spin" size={17} />
              ) : (
                <Sparkles size={17} />
              )}
              {loading ? "Estimating..." : "Calculate nutrition"}
            </button>
          </div>
        </div>
      </div>
      <img
        className="hero-image"
        alt="Healthy chicken and salad bowl"
        src="https://images.unsplash.com/photo-1574926054530-540288c8e678?auto=format&fit=crop&w=900&q=80"
      />
    </section>
  );
}
