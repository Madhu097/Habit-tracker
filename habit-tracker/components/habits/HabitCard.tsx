import React, { useState } from 'react';
import { DailyHabitView } from '@/types';
import { CheckCircle, XCircle, Circle, Flame, TrendingUp, MoreVertical, Edit2, Trash2, Calendar, Undo2 } from 'lucide-react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { motion } from 'framer-motion';
import CongratsAnimation from '@/components/animations/CongratsAnimation';
import MissAnimation from '@/components/animations/MissAnimation';

interface HabitCardProps {
    habit: DailyHabitView;
    onComplete: (habitId: string) => void;
    onMiss: (habitId: string) => void;
    onEdit: (habitId: string) => void;
    onDelete: (habitId: string) => void;
    onUndo: (habitId: string) => void;
}

// Helper function to get the next due date for a habit
const getNextDueDate = (habit: DailyHabitView): string => {
    const { frequency } = habit;
    const today = new Date();

    if (!frequency || frequency.type === 'daily') {
        return format(addDays(today, 1), 'EEEE, MMM d');
    }

    if (frequency.type === 'weekly' && frequency.daysOfWeek && frequency.daysOfWeek.length > 0) {
        const currentDay = today.getDay();
        const sortedDays = [...frequency.daysOfWeek].sort((a, b) => a - b);

        // Find the next day in the week
        let nextDay = sortedDays.find(day => day > currentDay);

        // If no day found this week, use the first day of next week
        if (nextDay === undefined) {
            nextDay = sortedDays[0];
            const daysUntilNext = (7 - currentDay + nextDay) % 7 || 7;
            return format(addDays(today, daysUntilNext), 'EEEE, MMM d');
        }

        const daysUntilNext = nextDay - currentDay;
        return format(addDays(today, daysUntilNext), 'EEEE, MMM d');
    }

    if (frequency.type === 'monthly' && frequency.daysOfMonth && frequency.daysOfMonth.length > 0) {
        const currentDate = today.getDate();
        const sortedDates = [...frequency.daysOfMonth].sort((a, b) => a - b);

        // Find the next date in this month
        let nextDate = sortedDates.find(date => date > currentDate);

        // If no date found this month, use the first date of next month
        if (nextDate === undefined) {
            nextDate = sortedDates[0];
            const nextMonth = addMonths(today, 1);
            const nextDueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextDate);
            return format(nextDueDate, 'MMMM d, yyyy');
        }

        const nextDueDate = new Date(today.getFullYear(), today.getMonth(), nextDate);
        return format(nextDueDate, 'MMMM d, yyyy');
    }

    return format(addDays(today, 1), 'EEEE, MMM d');
};

export default function HabitCard({ habit, onComplete, onMiss, onEdit, onDelete, onUndo }: HabitCardProps) {
    const { todayLog, stats } = habit;
    const status = todayLog?.status || 'pending';
    const [showMenu, setShowMenu] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
    const [showMiss, setShowMiss] = useState(false);

    const handleComplete = () => {
        setShowCongrats(true);
        onComplete(habit.id);
    };

    const handleMiss = () => {
        setShowMiss(true);
        onMiss(habit.id);
    };

    const getStatusColor = () => {
        switch (status) {
            case 'completed':
                return 'border-gray-200 dark:border-green-600 !bg-white dark:!bg-green-950/30 shadow-sm';
            case 'missed':
                return 'border-gray-200 dark:border-red-600 !bg-white dark:!bg-red-950/30 shadow-sm';
            default:
                return 'border-gray-200 dark:border-slate-700 !bg-white dark:!bg-slate-900 shadow-sm';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'missed':
                return <XCircle className="w-6 h-6 text-red-600" />;
            default:
                return <Circle className="w-6 h-6 text-gray-400" />;
        }
    };

    return (
        <>
            <motion.div
                whileHover={{ y: -5, scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`border rounded-xl p-4 transition-colors relative h-full flex flex-col ${getStatusColor()}`}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: habit.color }}
                            />
                            <h3 className="font-semibold text-lg !text-black dark:!text-white break-words">{habit.name}</h3>
                        </div>
                        {habit.description && (
                            <p className="text-sm !text-gray-700 dark:!text-slate-300 line-clamp-2">{habit.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}

                        {/* More Options Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                aria-label="More options"
                            >
                                <MoreVertical className="w-5 h-5 !text-gray-700 dark:!text-slate-400" />
                            </button>

                            {showMenu && (
                                <>
                                    {/* Backdrop to close menu */}
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowMenu(false)}
                                    />

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20">
                                        <button
                                            onClick={() => {
                                                onEdit(habit.id);
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Habit
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this habit?')) {
                                                    onDelete(habit.id);
                                                }
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Habit
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Motivational Filler for Pending Habits */}
                {status === 'pending' && (
                    <div className="flex-1 flex flex-col items-center justify-center py-4 opacity-100 group-hover:opacity-100 transition-opacity">
                        <div className="text-center space-y-1">
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 mb-1">
                                <Flame className="w-5 h-5 animate-pulse" />
                            </div>
                            <p className="text-xs font-medium !text-gray-700 dark:!text-slate-400">
                                {stats.currentStreak > 0
                                    ? "Keep the streak alive!"
                                    : "Start a new streak today!"}
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-3 text-sm mt-auto">
                    <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                        <span className="font-semibold text-base !text-black dark:!text-white">{stats.currentStreak}</span>
                        <span className="!text-gray-700 dark:!text-slate-300 font-normal">streak</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        <span className="font-semibold text-base !text-black dark:!text-white">{stats.completionRate}%</span>
                    </div>
                </div>

                {/* Actions */}
                {status === 'pending' && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleComplete}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            Complete
                        </button>
                        <button
                            onClick={handleMiss}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            Miss
                        </button>
                    </div>
                )}

                {status !== 'pending' && (
                    <div className="space-y-2">
                        <div className="text-center py-2 space-y-1">
                            <div className="text-sm font-normal !text-black dark:!text-slate-200">
                                {status === 'completed' ? '✓ Completed today' : '✗ Missed today'}
                            </div>
                            {status === 'completed' && (
                                <div className="flex items-center justify-center gap-1 text-xs !text-gray-700 dark:!text-slate-300">
                                    <Calendar className="w-3 h-3" />
                                    <span>Next due: {getNextDueDate(habit)}</span>
                                </div>
                            )}
                        </div>
                        {/* Undo Button */}
                        <button
                            onClick={() => onUndo(habit.id)}
                            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 !text-black dark:!text-slate-300 py-2 rounded-lg font-normal transition-colors text-sm"
                        >
                            <Undo2 className="w-4 h-4" />
                            Undo
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Congratulations Animation */}
            <CongratsAnimation
                show={showCongrats}
                onComplete={() => setShowCongrats(false)}
                habitName={habit.name}
            />

            {/* Miss Animation */}
            <MissAnimation
                show={showMiss}
                onComplete={() => setShowMiss(false)}
                habitName={habit.name}
            />
        </>
    );
}
