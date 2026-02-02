'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Activity, Sun, Droplets, ArrowRight } from 'lucide-react';
import { useWater } from '@/hooks/useWater';

interface WaterIntakeCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WaterIntakeCalculator({ isOpen, onClose }: WaterIntakeCalculatorProps) {
    const { updateSettings, setManualGoal, calculateGoal } = useWater();
    const [step, setStep] = useState<'input' | 'result'>('input');
    const [mode, setMode] = useState<'calculate' | 'manual'>('calculate');
    const [calculatedGoal, setCalculatedGoal] = useState(0);
    const [manualGoalInput, setManualGoalInput] = useState(2500);

    // Form State
    const [weight, setWeight] = useState(70);
    const [activity, setActivity] = useState<'sedentary' | 'moderate' | 'active'>('moderate');
    const [climate, setClimate] = useState<'normal' | 'hot'>('normal');

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setStep('input');
            setCalculatedGoal(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCalculate = async () => {
        if (mode === 'manual') {
            // Use manual goal
            setCalculatedGoal(manualGoalInput);
            setStep('result');
            try {
                await setManualGoal(manualGoalInput);
            } catch (error) {
                console.error('[WaterCalculator] Error setting manual goal:', error);
            }
        } else {
            // Calculate the goal
            const goal = calculateGoal(weight, activity, climate);
            setCalculatedGoal(goal);
            setStep('result');
            try {
                await updateSettings(weight, activity, climate);
            } catch (error) {
                console.error('[WaterCalculator] Error updating water settings:', error);
            }
        }
    };

    const handleClose = () => {
        setStep('input');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
                            <Droplets className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-1">Smart Water Plan</h2>
                        <p className="text-blue-100 text-sm">AI-Powered Hydration Analysis</p>
                    </div>
                    {/* Decorative Blob */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-50" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50" />
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 'input' ? (
                        <div className="space-y-6">
                            {/* Mode Selection */}
                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                                <button
                                    onClick={() => setMode('calculate')}
                                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${mode === 'calculate'
                                            ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    🤖 AI Calculate
                                </button>
                                <button
                                    onClick={() => setMode('manual')}
                                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${mode === 'manual'
                                            ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    ✏️ Set Manually
                                </button>
                            </div>

                            {mode === 'calculate' ? (
                                <>
                                    {/* Weight */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <Calculator className="w-4 h-4 text-blue-500" />
                                            Current Weight (kg)
                                        </label>
                                        <input
                                            type="range"
                                            min="30"
                                            max="150"
                                            value={weight}
                                            onChange={(e) => setWeight(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <div className="text-center font-bold text-2xl text-slate-800 dark:text-white">
                                            {weight} <span className="text-sm font-normal text-gray-500">kg</span>
                                        </div>
                                    </div>

                                    {/* Activity */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <Activity className="w-4 h-4 text-green-500" />
                                            Activity Level
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['sedentary', 'moderate', 'active'].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setActivity(level as any)}
                                                    className={`py-2 px-1 text-xs sm:text-sm rounded-xl font-medium capitalize transition-all border-2 ${activity === level
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                        : 'border-transparent bg-gray-100 dark:bg-slate-800 text-gray-500'
                                                        }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Climate */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <Sun className="w-4 h-4 text-orange-500" />
                                            Climate Environment
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setClimate('normal')}
                                                className={`flex-1 py-3 rounded-xl font-medium transition-all border-2 ${climate === 'normal'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30'
                                                    : 'border-gray-200 bg-white dark:bg-slate-800 dark:border-slate-700'
                                                    }`}
                                            >
                                                Average
                                            </button>
                                            <button
                                                onClick={() => setClimate('hot')}
                                                className={`flex-1 py-3 rounded-xl font-medium transition-all border-2 ${climate === 'hot'
                                                    ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/30'
                                                    : 'border-gray-200 bg-white dark:bg-slate-800 dark:border-slate-700'
                                                    }`}
                                            >
                                                Hot / Humid
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4 py-4">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Droplets className="w-4 h-4 text-blue-500" />
                                        Your Daily Water Goal (ml)
                                    </label>
                                    <input
                                        type="number"
                                        min="500"
                                        max="10000"
                                        step="100"
                                        value={manualGoalInput}
                                        onChange={(e) => setManualGoalInput(Number(e.target.value))}
                                        className="w-full px-4 py-3 text-center text-3xl font-bold bg-gray-50 dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                                    />
                                    <p className="text-center text-sm text-gray-500">
                                        ≈ {(manualGoalInput / 250).toFixed(1)} glasses (250ml each)
                                    </p>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
                                        💡 <strong>Tip:</strong> Most adults need 2000-3000ml per day. Adjust based on your activity level and climate.
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleCalculate}
                                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-200 dark:shadow-none transition-all hover:scale-[1.02]"
                            >
                                {mode === 'calculate' ? 'Calculate My Plan' : 'Set My Goal'}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center space-y-6 py-4">
                            {/* Success Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                            >
                                <Droplets className="w-10 h-10 text-white" />
                            </motion.div>

                            {/* Result Title */}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Your Daily Water Goal
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Personalized for your lifestyle
                                </p>
                            </div>

                            {/* Water Goal Display */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800"
                            >
                                <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {calculatedGoal}
                                    <span className="text-3xl ml-2">ml</span>
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 text-sm">
                                    ≈ {(calculatedGoal / 250).toFixed(1)} glasses (250ml each)
                                </div>
                            </motion.div>

                            {/* Info Cards */}
                            <div className="grid grid-cols-3 gap-3 text-xs">
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                                    <div className="font-semibold text-gray-900 dark:text-white">{weight}kg</div>
                                    <div className="text-gray-500">Weight</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                                    <div className="font-semibold text-gray-900 dark:text-white capitalize">{activity}</div>
                                    <div className="text-gray-500">Activity</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                                    <div className="font-semibold text-gray-900 dark:text-white capitalize">{climate}</div>
                                    <div className="text-gray-500">Climate</div>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-lg"
                            >
                                Got it! Start Tracking
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
