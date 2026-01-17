'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/useHabits';
import { getWeeklyStats, getMonthlyStats } from '@/lib/firebase/firestore';
import { exportToExcel, exportToCSV, exportToPDF } from '@/lib/utils/exportAnalytics';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    RadialLinearScale,
} from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, subMonths, startOfMonth, endOfMonth, eachWeekOfInterval, startOfYear } from 'date-fns';
import { TrendingUp, TrendingDown, Flame, Target, Calendar, Award, BarChart3, PieChart, Download, FileSpreadsheet, FileText, Activity, Clock, Zap, Filter } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    RadialLinearScale
);

interface AnalyticsInsights {
    totalHabits: number;
    activeHabits: number;
    totalCompleted: number;
    totalMissed: number;
    overallCompletionRate: number;
    currentWeekCompletion: number;
    bestStreak: number;
    mostConsistentHabit: string;
    improvementTrend: 'up' | 'down' | 'stable';
    averageDaily: number;
    perfectDays: number;
    currentMonthCompletion: number;
}

type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

export default function AnalyticsCharts() {
    const { user } = useAuth();
    const { dailyHabits } = useHabits();
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [insights, setInsights] = useState<AnalyticsInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
    const [heatmapData, setHeatmapData] = useState<any[]>([]);

    // Load dark mode preference
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            setDarkMode(true);
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        loadAnalytics();
    }, [user, dailyHabits, timePeriod]);

    const loadAnalytics = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Determine how many weeks/months to fetch based on time period
            const weeksToFetch = timePeriod === 'week' ? 4 : timePeriod === 'month' ? 8 : timePeriod === 'quarter' ? 12 : 52;
            const monthsToFetch = timePeriod === 'week' ? 2 : timePeriod === 'month' ? 6 : timePeriod === 'quarter' ? 3 : 12;

            const [weekly, monthly] = await Promise.all([
                getWeeklyStats(user.uid, weeksToFetch),
                getMonthlyStats(user.uid, monthsToFetch),
            ]);

            setWeeklyData(weekly);
            setMonthlyData(monthly);

            // Calculate insights
            const totalCompleted = dailyHabits.reduce((sum, h) => sum + (h.stats?.totalCompleted || 0), 0);
            const totalMissed = dailyHabits.reduce((sum, h) => sum + (h.stats?.totalMissed || 0), 0);
            const total = totalCompleted + totalMissed;
            const overallRate = total > 0 ? Math.round((totalCompleted / total) * 100) : 0;

            // Find best streak
            const bestStreak = Math.max(...dailyHabits.map(h => h.stats?.longestStreak || 0), 0);

            // Find most consistent habit (highest completion rate)
            const mostConsistent = dailyHabits.reduce((best, current) => {
                const currentRate = current.stats?.completionRate || 0;
                const bestRate = best.stats?.completionRate || 0;
                return currentRate > bestRate ? current : best;
            }, dailyHabits[0]);

            // Calculate trend (comparing last 2 months)
            let trend: 'up' | 'down' | 'stable' = 'stable';
            if (monthly.length >= 2) {
                const lastMonth = monthly[monthly.length - 1]?.completionRate || 0;
                const prevMonth = monthly[monthly.length - 2]?.completionRate || 0;
                if (lastMonth > prevMonth + 5) trend = 'up';
                else if (lastMonth < prevMonth - 5) trend = 'down';
            }

            // Current week completion
            const currentWeek = weekly[weekly.length - 1] || { completed: 0, missed: 0 };
            const weekTotal = currentWeek.completed + currentWeek.missed;
            const weekRate = weekTotal > 0 ? Math.round((currentWeek.completed / weekTotal) * 100) : 0;

            // Current month completion
            const currentMonth = monthly[monthly.length - 1] || { completed: 0, missed: 0, completionRate: 0 };

            // Calculate average daily completions
            const daysWithData = weekly.reduce((sum, w) => sum + (w.completed + w.missed > 0 ? 7 : 0), 0);
            const averageDaily = daysWithData > 0 ? Math.round(totalCompleted / daysWithData * 10) / 10 : 0;

            // Calculate perfect days (all habits completed)
            const perfectDays = weekly.reduce((sum, w) => {
                const perfectDaysInWeek = w.perfectDays || 0;
                return sum + perfectDaysInWeek;
            }, 0);

            setInsights({
                totalHabits: dailyHabits.length,
                activeHabits: dailyHabits.filter(h => h.isActive).length,
                totalCompleted,
                totalMissed,
                overallCompletionRate: overallRate,
                currentWeekCompletion: weekRate,
                currentMonthCompletion: currentMonth.completionRate,
                bestStreak,
                mostConsistentHabit: mostConsistent?.name || 'N/A',
                improvementTrend: trend,
                averageDaily,
                perfectDays,
            });

            // Generate heatmap data for last 90 days
            generateHeatmapData();
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateHeatmapData = () => {
        const days = eachDayOfInterval({
            start: subDays(new Date(), 89),
            end: new Date(),
        });

        const heatmap = days.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            // In a real implementation, you'd fetch actual completion data for each day
            // For now, we'll use a placeholder
            return {
                date: dayStr,
                count: 0, // This should be fetched from actual data
                level: 0, // 0-4 intensity level
            };
        });

        setHeatmapData(heatmap);
    };

    // Export handlers
    const handleExportExcel = () => {
        if (!insights) return;
        exportToExcel({
            habits: dailyHabits,
            weeklyData,
            monthlyData,
            insights,
        });
    };

    const handleExportCSV = () => {
        if (!insights) return;
        exportToCSV({
            habits: dailyHabits,
            weeklyData,
            monthlyData,
            insights,
        });
    };

    const handleExportPDF = () => {
        if (!insights) return;
        exportToPDF({
            habits: dailyHabits,
            weeklyData,
            monthlyData,
            insights,
        });
    };

    if (loading) {
        return (
            <div className={`space-y-6 ${darkMode ? 'text-white' : ''}`}>
                <div className={`rounded-xl p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <div className="animate-pulse space-y-4">
                        <div className={`h-4 rounded w-1/4 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                        <div className={`h-64 rounded ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                    </div>
                </div>
            </div>
        );
    }

    // Prepare data based on selected time period
    const getFilteredChartData = () => {
        let labels: string[] = [];
        let completedData: number[] = [];
        let missedData: number[] = [];

        if (timePeriod === 'week') {
            const recentWeeks = weeklyData.slice(-4);
            labels = recentWeeks.map(d => format(new Date(d.date), 'MMM dd'));
            completedData = recentWeeks.map(d => d.completed);
            missedData = recentWeeks.map(d => d.missed);
        } else if (timePeriod === 'month') {
            const recentWeeks = weeklyData.slice(-8);
            labels = recentWeeks.map(d => format(new Date(d.date), 'MMM dd'));
            completedData = recentWeeks.map(d => d.completed);
            missedData = recentWeeks.map(d => d.missed);
        } else if (timePeriod === 'quarter') {
            const recentMonths = monthlyData.slice(-3);
            labels = recentMonths.map(d => format(new Date(d.month + '-01'), 'MMM yyyy'));
            completedData = recentMonths.map(d => d.completed);
            missedData = recentMonths.map(d => d.missed);
        } else {
            const recentMonths = monthlyData.slice(-12);
            labels = recentMonths.map(d => format(new Date(d.month + '-01'), 'MMM'));
            completedData = recentMonths.map(d => d.completed);
            missedData = recentMonths.map(d => d.missed);
        }

        return { labels, completedData, missedData };
    };

    const { labels, completedData, missedData } = getFilteredChartData();

    // Chart configurations with enhanced styling
    const performanceChartData = {
        labels,
        datasets: [
            {
                label: 'Completed',
                data: completedData,
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2,
                borderRadius: 8,
            },
            {
                label: 'Missed',
                data: missedData,
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const trendChartData = {
        labels: monthlyData.slice(-6).map(d => format(new Date(d.month + '-01'), 'MMM yyyy')),
        datasets: [
            {
                label: 'Completion Rate (%)',
                data: monthlyData.slice(-6).map(d => d.completionRate),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
                    return gradient;
                },
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
        ],
    };

    // Radar chart for habit performance
    const habitPerformanceData = {
        labels: dailyHabits.slice(0, 6).map(h => h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name),
        datasets: [
            {
                label: 'Completion Rate',
                data: dailyHabits.slice(0, 6).map(h => h.stats?.completionRate || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(59, 130, 246)',
            },
        ],
    };

    // Habit distribution by completion rate
    const habitDistributionData = {
        labels: ['Excellent (>80%)', 'Good (60-80%)', 'Fair (40-60%)', 'Needs Work (<40%)'],
        datasets: [
            {
                data: [
                    dailyHabits.filter(h => (h.stats?.completionRate || 0) > 80).length,
                    dailyHabits.filter(h => {
                        const rate = h.stats?.completionRate || 0;
                        return rate >= 60 && rate <= 80;
                    }).length,
                    dailyHabits.filter(h => {
                        const rate = h.stats?.completionRate || 0;
                        return rate >= 40 && rate < 60;
                    }).length,
                    dailyHabits.filter(h => (h.stats?.completionRate || 0) < 40).length,
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(59, 130, 246)',
                    'rgb(251, 191, 36)',
                    'rgb(239, 68, 68)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: darkMode ? '#e2e8f0' : '#1f2937',
                    font: {
                        size: 12,
                        weight: 'bold' as const,
                    },
                    padding: 15,
                },
            },
            tooltip: {
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                titleColor: darkMode ? '#f1f5f9' : '#1f2937',
                bodyColor: darkMode ? '#cbd5e1' : '#4b5563',
                borderColor: darkMode ? '#475569' : '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: darkMode ? '#334155' : '#f3f4f6',
                },
                ticks: {
                    color: darkMode ? '#94a3b8' : '#6b7280',
                },
            },
            x: {
                grid: {
                    color: darkMode ? '#334155' : '#f3f4f6',
                },
                ticks: {
                    color: darkMode ? '#94a3b8' : '#6b7280',
                },
            },
        },
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: darkMode ? '#e2e8f0' : '#1f2937',
                    font: {
                        size: 12,
                        weight: 'bold' as const,
                    },
                },
            },
        },
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    color: darkMode ? '#94a3b8' : '#6b7280',
                    backdropColor: 'transparent',
                },
                grid: {
                    color: darkMode ? '#334155' : '#e5e7eb',
                },
                pointLabels: {
                    color: darkMode ? '#cbd5e1' : '#4b5563',
                    font: {
                        size: 11,
                    },
                },
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: darkMode ? '#e2e8f0' : '#1f2937',
                    padding: 15,
                    font: {
                        size: 11,
                    },
                },
            },
            tooltip: {
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                titleColor: darkMode ? '#f1f5f9' : '#1f2937',
                bodyColor: darkMode ? '#cbd5e1' : '#4b5563',
                borderColor: darkMode ? '#475569' : '#e5e7eb',
                borderWidth: 1,
            },
        },
    };

    return (
        <div className="space-y-6">
            {/* Header with Time Period Filter */}
            <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} shadow-lg`}>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div>
                        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                            📊 Analytics Dashboard
                        </h2>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            Comprehensive insights into your habit tracking journey
                        </p>
                    </div>

                    {/* Time Period Filter */}
                    <div className={`flex items-center gap-2 p-1.5 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                        <Filter className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                        {(['week', 'month', 'quarter', 'year'] as TimePeriod[]).map((period) => (
                            <button
                                key={period}
                                onClick={() => setTimePeriod(period)}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${timePeriod === period
                                    ? darkMode
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-blue-600 text-white shadow-md'
                                    : darkMode
                                        ? 'text-slate-300 hover:text-white hover:bg-slate-600'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                                    }`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Export Buttons */}
            <div className={`rounded-xl p-5 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-md`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className={`text-lg font-semibold flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                            <Download className="w-5 h-5" />
                            Export Analytics
                        </h3>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            Download your habit tracking data in various formats
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg hover:scale-105"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Excel</span>
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg hover:scale-105"
                        >
                            <FileText className="w-4 h-4" />
                            <span>CSV</span>
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg hover:scale-105"
                        >
                            <Download className="w-4 h-4" />
                            <span>PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Overall Completion Rate */}
                <div className={`rounded-xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-600/20' : 'bg-blue-600'} shadow-md`}>
                            <Target className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-white'}`} />
                        </div>
                        {insights?.improvementTrend === 'up' && <TrendingUp className="w-6 h-6 text-green-500" />}
                        {insights?.improvementTrend === 'down' && <TrendingDown className="w-6 h-6 text-red-500" />}
                    </div>
                    <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {insights?.overallCompletionRate || 0}%
                    </div>
                    <div className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Overall Success Rate</div>
                    <div className={`mt-3 text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                        {insights?.totalCompleted} completed / {(insights?.totalCompleted || 0) + (insights?.totalMissed || 0)} total
                    </div>
                </div>

                {/* Best Streak */}
                <div className={`rounded-xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-orange-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-orange-600/20' : 'bg-orange-600'} shadow-md`}>
                            <Flame className={`w-6 h-6 ${darkMode ? 'text-orange-400' : 'text-white'}`} />
                        </div>
                    </div>
                    <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {insights?.bestStreak || 0}
                    </div>
                    <div className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Best Streak (days)</div>
                    <div className={`mt-3 text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                        Keep the momentum going! 🔥
                    </div>
                </div>

                {/* Total Completed */}
                <div className={`rounded-xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-600/20' : 'bg-green-600'} shadow-md`}>
                            <Award className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-white'}`} />
                        </div>
                    </div>
                    <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {insights?.totalCompleted || 0}
                    </div>
                    <div className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Total Completions</div>
                    <div className={`mt-3 text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                        Avg {insights?.averageDaily || 0} per day
                    </div>
                </div>

                {/* This Month */}
                <div className={`rounded-xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-purple-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-purple-600/20' : 'bg-purple-600'} shadow-md`}>
                            <Calendar className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-white'}`} />
                        </div>
                    </div>
                    <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {insights?.currentMonthCompletion || 0}%
                    </div>
                    <div className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>This Month's Rate</div>
                    <div className={`mt-3 text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                        {insights?.perfectDays || 0} perfect days
                    </div>
                </div>
            </div>

            {/* Additional Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`rounded-xl p-5 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-md`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2.5 rounded-lg ${darkMode ? 'bg-cyan-600/20' : 'bg-cyan-100'}`}>
                            <Activity className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                        </div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Active Habits</div>
                    </div>
                    <div className={`text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {insights?.activeHabits || 0} <span className={`text-lg ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>/ {insights?.totalHabits || 0}</span>
                    </div>
                </div>

                <div className={`rounded-xl p-5 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-md`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2.5 rounded-lg ${darkMode ? 'bg-yellow-600/20' : 'bg-yellow-100'}`}>
                            <Zap className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        </div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Perfect Days</div>
                    </div>
                    <div className={`text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {insights?.perfectDays || 0}
                    </div>
                </div>

                <div className={`rounded-xl p-5 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-md`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2.5 rounded-lg ${darkMode ? 'bg-indigo-600/20' : 'bg-indigo-100'}`}>
                            <Clock className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        </div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>This Week</div>
                    </div>
                    <div className={`text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {insights?.currentWeekCompletion || 0}%
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Trend */}
                <div className={`lg:col-span-2 rounded-xl p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-lg`}>
                    <div className="flex items-center gap-2 mb-5">
                        <BarChart3 className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                            Performance Trend - {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}ly View
                        </h3>
                    </div>
                    <div className="h-80">
                        <Bar data={performanceChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Habit Distribution */}
                <div className={`rounded-xl p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-lg`}>
                    <div className="flex items-center gap-2 mb-5">
                        <PieChart className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                            Habit Quality
                        </h3>
                    </div>
                    <div className="h-80">
                        <Doughnut data={habitDistributionData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Completion Rate Trend */}
                <div className={`rounded-xl p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-lg`}>
                    <h3 className={`text-lg font-semibold mb-5 flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        6-Month Completion Rate Trend
                    </h3>
                    <div className="h-80">
                        <Line data={trendChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Habit Performance Radar */}
                <div className={`rounded-xl p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-lg`}>
                    <h3 className={`text-lg font-semibold mb-5 flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        <Activity className="w-5 h-5 text-blue-500" />
                        Habit Performance Overview
                    </h3>
                    <div className="h-80">
                        <Radar data={habitPerformanceData} options={radarOptions} />
                    </div>
                </div>
            </div>

            {/* Insights & Recommendations */}
            <div className={`rounded-xl p-6 border ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200'} shadow-lg`}>
                <h3 className={`text-xl font-bold mb-5 flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                    💡 Key Insights & Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-5 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-white/80'} shadow-md`}>
                        <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                            🏆 Most Consistent Habit
                        </div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                            {insights?.mostConsistentHabit}
                        </div>
                        <div className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            Keep up the excellent work!
                        </div>
                    </div>
                    <div className={`p-5 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-white/80'} shadow-md`}>
                        <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                            📈 Performance Trend
                        </div>
                        <div className="flex items-center gap-3">
                            {insights?.improvementTrend === 'up' && (
                                <>
                                    <TrendingUp className="w-8 h-8 text-green-500" />
                                    <div>
                                        <div className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                                            Improving!
                                        </div>
                                        <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                            You're on an upward trajectory
                                        </div>
                                    </div>
                                </>
                            )}
                            {insights?.improvementTrend === 'down' && (
                                <>
                                    <TrendingDown className="w-8 h-8 text-red-500" />
                                    <div>
                                        <div className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                                            Needs Focus
                                        </div>
                                        <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                            Time to refocus your efforts
                                        </div>
                                    </div>
                                </>
                            )}
                            {insights?.improvementTrend === 'stable' && (
                                <>
                                    <div className="w-8 h-8 flex items-center justify-center text-2xl">➡️</div>
                                    <div>
                                        <div className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                                            Steady Progress
                                        </div>
                                        <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                            Maintaining consistency
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Stats Summary */}
            <div>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                    📅 Recent Monthly Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {monthlyData.slice(-3).reverse().map((month) => (
                        <div key={month.month} className={`rounded-xl p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-md hover:shadow-lg transition-all`}>
                            <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                {format(new Date(month.month + '-01'), 'MMMM yyyy')}
                            </div>
                            <div className={`text-4xl font-bold mb-4 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                                {month.completionRate}%
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-green-600 font-medium flex items-center gap-1">
                                        <span className="text-lg">✓</span> Completed
                                    </span>
                                    <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>{month.completed}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-red-600 font-medium flex items-center gap-1">
                                        <span className="text-lg">✗</span> Missed
                                    </span>
                                    <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>{month.missed}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
