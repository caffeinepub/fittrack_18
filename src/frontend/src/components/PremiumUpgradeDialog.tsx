import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown, Sparkles, X, Zap } from "lucide-react";
import { motion } from "motion/react";

interface PremiumUpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

export default function PremiumUpgradeDialog({
  open,
  onClose,
  onUnlock,
}: PremiumUpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-sm gap-0 p-0 overflow-hidden border-border"
        data-ocid="premium.dialog"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-4 border-b border-border/50">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-3 shadow-glow-sm"
          >
            <Crown className="w-7 h-7 text-primary" />
          </motion.div>

          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="font-display text-xl text-foreground leading-tight">
              Unlock Advanced Settings
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Get the muscle heatmap — see exactly which muscles you hit and how
              hard, color-coded from your workouts.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Features list */}
        <div className="px-6 py-4 space-y-3">
          {[
            { icon: Sparkles, text: "Interactive human body diagram" },
            { icon: Zap, text: "Color-coded muscle intensity tracking" },
            { icon: Crown, text: "7-day workout heatmap analysis" },
          ].map((feature, i) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className="flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm text-foreground font-body">
                {feature.text}
              </span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-2">
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-display font-bold text-foreground">
              Free
            </span>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={onUnlock}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold shadow-glow-sm"
              data-ocid="premium.subscribe_button"
            >
              <Crown className="w-4 h-4 mr-2" />
              Unlock for Free
            </Button>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-muted-foreground hover:text-foreground font-body"
              data-ocid="premium.cancel_button"
            >
              Maybe later
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
