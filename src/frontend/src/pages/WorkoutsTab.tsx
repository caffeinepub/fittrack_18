import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Exercise } from "../backend.d";
import {
  useAddWorkoutSession,
  useAllWorkoutSessions,
  useDeleteWorkoutSession,
} from "../hooks/useQueries";

function today() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ExerciseForm {
  id: number;
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

let exerciseIdCounter = 0;

function newExercise(): ExerciseForm {
  return { id: ++exerciseIdCounter, name: "", sets: "", reps: "", weight: "" };
}

interface WorkoutForm {
  name: string;
  date: string;
  duration: string;
  exercises: ExerciseForm[];
}

export default function WorkoutsTab() {
  const [open, setOpen] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set(),
  );
  const [form, setForm] = useState<WorkoutForm>({
    name: "",
    date: today(),
    duration: "",
    exercises: [newExercise()],
  });

  const workoutsQuery = useAllWorkoutSessions();
  const addMutation = useAddWorkoutSession();
  const deleteMutation = useDeleteWorkoutSession();

  const sessions = [...(workoutsQuery.data ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  function toggleExpanded(key: string) {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function addExerciseRow() {
    setForm((p) => ({ ...p, exercises: [...p.exercises, newExercise()] }));
  }

  function removeExerciseRow(idx: number) {
    setForm((p) => ({
      ...p,
      exercises: p.exercises.filter((_, i) => i !== idx),
    }));
  }

  function updateExercise(
    idx: number,
    field: keyof ExerciseForm,
    value: string,
  ) {
    setForm((p) => {
      const exercises = [...p.exercises];
      exercises[idx] = { ...exercises[idx], [field]: value };
      return { ...p, exercises };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Enter a workout name");
      return;
    }

    const exercises: Exercise[] = form.exercises
      .filter((ex) => ex.name.trim())
      .map((ex) => ({
        name: ex.name.trim(),
        sets: BigInt(Number.parseInt(ex.sets) || 0),
        reps: BigInt(Number.parseInt(ex.reps) || 0),
        weight: Number.parseFloat(ex.weight) || 0,
      }));

    const session = {
      name: form.name.trim(),
      date: form.date,
      duration: Number.parseInt(form.duration) || 0,
      exercises,
    };

    addMutation.mutate(session, {
      onSuccess: () => {
        toast.success(`${session.name} saved!`);
        setForm({
          name: "",
          date: today(),
          duration: "",
          exercises: [newExercise()],
        });
        setOpen(false);
      },
      onError: () => toast.error("Failed to save workout"),
    });
  }

  function handleDelete(date: string, name: string) {
    deleteMutation.mutate(
      { date, name },
      {
        onSuccess: () => toast.success("Workout removed"),
        onError: () => toast.error("Failed to remove workout"),
      },
    );
  }

  return (
    <section className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-black text-2xl text-foreground">
          Workouts
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="workouts.add_button"
              size="sm"
              className="gap-1.5 font-display font-bold shadow-glow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Workout
            </Button>
          </DialogTrigger>

          <DialogContent
            data-ocid="workouts.add_workout.dialog"
            className="bg-popover border-border max-w-sm mx-auto max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-foreground">
                New Workout
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="workout-name"
                  className="text-sm font-body text-muted-foreground"
                >
                  Workout Name
                </Label>
                <Input
                  id="workout-name"
                  data-ocid="workouts.name.input"
                  placeholder="e.g. Upper Body Strength"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="bg-input border-border"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="workout-date"
                    className="text-sm font-body text-muted-foreground"
                  >
                    Date
                  </Label>
                  <Input
                    id="workout-date"
                    data-ocid="workouts.date.input"
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
                    htmlFor="workout-duration"
                    className="text-sm font-body text-muted-foreground"
                  >
                    Duration (min)
                  </Label>
                  <Input
                    id="workout-duration"
                    data-ocid="workouts.duration.input"
                    type="number"
                    min="0"
                    placeholder="45"
                    value={form.duration}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, duration: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>

              {/* Exercises */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-body text-muted-foreground">
                    Exercises
                  </Label>
                  <Button
                    type="button"
                    data-ocid="workouts.add_exercise.button"
                    variant="ghost"
                    size="sm"
                    onClick={addExerciseRow}
                    className="text-primary text-xs gap-1 h-7"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Exercise
                  </Button>
                </div>

                {form.exercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="bg-secondary/40 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        data-ocid="workouts.exercise.name.input"
                        placeholder="Exercise name"
                        value={ex.name}
                        onChange={(e) =>
                          updateExercise(idx, "name", e.target.value)
                        }
                        className="bg-input border-border text-sm h-8"
                      />
                      {form.exercises.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                          onClick={() => removeExerciseRow(idx)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground font-body">
                          Sets
                        </Label>
                        <Input
                          data-ocid="workouts.exercise.sets.input"
                          type="number"
                          min="0"
                          placeholder="3"
                          value={ex.sets}
                          onChange={(e) =>
                            updateExercise(idx, "sets", e.target.value)
                          }
                          className="bg-input border-border text-sm h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground font-body">
                          Reps
                        </Label>
                        <Input
                          data-ocid="workouts.exercise.reps.input"
                          type="number"
                          min="0"
                          placeholder="10"
                          value={ex.reps}
                          onChange={(e) =>
                            updateExercise(idx, "reps", e.target.value)
                          }
                          className="bg-input border-border text-sm h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground font-body">
                          Weight (kg)
                        </Label>
                        <Input
                          data-ocid="workouts.exercise.weight.input"
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="60"
                          value={ex.weight}
                          onChange={(e) =>
                            updateExercise(idx, "weight", e.target.value)
                          }
                          className="bg-input border-border text-sm h-8"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  data-ocid="workouts.save_workout.submit_button"
                  className="w-full font-display font-bold shadow-glow-sm"
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Workout"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workout List */}
      {workoutsQuery.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div
          data-ocid="workouts.session.empty_state"
          className="flex flex-col items-center py-16 bg-card border border-border rounded-xl"
        >
          <Dumbbell className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground font-body">
            No workouts logged yet
          </p>
          <p className="text-xs text-muted-foreground/60 font-body mt-1">
            Tap "Add Workout" to start tracking
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {sessions.map((session, i) => {
              const key = `${session.date}-${session.name}`;
              const isExpanded = expandedSessions.has(key);
              return (
                <motion.div
                  key={key}
                  data-ocid={`workouts.session.item.${i + 1}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleExpanded(key)}
                  >
                    <div className="flex items-center px-4 py-3.5 gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-body font-semibold text-sm text-foreground truncate">
                          {session.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground font-body">
                            {formatDate(session.date)}
                          </span>
                          <span className="text-xs text-primary font-display font-bold">
                            {session.duration}m
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {session.exercises.length} exercises
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          data-ocid={`workouts.session.delete_button.${i + 1}`}
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(session.date, session.name);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent>
                      {session.exercises.length > 0 && (
                        <div className="border-t border-border px-4 py-3 space-y-2">
                          <div className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Exercises
                          </div>
                          {session.exercises.map((ex, exIdx) => (
                            <div
                              key={`${ex.name}-${exIdx}`}
                              className="flex items-center justify-between py-1.5 px-3 bg-secondary/30 rounded-lg"
                            >
                              <span className="text-sm font-body text-foreground">
                                {ex.name}
                              </span>
                              <span className="text-xs text-muted-foreground font-body">
                                {ex.sets.toString()}×{ex.reps.toString()}
                                {ex.weight > 0 && ` @ ${ex.weight}kg`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
