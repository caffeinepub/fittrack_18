import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, Loader2, Medal, RefreshCw, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { LeaderboardEntry } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLeaderboard, useSetDisplayName } from "../hooks/useQueries";

type LeaderboardView = "weekly" | "alltime";

function formatVolume(volume: number): string {
  return `${volume.toLocaleString("en-US", { maximumFractionDigits: 0 })} kg`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-black"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.85 0.18 85), oklch(0.70 0.20 75))",
          color: "oklch(0.20 0.05 85)",
        }}
      >
        🥇
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-black"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.82 0.04 260), oklch(0.68 0.06 260))",
          color: "oklch(0.25 0.06 260)",
        }}
      >
        🥈
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-black"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.72 0.12 55), oklch(0.58 0.14 45))",
          color: "oklch(0.20 0.05 55)",
        }}
      >
        🥉
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground border border-border">
      {rank}
    </div>
  );
}

function TopThreeCard({
  entry,
  rank,
  isCurrentUser,
  view,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  view: LeaderboardView;
}) {
  const volume =
    view === "weekly" ? entry.totalVolumeLast7Days : entry.totalVolumeAllTime;
  const workouts =
    view === "weekly" ? entry.workoutCountLast7Days : entry.workoutCountAllTime;

  const gradients = [
    "linear-gradient(135deg, oklch(0.22 0.08 262) 0%, oklch(0.28 0.12 260) 100%)",
    "linear-gradient(135deg, oklch(0.20 0.07 262) 0%, oklch(0.26 0.09 260) 100%)",
    "linear-gradient(135deg, oklch(0.21 0.06 262) 0%, oklch(0.27 0.09 265) 100%)",
  ];

  const borderColors = [
    "oklch(0.75 0.18 85)", // gold
    "oklch(0.72 0.04 260)", // silver
    "oklch(0.65 0.12 50)", // bronze
  ];

  return (
    <motion.div
      data-ocid={`leaderboard.entry.item.${rank}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.35, ease: "easeOut" }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: gradients[rank - 1],
        border: `2px solid ${isCurrentUser ? "oklch(0.60 0.22 262)" : borderColors[rank - 1]}`,
        boxShadow: isCurrentUser
          ? "0 0 20px oklch(0.60 0.22 262 / 40%)"
          : `0 4px 24px ${borderColors[rank - 1]}33`,
      }}
    >
      {isCurrentUser && (
        <div
          className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: "oklch(0.60 0.22 262)",
            color: "oklch(0.10 0.03 262)",
          }}
        >
          YOU
        </div>
      )}
      <div className="p-4 flex items-center gap-3">
        <RankBadge rank={rank} />
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-foreground truncate">
            {entry.displayName || "Anonymous"}
          </p>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            {Number(workouts)} workout{Number(workouts) !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right">
          <p
            className="font-display font-black text-lg"
            style={{ color: borderColors[rank - 1] }}
          >
            {formatVolume(volume)}
          </p>
          <p className="text-[10px] text-muted-foreground">total volume</p>
        </div>
      </div>
    </motion.div>
  );
}

function LeaderboardRow({
  entry,
  rank,
  isCurrentUser,
  view,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  view: LeaderboardView;
}) {
  const volume =
    view === "weekly" ? entry.totalVolumeLast7Days : entry.totalVolumeAllTime;
  const workouts =
    view === "weekly" ? entry.workoutCountLast7Days : entry.workoutCountAllTime;

  return (
    <motion.div
      data-ocid={`leaderboard.entry.item.${rank}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.24 + (rank - 4) * 0.05, duration: 0.3 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
        isCurrentUser
          ? "border-primary/60 bg-primary/10 shadow-[0_0_12px_oklch(0.60_0.22_262_/_20%)]"
          : "border-border bg-card hover:bg-accent/30"
      }`}
    >
      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border border-border shrink-0">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body font-semibold text-sm text-foreground truncate">
          {entry.displayName || "Anonymous"}
          {isCurrentUser && (
            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
              YOU
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {Number(workouts)} workout{Number(workouts) !== 1 ? "s" : ""}
        </p>
      </div>
      <p className="font-display font-bold text-sm text-primary">
        {formatVolume(volume)}
      </p>
    </motion.div>
  );
}

export default function LeaderboardTab() {
  const [view, setView] = useState<LeaderboardView>("weekly");
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const { identity } = useInternetIdentity();
  const { data: entries, isLoading, refetch, isFetching } = useLeaderboard();
  const setDisplayName = useSetDisplayName();

  const myPrincipal = identity?.getPrincipal().toText() ?? "";

  const sorted = [...(entries ?? [])].sort((a, b) => {
    const aVol =
      view === "weekly" ? a.totalVolumeLast7Days : a.totalVolumeAllTime;
    const bVol =
      view === "weekly" ? b.totalVolumeLast7Days : b.totalVolumeAllTime;
    return bVol - aVol;
  });

  const myEntry = sorted.find((e) => e.principalText === myPrincipal);

  function openNameDialog() {
    setNameInput(myEntry?.displayName ?? "");
    setNameDialogOpen(true);
  }

  async function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    try {
      await setDisplayName.mutateAsync(trimmed);
      toast.success("Display name updated!");
      setNameDialogOpen(false);
    } catch {
      toast.error("Failed to update name. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div
        className="relative overflow-hidden pt-6 pb-4 px-4"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.18 0.08 262) 0%, oklch(0.13 0.04 262) 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, oklch(0.60 0.22 262), transparent)",
            }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, oklch(0.75 0.18 85), transparent)",
            }}
          />
        </div>

        <div className="relative flex flex-col items-center gap-3 mb-4">
          <motion.img
            src="/assets/generated/mascot-deer.dim_400x400.png"
            alt="Muscle Build mascot"
            className="w-24 h-24 object-contain drop-shadow-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
          />
          <div className="text-center">
            <h1 className="font-display font-black text-3xl tracking-tight text-foreground flex items-center gap-2">
              <Trophy
                className="w-6 h-6"
                style={{ color: "oklch(0.75 0.18 85)" }}
              />
              Compete
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-1">
              Who lifts the most? Prove your strength.
            </p>
          </div>
        </div>

        {/* User's current name + edit button */}
        <div className="flex items-center justify-between bg-card/40 border border-border rounded-xl px-4 py-2.5 mb-2">
          <div>
            <p className="text-xs text-muted-foreground font-body">
              Your name on the board
            </p>
            <p className="text-sm font-display font-bold text-foreground">
              {myEntry?.displayName || "Anonymous"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openNameDialog}
            data-ocid="leaderboard.set_name.open_modal_button"
            className="gap-1.5 text-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Name
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          <button
            type="button"
            data-ocid="leaderboard.weekly.tab"
            onClick={() => setView("weekly")}
            className={`flex-1 py-2 rounded-lg text-sm font-display font-semibold transition-all duration-200 ${
              view === "weekly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            This Week
          </button>
          <button
            type="button"
            data-ocid="leaderboard.alltime.tab"
            onClick={() => setView("alltime")}
            className={`flex-1 py-2 rounded-lg text-sm font-display font-semibold transition-all duration-200 ${
              view === "alltime"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Refresh indicator */}
      <div className="flex items-center justify-end px-4 py-1">
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw
            className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`}
          />
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Leaderboard Content */}
      <div className="px-4 pb-8">
        {isLoading ? (
          <div className="space-y-3" data-ocid="leaderboard.loading_state">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className={`w-full rounded-2xl ${i <= 3 ? "h-20" : "h-16"}`}
              />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <motion.div
            data-ocid="leaderboard.empty_state"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-16 text-center"
          >
            <img
              src="/assets/generated/mascot-deer.dim_400x400.png"
              alt="No competitors yet"
              className="w-28 h-28 object-contain opacity-60"
            />
            <div>
              <p className="font-display font-bold text-foreground text-lg">
                No competitors yet!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Log a workout to appear on the leaderboard.
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Top 3 — special cards */}
              {sorted.slice(0, 3).map((entry, i) => (
                <TopThreeCard
                  key={entry.principalText}
                  entry={entry}
                  rank={i + 1}
                  isCurrentUser={entry.principalText === myPrincipal}
                  view={view}
                />
              ))}

              {/* Divider */}
              {sorted.length > 3 && (
                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 h-px bg-border" />
                  <Medal className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              {/* Rest of the leaderboard */}
              <div className="space-y-2">
                {sorted.slice(3).map((entry, i) => (
                  <LeaderboardRow
                    key={entry.principalText}
                    entry={entry}
                    rank={i + 4}
                    isCurrentUser={entry.principalText === myPrincipal}
                    view={view}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Set Display Name Dialog */}
      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="leaderboard.set_name.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Set Your Name
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="display-name" className="text-sm font-body">
                Display name on the leaderboard
              </Label>
              <Input
                id="display-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. BeastMode99"
                maxLength={30}
                data-ocid="leaderboard.set_name.input"
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              />
              <p className="text-xs text-muted-foreground">
                {nameInput.length}/30 characters
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              onClick={handleSaveName}
              disabled={!nameInput.trim() || setDisplayName.isPending}
              data-ocid="leaderboard.set_name.submit_button"
              className="flex-1"
            >
              {setDisplayName.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Name"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setNameDialogOpen(false)}
              data-ocid="leaderboard.set_name.cancel_button"
              className="flex-1"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
