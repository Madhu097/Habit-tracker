'use client';

import React from 'react';
import { HabitLog } from '@/types';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Calendar, Award, Target } from 'lucide-react';

interface HabitInsightsProps {
    logs: HabitLog[];
    darkMode?: boolean;
}

/**
 * HabitInsights Component
 * Provides AI-like insights and patterns from habit data
 * Adds a unique, intelligent touch to the monthly view
 */
const HabitInsights: React.FC<HabitInsightsProps> = ({ logs, darkMode = false }) => {
    // Calculate insights
    const insights = calculateInsights(logs);

    if (insights.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-2xl border-2 ${darkMode
                    ? 'bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-700/50 backdrop-blur-xl'
                    : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-lg'
                }`}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-indigo-600/20' : 'bg-indigo-600'
                    }`}>
                    <Zap className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-white'}`} />
                </div>
                <div>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        Smart Insights
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        AI-powered patterns from your data
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {insights.map((insight, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={`p-4 rounded-xl border ${darkMode
                                ? 'bg-slate-800/50 border-slate-700/50'
                                : 'bg-white border-slate-200'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`mt-1 ${getInsightColor(insight.type, darkMode)}`}>
                                {getInsightIcon(insight.type)}
                            </div>
                            <div className="flex-1">
                                <p className={`font-semibold mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'
                                    }`}>
                                    {insight.title}
                                </p>
                                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'
                                    }`}>
                                    {insight.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

// Insight calculation logic
function calculateInsights(logs: HabitLog[]): Insight[] {
    const insights: Insight[] = [];

    if (logs.length === 0) return insights;

    const completedLogs = logs.filter(log => log.status === 'completed');
    const missedLogs = logs.filter(log => log.status === 'missed');

    // Calculate completion rate
    const completionRate = (completedLogs.length / logs.length) * 100;

    // Insight 1: Overall performance
    if (completionRate >= 80) {
        insights.push({
            type: 'positive',
            title: 'Excellent Performance! 🎉',
            description: `You're crushing it with ${Math.round(completionRate)}% completion rate this month. Keep up the amazing work!`
        });
    } else if (completionRate >= 60) {
        insights.push({
            type: 'neutral',
            title: 'Good Progress',
            description: `You're at ${Math.round(completionRate)}% completion. A little more consistency could push you to excellence!`
        });
    } else if (completionRate < 40 && logs.length > 5) {
        insights.push({
            type: 'warning',
            title: 'Room for Improvement',
            description: `Your completion rate is ${Math.round(completionRate)}%. Try starting with smaller, achievable goals to build momentum.`
        });
    }

    // Insight 2: Streak analysis
    const currentStreak = calculateCurrentStreak(logs);
    if (currentStreak >= 7) {
        insights.push({
            type: 'positive',
            title: `${currentStreak}-Day Streak! 🔥`,
            description: 'You\'re on fire! Consistency is the key to lasting change. Don\'t break the chain!'
        });
    } else if (currentStreak >= 3) {
        insights.push({
            type: 'neutral',
            title: `${currentStreak}-Day Streak`,
            description: 'Great start! Keep going to build a powerful habit chain.'
        });
    }

    // Insight 3: Best day of week
    const bestDay = findBestDayOfWeek(completedLogs);
    if (bestDay && completedLogs.length > 7) {
        insights.push({
            type: 'info',
            title: `${bestDay} is Your Power Day`,
            description: `You complete the most habits on ${bestDay}s. Consider scheduling important tasks on this day!`
        });
    }

    // Insight 4: Recent trend
    const recentTrend = analyzeRecentTrend(logs);
    if (recentTrend === 'improving') {
        insights.push({
            type: 'positive',
            title: 'Upward Trend Detected 📈',
            description: 'Your completion rate has been improving over the past week. Momentum is building!'
        });
    } else if (recentTrend === 'declining') {
        insights.push({
            type: 'warning',
            title: 'Slight Dip Noticed',
            description: 'Your completion rate has dropped recently. Take a moment to reassess your goals and energy levels.'
        });
    }

    // Insight 5: Consistency score
    const consistencyScore = calculateConsistencyScore(logs);
    if (consistencyScore >= 0.8 && logs.length > 10) {
        insights.push({
            type: 'positive',
            title: 'Highly Consistent',
            description: 'You\'re maintaining steady progress without big gaps. This is the path to lasting habits!'
        });
    }

    return insights.slice(0, 4); // Return max 4 insights
}

// Helper functions
function calculateCurrentStreak(logs: HabitLog[]): number {
    const sortedLogs = [...logs]
        .filter(log => log.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedLogs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedLogs.length; i++) {
        const logDate = new Date(sortedLogs[i].date);
        logDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (logDate.getTime() === expectedDate.getTime()) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function findBestDayOfWeek(logs: HabitLog[]): string | null {
    if (logs.length === 0) return null;

    const dayCount: { [key: number]: number } = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    logs.forEach(log => {
        const day = new Date(log.date).getDay();
        dayCount[day] = (dayCount[day] || 0) + 1;
    });

    const bestDay = Object.entries(dayCount).reduce((a, b) => a[1] > b[1] ? a : b);
    return dayNames[parseInt(bestDay[0])];
}

function analyzeRecentTrend(logs: HabitLog[]): 'improving' | 'declining' | 'stable' {
    if (logs.length < 14) return 'stable';

    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const midpoint = Math.floor(sortedLogs.length / 2);
    const firstHalf = sortedLogs.slice(0, midpoint);
    const secondHalf = sortedLogs.slice(midpoint);

    const firstHalfRate = firstHalf.filter(l => l.status === 'completed').length / firstHalf.length;
    const secondHalfRate = secondHalf.filter(l => l.status === 'completed').length / secondHalf.length;

    const difference = secondHalfRate - firstHalfRate;

    if (difference > 0.15) return 'improving';
    if (difference < -0.15) return 'declining';
    return 'stable';
}

function calculateConsistencyScore(logs: HabitLog[]): number {
    if (logs.length < 7) return 0;

    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let gaps = 0;
    for (let i = 1; i < sortedLogs.length; i++) {
        const prevDate = new Date(sortedLogs[i - 1].date);
        const currDate = new Date(sortedLogs[i].date);
        const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dayDiff > 1) {
            gaps += dayDiff - 1;
        }
    }

    const totalDays = Math.floor(
        (new Date(sortedLogs[sortedLogs.length - 1].date).getTime() -
            new Date(sortedLogs[0].date).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    return 1 - (gaps / totalDays);
}

function getInsightIcon(type: InsightType) {
    switch (type) {
        case 'positive':
            return <Award className="w-5 h-5" />;
        case 'warning':
            return <TrendingDown className="w-5 h-5" />;
        case 'neutral':
            return <Target className="w-5 h-5" />;
        case 'info':
            return <Calendar className="w-5 h-5" />;
        default:
            return <TrendingUp className="w-5 h-5" />;
    }
}

function getInsightColor(type: InsightType, darkMode: boolean): string {
    const colors = {
        positive: darkMode ? 'text-green-400' : 'text-green-600',
        warning: darkMode ? 'text-orange-400' : 'text-orange-600',
        neutral: darkMode ? 'text-blue-400' : 'text-blue-600',
        info: darkMode ? 'text-purple-400' : 'text-purple-600',
    };
    return colors[type];
}

// Types
type InsightType = 'positive' | 'warning' | 'neutral' | 'info';

interface Insight {
    type: InsightType;
    title: string;
    description: string;
}

export default HabitInsights;
