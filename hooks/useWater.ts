'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WaterSettings, WaterLog } from '@/types';
import {
    getWaterSettings,
    saveWaterSettings,
    updateWaterIntake,
    subscribeTodayWaterLog
} from '@/lib/firebase/firestore';

export const useWater = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<WaterSettings | null>(null);
    const [todayLog, setTodayLog] = useState<WaterLog | null>(null);
    const [loading, setLoading] = useState(true);
    const [additionHistory, setAdditionHistory] = useState<number[]>([]); // Track all additions for multiple undo

    // Load Settings
    useEffect(() => {
        if (!user) {
            setSettings(null);
            setLoading(false);
            return;
        }

        const loadSettings = async () => {
            try {
                const data = await getWaterSettings(user.uid);
                setSettings(data);
            } catch (error) {
                console.error('Error loading water settings:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [user]);

    // Subscribe to Logs
    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeTodayWaterLog(user.uid, (log) => {
            console.log('[useWater] Firestore log updated:', log?.amount, 'Current history length:', additionHistory.length);
            setTodayLog(log);
        });

        return () => unsubscribe();
    }, [user]);

    // Clear history when date changes (new day)
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const logDate = todayLog?.date;

        if (logDate && logDate !== today) {
            // New day, clear history
            setAdditionHistory([]);
        }
    }, [todayLog?.date]);

    const calculateGoal = (weight: number, activityLevel: 'sedentary' | 'moderate' | 'active', climate: 'normal' | 'hot') => {
        // Base calculation: 33ml per kg
        let goal = weight * 33;

        // Activity adjustments
        if (activityLevel === 'moderate') goal += 400;
        if (activityLevel === 'active') goal += 800;

        // Climate adjustments
        if (climate === 'hot') goal += 500;

        // Round to nearest 50
        return Math.round(goal / 50) * 50;
    };

    const updateSettings = useCallback(async (
        weight: number,
        activityLevel: 'sedentary' | 'moderate' | 'active',
        climate: 'normal' | 'hot'
    ) => {
        if (!user) return;

        const goal = calculateGoal(weight, activityLevel, climate);

        // Optimistic update (Instant UI feedback)
        setSettings(prev => ({
            ...prev,
            id: user.uid,
            userId: user.uid,
            weight,
            activityLevel,
            climate,
            calculatedGoal: goal,
            isSetup: true,
            updatedAt: prev?.updatedAt || (null as any)
        } as WaterSettings));

        // Background save with error handling
        try {
            await saveWaterSettings(user.uid, {
                weight,
                activityLevel,
                climate,
                calculatedGoal: goal,
                isSetup: true
            });
        } catch (error) {
            console.error('[useWater] Error saving water settings:', error);
            // Optimistic update already applied, so UI still works
        }
    }, [user]);

    const addWater = useCallback(async (amount: number) => {
        if (!user || !settings) return;

        const currentAmount = todayLog?.amount || 0;
        const newAmount = currentAmount + amount;

        // Add to history for undo capability
        setAdditionHistory(prev => {
            const newHistory = [...prev, amount];
            console.log('[useWater] Adding to history:', amount, 'New history:', newHistory);
            return newHistory;
        });

        // Optimistic update
        setTodayLog(prev => ({
            id: prev?.id || 'temp-id',
            userId: user.uid,
            date: prev?.date || new Date().toISOString().split('T')[0],
            amount: newAmount,
            goal: settings.calculatedGoal,
            updatedAt: prev?.updatedAt || (null as any)
        }));

        await updateWaterIntake(user.uid, newAmount, settings.calculatedGoal);
    }, [user, settings, todayLog]);

    const undoLastAddition = useCallback(async () => {
        if (!user || !settings || additionHistory.length === 0) return;

        // Get the last addition from history
        const lastAmount = additionHistory[additionHistory.length - 1];
        const currentAmount = todayLog?.amount || 0;
        const newAmount = Math.max(0, currentAmount - lastAmount);

        // Remove last addition from history
        setAdditionHistory(prev => prev.slice(0, -1));

        // Optimistic update
        setTodayLog(prev => ({
            id: prev?.id || 'temp-id',
            userId: user.uid,
            date: prev?.date || new Date().toISOString().split('T')[0],
            amount: newAmount,
            goal: settings.calculatedGoal,
            updatedAt: prev?.updatedAt || (null as any)
        }));

        await updateWaterIntake(user.uid, newAmount, settings.calculatedGoal);
    }, [user, settings, todayLog, additionHistory]);

    const setManualGoal = useCallback(async (manualGoal: number) => {
        if (!user) return;

        // Optimistic update
        setSettings(prev => ({
            ...prev,
            id: user.uid,
            userId: user.uid,
            weight: prev?.weight || 70,
            activityLevel: prev?.activityLevel || 'moderate',
            climate: prev?.climate || 'normal',
            calculatedGoal: manualGoal,
            isSetup: true,
            updatedAt: prev?.updatedAt || (null as any)
        } as WaterSettings));

        // Save to Firestore
        try {
            await saveWaterSettings(user.uid, {
                weight: settings?.weight || 70,
                activityLevel: settings?.activityLevel || 'moderate',
                climate: settings?.climate || 'normal',
                calculatedGoal: manualGoal,
                isSetup: true
            });
        } catch (error) {
            console.error('[useWater] Error saving manual goal:', error);
        }
    }, [user, settings]);

    const resetWater = useCallback(async () => {
        if (!user || !settings) return;

        console.log('[useWater] Resetting water intake to 0');

        // Clear history
        setAdditionHistory([]);

        // Reset to 0
        setTodayLog(prev => ({
            id: prev?.id || 'temp-id',
            userId: user.uid,
            date: prev?.date || new Date().toISOString().split('T')[0],
            amount: 0,
            goal: settings.calculatedGoal,
            updatedAt: prev?.updatedAt || (null as any)
        }));

        await updateWaterIntake(user.uid, 0, settings.calculatedGoal);
    }, [user, settings]);

    return {
        settings,
        todayLog,
        loading,
        updateSettings,
        setManualGoal,
        addWater,
        undoLastAddition,
        resetWater,
        canUndo: additionHistory.length > 0,
        undoCount: additionHistory.length,
        calculateGoal // Exposed for preview
    };
};
