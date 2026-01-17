import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    writeBatch,
    onSnapshot,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import { Habit, HabitLog, HabitStats, HabitLogStatus } from '@/types';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// Collection references
const HABITS_COLLECTION = 'habits';
const HABIT_LOGS_COLLECTION = 'habitLogs';
const HABIT_STATS_COLLECTION = 'habitStats';

// ============ HABIT CRUD ============

export const createHabit = async (
    userId: string,
    name: string,
    description?: string,
    color?: string,
    frequency?: { type: 'daily' | 'weekly' | 'monthly'; daysOfWeek?: number[]; daysOfMonth?: number[] }
): Promise<Habit> => {
    console.log('[createHabit] Creating habit:', { userId, name, description, color, frequency });

    // Default frequency is daily
    const habitFrequency = frequency || { type: 'daily' };

    const habitData = {
        userId,
        name,
        description: description || '',
        color: color || '#3B82F6', // Default blue
        frequency: habitFrequency,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true,
    };

    const docRef = await addDoc(collection(db, HABITS_COLLECTION), habitData);
    console.log('[createHabit] Habit document created with ID:', docRef.id);

    // Initialize stats
    await initializeHabitStats(docRef.id, userId);
    console.log('[createHabit] Stats initialized for habit:', docRef.id);

    const createdHabit = { id: docRef.id, ...habitData } as Habit;
    console.log('[createHabit] Returning habit:', createdHabit);
    return createdHabit;
};

// Helper function to check if a habit should appear on a given date
export const shouldHabitAppearOnDate = (habit: Habit, date: Date): boolean => {
    const { frequency } = habit;

    if (frequency.type === 'daily') {
        return true;
    }

    if (frequency.type === 'weekly') {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        return frequency.daysOfWeek?.includes(dayOfWeek) || false;
    }

    if (frequency.type === 'monthly') {
        const dayOfMonth = date.getDate(); // 1-31
        return frequency.daysOfMonth?.includes(dayOfMonth) || false;
    }

    return true; // Default to showing the habit
};

export const getUserHabits = async (userId: string, activeOnly: boolean = true): Promise<Habit[]> => {
    // Simplified query without orderBy to avoid composite index requirement
    const q = query(
        collection(db, HABITS_COLLECTION),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    let habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));

    // Filter for active habits client-side if needed
    if (activeOnly) {
        habits = habits.filter(habit => habit.isActive);
    }

    // Sort by createdAt client-side
    habits.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime; // Descending order (newest first)
    });

    return habits;
};

export const updateHabit = async (habitId: string, updates: Partial<Habit>): Promise<void> => {
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    await updateDoc(habitRef, {
        ...updates,
        updatedAt: Timestamp.now(),
    });
};

export const deleteHabit = async (habitId: string): Promise<void> => {
    // Soft delete - mark as inactive
    await updateHabit(habitId, { isActive: false });
};

// ============ HABIT LOGS ============

export const logHabit = async (
    habitId: string,
    userId: string,
    date: Date,
    status: HabitLogStatus
): Promise<HabitLog> => {
    const dateStr = format(date, 'yyyy-MM-dd');

    // Check if log already exists for this date
    const existingLog = await getHabitLogForDate(habitId, dateStr);

    if (existingLog) {
        // Update existing log
        const logRef = doc(db, HABIT_LOGS_COLLECTION, existingLog.id);
        await updateDoc(logRef, {
            status,
            updatedAt: Timestamp.now(),
        });

        // Update stats
        await updateHabitStats(habitId, userId);

        return { ...existingLog, status, updatedAt: Timestamp.now() };
    } else {
        // Create new log
        const logData = {
            habitId,
            userId,
            date: dateStr,
            status,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, HABIT_LOGS_COLLECTION), logData);

        // Update stats
        await updateHabitStats(habitId, userId);

        return { id: docRef.id, ...logData } as HabitLog;
    }
};

export const getHabitLogForDate = async (habitId: string, dateStr: string): Promise<HabitLog | null> => {
    const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('habitId', '==', habitId),
        where('date', '==', dateStr),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as HabitLog;
};

// Delete a habit log (for undo functionality)
export const deleteHabitLog = async (habitId: string, userId: string, date: Date): Promise<void> => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingLog = await getHabitLogForDate(habitId, dateStr);

    if (existingLog) {
        const logRef = doc(db, HABIT_LOGS_COLLECTION, existingLog.id);
        await deleteDoc(logRef);

        // Update stats after deletion
        await updateHabitStats(habitId, userId);
    }
};

export const getHabitLogsInRange = async (
    habitId: string,
    startDate: string,
    endDate: string
): Promise<HabitLog[]> => {
    // Optimized query with date range - requires composite index
    const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('habitId', '==', habitId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HabitLog));
};

export const getTodayLogsForUser = async (userId: string): Promise<HabitLog[]> => {
    const today = format(new Date(), 'yyyy-MM-dd');

    const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('userId', '==', userId),
        where('date', '==', today)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HabitLog));
};

// Real-time listener for today's habits (only use for today's view)
export const subscribeTodayLogs = (
    userId: string,
    callback: (logs: HabitLog[]) => void
): (() => void) => {
    const today = format(new Date(), 'yyyy-MM-dd');

    const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('userId', '==', userId),
        where('date', '==', today)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HabitLog));
            callback(logs);
        },
        (error) => {
            // Silently handle permission errors (user not authenticated)
            if (error.code === 'permission-denied') {
                // User not authenticated - this is expected, return empty array
                callback([]);
            } else {
                console.error('Error in snapshot listener:', error);
            }
        }
    );
};

// ============ HABIT STATS ============

const initializeHabitStats = async (habitId: string, userId: string): Promise<void> => {
    const statsData = {
        habitId,
        userId,
        currentStreak: 0,
        longestStreak: 0,
        totalCompleted: 0,
        totalMissed: 0,
        completionRate: 0,
        lastUpdated: Timestamp.now(),
    };

    await addDoc(collection(db, HABIT_STATS_COLLECTION), statsData);
};

export const getHabitStats = async (habitId: string, userId: string): Promise<HabitStats | null> => {
    const q = query(
        collection(db, HABIT_STATS_COLLECTION),
        where('habitId', '==', habitId),
        where('userId', '==', userId),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as HabitStats;
};

export const updateHabitStats = async (habitId: string, userId: string): Promise<void> => {
    // Fetch all logs for this habit (optimized - only fetch what we need)
    const allLogsQuery = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('habitId', '==', habitId),
        orderBy('date', 'desc')
    );

    const logsSnapshot = await getDocs(allLogsQuery);
    const logs = logsSnapshot.docs.map(doc => doc.data() as HabitLog);

    // Calculate stats
    const totalCompleted = logs.filter(log => log.status === 'completed').length;
    const totalMissed = logs.filter(log => log.status === 'missed').length;
    const total = totalCompleted + totalMissed;
    const completionRate = total > 0 ? Math.round((totalCompleted / total) * 100) : 0;

    // Calculate streaks
    const { currentStreak, longestStreak, lastCompletedDate } = calculateStreaks(logs);

    // Update or create stats document
    const statsQuery = query(
        collection(db, HABIT_STATS_COLLECTION),
        where('habitId', '==', habitId),
        where('userId', '==', userId),
        limit(1)
    );

    const statsSnapshot = await getDocs(statsQuery);

    const statsData = {
        currentStreak,
        longestStreak,
        totalCompleted,
        totalMissed,
        completionRate,
        lastCompletedDate,
        lastUpdated: Timestamp.now(),
    };

    if (!statsSnapshot.empty) {
        // Update existing stats document
        const statsDoc = statsSnapshot.docs[0];
        await updateDoc(doc(db, HABIT_STATS_COLLECTION, statsDoc.id), statsData);
    } else {
        // Create new stats document
        await addDoc(collection(db, HABIT_STATS_COLLECTION), {
            habitId,
            userId,
            ...statsData,
            createdAt: Timestamp.now(),
        });
    }
};

const calculateStreaks = (logs: HabitLog[]): {
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate?: string;
} => {
    if (logs.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    // Sort by date descending
    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastCompletedDate: string | undefined;

    // Find last completed date
    const lastCompleted = sortedLogs.find(log => log.status === 'completed');
    if (lastCompleted) {
        lastCompletedDate = lastCompleted.date;
    }

    // Calculate current streak (from today backwards)
    const today = format(new Date(), 'yyyy-MM-dd');
    let checkDate = today;
    let dayIndex = 0;

    while (dayIndex < sortedLogs.length) {
        const log = sortedLogs.find(l => l.date === checkDate);

        if (log && log.status === 'completed') {
            currentStreak++;
        } else if (log && log.status === 'missed') {
            break;
        }

        // Move to previous day
        checkDate = format(subDays(new Date(checkDate), 1), 'yyyy-MM-dd');
        dayIndex++;

        // Safety limit
        if (dayIndex > 365) break;
    }

    // Calculate longest streak
    tempStreak = 0;
    for (let i = 0; i < sortedLogs.length; i++) {
        if (sortedLogs[i].status === 'completed') {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else if (sortedLogs[i].status === 'missed') {
            tempStreak = 0;
        }
    }

    return { currentStreak, longestStreak, lastCompletedDate };
};

// ============ ANALYTICS ============

export const getWeeklyStats = async (userId: string, weeksBack: number = 4): Promise<any[]> => {
    const endDate = endOfWeek(new Date());
    const startDate = startOfWeek(subDays(endDate, weeksBack * 7));

    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    // Optimized query - fetch only logs in date range
    const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('userId', '==', userId),
        where('date', '>=', startDateStr),
        where('date', '<=', endDateStr)
    );

    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(doc => doc.data() as HabitLog);

    // Group by week
    const weeklyData: { [key: string]: { completed: number; missed: number } } = {};

    logs.forEach(log => {
        const weekStart = format(startOfWeek(new Date(log.date)), 'yyyy-MM-dd');

        if (!weeklyData[weekStart]) {
            weeklyData[weekStart] = { completed: 0, missed: 0 };
        }

        if (log.status === 'completed') {
            weeklyData[weekStart].completed++;
        } else if (log.status === 'missed') {
            weeklyData[weekStart].missed++;
        }
    });

    return Object.entries(weeklyData).map(([date, stats]) => ({
        date,
        ...stats,
    }));
};

export const getMonthlyStats = async (userId: string, monthsBack: number = 6): Promise<any[]> => {
    const endDate = endOfMonth(new Date());
    const startDate = startOfMonth(subDays(endDate, monthsBack * 30));

    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('userId', '==', userId),
        where('date', '>=', startDateStr),
        where('date', '<=', endDateStr)
    );

    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(doc => doc.data() as HabitLog);

    // Group by month
    const monthlyData: { [key: string]: { completed: number; missed: number } } = {};

    logs.forEach(log => {
        const month = format(new Date(log.date), 'yyyy-MM');

        if (!monthlyData[month]) {
            monthlyData[month] = { completed: 0, missed: 0 };
        }

        if (log.status === 'completed') {
            monthlyData[month].completed++;
        } else if (log.status === 'missed') {
            monthlyData[month].missed++;
        }
    });

    return Object.entries(monthlyData).map(([month, stats]) => {
        const total = stats.completed + stats.missed;
        return {
            month,
            ...stats,
            total,
            completionRate: total > 0 ? Math.round((stats.completed / total) * 100) : 0,
        };
    });
};

// ============ AUTOMATIC MISSED DAY DETECTION ============

export const detectAndMarkMissedDays = async (userId: string): Promise<void> => {
    const habits = await getUserHabits(userId, true);
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    const batch = writeBatch(db);

    for (const habit of habits) {
        const yesterdayLog = await getHabitLogForDate(habit.id, yesterday);

        // If no log exists for yesterday, mark as missed
        if (!yesterdayLog) {
            const logRef = doc(collection(db, HABIT_LOGS_COLLECTION));
            batch.set(logRef, {
                habitId: habit.id,
                userId,
                date: yesterday,
                status: 'missed',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
        }
    }

    await batch.commit();

    // Update stats for all habits
    for (const habit of habits) {
        await updateHabitStats(habit.id, userId);
    }
};
