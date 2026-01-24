import { Timestamp } from 'firebase/firestore';

export interface User {
    id: string;
    email: string;
    displayName?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export type FrequencyType = 'daily' | 'weekly' | 'monthly';

export interface HabitFrequency {
    type: FrequencyType;
    // For weekly: array of day numbers (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    daysOfWeek?: number[];
    // For monthly: array of day numbers (1-31)
    daysOfMonth?: number[];
}

export interface Habit {
    id: string;
    userId: string;
    name: string;
    description?: string;
    color: string; // Hex color for visual distinction
    frequency: HabitFrequency; // How often the habit should appear
    createdAt: Timestamp;
    updatedAt: Timestamp;
    isActive: boolean;
}

export type HabitLogStatus = 'completed' | 'missed' | 'pending';

export interface HabitLog {
    id: string;
    habitId: string;
    userId: string;
    date: string; // Format: YYYY-MM-DD for easy querying
    status: HabitLogStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface HabitStats {
    id: string; // Same as habitId
    habitId: string;
    userId: string;
    currentStreak: number;
    longestStreak: number;
    totalCompleted: number;
    totalMissed: number;
    completionRate: number; // Percentage (0-100)
    lastCompletedDate?: string; // YYYY-MM-DD
    lastUpdated: Timestamp;
}

export interface DailyHabitView extends Habit {
    todayLog?: HabitLog;
    stats: HabitStats;
}

export interface WeeklyStats {
    date: string; // YYYY-MM-DD
    completed: number;
    missed: number;
    total: number;
}

export interface MonthlyStats {
    month: string; // YYYY-MM
    completed: number;
    missed: number;
    total: number;
    completionRate: number;
}

// Water Tracking Types
export interface WaterLog {
    id: string;
    userId: string;
    date: string; // YYYY-MM-DD
    amount: number; // Current daily total in ml
    goal: number; // Goal for that day in ml
    updatedAt: Timestamp;
}

export interface WaterSettings {
    id: string; // usually userId
    userId: string;
    weight: number; // in kg
    activityLevel: 'sedentary' | 'moderate' | 'active';
    climate: 'normal' | 'hot';
    calculatedGoal: number; // in ml
    isSetup: boolean;
    updatedAt: Timestamp;
}
