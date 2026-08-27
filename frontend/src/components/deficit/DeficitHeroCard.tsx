"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeficitHeroCardProps {
  netDeficit: number;
  estimatedWeightChangeKg: number;
  trackedDays: number;
}

export default function DeficitHeroCard({
  netDeficit,
  estimatedWeightChangeKg,
  trackedDays,
}: DeficitHeroCardProps) {
  const isDeficit = netDeficit >= 0;

  return (
    <div className={cn("deficit-hero-card", isDeficit ? "positive" : "negative")}>
      <p className="eyebrow">{isDeficit ? "MONTH DEFICIT" : "MONTH SURPLUS"}</p>
      <div className="deficit-hero-value">
        {isDeficit ? <TrendingDown size={28} /> : <TrendingUp size={28} />}
        <strong data-testid="net-deficit">
          {Math.abs(netDeficit).toLocaleString()}
          <small> kcal</small>
        </strong>
      </div>
      <p className="deficit-hero-note">
        Est. weight change:{" "}
        <strong data-testid="est-weight-change">
          {isDeficit ? "−" : "+"}
          {Math.abs(estimatedWeightChangeKg).toFixed(2)} kg
        </strong>
        <br />
        <small>
          based on 7,700 kcal / kg over {trackedDays} tracked day
          {trackedDays === 1 ? "" : "s"}
        </small>
      </p>
    </div>
  );
}
