'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Habit, HabitLog } from '@/types';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isSameMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp, Target, Award, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHabitLogsInRange } from '@/lib/firebase/firestore';
import HabitInsights from './HabitInsights';

interface MonthlyViewProps {
    habits: Habit[];
    darkMode?: boolean;
}

interface DayData {
    date: Date;
    logs: HabitLog[];
    isCurrentMonth: boolean;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ habits, darkMode = false }) => {
    const { user } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
    const [monthlyLogs, setMonthlyLogs] = useState<HabitLog[]>([]);
    const [loading, setLoading] = useState(false);

    // Load logs for the current month
    useEffect(() => {
        const loadMonthlyLogs = async () => {
            if (!user || habits.length === 0) return;

            setLoading(true);
            try {
                const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
                const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

                const allLogs: HabitLog[] = [];

                const habitsToFetch = selectedHabit ? [selectedHabit] : habits;

                for (const habit of habitsToFetch) {
                    const logs = await getHabitLogsInRange(habit.id, user.uid, startDate, endDate);
                    allLogs.push(...logs);
                }

                setMonthlyLogs(allLogs);
            } catch (error) {
                console.error('Error loading monthly logs:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMonthlyLogs();
    }, [currentMonth, selectedHabit, habits, user]);

    const generateCalendarDays = (): DayData[] => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);

        const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

        return days.map(date => ({
            date,
            logs: monthlyLogs.filter(log => isSameDay(new Date(log.date), date)),
            isCurrentMonth: isSameMonth(date, currentMonth)
        }));
    };

    const calendarDays = generateCalendarDays();

    const monthlyStats = {
        totalDays: calendarDays.filter(d => d.isCurrentMonth).length,
        completedDays: monthlyLogs.filter(log => log.status === 'completed').length,
        missedDays: monthlyLogs.filter(log => log.status === 'missed').length,
        completionRate: monthlyLogs.length > 0
            ? Math.round((monthlyLogs.filter(log => log.status === 'completed').length / monthlyLogs.length) * 100)
            : 0,
        currentStreak: calculateCurrentStreak(monthlyLogs),
    };

    function calculateCurrentStreak(logs: HabitLog[]): number {
        const sortedLogs = [...logs]
            .filter(log => log.status === 'completed')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (sortedLogs.length === 0) return 0;

        let streak = 0;
        const today = new Date();

        for (let i = 0; i < sortedLogs.length; i++) {
            const logDate = new Date(sortedLogs[i].date);
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);

            if (isSameDay(logDate, expectedDate)) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    const getDayColor = (dayData: DayData) => {
        if (!dayData.isCurrentMonth) return darkMode ? 'bg-slate-900/20' : 'bg-gray-100/50';

        const completed = dayData.logs.filter(log => log.status === 'completed').length;
        const total = dayData.logs.length;

        if (total === 0) return darkMode ? 'bg-slate-800/30' : 'bg-white';

        const percentage = (completed / total) * 100;

        // Using distinct colors: Teal for 100%, Green for 75-99%
        if (percentage === 100) return darkMode ? 'bg-teal-500/70' : 'bg-teal-400';
        if (percentage >= 75) return darkMode ? 'bg-green-500/60' : 'bg-green-400';
        if (percentage >= 50) return darkMode ? 'bg-yellow-500/50' : 'bg-yellow-300';
        if (percentage >= 25) return darkMode ? 'bg-orange-500/50' : 'bg-orange-300';
        return darkMode ? 'bg-red-500/50' : 'bg-red-300';
    };

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="space-y-4">
            {/* Month Navigation - Simplified */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {selectedHabit ? selectedHabit.name : `All Habits (${habits.length})`}
                    </p>
                </div>

                <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Habit Filter - Compact */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setSelectedHabit(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${!selectedHabit
                        ? darkMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-600 text-white'
                        : darkMode
                            ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All
                </button>
                {habits.map(habit => (
                    <button
                        key={habit.id}
                        onClick={() => setSelectedHabit(habit)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${selectedHabit?.id === habit.id
                            ? 'text-white'
                            : darkMode
                                ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        style={selectedHabit?.id === habit.id ? {
                            backgroundColor: habit.color
                        } : {}}
                    >
                        {habit.name}
                    </button>
                ))}
            </div>

            {/* Stats - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    icon={<Target className="w-4 h-4" />}
                    label="Rate"
                    value={`${monthlyStats.completionRate}%`}
                    color="blue"
                    darkMode={darkMode}
                />
                <StatCard
                    icon={<Award className="w-4 h-4" />}
                    label="Done"
                    value={monthlyStats.completedDays}
                    color="green"
                    darkMode={darkMode}
                />
                <StatCard
                    icon={<TrendingUp className="w-4 h-4" />}
                    label="Streak"
                    value={`${monthlyStats.currentStreak}d`}
                    color="purple"
                    darkMode={darkMode}
                />
                <StatCard
                    icon={<Calendar className="w-4 h-4" />}
                    label="Missed"
                    value={monthlyStats.missedDays}
                    color="red"
                    darkMode={darkMode}
                />
            </div>

            {/* Calendar - Simplified */}
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                {/* Week Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day, i) => (
                        <div
                            key={i}
                            className={`text-center font-bold text-xs py-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((dayData, index) => {
                        const isToday = isSameDay(dayData.date, new Date());

                        return (
                            <div
                                key={index}
                                className={`
                                    relative aspect-square rounded-lg p-1 transition-all cursor-pointer text-center
                                    ${getDayColor(dayData)}
                                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                                    ${dayData.isCurrentMonth ? 'hover:scale-105' : 'opacity-40'}
                                `}
                                title={`${format(dayData.date, 'MMM d')}\n${dayData.logs.filter(l => l.status === 'completed').length}/${dayData.logs.length}`}
                            >
                                <div className={`text-xs font-bold ${dayData.isCurrentMonth
                                    ? darkMode ? 'text-white' : 'text-slate-900'
                                    : darkMode ? 'text-slate-600' : 'text-slate-400'
                                    }`}>
                                    {format(dayData.date, 'd')}
                                </div>

                                {dayData.logs.length > 0 && dayData.isCurrentMonth && (
                                    <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                                        {dayData.logs.slice(0, 3).map((log, i) => (
                                            <div
                                                key={i}
                                                className={`w-1 h-1 rounded-full ${log.status === 'completed' ? 'bg-white' : 'bg-gray-400'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend - Compact */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap gap-2 text-xs">
                        <LegendItem color={darkMode ? 'bg-teal-500/70' : 'bg-teal-400'} label="100%" darkMode={darkMode} />
                        <LegendItem color={darkMode ? 'bg-green-500/60' : 'bg-green-400'} label="75%" darkMode={darkMode} />
                        <LegendItem color={darkMode ? 'bg-yellow-500/50' : 'bg-yellow-300'} label="50%" darkMode={darkMode} />
                        <LegendItem color={darkMode ? 'bg-orange-500/50' : 'bg-orange-300'} label="25%" darkMode={darkMode} />
                        <LegendItem color={darkMode ? 'bg-red-500/50' : 'bg-red-300'} label="<25%" darkMode={darkMode} />
                    </div>
                </div>
            </div>

            {/* Insights - Optional */}
            {monthlyLogs.length > 5 && <HabitInsights logs={monthlyLogs} darkMode={darkMode} />}
        </div>
    );
};

// Compact Stat Card
const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
    darkMode: boolean;
}> = ({ icon, label, value, color, darkMode }) => {
    const colorClasses = {
        blue: darkMode ? 'bg-blue-600/20 border-blue-700/50' : 'bg-blue-50 border-blue-200',
        green: darkMode ? 'bg-green-600/20 border-green-700/50' : 'bg-green-50 border-green-200',
        purple: darkMode ? 'bg-purple-600/20 border-purple-700/50' : 'bg-purple-50 border-purple-200',
        red: darkMode ? 'bg-red-600/20 border-red-700/50' : 'bg-red-50 border-red-200',
    };

    const iconColorClasses = {
        blue: darkMode ? 'text-blue-400' : 'text-blue-600',
        green: darkMode ? 'text-green-400' : 'text-green-600',
        purple: darkMode ? 'text-purple-400' : 'text-purple-600',
        red: darkMode ? 'text-red-400' : 'text-red-600',
    };

    return (
        <div className={`p-3 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
            <div className={`mb-1 ${iconColorClasses[color as keyof typeof iconColorClasses]}`}>
                {icon}
            </div>
            <p className={`text-xl font-black ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {value}
            </p>
            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {label}
            </p>
        </div>
    );
};

// Compact Legend Item
const LegendItem: React.FC<{ color: string; label: string; darkMode: boolean }> = ({ color, label, darkMode }) => (
    <div className="flex items-center gap-1">
        <div className={`w-3 h-3 rounded ${color}`} />
        <span className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
    </div>
);

export default MonthlyView;
