'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, Trophy, Star } from 'lucide-react';

interface CongratsAnimationProps {
    show: boolean;
    onComplete: () => void;
    habitName: string;
}

export default function CongratsAnimation({ show, onComplete, habitName }: CongratsAnimationProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onComplete, 300); // Wait for fade out animation
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    if (!show && !isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
                }`}
        >
            {/* Confetti Background */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-confetti"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: '-10%',
                            animationDelay: `${Math.random() * 0.5}s`,
                            animationDuration: `${2 + Math.random() * 2}s`,
                        }}
                    >
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][
                                    Math.floor(Math.random() * 5)
                                ],
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Main Animation Card */}
            <div
                className={`relative bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 pointer-events-auto transform transition-all duration-500 ${isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-12'
                    }`}
            >
                {/* Sparkle Icons */}
                <div className="absolute -top-4 -left-4 text-yellow-400 animate-bounce">
                    <Sparkles className="w-8 h-8" fill="currentColor" />
                </div>
                <div className="absolute -top-4 -right-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }}>
                    <Star className="w-8 h-8" fill="currentColor" />
                </div>
                <div className="absolute -bottom-4 -left-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.4s' }}>
                    <Star className="w-6 h-6" fill="currentColor" />
                </div>
                <div className="absolute -bottom-4 -right-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.1s' }}>
                    <Sparkles className="w-6 h-6" fill="currentColor" />
                </div>

                {/* Trophy Icon with Pulse */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-pulse" />
                        <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-6 shadow-lg">
                            <Trophy className="w-16 h-16 text-white" fill="white" />
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-bold text-gray-900 animate-bounce">
                        🎉 Congratulations! 🎉
                    </h2>
                    <p className="text-lg text-gray-700">
                        You completed <span className="font-bold text-green-600">{habitName}</span>!
                    </p>
                    <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        <span>Keep up the great work!</span>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-6 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 animate-progress-bar"
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Close Button */}
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onComplete, 300);
                    }}
                    className="mt-6 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                    Awesome!
                </button>
            </div>
        </div>
    );
}
