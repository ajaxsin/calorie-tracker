"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, Flame, Leaf, Scale, Sparkles, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Daily dashboard", icon: Utensils, testId: "dashboard-navigation" },
    { href: "/history", label: "Meal history", icon: Flame, testId: "history-navigation" },
    { href: "/deficit", label: "Calorie deficit", icon: Scale, testId: "deficit-navigation" },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <Leaf size={18} />
        </span>
        <span>
          AJX90<span className="brand-dot">.</span>
        </span>
      </div>

      <nav>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(isActive && "nav-active")}
              data-testid={item.testId}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="side-note">
        <div className="note-icon">
          <Sparkles size={16} />
        </div>
        <p>
          <strong>Good food, clear data.</strong>
          <br />
          Paste what you ate and let your day take shape.
        </p>
      </div>

      <div className="help">
        <CircleHelp size={16} />
        Nutrition estimates are a guide
      </div>
    </aside>
  );
}
