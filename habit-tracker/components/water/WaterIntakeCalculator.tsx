'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Activity, Sun, Droplets, ArrowRight, Brain } from 'lucide-react';
import { useWater } from '@/hooks/useWater';

interface WaterIntakeCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WaterIntakeCalculator({ isOpen, onClose }: WaterIntakeCalculatorProps) {
    const { updateSettings } = useWater();
    const [step, setStep] = useState(1);
    const [calculating, setCalculating] = useState(false);

    // Form State
    const [weight, setWeight] = useState(70);
    const [activity, setActivity] = useState<'sedentary' | 'moderate' | 'active'>('moderate');
    const [climate, setClimate] = useState<'normal' | 'hot'>('normal');

    if (!isOpen) return null;

    const handleCalculate = async () => {
        setStep(2);
        setCalculating(true);

        // Simulate "AI Calculation" delay
        setTimeout(async () => {
            await updateSettings(weight, activity, climate);
            setCalculating(false);
            onClose();
        }, 300);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
                            <Brain className="w-6 h-6 text-white" />
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
                    {step === 1 ? (
                        <div className="space-y-6">
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

                            <button
                                onClick={handleCalculate}
                                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-200 dark:shadow-none transition-all hover:scale-[1.02]"
                            >
                                Calculate My Plan
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-10 space-y-6">
                            <div className="relative mx-auto w-24 h-24">
                                <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-pulse" />
                                <div className="absolute inset-2 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Brain className="w-8 h-8 text-blue-500 animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Analyzing Bio-Data...
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Optimizing daily hydration targets based on your unique profile.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
