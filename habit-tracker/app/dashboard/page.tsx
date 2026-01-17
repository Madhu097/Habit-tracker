'use client';

import React, { useState, Suspense, lazy, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/useHabits';
import { logOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import HabitCard from '@/components/habits/HabitCard';
import AddHabitModal from '@/components/habits/AddHabitModal';
import EditHabitModal from '@/components/habits/EditHabitModal';
import { Plus, BarChart3, LogOut, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { DailyHabitView } from '@/types';

// Lazy load analytics for code splitting
const AnalyticsCharts = lazy(() => import('@/components/analytics/AnalyticsCharts'));

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const { dailyHabits, loading, error, addHabit, editHabit, markHabitStatus, undoHabitLog, removeHabit } = useHabits();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingHabit, setEditingHabit] = useState<DailyHabitView | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const router = useRouter();

    // Load dark mode preference
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            setDarkMode(true);
        }
    }, []);

    // Save dark mode preference
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleLogout = async () => {
        await logOut();
        router.push('/login');
    };

    const handleComplete = async (habitId: string) => {
        await markHabitStatus(habitId, 'completed');
    };

    const handleMiss = async (habitId: string) => {
        await markHabitStatus(habitId, 'missed');
    };

    const handleUndo = async (habitId: string) => {
        try {
            await undoHabitLog(habitId);
        } catch (error) {
            console.error('Failed to undo:', error);
        }
    };

    const handleEdit = (habitId: string) => {
        const habit = dailyHabits.find(h => h.id === habitId);
        if (habit) {
            setEditingHabit(habit);
            setShowEditModal(true);
        }
    };

    const handleDelete = async (habitId: string) => {
        try {
            await removeHabit(habitId);
            // Success feedback is handled by the hook
        } catch (error) {
            console.error('Failed to delete habit:', error);
            alert('Failed to delete habit. Please try again.');
        }
    };

    if (authLoading || !user) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-blue-500' : 'text-blue-600'}`} />
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {/* Header */}
            <header className={`border-b sticky top-0 z-40 backdrop-blur-sm ${darkMode
                ? 'bg-slate-800/95 border-slate-700'
                : 'bg-white/95 border-slate-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <h1 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                Habit Tracker
                            </h1>

                            {/* Navigation Tabs */}
                            <div className={`hidden md:flex items-center gap-2 p-1 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                                <button
                                    onClick={() => setShowAnalytics(false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${!showAnalytics
                                        ? darkMode
                                            ? 'bg-slate-600 text-white shadow-md'
                                            : 'bg-white text-slate-900 shadow-md'
                                        : darkMode
                                            ? 'text-slate-400 hover:text-slate-200'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Dashboard</span>
                                </button>
                                <button
                                    onClick={() => setShowAnalytics(true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${showAnalytics
                                        ? darkMode
                                            ? 'bg-slate-600 text-white shadow-md'
                                            : 'bg-white text-slate-900 shadow-md'
                                        : darkMode
                                            ? 'text-slate-400 hover:text-slate-200'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    <BarChart3 className="w-5 h-5" />
                                    <span>Analytics</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Mobile Navigation Toggle */}
                            <button
                                onClick={() => setShowAnalytics(!showAnalytics)}
                                className={`md:hidden flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${showAnalytics
                                    ? darkMode
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-blue-600 text-white'
                                    : darkMode
                                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {showAnalytics ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <span className="hidden sm:inline">Dashboard</span>
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 className="w-5 h-5" />
                                        <span className="hidden sm:inline">Analytics</span>
                                    </>
                                )}
                            </button>

                            {/* Dark Mode Toggle */}
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode
                                    ? 'bg-blue-600 focus:ring-blue-500'
                                    : 'bg-slate-300 focus:ring-blue-400'
                                    }`}
                                aria-label="Toggle dark mode"
                            >
                                <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center ${darkMode
                                    ? 'translate-x-7 bg-slate-900'
                                    : 'translate-x-0 bg-white'
                                    }`}>
                                    {darkMode ? (
                                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </button>

                            <button
                                onClick={handleLogout}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${darkMode
                                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>

                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!showAnalytics ? (
                    <>
                        {/* Welcome Section */}
                        <div className="mb-8">
                            <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                Welcome back, {user.displayName || 'there'}!
                            </h2>
                            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                                Track your daily habits and build consistency
                            </p>
                        </div>

                        {/* Today's Date Card */}
                        <div className={`mb-6 p-4 rounded-xl border-2 ${darkMode
                            ? 'bg-slate-800/50 border-slate-700'
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-600/20' : 'bg-blue-600'
                                    }`}>
                                    <svg className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        Today's Date
                                    </p>
                                    <p className={`text-lg font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                        {format(new Date(), 'EEEE, MMMM d, yyyy')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Add Habit Button */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors mb-6 ${darkMode
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            <Plus className="w-5 h-5" />
                            Add New Habit
                        </button>

                        {/* Error Message */}
                        {error && (
                            <div className={`px-4 py-3 rounded-lg mb-6 border ${darkMode
                                ? 'bg-red-900/20 border-red-800 text-red-400'
                                : 'bg-red-50 border-red-200 text-red-700'
                                }`}>
                                {error}
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                            </div>
                        )}

                        {/* Habits Grid */}
                        {!loading && dailyHabits.length === 0 && (
                            <div className="text-center py-12">
                                <div className={darkMode ? 'text-slate-600' : 'text-slate-400'}>
                                    <Plus className="w-16 h-16 mx-auto mb-4" />
                                </div>
                                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                                    No habits yet
                                </h3>
                                <p className={`mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Start building better habits by adding your first one
                                </p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${darkMode
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Your First Habit
                                </button>
                            </div>
                        )}

                        {!loading && dailyHabits.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {dailyHabits.map((habit) => (
                                    <HabitCard
                                        key={habit.id}
                                        habit={habit}
                                        onComplete={handleComplete}
                                        onMiss={handleMiss}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onUndo={handleUndo}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Analytics View */}
                        <div className="mb-6">
                            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                Analytics
                            </h2>
                            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                                Track your progress and identify trends
                            </p>
                        </div>

                        <Suspense
                            fallback={
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                                </div>
                            }
                        >
                            <AnalyticsCharts />
                        </Suspense>
                    </>
                )}
            </main>

            {/* Add Habit Modal */}
            <AddHabitModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={addHabit}
            />

            {/* Edit Habit Modal */}
            <EditHabitModal
                isOpen={showEditModal}
                habit={editingHabit}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingHabit(null);
                }}
                onEdit={editHabit}
            />
        </div>
    );
}
