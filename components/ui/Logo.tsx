import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
    darkMode?: boolean;
    iconSize?: number;
    textSize?: string;
}

export default function Logo({
    className = "",
    showText = true,
    darkMode = false,
    iconSize = 32,
    textSize = "text-xl"
}: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Logo Icon */}
            <div
                className="relative flex items-center justify-center shrink-0"
                style={{ width: iconSize, height: iconSize }}
            >
                {/* Background Gradient Circle */}
                <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-sm"
                >
                    <defs>
                        <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#8B5CF6" /> {/* Violet-500 */}
                            <stop offset="100%" stopColor="#3B82F6" /> {/* Blue-500 */}
                        </linearGradient>
                    </defs>

                    {/* Main Circle */}
                    <circle cx="20" cy="20" r="20" fill="url(#logoGradient)" />

                    {/* Progress Ring (Subtle) */}
                    <path
                        d="M36 20a16 16 0 1 1-32 0"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />

                    {/* Checkmark Arrow Symbol */}
                    <path
                        d="M11 20.5l6 6 12-12m-2-2l2 2m0-2v6m0-6h-6"
                        stroke="white"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Simplified Checkmark-Arrow for better visibility */}
                    {/* Checkmark part */}
                    <path
                        d="M12 21 L17 26 L23 20"
                        stroke="white"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        className="hidden" // Hiding this alternate path, keeping the one above
                    />
                    {/* Arrow part */}
                    <path
                        d="M23 20 L28 15 M28 15 H22 M28 15 V 21"
                        stroke="white"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        className="hidden"
                    />
                </svg>
            </div>

            {/* Text Logo */}
            {showText && (
                <div className={`font-black tracking-tight leading-none ${textSize} ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    <span>Habit</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-blue-500">Flow</span>
                </div>
            )}
        </div>
    );
}
