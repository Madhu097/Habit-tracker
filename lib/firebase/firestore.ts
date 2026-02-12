import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
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
import { Habit, HabitLog, HabitStats, HabitLogStatus, WaterSettings, WaterLog } from '@/types';
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
    const existingLog = await getHabitLogForDate(habitId, userId, dateStr);

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

export const getHabitLogForDate = async (habitId: string, userId: string, dateStr: string): Promise<HabitLog | null> => {
    // FAILSAFE: Fetch all logs for this habit/user and filter in memory to avoid "Composite Index" errors.
    // While less efficient for habits with thousands of logs, this guarantees specific indexes aren't required.
    const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('habitId', '==', habitId),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    // Find the log that matches the date string exactly
    const match = snapshot.docs.find(doc => doc.data().date === dateStr);

    if (!match) return null;
    return { id: match.id, ...match.data() } as HabitLog;
};

// Delete a habit log (for undo functionality)
export const deleteHabitLog = async (habitId: string, userId: string, date: Date): Promise<void> => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingLog = await getHabitLogForDate(habitId, userId, dateStr);

    if (existingLog) {
        const logRef = doc(db, HABIT_LOGS_COLLECTION, existingLog.id);
        await deleteDoc(logRef);

        // Update stats after deletion
        await updateHabitStats(habitId, userId);
    }
};

export const getHabitLogsInRange = async (
    habitId: string,
    userId: string,
    startDate: string,
    endDate: string
): Promise<HabitLog[]> => {
    // Optimized: Fetch strictly by habitId and userId, then filter/sort in memory
    // This avoids requiring a composite index for equality + range + sort
    const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('habitId', '==', habitId),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HabitLog));

    // Filter and sort in memory
    return logs
        .filter(log => log.date >= startDate && log.date <= endDate)
        .sort((a, b) => b.date.localeCompare(a.date));
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

// Get logs for a specific date
export const getLogsForDate = async (userId: string, dateStr: string): Promise<HabitLog[]> => {
    const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('userId', '==', userId),
        where('date', '==', dateStr)
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

export const getUserHabitStats = async (userId: string): Promise<HabitStats[]> => {
    const q = query(
        collection(db, HABIT_STATS_COLLECTION),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HabitStats));
};

export const updateHabitStats = async (habitId: string, userId: string): Promise<void> => {
    // Fetch all logs for this habit
    // Removed orderBy('date', 'desc') to avoid composite index error
    const allLogsQuery = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('habitId', '==', habitId),
        where('userId', '==', userId)
    );

    const logsSnapshot = await getDocs(allLogsQuery);
    const logs = logsSnapshot.docs.map(doc => doc.data() as HabitLog);

    // Sort logs in memory for streak calculation (descending date)
    logs.sort((a, b) => b.date.localeCompare(a.date));

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

    const statsData: any = {
        currentStreak,
        longestStreak,
        totalCompleted,
        totalMissed,
        completionRate,
        lastUpdated: Timestamp.now(),
    };

    // Only include lastCompletedDate if it's defined (Firestore doesn't accept undefined)
    if (lastCompletedDate !== undefined) {
        statsData.lastCompletedDate = lastCompletedDate;
    }

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
        const yesterdayLog = await getHabitLogForDate(habit.id, userId, yesterday);

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

// ============ USER DATA MANAGEMENT ============

export const resetUserData = async (userId: string): Promise<void> => {
    const batch = writeBatch(db);
    let operationCount = 0;
    const MAX_BATCH_SIZE = 450; // Safety margin below 500

    const committedBatches = [];

    // Helper to commit and reset batch if full
    const checkBatch = async () => {
        if (operationCount >= MAX_BATCH_SIZE) {
            committedBatches.push(batch.commit());
            // We can't reuse the batch object after commit, need a new one or we just await here?
            // "batch.commit()" returns a promise. Using a new batch is better logic for loops, 
            // but here we might just await it. 
            // Actually, simplest is to just await every time we fill up.
            await batch.commit();

            // Re-instantiate is tricky inside a helper without ref ref updating. 
            // Let's just do it sequentially without a helper for simplicity or use separate batches for collections.
        }
    };

    // We will do it simpler: Fetch all, then chunk into batches of 450.

    // 1. Fetch all docs to delete
    const habitQuery = query(collection(db, HABITS_COLLECTION), where('userId', '==', userId));
    const logsQuery = query(collection(db, HABIT_LOGS_COLLECTION), where('userId', '==', userId));
    const statsQuery = query(collection(db, HABIT_STATS_COLLECTION), where('userId', '==', userId));

    const [habitsSnapshot, logsSnapshot, statsSnapshot] = await Promise.all([
        getDocs(habitQuery),
        getDocs(logsQuery),
        getDocs(statsQuery)
    ]);

    const allDocs = [
        ...habitsSnapshot.docs,
        ...logsSnapshot.docs,
        ...statsSnapshot.docs
    ];

    console.log(`[resetUserData] Found ${allDocs.length} documents to delete for user ${userId}`);

    // 2. Delete in chunks
    for (let i = 0; i < allDocs.length; i += MAX_BATCH_SIZE) {
        const chunk = allDocs.slice(i, i + MAX_BATCH_SIZE);
        const currentBatch = writeBatch(db);

        chunk.forEach(doc => {
            currentBatch.delete(doc.ref);
        });

        await currentBatch.commit();
        console.log(`[resetUserData] Deleted batch ${Math.floor(i / MAX_BATCH_SIZE) + 1}`);
    }
};

// ============ WATER TRACKING ============

const WATER_SETTINGS_COLLECTION = 'waterSettings';
const WATER_LOGS_COLLECTION = 'waterLogs';

export const getWaterSettings = async (userId: string): Promise<WaterSettings | null> => {
    const docRef = doc(db, WATER_SETTINGS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as WaterSettings;
    }
    return null;
};

export const saveWaterSettings = async (userId: string, settings: Partial<WaterSettings>): Promise<void> => {
    const docRef = doc(db, WATER_SETTINGS_COLLECTION, userId);
    await setDoc(docRef, {
        userId,
        ...settings,
        updatedAt: Timestamp.now(),
    }, { merge: true });
};

export const getTodayWaterLog = async (userId: string): Promise<WaterLog | null> => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const q = query(
        collection(db, WATER_LOGS_COLLECTION),
        where('userId', '==', userId),
        where('date', '==', todayStr),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as WaterLog;
};

export const updateWaterIntake = async (userId: string, amount: number, goal: number): Promise<void> => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const existingLog = await getTodayWaterLog(userId);

    if (existingLog) {
        const docRef = doc(db, WATER_LOGS_COLLECTION, existingLog.id);
        await updateDoc(docRef, {
            amount,
            goal,
            updatedAt: Timestamp.now(),
        });
    } else {
        await addDoc(collection(db, WATER_LOGS_COLLECTION), {
            userId,
            date: todayStr,
            amount,
            goal,
            updatedAt: Timestamp.now(),
        });
    }
};

// Real-time listener for today's water log
export const subscribeTodayWaterLog = (
    userId: string,
    callback: (log: WaterLog | null) => void
): (() => void) => {
    const today = format(new Date(), 'yyyy-MM-dd');

    const q = query(
        collection(db, WATER_LOGS_COLLECTION),
        where('userId', '==', userId),
        where('date', '==', today),
        limit(1)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            if (snapshot.empty) {
                callback(null);
            } else {
                const doc = snapshot.docs[0];
                callback({ id: doc.id, ...doc.data() } as WaterLog);
            }
        },
        (error) => {
            // Silently handle
            callback(null);
        }
    );
};
