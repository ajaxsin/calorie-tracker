"use client";

import { format, parseISO } from "date-fns";
import { Utensils } from "lucide-react";
import { DaySummary } from "@/models/summary";
import { MEAL_SEGMENTS } from "@/constants/segments";

interface DayByDayListProps {
  trackedDays: DaySummary[];
}

export default function DayByDayList({ trackedDays }: DayByDayListProps) {
  if (!trackedDays || trackedDays.length === 0) return null;

  const sortedDays = [...trackedDays].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="day-log" data-testid="day-log">
      <div className="section-heading">
        <div>
          <p className="eyebrow">DAY BY DAY</p>
          <h3>What you ate</h3>
        </div>
        <span className="meal-count">
          {sortedDays.length} day{sortedDays.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="day-list">
        {sortedDays.map((d) => {
          const dt = parseISO(d.date);
          return (
            <article
              className="day-card"
              key={d.date}
              data-testid={`day-card-${d.date}`}
            >
              <header className="day-head">
                <div className="day-cal">
                  <span className="day-num">{format(dt, "d")}</span>
                  <div>
                    <strong>{format(dt, "EEEE")}</strong>
                    <small>{format(dt, "MMM yyyy")}</small>
                  </div>
                </div>
                <div className="day-macros" data-testid={`day-macros-${d.date}`}>
                  <span>
                    <em>{Math.round(d.calories)}</em>kcal
                  </span>
                  <span>
                    <em>{Math.round(d.protein)}</em>P
                  </span>
                  <span>
                    <em>{Math.round(d.carbs)}</em>C
                  </span>
                  <span>
                    <em>{Math.round(d.fibre)}</em>Fi
                  </span>
                  <span>
                    <em>{Math.round(d.fats)}</em>Fa
                  </span>
                  {d.steps > 0 && (
                    <span className="day-steps">
                      <em>{d.steps.toLocaleString()}</em>steps
                    </span>
                  )}
                </div>
              </header>

              <div className="day-segments">
                {MEAL_SEGMENTS.map((seg) => {
                  const items = d.segments?.[seg] || [];
                  return (
                    <div
                      className="day-seg"
                      key={seg}
                      data-testid={`day-${d.date}-${seg.toLowerCase()}`}
                    >
                      <div className="day-seg-head">
                        <span className={`meal-icon ${seg.toLowerCase()}`}>
                          <Utensils size={13} />
                        </span>
                        <strong>{seg}</strong>
                      </div>
                      {items.length === 0 ? (
                        <p className="empty-seg">—</p>
                      ) : (
                        items.map((meal) => (
                          <p key={meal.id}>
                            {meal.meal_text}
                            <em>{Math.round(meal.calories)} kcal</em>
                          </p>
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
  );
}
