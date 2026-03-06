import { useState } from "react";
import { useInternetIdentity } from "./useInternetIdentity";

function getStorageKey(principalId: string) {
  return `fittrack_goal_${principalId}`;
}

export function useUserGoal(): {
  goal: string | null;
  setGoal: (g: string) => void;
} {
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toText() ?? null;
  const storageKey = principalId ? getStorageKey(principalId) : null;

  const [goal, setGoalState] = useState<string | null>(() => {
    if (!storageKey) return null;
    return localStorage.getItem(storageKey);
  });

  function setGoal(g: string) {
    if (!storageKey) return;
    localStorage.setItem(storageKey, g);
    setGoalState(g);
  }

  // If no identity yet, return null
  if (!principalId) {
    return { goal: null, setGoal };
  }

  return { goal, setGoal };
}
