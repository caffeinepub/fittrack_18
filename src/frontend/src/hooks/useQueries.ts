import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BodyWeightEntry,
  DailyTotals,
  FoodEntry,
  WorkoutSession,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Food Queries ───────────────────────────────────────────────────────────

export function useFoodEntriesByDate(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<FoodEntry[]>({
    queryKey: ["foodEntries", date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFoodEntriesByDate(date);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDailyTotals(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<DailyTotals>({
    queryKey: ["dailyTotals", date],
    queryFn: async () => {
      if (!actor) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
      return actor.getDailyTotals(date);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddFoodEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: FoodEntry) => {
      if (!actor) throw new Error("Not connected");
      return actor.addFoodEntry(entry);
    },
    onSuccess: (_, entry) => {
      queryClient.invalidateQueries({ queryKey: ["foodEntries", entry.date] });
      queryClient.invalidateQueries({ queryKey: ["dailyTotals", entry.date] });
      queryClient.invalidateQueries({ queryKey: ["dailyTotals"] });
    },
  });
}

export function useDeleteFoodEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, name }: { date: string; name: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteFoodEntry(date, name);
    },
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: ["foodEntries", date] });
      queryClient.invalidateQueries({ queryKey: ["dailyTotals", date] });
      queryClient.invalidateQueries({ queryKey: ["dailyTotals"] });
    },
  });
}

// ─── Workout Queries ─────────────────────────────────────────────────────────

export function useAllWorkoutSessions() {
  const { actor, isFetching } = useActor();
  return useQuery<WorkoutSession[]>({
    queryKey: ["workoutSessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWorkoutSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWorkoutSessionsByDate(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<WorkoutSession[]>({
    queryKey: ["workoutSessions", date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkoutSessionsByDate(date);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddWorkoutSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: WorkoutSession) => {
      if (!actor) throw new Error("Not connected");
      return actor.addWorkoutSession(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutSessions"] });
    },
  });
}

export function useDeleteWorkoutSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, name }: { date: string; name: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteWorkoutSession(date, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutSessions"] });
    },
  });
}

// ─── Weight Queries ──────────────────────────────────────────────────────────

export function useAllBodyWeightEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<BodyWeightEntry[]>({
    queryKey: ["bodyWeightEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBodyWeightEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBodyWeightEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: BodyWeightEntry) => {
      if (!actor) throw new Error("Not connected");
      return actor.addBodyWeightEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bodyWeightEntries"] });
    },
  });
}

export function useDeleteBodyWeightEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteBodyWeightEntry(date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bodyWeightEntries"] });
    },
  });
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

export function useSeedDemoData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.seedDemoData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
