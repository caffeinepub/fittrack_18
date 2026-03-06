import { Button } from "@/components/ui/button";
import { Dumbbell, Target, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const features = [
    { icon: Target, label: "Track Calories & Macros", color: "text-calories" },
    { icon: Dumbbell, label: "Log Your Workouts", color: "text-primary" },
    { icon: TrendingUp, label: "Monitor Weight Trends", color: "text-protein" },
    { icon: Zap, label: "Hit Your Daily Goals", color: "text-carbs" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-protein/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-calories/3 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-glow mb-4"
          >
            <Dumbbell className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="font-display font-black text-4xl tracking-tight text-foreground">
            FitTrack
          </h1>
          <p className="text-muted-foreground text-sm mt-2 font-body text-center">
            Your all-in-one fitness companion
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-10">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.3 }}
                className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${feature.color}`} />
                <span className="text-sm font-body text-foreground font-medium">
                  {feature.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Login CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.3 }}
        >
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-14 text-base font-display font-bold tracking-wide shadow-glow"
            size="lg"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              "Get Started"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3 font-body">
            Secure login with Internet Identity
          </p>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-muted-foreground font-body">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Built with love using caffeine.ai
        </a>
      </div>
    </div>
  );
}
