"use client";

import { Plus, Trash2, Utensils } from "lucide-react";
import { Meal } from "@/models/meals";
import { MEAL_SEGMENTS } from "@/constants/segments";

interface MealLogSectionProps {
  meals: Meal[];
  onDeleteMeal: (id: string) => void;
}

export default function MealLogSection({ meals, onDeleteMeal }: MealLogSectionProps) {
  return (
    <div className="meals">
      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR LOG</p>
          <h3>Meals today</h3>
        </div>
        <span className="meal-count" data-testid="meal-count">
          {meals.length} {meals.length === 1 ? "meal" : "meals"}
        </span>
      </div>

      {MEAL_SEGMENTS.map((seg) => {
        const segMeals = meals.filter((m) => m.segment === seg);
        const segCalories = segMeals.reduce((sum, m) => sum + Number(m.calories || 0), 0);

        return (
          <div
            className="meal-row"
            key={seg}
            data-testid={`meal-segment-${seg.toLowerCase()}`}
          >
            <div className="meal-name">
              <span className={`meal-icon ${seg.toLowerCase()}`}>
                {seg === "Snacks" ? <Plus size={16} /> : <Utensils size={16} />}
              </span>
              <div>
                <strong>{seg}</strong>
                {segMeals.map((meal) => (
                  <p key={meal.id}>{meal.meal_text}</p>
                ))}
              </div>
            </div>

            <div className="meal-value">
              {segCalories > 0 ? `${Math.round(segCalories)} kcal` : "—"}
              {segMeals.map((meal) => (
                <button
                  key={meal.id}
                  className="delete"
                  data-testid={`delete-meal-${meal.id}`}
                  onClick={() => onDeleteMeal(meal.id)}
                  aria-label={`Delete ${seg} meal`}
                >
                  <Trash2 size={15} />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
