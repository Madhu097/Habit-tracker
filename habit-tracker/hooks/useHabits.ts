'use client';

import { useState, useEffect, useCallback } from 'react';
import { Habit, HabitLog, HabitStats, DailyHabitView } from '@/types';
import {
    getUserHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    logHabit,
    getTodayLogsForUser,
    getHabitStats,
    subscribeTodayLogs,
} from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export const useHabits = () => {
    const { user } = useAuth();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
    const [dailyHabits, setDailyHabits] = useState<DailyHabitView[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch habits on mount
    useEffect(() => {
        if (!user) {
            setHabits([]);
            setTodayLogs([]);
            setDailyHabits([]);
            setLoading(false);
            return;
        }

        loadHabits();
    }, [user]);

    // Subscribe to today's logs (real-time)
    useEffect(() => {
        if (!user) {
            setTodayLogs([]);
            return;
        }

        const unsubscribe = subscribeTodayLogs(user.uid, (logs) => {
            setTodayLogs(logs);
        });

        return () => unsubscribe();
    }, [user]);

    // Combine habits with today's logs and stats
    useEffect(() => {
        const combineDailyData = async () => {
            console.log('[useHabits] combineDailyData called, habits.length:', habits.length);
            if (habits.length === 0) {
                console.log('[useHabits] No habits, setting dailyHabits to []');
                setDailyHabits([]);
                return;
            }

            try {
                console.log('[useHabits] Combining habits with logs and stats...');

                // Filter habits that should appear today
                const today = new Date();
                const { shouldHabitAppearOnDate } = await import('@/lib/firebase/firestore');
                const todaysHabits = habits.filter(habit => {
                    // For backward compatibility, if no frequency is set, assume daily
                    if (!habit.frequency) {
                        return true;
                    }
                    return shouldHabitAppearOnDate(habit, today);
                });

                console.log('[useHabits] Filtered habits for today:', todaysHabits.length, 'out of', habits.length);

                const combined: DailyHabitView[] = await Promise.all(
                    todaysHabits.map(async (habit) => {
                        try {
                            const todayLog = todayLogs.find(log => log.habitId === habit.id);
                            const stats = await getHabitStats(habit.id, habit.userId);

                            return {
                                ...habit,
                                todayLog,
                                stats: stats || {
                                    id: habit.id,
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
                        } catch (err) {
                            // Suppress expected permission errors for stats that don't exist yet
                            const isPermissionError = err instanceof Error &&
                                (err.message.includes('permission-denied') || err.message.includes('Missing or insufficient permissions'));

                            if (!isPermissionError) {
                                console.error('[useHabits] Error processing habit:', habit.id, err);
                            }

                            // Return habit with default stats if there's an error
                            return {
                                ...habit,
                                todayLog: undefined,
                                stats: {
                                    id: habit.id,
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
                        }
                    })
                );

                console.log('[useHabits] Combined daily habits:', combined);
                setDailyHabits(combined);
            } catch (err) {
                console.error('[useHabits] Error in combineDailyData:', err);
                // Set dailyHabits to habits with default stats as fallback
                setDailyHabits(habits.map(habit => ({
                    ...habit,
                    todayLog: undefined,
                    stats: {
                        id: habit.id,
                        habitId: habit.id,
                        userId: habit.userId,
                        currentStreak: 0,
                        longestStreak: 0,
                        totalCompleted: 0,
                        totalMissed: 0,
                        completionRate: 0,
                        lastUpdated: habit.updatedAt,
                    },
                })));
            }
        };

        combineDailyData();
    }, [habits, todayLogs]);

    const loadHabits = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            console.log('[useHabits] Loading habits for user:', user.uid);
            const fetchedHabits = await getUserHabits(user.uid, true);
            console.log('[useHabits] Fetched habits:', fetchedHabits);
            setHabits(fetchedHabits);

            // Also fetch today's logs
            const logs = await getTodayLogsForUser(user.uid);
            console.log('[useHabits] Fetched today logs:', logs);
            setTodayLogs(logs);
        } catch (err) {
            setError('Failed to load habits');
            console.error('[useHabits] Error loading habits:', err);
        } finally {
            setLoading(false);
        }
    };

    const addHabit = useCallback(async (
        name: string,
        description?: string,
        color?: string,
        frequency?: { type: 'daily' | 'weekly' | 'monthly'; daysOfWeek?: number[]; daysOfMonth?: number[] }
    ) => {
        if (!user) return;

        try {
            setError(null);
            console.log('[useHabits] Creating habit:', { name, description, color, frequency, userId: user.uid });
            const newHabit = await createHabit(user.uid, name, description, color, frequency);
            console.log('[useHabits] Habit created:', newHabit);
            setHabits(prev => {
                const updated = [newHabit, ...prev];
                console.log('[useHabits] Updated habits state:', updated);
                return updated;
            });
            return newHabit;
        } catch (err) {
            setError('Failed to create habit');
            console.error('[useHabits] Error creating habit:', err);
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
            console.error(err);
            throw err;
        }
    }, []);

    const removeHabit = useCallback(async (habitId: string) => {
        try {
            setError(null);
            await deleteHabit(habitId);
            setHabits(prev => prev.filter(h => h.id !== habitId));
        } catch (err) {
            setError('Failed to delete habit');
            console.error(err);
            throw err;
        }
    }, []);

    const markHabitStatus = useCallback(async (habitId: string, status: 'completed' | 'missed') => {
        if (!user) return;

        try {
            setError(null);
            await logHabit(habitId, user.uid, new Date(), status);
            // The real-time listener will update todayLogs automatically
        } catch (err) {
            setError('Failed to log habit');
            console.error(err);
            throw err;
        }
    }, [user]);

    const undoHabitLog = useCallback(async (habitId: string) => {
        if (!user) return;

        try {
            setError(null);
            const { deleteHabitLog } = await import('@/lib/firebase/firestore');
            await deleteHabitLog(habitId, user.uid, new Date());
            // The real-time listener will update todayLogs automatically
        } catch (err) {
            setError('Failed to undo habit log');
            console.error(err);
            throw err;
        }
    }, [user]);

    return {
        habits,
        dailyHabits,
        loading,
        error,
        addHabit,
        editHabit,
        removeHabit,
        markHabitStatus,
        undoHabitLog,
        refreshHabits: loadHabits,
    };
};
