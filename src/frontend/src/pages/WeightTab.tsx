import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Minus,
  Plus,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddBodyWeightEntry,
  useAllBodyWeightEntries,
  useDeleteBodyWeightEntry,
} from "../hooks/useQueries";

function today() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function kgToLbs(kg: number) {
  return kg * 2.20462;
}

interface WeightChartProps {
  entries: { date: string; weight: number }[];
  useKg: boolean;
}

function WeightChart({ entries, useKg }: WeightChartProps) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) return null;

  const values = sorted.map((e) => (useKg ? e.weight : kgToLbs(e.weight)));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const W = 320;
  const H = 100;
  const PAD = 12;

  const points = sorted.map((_, i) => {
    const x = PAD + (i / (sorted.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((values[i] - minVal) / range) * (H - PAD * 2);
    return { x, y, val: values[i], date: sorted[i].date };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `M ${points[0].x},${H - PAD} ${points.map((p) => `L ${p.x},${p.y}`).join(" ")} L ${points[points.length - 1].x},${H - PAD} Z`;

  const latest = values[values.length - 1];
  const first = values[0];
  const diff = latest - first;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
          Weight Trend
        </div>
        <div className="flex items-center gap-1">
          {diff < -0.1 ? (
            <TrendingDown className="w-4 h-4 text-primary" />
          ) : diff > 0.1 ? (
            <TrendingUp className="w-4 h-4 text-destructive" />
          ) : (
            <Minus className="w-4 h-4 text-muted-foreground" />
          )}
          <span
            className={`text-xs font-display font-bold ${diff < -0.1 ? "text-primary" : diff > 0.1 ? "text-destructive" : "text-muted-foreground"}`}
          >
            {diff > 0 ? "+" : ""}
            {diff.toFixed(1)}
            {useKg ? " kg" : " lbs"} overall
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 100 }}
        role="img"
        aria-label="Weight trend chart"
      >
        <title>Weight trend chart</title>
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="oklch(0.65 0.18 230)"
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor="oklch(0.65 0.18 230)"
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill="url(#weightGrad)" />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="oklch(0.65 0.18 230)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={`${p.date}-pt`}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 4 : 2.5}
            fill={
              i === points.length - 1
                ? "oklch(0.65 0.18 230)"
                : "oklch(0.16 0.008 250)"
            }
            stroke="oklch(0.65 0.18 230)"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground font-body">
          {formatDate(sorted[0].date)}
        </span>
        {sorted.length > 2 && (
          <span className="text-[10px] text-muted-foreground font-body">
            {formatDate(sorted[Math.floor(sorted.length / 2)].date)}
          </span>
        )}
        <span className="text-[10px] text-muted-foreground font-body">
          {formatDate(sorted[sorted.length - 1].date)}
        </span>
      </div>
    </div>
  );
}

export default function WeightTab() {
  const [open, setOpen] = useState(false);
  const [useKg, setUseKg] = useState(true);
  const [form, setForm] = useState({ date: today(), weight: "" });

  const weightQuery = useAllBodyWeightEntries();
  const addMutation = useAddBodyWeightEntry();
  const deleteMutation = useDeleteBodyWeightEntry();

  const entries = [...(weightQuery.data ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rawWeight = Number.parseFloat(form.weight);
    if (!rawWeight || rawWeight <= 0) {
      toast.error("Enter a valid weight");
      return;
    }
    const weightInKg = useKg ? rawWeight : rawWeight / 2.20462;

    addMutation.mutate(
      { date: form.date, weight: Number.parseFloat(weightInKg.toFixed(2)) },
      {
        onSuccess: () => {
          toast.success("Weight logged!");
          setForm({ date: today(), weight: "" });
          setOpen(false);
        },
        onError: () => toast.error("Failed to log weight"),
      },
    );
  }

  function handleDelete(date: string) {
    deleteMutation.mutate(date, {
      onSuccess: () => toast.success("Entry removed"),
      onError: () => toast.error("Failed to remove entry"),
    });
  }

  function displayWeight(kg: number) {
    return useKg ? kg.toFixed(1) : kgToLbs(kg).toFixed(1);
  }

  const unit = useKg ? "kg" : "lbs";

  return (
    <section className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-black text-2xl text-foreground">
          Weight
        </h2>
        <div className="flex items-center gap-2">
          {/* Unit toggle */}
          <div className="flex items-center bg-card border border-border rounded-lg p-0.5 text-xs font-body">
            <button
              type="button"
              onClick={() => setUseKg(true)}
              className={`px-2.5 py-1 rounded-md transition-colors ${useKg ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"}`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => setUseKg(false)}
              className={`px-2.5 py-1 rounded-md transition-colors ${!useKg ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"}`}
            >
              lbs
            </button>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="weight.add_button"
                size="sm"
                className="gap-1.5 font-display font-bold shadow-glow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Weight
              </Button>
            </DialogTrigger>

            <DialogContent
              data-ocid="weight.add_weight.dialog"
              className="bg-popover border-border max-w-sm mx-auto"
            >
              <DialogHeader>
                <DialogTitle className="font-display font-bold text-foreground">
                  Log Body Weight
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="weight-date"
                    className="text-sm font-body text-muted-foreground"
                  >
                    Date
                  </Label>
                  <Input
                    id="weight-date"
                    data-ocid="weight.date.input"
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, date: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="weight-value"
                    className="text-sm font-body text-muted-foreground"
                  >
                    Weight ({unit})
                  </Label>
                  <Input
                    id="weight-value"
                    data-ocid="weight.value.input"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder={useKg ? "e.g. 75.5" : "e.g. 166.4"}
                    value={form.weight}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, weight: e.target.value }))
                    }
                    className="bg-input border-border"
                    required
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    data-ocid="weight.save.submit_button"
                    className="w-full font-display font-bold shadow-glow-sm"
                    disabled={addMutation.isPending}
                  >
                    {addMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Weight"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Chart */}
      {weightQuery.isLoading ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : entries.length >= 2 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <WeightChart entries={entries} useKg={useKg} />
        </motion.div>
      ) : entries.length === 1 ? (
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground font-body">
            Log at least 2 entries to see your trend chart.
          </p>
        </div>
      ) : null}

      {/* Entries List */}
      {weightQuery.isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div
          data-ocid="weight.entry.empty_state"
          className="flex flex-col items-center py-16 bg-card border border-border rounded-xl"
        >
          <Scale className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground font-body">
            No weight entries yet
          </p>
          <p className="text-xs text-muted-foreground/60 font-body mt-1">
            Tap "Add Weight" to start tracking
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider">
            History
          </div>
          <AnimatePresence>
            {entries.map((entry, i) => (
              <motion.div
                key={entry.date}
                data-ocid={`weight.entry.item.${i + 1}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-protein/15 flex items-center justify-center flex-shrink-0">
                    <Scale className="w-4 h-4 text-protein" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-body">
                      {formatDate(entry.date)}
                    </div>
                    <div className="font-display font-bold text-lg text-foreground leading-tight">
                      {displayWeight(entry.weight)}
                      <span className="text-sm font-body font-normal text-muted-foreground ml-1">
                        {unit}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  data-ocid={`weight.entry.delete_button.${i + 1}`}
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={() => handleDelete(entry.date)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
