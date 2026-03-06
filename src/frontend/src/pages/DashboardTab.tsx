import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Beef,
  ChevronRight,
  Droplets,
  Flame,
  Heart,
  Loader2,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wheat,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { TabName } from "../App";
import MacroCard from "../components/MacroCard";
import {
  useAllBodyWeightEntries,
  useAllWorkoutSessions,
  useDailyTotals,
  useSeedDemoData,
} from "../hooks/useQueries";

interface DashboardTabProps {
  onNavigate: (tab: TabName) => void;
  goal?: string | null;
}

function BicepIcon({ className }: { className?: string }) {
  return (
    <span className={`leading-none ${className ?? ""}`} aria-hidden="true">
      💪
    </span>
  );
}

const GOAL_META: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    bgClass: string;
  }
> = {
  lose_weight: {
    label: "Lose Weight",
    icon: TrendingDown,
    colorClass: "text-calories",
    bgClass: "bg-calories/15",
  },
  gain_weight: {
    label: "Gain Weight",
    icon: TrendingUp,
    colorClass: "text-protein",
    bgClass: "bg-protein/15",
  },
  gain_muscle: {
    label: "Gain Muscle",
    icon: BicepIcon,
    colorClass: "text-primary",
    bgClass: "bg-primary/15",
  },
  healthier_decisions: {
    label: "Healthier Decisions",
    icon: Heart,
    colorClass: "text-carbs",
    bgClass: "bg-carbs/15",
  },
};

function today() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TARGETS = { calories: 2000, protein: 150, carbs: 200, fat: 65 };

export default function DashboardTab({ onNavigate, goal }: DashboardTabProps) {
  const todayDate = today();
  const totalsQuery = useDailyTotals(todayDate);
  const workoutsQuery = useAllWorkoutSessions();
  const weightQuery = useAllBodyWeightEntries();
  const seedMutation = useSeedDemoData();

  const totals = totalsQuery.data ?? {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
  const recentWorkouts = [...(workoutsQuery.data ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const latestWeight = [...(weightQuery.data ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0];

  const hasAnyData =
    (workoutsQuery.data?.length ?? 0) > 0 ||
    (weightQuery.data?.length ?? 0) > 0;

  const isLoading =
    totalsQuery.isLoading || workoutsQuery.isLoading || weightQuery.isLoading;

  function handleSeedDemo() {
    seedMutation.mutate(undefined, {
      onSuccess: () => toast.success("Demo data loaded!"),
      onError: () => toast.error("Failed to load demo data"),
    });
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4" data-ocid="dashboard.section">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  return (
    <section data-ocid="dashboard.section" className="p-4 space-y-6">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-display font-black text-2xl text-foreground leading-tight">
            Today's Overview
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground font-body">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            {goal &&
              GOAL_META[goal] &&
              (() => {
                const meta = GOAL_META[goal];
                const GoalIcon = meta.icon;
                return (
                  <Badge
                    data-ocid="dashboard.goal_badge"
                    className={[
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-body font-semibold border-0",
                      meta.bgClass,
                      meta.colorClass,
                    ].join(" ")}
                  >
                    <GoalIcon className="w-3 h-3 flex-shrink-0" />
                    {meta.label}
                  </Badge>
                );
              })()}
          </div>
        </div>
        {!hasAnyData && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSeedDemo}
            disabled={seedMutation.isPending}
            className="text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
          >
            {seedMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Load Demo
          </Button>
        )}
      </motion.div>

      {/* Macro cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07, duration: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        <MacroCard
          label="Calories"
          value={Math.round(totals.calories)}
          target={TARGETS.calories}
          unit=" kcal"
          icon={<Flame className="w-4 h-4" />}
          colorClass="text-calories"
          progressClass="progress-calories"
          bgClass="bg-calories/20"
        />
        <MacroCard
          label="Protein"
          value={Math.round(totals.protein)}
          target={TARGETS.protein}
          unit="g"
          icon={<Beef className="w-4 h-4" />}
          colorClass="text-protein"
          progressClass="progress-protein"
          bgClass="bg-protein/20"
        />
        <MacroCard
          label="Carbs"
          value={Math.round(totals.carbs)}
          target={TARGETS.carbs}
          unit="g"
          icon={<Wheat className="w-4 h-4" />}
          colorClass="text-carbs"
          progressClass="progress-carbs"
          bgClass="bg-carbs/20"
        />
        <MacroCard
          label="Fat"
          value={Math.round(totals.fat)}
          target={TARGETS.fat}
          unit="g"
          icon={<Droplets className="w-4 h-4" />}
          colorClass="text-fat"
          progressClass="progress-fat"
          bgClass="bg-fat/20"
        />
      </motion.div>

      {/* Recent Workouts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.3 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm leading-none" aria-hidden="true">
              💪
            </span>
            <h3 className="font-display font-bold text-sm text-foreground">
              Recent Workouts
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("workouts")}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="p-6 text-center">
            <span
              className="text-3xl leading-none block mx-auto mb-2"
              aria-hidden="true"
            >
              💪
            </span>
            <p className="text-sm text-muted-foreground font-body">
              No workouts logged yet
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 text-primary"
              onClick={() => onNavigate("workouts")}
            >
              Log your first workout
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentWorkouts.map((session) => (
              <div
                key={`${session.date}-${session.name}`}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-body font-semibold text-sm text-foreground">
                    {session.name}
                  </div>
                  <div className="text-xs text-muted-foreground font-body">
                    {formatDate(session.date)} · {session.exercises.length}{" "}
                    exercises
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-display font-bold text-primary">
                    {session.duration}m
                  </div>
                  <div className="text-xs text-muted-foreground font-body">
                    duration
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Latest Weight */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.21, duration: 0.3 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold text-sm text-foreground">
              Body Weight
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("weight")}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {latestWeight ? (
          <div className="px-4 py-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-body">
                Last recorded
              </div>
              <div className="text-sm font-body text-foreground mt-0.5">
                {formatDate(latestWeight.date)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-black text-3xl text-primary">
                {latestWeight.weight.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground font-body">kg</div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Scale className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-body">
              No weight logged yet
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 text-primary"
              onClick={() => onNavigate("weight")}
            >
              Log your weight
            </Button>
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground/60 font-body py-2">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted-foreground transition-colors"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </div>
    </section>
  );
}
