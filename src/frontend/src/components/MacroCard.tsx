import { Progress } from "@/components/ui/progress";
import type { ReactNode } from "react";

interface MacroCardProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  icon: ReactNode;
  colorClass: string;
  progressClass: string;
  bgClass: string;
}

export default function MacroCard({
  label,
  value,
  target,
  unit,
  icon,
  colorClass,
  progressClass,
  bgClass,
}: MacroCardProps) {
  const pct = Math.min(Math.round((value / target) * 100), 100);

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div
          className={`w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center`}
        >
          <span className={colorClass}>{icon}</span>
        </div>
        <span
          className={`text-xs font-body font-semibold ${pct >= 100 ? "text-primary" : "text-muted-foreground"}`}
        >
          {pct}%
        </span>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className={`font-display font-bold text-2xl ${colorClass}`}>
            {value.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground font-body">
            {unit}
          </span>
        </div>
        <div className="text-xs text-muted-foreground font-body">
          {label} · goal {target.toLocaleString()}
          {unit}
        </div>
      </div>
      <Progress value={pct} className={`h-1.5 bg-muted/40 ${progressClass}`} />
    </div>
  );
}
