import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { Copy, Share2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import BottomNav from "./components/BottomNav";
import PremiumUpgradeDialog from "./components/PremiumUpgradeDialog";
import QRCodeDisplay from "./components/QRCodeDisplay";
import StripeSetup from "./components/StripeSetup";
import UserCounter, { registerUserPrincipal } from "./components/UserCounter";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useAllBodyWeightEntries,
  useAllWorkoutSessions,
  useFoodEntriesByDate,
  useSeedDemoData,
} from "./hooks/useQueries";
import { usePremiumStatus } from "./hooks/useStripe";
import { useUserGoal } from "./hooks/useUserGoal";
import DashboardTab from "./pages/DashboardTab";
import GoalOnboarding from "./pages/GoalOnboarding";
import LeaderboardTab from "./pages/LeaderboardTab";
import LoginPage from "./pages/LoginPage";
import MuscleHeatmapTab from "./pages/MuscleHeatmapTab";
import NutritionTab from "./pages/NutritionTab";
import PaymentFailure from "./pages/PaymentFailure";
import PaymentSuccess from "./pages/PaymentSuccess";
import WeightTab from "./pages/WeightTab";
import WorkoutsTab from "./pages/WorkoutsTab";

export type TabName =
  | "dashboard"
  | "nutrition"
  | "workouts"
  | "weight"
  | "body"
  | "compete";

function today() {
  return new Date().toISOString().split("T")[0];
}

function AppShell({ goal }: { goal?: string | null }) {
  const [activeTab, setActiveTab] = useState<TabName>("dashboard");
  const [shareOpen, setShareOpen] = useState(false);
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { isPremium } = usePremiumStatus();
  const appUrl = window.location.origin;

  function copyLink() {
    navigator.clipboard.writeText(appUrl).then(() => {
      toast.success("Link copied to clipboard!");
    });
  }

  function handleTabChange(tab: TabName) {
    setActiveTab(tab);
  }

  function handleUnlock() {
    setPremiumDialogOpen(false);
    setActiveTab("body");
  }
  const { actor, isFetching: actorFetching } = useActor();
  const seedMutation = useSeedDemoData();

  // Check if user has any data and seed if needed
  const workoutsQuery = useAllWorkoutSessions();
  const weightQuery = useAllBodyWeightEntries();
  const foodQuery = useFoodEntriesByDate(today());

  useEffect(() => {
    if (!actor || actorFetching) return;
    if (
      workoutsQuery.isFetching ||
      weightQuery.isFetching ||
      foodQuery.isFetching
    )
      return;
    if (seedMutation.isPending || seedMutation.isSuccess) return;

    const hasNoData =
      (workoutsQuery.data?.length ?? 0) === 0 &&
      (weightQuery.data?.length ?? 0) === 0 &&
      (foodQuery.data?.length ?? 0) === 0;

    if (hasNoData && identity) {
      seedMutation.mutate(undefined, {
        onSuccess: () => {
          const principal = identity.getPrincipal().toText();
          registerUserPrincipal(principal);
        },
      });
    } else if (identity) {
      // User already has data — still register their principal
      registerUserPrincipal(identity.getPrincipal().toText());
    }
  }, [
    actor,
    actorFetching,
    workoutsQuery.data,
    weightQuery.data,
    foodQuery.data,
    workoutsQuery.isFetching,
    weightQuery.isFetching,
    foodQuery.isFetching,
    identity,
    seedMutation,
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-2xl mx-auto relative">
      {/* Top header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-glow-sm">
            <span className="text-sm leading-none">💪</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            Muscle Build
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground font-body">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={() => setShareOpen(true)}
            data-ocid="share.open_modal_button"
            aria-label="Share Muscle Build"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-sm" data-ocid="share.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground">
              Share Muscle Build
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Scan the QR code or copy the link to share this app.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {/* QR Code */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="p-4 rounded-2xl bg-white shadow-md border border-border"
            >
              <QRCodeDisplay
                value={appUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#0a0a0a"
              />
            </motion.div>

            {/* URL display */}
            <div className="w-full px-3 py-2 rounded-lg bg-muted border border-border">
              <p className="text-sm text-muted-foreground text-center font-mono truncate">
                {appUrl}
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              onClick={copyLink}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="share.copy_link_button"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button
              variant="outline"
              onClick={() => setShareOpen(false)}
              className="flex-1"
              data-ocid="share.close_button"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DashboardTab onNavigate={setActiveTab} goal={goal} />
            </motion.div>
          )}
          {activeTab === "nutrition" && (
            <motion.div
              key="nutrition"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <NutritionTab />
            </motion.div>
          )}
          {activeTab === "workouts" && (
            <motion.div
              key="workouts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <WorkoutsTab />
            </motion.div>
          )}
          {activeTab === "weight" && (
            <motion.div
              key="weight"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <WeightTab />
            </motion.div>
          )}
          {activeTab === "body" && (
            <motion.div
              key="body"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <MuscleHeatmapTab />
            </motion.div>
          )}
          {activeTab === "compete" && (
            <motion.div
              key="compete"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <LeaderboardTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Premium Upgrade Dialog */}
      <PremiumUpgradeDialog
        open={premiumDialogOpen}
        onClose={() => setPremiumDialogOpen(false)}
        onUnlock={handleUnlock}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isPremium={isPremium}
      />

      {/* Admin section */}
      <UserCounter />
      <StripeSetup />

      <Toaster />
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { goal, setGoal } = useUserGoal();

  // Handle payment redirect pages — no auth needed
  const pathname = window.location.pathname;
  if (pathname === "/payment-success") {
    return <PaymentSuccess />;
  }
  if (pathname === "/payment-failure") {
    return <PaymentFailure />;
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <span className="text-xl leading-none">💪</span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  if (!goal) {
    return <GoalOnboarding onComplete={(g) => setGoal(g)} />;
  }

  return <AppShell goal={goal} />;
}
