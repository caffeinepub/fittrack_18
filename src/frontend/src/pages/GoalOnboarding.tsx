import { Button } from "@/components/ui/button";
import { Heart, TrendingDown, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

function BicepIcon({ className }: { className?: string }) {
  return (
    <span className={`leading-none ${className ?? ""}`} aria-hidden="true">
      💪
    </span>
  );
}

interface GoalOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
  bgClass: string;
  ringClass: string;
}

const GOALS: GoalOption[] = [
  {
    id: "lose_weight",
    label: "Lose Weight",
    description: "Burn fat & hit a calorie deficit",
    icon: TrendingDown,
    accentClass: "text-calories",
    bgClass: "bg-calories/10",
    ringClass: "ring-calories/60",
  },
  {
    id: "gain_weight",
    label: "Gain Weight",
    description: "Increase calories & build mass",
    icon: TrendingUp,
    accentClass: "text-protein",
    bgClass: "bg-protein/10",
    ringClass: "ring-protein/60",
  },
  {
    id: "gain_muscle",
    label: "Gain Muscle",
    description: "Lift heavy & boost protein intake",
    icon: BicepIcon,
    accentClass: "text-primary",
    bgClass: "bg-primary/10",
    ringClass: "ring-primary/60",
  },
  {
    id: "healthier_decisions",
    label: "Healthier Decisions",
    description: "Build balanced, sustainable habits",
    icon: Heart,
    accentClass: "text-carbs",
    bgClass: "bg-carbs/10",
    ringClass: "ring-carbs/60",
  },
];

interface GoalOnboardingProps {
  onComplete: (goal: string) => void;
}

export default function GoalOnboarding({ onComplete }: GoalOnboardingProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleSubmit() {
    if (!selected) return;
    onComplete(selected);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Atmospheric background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-protein/6 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-calories/4 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 flex flex-col gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 280,
              damping: 18,
            }}
            className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-glow mx-auto mb-5"
          >
            <span className="text-3xl leading-none">💪</span>
          </motion.div>
          <h1 className="font-display font-black text-3xl text-foreground tracking-tight leading-tight">
            What's your goal?
          </h1>
          <p className="text-muted-foreground text-sm mt-2 font-body leading-relaxed">
            We'll personalize Muscle Build for you.
          </p>
        </motion.div>

        {/* Goal cards — 2x2 grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="grid grid-cols-2 gap-3"
        >
          {GOALS.map((goal, i) => {
            const Icon = goal.icon;
            const isSelected = selected === goal.id;
            return (
              <motion.button
                key={goal.id}
                data-ocid={
                  `onboarding.card.${i + 1}` as `onboarding.card.${1 | 2 | 3 | 4}`
                }
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.25 + i * 0.07,
                  duration: 0.3,
                  ease: "easeOut",
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(goal.id)}
                className={[
                  "relative flex flex-col items-center justify-center gap-3 rounded-2xl p-5 text-center transition-all duration-200",
                  "border-2 min-h-[120px] cursor-pointer outline-none focus-visible:outline-none",
                  isSelected
                    ? `bg-card border-primary ring-2 ${goal.ringClass} shadow-glow-sm`
                    : "bg-card border-border hover:border-primary/40 hover:bg-card/80",
                ].join(" ")}
              >
                <div
                  className={[
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-200",
                    isSelected ? goal.bgClass : "bg-muted",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "w-5 h-5 transition-colors duration-200",
                      isSelected ? goal.accentClass : "text-muted-foreground",
                    ].join(" ")}
                  />
                </div>
                <div>
                  <div
                    className={[
                      "font-display font-bold text-sm leading-tight transition-colors duration-200",
                      isSelected ? "text-foreground" : "text-foreground/80",
                    ].join(" ")}
                  >
                    {goal.label}
                  </div>
                  <div className="text-muted-foreground text-xs mt-0.5 font-body leading-snug">
                    {goal.description}
                  </div>
                </div>

                {/* Selected checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <svg
                        className="w-3 h-3 text-primary-foreground"
                        viewBox="0 0 12 12"
                        fill="none"
                        role="img"
                        aria-label="Selected"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <Button
            data-ocid="onboarding.submit_button"
            onClick={handleSubmit}
            disabled={!selected}
            size="lg"
            className="w-full h-14 text-base font-display font-bold tracking-wide shadow-glow disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            {selected ? "Let's Go 🚀" : "Pick a goal to continue"}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3 font-body">
            You can change this anytime in settings
          </p>
        </motion.div>
      </div>
    </div>
  );
}
