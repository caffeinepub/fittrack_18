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
export interface LeaderboardEntry {
    displayName: string;
    totalVolumeLast7Days: number;
    totalVolumeAllTime: number;
    principalText: string;
    workoutCountLast7Days: bigint;
    workoutCountAllTime: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
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
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface FoodEntry {
    fat: number;
    carbs: number;
    date: string;
    calories: number;
    name: string;
    protein: number;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface DailyTotals {
    fat: number;
    carbs: number;
    calories: number;
    protein: number;
}
export interface UserProfile {
    displayName?: string;
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
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteBodyWeightEntry(date: string): Promise<void>;
    deleteFoodEntry(date: string, name: string): Promise<void>;
    deleteWorkoutSession(date: string, name: string): Promise<void>;
    getAllBodyWeightEntries(): Promise<Array<BodyWeightEntry>>;
    getAllWorkoutSessions(): Promise<Array<WorkoutSession>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyTotals(date: string): Promise<DailyTotals>;
    getFoodEntriesByDate(date: string): Promise<Array<FoodEntry>>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkoutSessionsByDate(date: string): Promise<Array<WorkoutSession>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedDemoData(): Promise<void>;
    setDisplayName(displayName: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
