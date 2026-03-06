import { Button } from "@/components/ui/button";
import { ArrowLeft, XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function PaymentFailure() {
  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-6"
      data-ocid="payment.error_state"
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
          className="w-24 h-24 mx-auto rounded-full bg-muted border-2 border-border flex items-center justify-center"
        >
          <XCircle className="w-12 h-12 text-muted-foreground" />
        </motion.div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            Payment cancelled. You can subscribe anytime to unlock the muscle
            heatmap and advanced features.
          </p>
        </div>

        {/* Back button */}
        <Button
          onClick={() => {
            window.location.href = "/";
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-body"
          data-ocid="payment.back_button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to App
        </Button>
      </motion.div>
    </div>
  );
}
