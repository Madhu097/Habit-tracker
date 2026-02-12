'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Habit, HabitLog, HabitStats, DailyHabitView } from '@/types';
import {
    getUserHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    logHabit,
    getTodayLogsForUser,
    getHabitStats,
    getUserHabitStats,
    subscribeTodayLogs,
} from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays } from 'date-fns';

export const useHabits = () => {
    const { user } = useAuth();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
    const [yesterdayLogs, setYesterdayLogs] = useState<HabitLog[]>([]);
    const [habitStats, setHabitStats] = useState<HabitStats[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial Data Load
    useEffect(() => {
        if (!user) {
            setHabits([]);
            setTodayLogs([]);
            setHabitStats([]);

            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch habits and stats in parallel
                const [fetchedHabits, fetchedStats] = await Promise.all([
                    getUserHabits(user.uid, true),
                    getUserHabitStats(user.uid)
                ]);

                setHabits(fetchedHabits);
                setHabitStats(fetchedStats);
            } catch (err) {
                console.error('[useHabits] Error loading data:', err);
                setError('Failed to load habits data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    // Real-time Logs Subscription for Today
    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeTodayLogs(user.uid, (logs) => {
            setTodayLogs(logs);
        });

        return () => unsubscribe();
    }, [user]);

    // Load Yesterday's Logs (one-time fetch, not real-time)
    useEffect(() => {
        if (!user) return;

        const loadYesterdayLogs = async () => {
            try {
                const { getLogsForDate } = await import('@/lib/firebase/firestore');
                const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
                const logs = await getLogsForDate(user.uid, yesterday);
                setYesterdayLogs(logs);
            } catch (err) {
                console.error('[useHabits] Error loading yesterday logs:', err);
            }
        };

        loadYesterdayLogs();
    }, [user]);

    // Derived State: Combine Data
    // Derived State: Combine Data
    const dailyHabits = useMemo(() => {
        if (habits.length === 0) {
            return [];
        }

        const today = new Date();
        const filteredHabits = habits.filter(habit => {
            if (!habit.frequency) return true; // Daily default
            if (habit.frequency.type === 'daily') return true;
            if (habit.frequency.type === 'weekly') return habit.frequency.daysOfWeek?.includes(today.getDay()) ?? false;
            if (habit.frequency.type === 'monthly') return habit.frequency.daysOfMonth?.includes(today.getDate()) ?? false;
            return true;
        });

        const combined = filteredHabits.map(habit => {
            const todayLog = todayLogs.find(log => log.habitId === habit.id);
            const stat = habitStats.find(s => s.habitId === habit.id); // Matches by habitId

            return {
                ...habit,
                todayLog,
                stats: stat || {
                    id: `stats-${habit.id}`, // Temporary ID
                    habitId: habit.id,
                    userId: habit.userId,
                    currentStreak: 0,
                    longestStreak: 0,
                    totalCompleted: 0,
                    totalMissed: 0,
                    completionRate: 0,
                    lastUpdated: habit.updatedAt,
                },
            };
        });

        return combined;
    }, [habits, todayLogs, habitStats]);

    // Yesterday's Habits (incomplete only)
    const yesterdayHabits = useMemo(() => {
        if (habits.length === 0) {
            return [];
        }

        const yesterday = subDays(new Date(), 1);
        const filteredHabits = habits.filter(habit => {
            if (!habit.frequency) return true;
            if (habit.frequency.type === 'daily') return true;
            if (habit.frequency.type === 'weekly') return habit.frequency.daysOfWeek?.includes(yesterday.getDay()) ?? false;
            if (habit.frequency.type === 'monthly') return habit.frequency.daysOfMonth?.includes(yesterday.getDate()) ?? false;
            return true;
        });

        // Only show habits that weren't completed or missed yesterday
        const incomplete = filteredHabits.filter(habit => {
            const yesterdayLog = yesterdayLogs.find(log => log.habitId === habit.id);
            // Show only if there's no log at all (user forgot to mark it)
            return !yesterdayLog;
        });

        return incomplete.map(habit => {
            const yesterdayLog = yesterdayLogs.find(log => log.habitId === habit.id);
            const stat = habitStats.find(s => s.habitId === habit.id);

            return {
                ...habit,
                todayLog: yesterdayLog,
                stats: stat || {
                    id: `stats-${habit.id}`,
                    habitId: habit.id,
                    userId: habit.userId,
                    currentStreak: 0,
                    longestStreak: 0,
                    totalCompleted: 0,
                    totalMissed: 0,
                    completionRate: 0,
                    lastUpdated: habit.updatedAt,
                },
            };
        });
    }, [habits, yesterdayLogs, habitStats]);


    const addHabit = useCallback(async (
        name: string,
        description?: string,
        color?: string,
        frequency?: { type: 'daily' | 'weekly' | 'monthly'; daysOfWeek?: number[]; daysOfMonth?: number[] }
    ) => {
        if (!user) return;
        try {
            setError(null);
            const newHabit = await createHabit(user.uid, name, description, color, frequency);

            // Optimistically add to habits
            setHabits(prev => [newHabit, ...prev]);

            // Manually add initial stats to avoid Firestore consistency delays
            // (Querying immediately after creation might result in empty results)
            const initialStats: HabitStats = {
                id: `temp-stats-${newHabit.id}`,
                habitId: newHabit.id,
                userId: user.uid,
                currentStreak: 0,
                longestStreak: 0,
                totalCompleted: 0,
                totalMissed: 0,
                completionRate: 0,
                lastUpdated: newHabit.createdAt, // Usage of the same timestamp
            };

            setHabitStats(prev => [...prev, initialStats]);

            // BACKGROUND SYNC:
            // Trigger a real data fetch after a short delay to ensure consistency.
            // This fixes issues where optimistic updates might lack server-generated fields
            // or if the Firestore index takes a moment to be queryable.
            setTimeout(() => {
                loadHabits();
            }, 500);

            return newHabit;
        } catch (err) {
            setError('Failed to create habit');
            throw err;
        }
    }, [user]);

    const editHabit = useCallback(async (habitId: string, updates: Partial<Habit>) => {
        try {
            setError(null);
            await updateHabit(habitId, updates);
            setHabits(prev => prev.map(h => h.id === habitId ? { ...h, ...updates } : h));
        } catch (err) {
            setError('Failed to update habit');
            throw err;
        }
    }, []);

    const removeHabit = useCallback(async (habitId: string) => {
        try {
            setError(null);
            await deleteHabit(habitId);
            setHabits(prev => prev.filter(h => h.id !== habitId));
            setHabitStats(prev => prev.filter(s => s.habitId !== habitId));
        } catch (err) {
            setError('Failed to delete habit');
            throw err;
        }
    }, []);

    const markHabitStatus = useCallback(async (habitId: string, status: 'completed' | 'missed') => {
        if (!user) return;
        try {
            setError(null);
            await logHabit(habitId, user.uid, new Date(), status);
            // todayLogs updates automatically via subscription

            // Manually refresh stats for this habit to reflect new streaks
            const updatedStat = await getHabitStats(habitId, user.uid);
            if (updatedStat) {
                setHabitStats(prev => {
                    const idx = prev.findIndex(s => s.habitId === habitId);
                    if (idx >= 0) {
                        const newStats = [...prev];
                        newStats[idx] = updatedStat;
                        return newStats;
                    }
                    return [...prev, updatedStat];
                });
            }
        } catch (err) {
            setError('Failed to log habit');
            throw err;
        }
    }, [user]);

    // Mark habit for a specific date (for yesterday's habits)
    const markHabitStatusForDate = useCallback(async (habitId: string, status: 'completed' | 'missed', date: Date) => {
        if (!user) return;
        try {
            setError(null);
            await logHabit(habitId, user.uid, date, status);

            // Refresh yesterday's logs if marking for yesterday
            const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
            const targetDate = format(date, 'yyyy-MM-dd');
            if (targetDate === yesterday) {
                const { getLogsForDate } = await import('@/lib/firebase/firestore');
                const logs = await getLogsForDate(user.uid, yesterday);
                setYesterdayLogs(logs);
            }

            // Refresh stats
            const updatedStat = await getHabitStats(habitId, user.uid);
            if (updatedStat) {
                setHabitStats(prev => {
                    const idx = prev.findIndex(s => s.habitId === habitId);
                    if (idx >= 0) {
                        const newStats = [...prev];
                        newStats[idx] = updatedStat;
                        return newStats;
                    }
                    return [...prev, updatedStat];
                });
            }
        } catch (err) {
            setError('Failed to log habit for date');
            throw err;
        }
    }, [user]);

    const undoHabitLog = useCallback(async (habitId: string) => {
        if (!user) return;
        try {
            setError(null);
            const { deleteHabitLog } = await import('@/lib/firebase/firestore'); // keep dynamic for now or move up
            await deleteHabitLog(habitId, user.uid, new Date());

            // Refresh stats
            const updatedStat = await getHabitStats(habitId, user.uid);
            if (updatedStat) {
                setHabitStats(prev => {
                    const idx = prev.findIndex(s => s.habitId === habitId);
                    if (idx >= 0) {
                        const newStats = [...prev];
                        newStats[idx] = updatedStat;
                        return newStats;
                    }
                    return prev;
                });
            }
        } catch (err) {
            setError('Failed to undo habit log');
            throw err;
        }
    }, [user]);


    const loadHabits = async () => {
        // Expose manual reload if needed
        if (!user) return;
        setLoading(true);
        try {
            const [fetchedHabits, fetchedStats] = await Promise.all([
                getUserHabits(user.uid, true),
                getUserHabitStats(user.uid)
            ]);
            setHabits(fetchedHabits);
            setHabitStats(fetchedStats);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const resetAllData = useCallback(async () => {
        if (!user) return;
        try {
            setError(null);
            const { resetUserData } = await import('@/lib/firebase/firestore');
            await resetUserData(user.uid);

            // Clear local state
            setHabits([]);
            setTodayLogs([]);
            setHabitStats([]);
            // dailyHabits updates automatically via useMemo
        } catch (err) {
            setError('Failed to reset data');
            throw err;
        }
    }, [user]);

    return {
        habits,
        dailyHabits,
        yesterdayHabits,
        loading,
        error,
        addHabit,
        editHabit,
        removeHabit,
        markHabitStatus,
        markHabitStatusForDate,
        undoHabitLog,
        refreshHabits: loadHabits,
        resetAllData,
    };
};
