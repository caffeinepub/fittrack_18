import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import type { WorkoutSession } from "../backend.d";
import MuscleHeatmap from "../components/MuscleHeatmap";
import type { MuscleGroup, MuscleScores } from "../components/MuscleHeatmap";
import { useAllWorkoutSessions } from "../hooks/useQueries";

// Exercise → muscle group mapping
const EXERCISE_MUSCLE_MAP: Array<{ pattern: RegExp; muscles: MuscleGroup[] }> =
  [
    {
      pattern: /bench press|chest press|push.?up|pushup/i,
      muscles: ["chest", "triceps", "front_deltoid"],
    },
    {
      pattern: /squat|leg press/i,
      muscles: ["quads", "glutes", "hamstrings"],
    },
    {
      pattern: /deadlift/i,
      muscles: ["hamstrings", "glutes", "lower_back", "traps"],
    },
    {
      pattern: /pull.?up|lat pulldown|pulldown|row/i,
      muscles: ["lats", "biceps", "rear_deltoid"],
    },
    {
      pattern: /shoulder press|overhead press|ohp/i,
      muscles: ["front_deltoid", "rear_deltoid", "triceps"],
    },
    {
      pattern: /curl|bicep/i,
      muscles: ["biceps"],
    },
    {
      pattern: /tricep|skull|dip/i,
      muscles: ["triceps"],
    },
    {
      pattern: /lunge/i,
      muscles: ["quads", "glutes", "hamstrings"],
    },
    {
      pattern: /calf|calf raise/i,
      muscles: ["calves"],
    },
    {
      pattern: /ab|crunch|plank|sit.?up/i,
      muscles: ["abs", "obliques"],
    },
    {
      pattern: /shrug/i,
      muscles: ["traps"],
    },
    {
      pattern: /fly|pec/i,
      muscles: ["chest"],
    },
    {
      pattern: /rdl|romanian/i,
      muscles: ["hamstrings", "glutes", "lower_back"],
    },
  ];

function getMusclesForExercise(exerciseName: string): MuscleGroup[] {
  const muscles = new Set<MuscleGroup>();
  for (const { pattern, muscles: m } of EXERCISE_MUSCLE_MAP) {
    if (pattern.test(exerciseName)) {
      for (const muscle of m) muscles.add(muscle);
    }
  }
  return Array.from(muscles);
}

function computeMuscleScores(sessions: WorkoutSession[]): {
  scores: MuscleScores;
  todayMuscles: Set<MuscleGroup>;
} {
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const scores: MuscleScores = {};
  const todayMuscles = new Set<MuscleGroup>();
  const sessionsByMuscle = new Map<MuscleGroup, Set<string>>();

  for (const session of sessions) {
    // Only count sessions in the last 7 days
    if (session.date < sevenDaysAgo) continue;

    for (const exercise of session.exercises) {
      const muscles = getMusclesForExercise(exercise.name);
      for (const muscle of muscles) {
        if (!sessionsByMuscle.has(muscle)) {
          sessionsByMuscle.set(muscle, new Set());
        }
        sessionsByMuscle.get(muscle)!.add(session.date);

        if (session.date === today) {
          todayMuscles.add(muscle);
        }
      }
    }
  }

  for (const [muscle, dates] of sessionsByMuscle.entries()) {
    scores[muscle] = dates.size;
  }

  return { scores, todayMuscles };
}

export default function MuscleHeatmapTab() {
  const { data: sessions, isLoading } = useAllWorkoutSessions();

  const { scores, todayMuscles } = sessions
    ? computeMuscleScores(sessions)
    : { scores: {}, todayMuscles: new Set<MuscleGroup>() };

  return (
    <div className="px-4 pt-6 pb-8 space-y-6" data-ocid="body.section">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-1"
      >
        <h2 className="font-display font-bold text-2xl text-foreground tracking-tight">
          Muscle Heatmap
        </h2>
        <p className="text-sm text-muted-foreground font-body">
          Last 7 days — see which muscles you've hit and how hard
        </p>
      </motion.div>

      {/* Loading state */}
      {isLoading ? (
        <div
          className="flex flex-col items-center gap-4"
          data-ocid="body.loading_state"
        >
          <Skeleton className="w-[180px] h-[396px] rounded-2xl" />
          <div className="grid grid-cols-2 gap-2 w-full px-2">
            {["s1", "s2", "s3", "s4", "s5"].map((k) => (
              <Skeleton key={k} className="h-5 rounded-full" />
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <MuscleHeatmap scores={scores} todayMuscles={todayMuscles} />
        </motion.div>
      )}

      {/* Workout summary */}
      {!isLoading && sessions && sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-card border border-border p-4 space-y-2"
        >
          <h3 className="text-sm font-display font-semibold text-foreground">
            Recent Sessions
          </h3>
          <div className="space-y-1">
            {sessions
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 3)
              .map((session, i) => (
                <div
                  key={`${session.date}-${i}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground font-body">
                    {session.name}
                  </span>
                  <span className="text-muted-foreground font-body text-xs">
                    {session.date}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
