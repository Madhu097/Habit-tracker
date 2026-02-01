'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HamburgerMenuProps {
    isOpen: boolean;
    onClick: () => void;
    darkMode?: boolean;
}

/**
 * Professional 3D Hamburger Menu Button
 * Features smooth animations and 3D effects
 */
const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClick, darkMode = false }) => {
    return (
        <motion.button
            onClick={onClick}
            className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${darkMode
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 shadow-lg shadow-slate-900/50'
                    : 'bg-gradient-to-br from-white to-slate-100 hover:from-slate-50 hover:to-slate-200 shadow-lg shadow-slate-300/50'
                } border ${darkMode ? 'border-slate-600' : 'border-slate-200'}`}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Menu"
        >
            {/* 3D Effect Background */}
            <div className={`absolute inset-0 rounded-xl ${darkMode ? 'bg-gradient-to-t from-slate-900/20 to-transparent' : 'bg-gradient-to-t from-slate-200/30 to-transparent'
                }`} />

            {/* Hamburger Lines */}
            <div className="relative w-6 h-5 flex flex-col justify-between">
                {/* Top Line */}
                <motion.span
                    className={`block h-0.5 rounded-full ${darkMode ? 'bg-slate-100' : 'bg-slate-800'
                        } shadow-sm`}
                    animate={{
                        rotate: isOpen ? 45 : 0,
                        y: isOpen ? 10 : 0,
                        scaleX: isOpen ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                />

                {/* Middle Line */}
                <motion.span
                    className={`block h-0.5 rounded-full ${darkMode ? 'bg-slate-100' : 'bg-slate-800'
                        } shadow-sm`}
                    animate={{
                        opacity: isOpen ? 0 : 1,
                        scaleX: isOpen ? 0 : 1,
                    }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                />

                {/* Bottom Line */}
                <motion.span
                    className={`block h-0.5 rounded-full ${darkMode ? 'bg-slate-100' : 'bg-slate-800'
                        } shadow-sm`}
                    animate={{
                        rotate: isOpen ? -45 : 0,
                        y: isOpen ? -10 : 0,
                        scaleX: isOpen ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
            </div>

            {/* Glow Effect on Hover */}
            <motion.div
                className={`absolute inset-0 rounded-xl ${darkMode ? 'bg-blue-500/0' : 'bg-blue-400/0'
                    } transition-all duration-300`}
                whileHover={{
                    backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(96, 165, 250, 0.1)',
                }}
            />
        </motion.button>
    );
};

export default HamburgerMenu;
