import { CheckCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { usePremiumStatus, useStripeSessionStatus } from "../hooks/useStripe";

export default function PaymentSuccess() {
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get("session_id");

  const { setPremium } = usePremiumStatus();
  const [activated, setActivated] = useState(false);
  const { data: status, isLoading } = useStripeSessionStatus(sessionId);

  useEffect(() => {
    if (!status) return;
    if (status.__kind__ === "completed" && !activated) {
      setPremium(true);
      setActivated(true);
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [status, activated, setPremium]);

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-6"
      data-ocid="payment.success_state"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-sm w-full text-center space-y-6"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="w-24 h-24 mx-auto rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center"
        >
          {isLoading && !activated ? (
            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
          ) : (
            <CheckCircle className="w-12 h-12 text-green-500" />
          )}
        </motion.div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {activated ? "Heatmap Unlocked!" : "Processing Payment..."}
          </h1>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            {activated
              ? "Payment successful! The muscle heatmap is now unlocked. Redirecting you back to the app..."
              : "We're confirming your payment with Stripe. This usually takes just a moment."}
          </p>
        </div>

        {/* Loading dots */}
        {isLoading && !activated && (
          <div className="flex gap-1.5 justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
          </div>
        )}

        {activated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground font-body"
          >
            Redirecting in a moment...
          </motion.div>
        )}

        {/* Manual redirect fallback */}
        {activated && (
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="text-sm text-primary hover:underline font-body"
          >
            Go to app now →
          </button>
        )}
      </motion.div>
    </div>
  );
}
