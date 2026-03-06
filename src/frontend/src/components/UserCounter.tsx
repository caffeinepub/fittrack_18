import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Users } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";

const STORAGE_KEY = "muscle_build_known_users";

export function getKnownUserCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export function registerUserPrincipal(principal: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!arr.includes(principal)) {
      arr.push(principal);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }
  } catch {
    // silently fail
  }
}

export default function UserCounter() {
  const { actor, isFetching } = useActor();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [count, setCount] = useState<number>(0);

  const refreshCount = useCallback(() => {
    setCount(getKnownUserCount());
  }, []);

  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .isCallerAdmin()
      .then((admin) => {
        setIsAdmin(admin);
        if (admin) refreshCount();
      })
      .catch(() => setIsAdmin(false));
  }, [actor, isFetching, refreshCount]);

  // Don't render while still checking or if not admin
  if (isAdmin === null || !isAdmin) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mx-4 mb-4 rounded-xl border border-primary/20 bg-primary/5 overflow-hidden"
      data-ocid="admin.user_counter.card"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body leading-none mb-1">
              Total Users
            </p>
            <p className="text-2xl font-display font-bold text-foreground leading-none">
              {count}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshCount}
            className="w-7 h-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label="Refresh user count"
            data-ocid="admin.user_counter.button"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <p className="text-xs text-muted-foreground font-body text-right max-w-[140px] leading-tight">
            Unique logins on this device
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Loading placeholder (returned while actor is fetching)
export function UserCounterSkeleton() {
  return (
    <div className="mx-4 mb-4 rounded-xl border border-border bg-card/30 px-4 py-3 flex items-center gap-3">
      <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
      <span className="text-xs text-muted-foreground font-body">
        Checking admin status…
      </span>
    </div>
  );
}
