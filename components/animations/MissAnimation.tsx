'use client';

import React, { useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';

interface MissAnimationProps {
    show: boolean;
    onComplete: () => void;
    habitName: string;
}

export default function MissAnimation({ show, onComplete, habitName }: MissAnimationProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            // Auto-hide after 0.5 seconds (faster)
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onComplete, 100); // Wait for fade out animation
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    if (!show && !isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-100 ${isVisible ? 'opacity-100' : 'opacity-0'
                }`}
        >
            {/* Simple overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Main Animation Card - Compact */}
            <div
                className={`relative bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-4 pointer-events-auto transform transition-all duration-200 ${isVisible ? 'scale-100' : 'scale-75'
                    }`}
            >
                {/* X Icon with Shake */}
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-400 rounded-full blur-lg opacity-30 animate-pulse" />
                        <div className="relative bg-gradient-to-br from-red-400 to-red-600 rounded-full p-4 shadow-lg animate-shake-fast">
                            <XCircle className="w-12 h-12 text-white" strokeWidth={3} />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">
                        Missed
                    </h3>
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold text-red-600">{habitName}</span> marked as missed
                    </p>
                    <p className="text-xs text-gray-500">
                        Don't worry, tomorrow is a new day! 💪
                    </p>
                </div>

                {/* Quick close button */}
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onComplete, 100);
                    }}
                    className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg transition-all duration-200"
                >
                    OK
                </button>
            </div>
        </div>
    );
}
