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
            setTodayLog(log);
        });

        return () => unsubscribe();
    }, [user]);

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

        // Background save
        await saveWaterSettings(user.uid, {
            weight,
            activityLevel,
            climate,
            calculatedGoal: goal,
            isSetup: true
        });
    }, [user]);

    const addWater = useCallback(async (amount: number) => {
        if (!user || !settings) return;

        const currentAmount = todayLog?.amount || 0;
        const newAmount = currentAmount + amount;

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

    return {
        settings,
        todayLog,
        loading,
        updateSettings,
        addWater,
        calculateGoal // Exposed for preview
    };
};
