'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Calendar, Repeat } from 'lucide-react';
import { Habit } from '@/types';

interface EditHabitModalProps {
    isOpen: boolean;
    habit: Habit | null;
    onClose: () => void;
    onEdit: (habitId: string, updates: Partial<Habit>) => Promise<any>;
}

const PRESET_COLORS = [
    { value: '#3B82F6', label: 'Focus' },   // Blue
    { value: '#10B981', label: 'Health' },  // Emerald
    { value: '#8B5CF6', label: 'Growth' },  // Violet
    { value: '#F43F5E', label: 'Energy' },  // Rose
    { value: '#F59E0B', label: 'Creativity' }, // Amber
    { value: '#EC4899', label: 'Passion' }, // Pink
    { value: '#06B6D4', label: 'Calm' },    // Cyan
    { value: '#6366F1', label: 'Spirit' },  // Indigo
];

const DAYS_OF_WEEK = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
];

export default function EditHabitModal({ isOpen, habit, onClose, onEdit }: EditHabitModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0].value);
    const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
    const [selectedDaysOfMonth, setSelectedDaysOfMonth] = useState<number[]>([1]); // 1st of month default
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Populate form when habit changes
    useEffect(() => {
        if (habit) {
            setName(habit.name);
            setDescription(habit.description || '');
            setColor(habit.color || PRESET_COLORS[0].value);
            setFrequencyType(habit.frequency?.type || 'daily');
            setSelectedDaysOfWeek(habit.frequency?.daysOfWeek || [1, 2, 3, 4, 5]);
            setSelectedDaysOfMonth(habit.frequency?.daysOfMonth || [1]);
        }
    }, [habit]);

    // Handle fade in/out animations
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;
    if (!habit) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            // Build frequency object
            const frequency: { type: 'daily' | 'weekly' | 'monthly'; daysOfWeek?: number[]; daysOfMonth?: number[] } = {
                type: frequencyType,
            };

            if (frequencyType === 'weekly') {
                frequency.daysOfWeek = selectedDaysOfWeek;
            } else if (frequencyType === 'monthly') {
                frequency.daysOfMonth = selectedDaysOfMonth;
            }

            await onEdit(habit.id, {
                name,
                description,
                color,
                frequency,
            });
            onClose();
        } catch (error) {
            console.error('Failed to edit habit:', error);
            alert('Failed to update habit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            Edit Habit
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Update your habit details
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-slate-800 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            What do you want to achieve?
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium placeholder:text-gray-400 dark:text-white"
                            placeholder="e.g., Read 30 minutes"
                            autoFocus
                        />
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Why is this important? <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none placeholder:text-gray-400 dark:text-white"
                            placeholder="Motivate your future self..."
                        />
                    </div>


                    {/* Color Picker */}
                    <div className="space-y-2">
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Choose a theme
                        </label>
                        <div className="relative">
                            <select
                                id="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium appearance-none cursor-pointer dark:text-white"
                                style={{
                                    paddingLeft: '3rem'
                                }}
                            >
                                {PRESET_COLORS.map((preset) => (
                                    <option key={preset.value} value={preset.value}>
                                        {preset.label}
                                    </option>
                                ))}
                            </select>
                            {/* Color indicator */}
                            <div
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white shadow-sm pointer-events-none"
                                style={{ backgroundColor: color }}
                            />
                            {/* Dropdown arrow */}
                            <svg
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Frequency Selector */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Repeat className="w-4 h-4" />
                            How often?
                        </label>

                        {/* Frequency Type Tabs */}
                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setFrequencyType('daily')}
                                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${frequencyType === 'daily'
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                Daily
                            </button>
                            <button
                                type="button"
                                onClick={() => setFrequencyType('weekly')}
                                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${frequencyType === 'weekly'
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                Weekly
                            </button>
                            <button
                                type="button"
                                onClick={() => setFrequencyType('monthly')}
                                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${frequencyType === 'monthly'
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                Monthly
                            </button>
                        </div>

                        {/* Weekly Day Selection */}
                        {frequencyType === 'weekly' && (
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Select days of the week:</p>
                                <div className="grid grid-cols-7 gap-2">
                                    {DAYS_OF_WEEK.map((day) => (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => {
                                                if (selectedDaysOfWeek.includes(day.value)) {
                                                    setSelectedDaysOfWeek(selectedDaysOfWeek.filter(d => d !== day.value));
                                                } else {
                                                    setSelectedDaysOfWeek([...selectedDaysOfWeek, day.value].sort());
                                                }
                                            }}
                                            className={`h-10 rounded-lg text-xs font-medium transition-all ${selectedDaysOfWeek.includes(day.value)
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Monthly Day Selection */}
                        {frequencyType === 'monthly' && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Select days of the month:</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (selectedDaysOfMonth.length === 31) {
                                                setSelectedDaysOfMonth([1]); // Reset to just 1st
                                            } else {
                                                setSelectedDaysOfMonth(Array.from({ length: 31 }, (_, i) => i + 1)); // Select all
                                            }
                                        }}
                                        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                    >
                                        {selectedDaysOfMonth.length === 31 ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-2 max-h-32 overflow-y-auto">
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => {
                                                if (selectedDaysOfMonth.includes(day)) {
                                                    setSelectedDaysOfMonth(selectedDaysOfMonth.filter(d => d !== day));
                                                } else {
                                                    setSelectedDaysOfMonth([...selectedDaysOfMonth, day].sort((a, b) => a - b));
                                                }
                                            }}
                                            className={`h-9 rounded-lg text-xs font-medium transition-all ${selectedDaysOfMonth.includes(day)
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Update Habit</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
