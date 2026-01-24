'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, CalendarDays, BarChart3, X, Trash2, LogOut, Loader2 } from 'lucide-react';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    darkMode: boolean;
    currentView: 'dashboard' | 'monthly' | 'analytics';
    onViewChange: (view: 'dashboard' | 'monthly' | 'analytics') => void;
    onReset: () => void;
    onLogout: () => void;
    resetting?: boolean;
}

/**
 * Professional Mobile Menu with 3D Effects
 */
const MobileMenu: React.FC<MobileMenuProps> = ({
    isOpen,
    onClose,
    darkMode,
    currentView,
    onViewChange,
    onReset,
    onLogout,
    resetting = false,
}) => {
    const menuItems = [
        {
            id: 'dashboard' as const,
            label: 'Dashboard',
            icon: Home,
            description: 'Track daily habits',
        },
        {
            id: 'monthly' as const,
            label: 'Monthly View',
            icon: CalendarDays,
            description: 'Calendar overview',
        },
        {
            id: 'analytics' as const,
            label: 'Analytics',
            icon: BarChart3,
            description: 'Progress insights',
        },
    ];

    const handleItemClick = (view: 'dashboard' | 'monthly' | 'analytics') => {
        onViewChange(view);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`fixed left-0 top-0 bottom-0 w-80 z-50 md:hidden ${darkMode
                            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
                            : 'bg-gradient-to-br from-white via-slate-50 to-white'
                            } shadow-2xl`}
                    >
                        {/* Header */}
                        <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className={`text-2xl font-black ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                        Menu
                                    </h2>
                                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        Navigate your habits
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-lg transition-colors ${darkMode
                                        ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-100'
                                        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-4 space-y-2">
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                const isActive = currentView === item.id;

                                return (
                                    <motion.button
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => handleItemClick(item.id)}
                                        className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-300 ${isActive
                                            ? darkMode
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-300/50'
                                            : darkMode
                                                ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {/* Icon with 3D Effect */}
                                        <div
                                            className={`p-3 rounded-lg ${isActive
                                                ? 'bg-white/20'
                                                : darkMode
                                                    ? 'bg-slate-700'
                                                    : 'bg-white'
                                                } shadow-md`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 text-left">
                                            <div className="font-bold text-base">{item.label}</div>
                                            <div
                                                className={`text-xs ${isActive
                                                    ? 'text-white/80'
                                                    : darkMode
                                                        ? 'text-slate-500'
                                                        : 'text-slate-600'
                                                    }`}
                                            >
                                                {item.description}
                                            </div>
                                        </div>

                                        {/* Active Indicator */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="w-1 h-8 bg-white rounded-full"
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className={`absolute bottom-16 left-0 right-0 p-4 space-y-2 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            {/* Reset Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                onClick={() => {
                                    onReset();
                                    onClose();
                                }}
                                disabled={resetting}
                                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${darkMode
                                        ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-700/50'
                                        : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                    } disabled:opacity-50`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className={`p-2 rounded-lg ${darkMode ? 'bg-red-700/30' : 'bg-red-100'}`}>
                                    {resetting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold">Reset Data</div>
                                    <div className="text-xs opacity-80">Clear all habits</div>
                                </div>
                            </motion.button>

                            {/* Logout Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                onClick={() => {
                                    onLogout();
                                    onClose();
                                }}
                                className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${darkMode
                                        ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-white'} shadow-md`}>
                                    <LogOut className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold">Logout</div>
                                    <div className="text-xs opacity-80">Sign out</div>
                                </div>
                            </motion.button>
                        </div>

                        {/* Footer */}
                        <div className={`absolute bottom-0 left-0 right-0 p-6 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            <p className={`text-xs text-center ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                                Habit Tracker v1.0
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileMenu;
