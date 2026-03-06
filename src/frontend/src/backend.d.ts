import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exercise {
    weight: number;
    name: string;
    reps: bigint;
    sets: bigint;
}
export interface FoodEntry {
    fat: number;
    carbs: number;
    date: string;
    calories: number;
    name: string;
    protein: number;
}
export interface WorkoutSession {
    duration: number;
    date: string;
    name: string;
    exercises: Array<Exercise>;
}
export interface BodyWeightEntry {
    weight: number;
    date: string;
}
export interface DailyTotals {
    fat: number;
    carbs: number;
    calories: number;
    protein: number;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBodyWeightEntry(entry: BodyWeightEntry): Promise<void>;
    addFoodEntry(entry: FoodEntry): Promise<void>;
    addWorkoutSession(session: WorkoutSession): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteBodyWeightEntry(date: string): Promise<void>;
    deleteFoodEntry(date: string, name: string): Promise<void>;
    deleteWorkoutSession(date: string, name: string): Promise<void>;
    getAllBodyWeightEntries(): Promise<Array<BodyWeightEntry>>;
    getAllWorkoutSessions(): Promise<Array<WorkoutSession>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyTotals(date: string): Promise<DailyTotals>;
    getFoodEntriesByDate(date: string): Promise<Array<FoodEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkoutSessionsByDate(date: string): Promise<Array<WorkoutSession>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedDemoData(): Promise<void>;
}
