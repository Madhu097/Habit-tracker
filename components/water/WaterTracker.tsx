'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Plus, Settings, CupSoda, CheckCircle, Undo2, Trash2 } from 'lucide-react';
import { useWater } from '@/hooks/useWater';
import WaterIntakeCalculator from './WaterIntakeCalculator';

export default function WaterTracker() {
    const { settings, todayLog, addWater, undoLastAddition, resetWater, canUndo, undoCount, setManualGoal, loading } = useWater();
    const [showCalculator, setShowCalculator] = useState(false);
    const [adding, setAdding] = useState<number | null>(null);

    const goal = settings?.calculatedGoal || 2500;
    const current = todayLog?.amount || 0;
    const percentage = Math.min(100, Math.round((current / goal) * 100));

    // Debug logging
    React.useEffect(() => {
        console.log('[WaterTracker] canUndo:', canUndo, 'undoCount:', undoCount, 'current:', current);
    }, [canUndo, undoCount, current]);

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
                {/* Enhanced Realistic Water Tank Animation */}
                <div
                    className="absolute bottom-0 left-0 right-0 transition-all duration-[2000ms] ease-out z-0"
                    style={{ height: `${percentage}%` }}
                >
                    {/* Water Body with Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-400/40 via-blue-500/30 to-blue-600/40 dark:from-blue-500/30 dark:via-blue-600/25 dark:to-blue-700/35" />

                    {/* Animated Bubbles */}
                    {percentage > 10 && (
                        <>
                            <motion.div
                                className="absolute w-2 h-2 bg-white/40 rounded-full"
                                style={{ left: '20%', bottom: '10%' }}
                                animate={{
                                    y: [0, -100, -200],
                                    opacity: [0, 0.6, 0],
                                    scale: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeOut"
                                }}
                            />
                            <motion.div
                                className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
                                style={{ left: '60%', bottom: '5%' }}
                                animate={{
                                    y: [0, -120, -240],
                                    opacity: [0, 0.5, 0],
                                    scale: [0.5, 1.2, 0.5]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    delay: 1,
                                    ease: "easeOut"
                                }}
                            />
                            <motion.div
                                className="absolute w-1 h-1 bg-white/25 rounded-full"
                                style={{ left: '80%', bottom: '15%' }}
                                animate={{
                                    y: [0, -80, -160],
                                    opacity: [0, 0.4, 0],
                                    scale: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 3.5,
                                    repeat: Infinity,
                                    delay: 2,
                                    ease: "easeOut"
                                }}
                            />
                            <motion.div
                                className="absolute w-2 h-2 bg-white/35 rounded-full"
                                style={{ left: '40%', bottom: '8%' }}
                                animate={{
                                    y: [0, -150, -300],
                                    opacity: [0, 0.5, 0],
                                    scale: [0.5, 1.3, 0.5]
                                }}
                                transition={{
                                    duration: 4.5,
                                    repeat: Infinity,
                                    delay: 0.5,
                                    ease: "easeOut"
                                }}
                            />
                        </>
                    )}

                    {/* Smooth Wave Animation */}
                    <svg
                        className="absolute bottom-0 w-full h-32"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 320"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(96, 165, 250, 0.6)" />
                                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.4)" />
                                <stop offset="100%" stopColor="rgba(37, 99, 235, 0.3)" />
                            </linearGradient>
                        </defs>

                        {/* Primary Wave */}
                        <path
                            fill="url(#waveGradient)"
                            d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,154.7C672,149,768,171,864,186.7C960,203,1056,213,1152,208C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        >
                            <animate
                                attributeName="d"
                                dur="5s"
                                repeatCount="indefinite"
                                values="
                                    M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,154.7C672,149,768,171,864,186.7C960,203,1056,213,1152,208C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                    M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,197.3C672,203,768,181,864,170.7C960,160,1056,160,1152,170.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                    M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,197.3C960,181,1056,171,1152,181.3C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                    M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,154.7C672,149,768,171,864,186.7C960,203,1056,213,1152,208C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
                                "
                            />
                        </path>

                        {/* Secondary Wave (Overlay) */}
                        <path
                            fill="rgba(59, 130, 246, 0.25)"
                            d="M0,256L48,240C96,224,192,192,288,197.3C384,203,480,245,576,250.7C672,256,768,224,864,213.3C960,203,1056,213,1152,224C1248,235,1344,245,1392,250.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        >
                            <animate
                                attributeName="d"
                                dur="4s"
                                repeatCount="indefinite"
                                values="
                                    M0,256L48,240C96,224,192,192,288,197.3C384,203,480,245,576,250.7C672,256,768,224,864,213.3C960,203,1056,213,1152,224C1248,235,1344,245,1392,250.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                    M0,224L48,234.7C96,245,192,267,288,261.3C384,256,480,224,576,218.7C672,213,768,235,864,245.3C960,256,1056,256,1152,245.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                    M0,288L48,277.3C96,267,192,245,288,240C384,235,480,245,576,256C672,267,768,277,864,272C960,267,1056,245,1152,234.7C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                    M0,256L48,240C96,224,192,192,288,197.3C384,203,480,245,576,250.7C672,256,768,224,864,213.3C960,203,1056,213,1152,224C1248,235,1344,245,1392,250.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
                                "
                            />
                        </path>

                        {/* Top Shimmer Effect */}
                        <path
                            fill="rgba(255, 255, 255, 0.15)"
                            d="M0,288L48,282.7C96,277,192,267,288,272C384,277,480,299,576,293.3C672,288,768,256,864,250.7C960,245,1056,267,1152,272C1248,277,1344,267,1392,261.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        >
                            <animate
                                attributeName="d"
                                dur="3s"
                                repeatCount="indefinite"
                                values="
                                    M0,288L48,282.7C96,277,192,267,288,272C384,277,480,299,576,293.3C672,288,768,256,864,250.7C960,245,1056,267,1152,272C1248,277,1344,267,1392,261.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                    M0,272L48,277.3C96,283,192,293,288,288C384,283,480,261,576,256C672,251,768,261,864,272C960,283,1056,293,1152,288C1248,283,1344,261,1392,250.7L1440,240L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                    M0,288L48,282.7C96,277,192,267,288,272C384,277,480,299,576,293.3C672,288,768,256,864,250.7C960,245,1056,267,1152,272C1248,277,1344,267,1392,261.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
                                "
                            />
                        </path>
                    </svg>
                </div>

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
                    <div className="flex items-center gap-2">
                        {current > 0 && (
                            <button
                                onClick={resetWater}
                                className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                                title="Reset to 0ml"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => setShowCalculator(true)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
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
                <div className={`relative z-10 grid gap-3 mt-auto transition-all ${canUndo ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <AnimatePresence>
                        {canUndo && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={undoLastAddition}
                                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-md shadow-orange-200 dark:shadow-none transition-all active:scale-95"
                            >
                                <Undo2 className="w-4 h-4" />
                                <span className="text-sm font-bold">Undo {undoCount > 1 && `(${undoCount})`}</span>
                            </motion.button>
                        )}
                    </AnimatePresence>
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
