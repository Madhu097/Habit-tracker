'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Plus, Settings, CupSoda, CheckCircle } from 'lucide-react';
import { useWater } from '@/hooks/useWater';
import WaterIntakeCalculator from './WaterIntakeCalculator';

export default function WaterTracker() {
    const { settings, todayLog, addWater, loading } = useWater();
    const [showCalculator, setShowCalculator] = useState(false);
    const [adding, setAdding] = useState<number | null>(null);

    const goal = settings?.calculatedGoal || 2500;
    const current = todayLog?.amount || 0;
    const percentage = Math.min(100, Math.round((current / goal) * 100));

    const handleAdd = async (amount: number) => {
        setAdding(amount);
        await addWater(amount);
        setAdding(null);
    };

    if (loading) return (
        <div className="h-full bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="flex-1">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            </div>
        </div>
    );

    if (!settings?.isSetup) {
        return (
            <>
                <motion.div
                    whileHover={{ y: -5 }}
                    className="h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-blue-200 dark:shadow-none text-white flex flex-col items-center justify-center text-center space-y-4"
                >
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <Droplets className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Hydration Tracker</h3>
                        <p className="text-blue-100 text-sm mt-1">AI-calculated daily goals</p>
                    </div>
                    <button
                        onClick={() => setShowCalculator(true)}
                        className="px-6 py-2 bg-white text-blue-600 rounded-lg font-bold shadow-md hover:bg-blue-50 transition-colors"
                    >
                        Setup Plan
                    </button>
                </motion.div>
                <WaterIntakeCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
            </>
        );
    }

    return (
        <>
            <motion.div
                whileHover={{ y: -5 }}
                className="relative h-full bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col"
            >
                {/* Background Wave Animation (Fill effect) */}
                <div
                    className="absolute bottom-0 left-0 right-0 bg-blue-50 dark:bg-blue-900/20 transition-all duration-1000 ease-in-out z-0"
                    style={{ height: `${percentage}%` }}
                />

                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Water Intake</h3>
                            <p className="text-xs text-slate-500 font-medium">Daily Goal: {goal}ml</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCalculator(true)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>

                {/* Main Progress Display */}
                <div className="relative z-10 flex-1 flex flex-col justify-center items-center py-4">
                    <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                        {current}<span className="text-lg text-slate-400 font-medium">ml</span>
                    </div>

                    {percentage >= 100 ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2 text-green-500 font-bold bg-green-50 px-3 py-1 rounded-full text-sm"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Goal Reached!
                        </motion.div>
                    ) : (
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {percentage}% completed
                        </div>
                    )}
                </div>

                {/* Quick Add Buttons */}
                <div className="relative z-10 grid grid-cols-2 gap-3 mt-auto">
                    <button
                        onClick={() => handleAdd(250)}
                        disabled={adding !== null}
                        className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm active:scale-95"
                    >
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">+250ml</span>
                    </button>
                    <button
                        onClick={() => handleAdd(500)}
                        disabled={adding !== null}
                        className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-200 dark:shadow-none transition-colors active:scale-95"
                    >
                        <CupSoda className="w-4 h-4" />
                        <span className="text-sm font-bold">+500ml</span>
                    </button>
                </div>
            </motion.div>

            <WaterIntakeCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
        </>
    );
}
