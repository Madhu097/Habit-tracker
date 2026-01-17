'use client';

import React, { useState, useEffect } from 'react';
import { signUp, signIn } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Smartphone, Mail, Lock, User, ArrowRight, Home, Moon, Sun, CheckCircle, Zap, BarChart3, ChevronRight } from 'lucide-react';

interface AuthFlowProps {
    initialMode?: 'login' | 'signup';
}

export default function AuthFlow({ initialMode = 'login' }: AuthFlowProps) {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [identifier, setIdentifier] = useState(''); // Email or Mobile
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') setDarkMode(true);
    }, []);

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);

    // Helper to format identifier for Firebase Auth
    const getFormattedIdentifier = (id: string) => {
        const cleanId = id.trim();
        if (/^\+?[0-9]{7,15}$/.test(cleanId)) {
            return `${cleanId.replace('+', 'p')}@phone.app`;
        }
        return cleanId;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const emailFormatted = getFormattedIdentifier(identifier);

        try {
            if (isLogin) {
                await signIn(emailFormatted, password);
            } else {
                if (password.length < 6) throw new Error('Password should be at least 6 characters');
                await signUp(emailFormatted, password, displayName);
            }
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Auth error:', err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email/mobile or password.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('This email or mobile number is already registered.');
            } else {
                setError(err.message || 'Authentication failed');
            }
            setLoading(false);
        }
    };

    return (
        <div className={`h-screen w-full flex overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
            {/* Left Side: Professional 3D Animation */}
            <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${darkMode
                ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950'
                : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800'}`}>

                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>

                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
                        {/* Static Floating Cards with Flip */}

                        {/* Card 1 - Top Left */}
                        <div className="absolute top-12 left-2 w-64 h-44 glass-card flex flex-col justify-between p-6 animate-float-1 z-10" style={{ animationDelay: '0s' }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 rounded-3xl"></div>
                            <div className="relative z-10 w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shadow-inner border border-white/10">
                                <CheckCircle className="text-blue-400 w-6 h-6" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-white font-black text-lg mb-1">Daily Mastery</h4>
                                <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">Tracking Active</p>
                            </div>
                        </div>

                        {/* Card 2 - Center Right (Prominent) */}
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 w-72 h-48 glass-card flex flex-col justify-between p-7 animate-flip-interval z-20" style={{ animationDelay: '0s' }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 rounded-3xl"></div>
                            <div className="relative z-10 w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center shadow-inner border border-white/10">
                                <Zap className="text-orange-400 w-7 h-7" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-white font-black text-2xl mb-1">Streak Power</h4>
                                <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Momentum Unstoppable</p>
                            </div>
                        </div>

                        {/* Card 3 - Bottom Left */}
                        <div className="absolute bottom-12 left-8 w-64 h-44 glass-card flex flex-col justify-between p-6 animate-float-2 z-10" style={{ animationDelay: '2s' }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 rounded-3xl"></div>
                            <div className="relative z-10 w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center shadow-inner border border-white/10">
                                <BarChart3 className="text-indigo-400 w-6 h-6" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-white font-black text-lg mb-1">Visual Growth</h4>
                                <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">Evolution Data</p>
                            </div>
                        </div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/20 blur-[120px] rounded-full"></div>
                    </div>
                </div>

                <div className="absolute bottom-10 left-10 z-30">
                    <h2 className="text-white text-3xl font-black max-w-xs leading-tight tracking-tight drop-shadow-lg">Your growth, visualized.</h2>
                </div>
            </div>

            {/* Right Side: Authentication Form */}
            <div className={`w-full lg:w-1/2 flex flex-col z-30 ${darkMode ? 'bg-slate-900 border-l border-slate-800 shadow-2xl shadow-black/50' : 'bg-white shadow-2xl shadow-slate-200'}`}>
                {/* Compact Toolbar */}
                <div className="px-6 py-4 flex items-center justify-between shrink-0">
                    <Link href="/" className="flex items-center gap-2 group px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <Home className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                        <span className={`font-bold text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Back</span>
                    </Link>

                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${darkMode ? 'border-slate-800 bg-slate-800 text-yellow-400 hover:scale-105' : 'border-slate-100 bg-slate-50 text-slate-600 hover:scale-105'}`}
                    >
                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>

                {/* Compact Form Wrapper - Explicitly No Scroll */}
                <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 overflow-hidden">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-8">
                            <h1 className={`text-4xl font-black mb-3 tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                {isLogin ? 'Sign In' : 'Sign Up'}
                            </h1>
                            <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {isLogin ? 'Access your dashboard' : 'Start your journey'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3 animate-shake">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"></div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className={`block text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Name</label>
                                    <div className="relative group">
                                        <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${darkMode ? 'text-slate-600 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            required={!isLogin}
                                            className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 outline-none transition-all text-base font-bold ${darkMode ? 'bg-slate-800/50 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-600 focus:bg-white'}`}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className={`block text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Email / Mobile</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-1 text-slate-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 outline-none transition-all text-base font-bold ${darkMode ? 'bg-slate-800/50 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-600 focus:bg-white'}`}
                                        placeholder="user@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className={`block text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Password</label>
                                </div>
                                <div className="relative group">
                                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${darkMode ? 'text-slate-600 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 outline-none transition-all text-base font-bold ${darkMode ? 'bg-slate-800/50 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-600 focus:bg-white'}`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-all ${showPassword ? 'text-blue-500' : 'text-slate-400'}`}
                                    >
                                        <ChevronRight className={`w-5 h-5 transition-transform ${showPassword ? 'rotate-90' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-black text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 text-base ${darkMode ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10'}`}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className={`text-sm font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {isLogin ? "No account?" : "Have account?"}
                                <button
                                    onClick={() => { setIsLogin(!isLogin); setError(''); setIdentifier(''); setPassword(''); setDisplayName(''); }}
                                    className="ml-2 font-black text-blue-600 hover:underline"
                                >
                                    {isLogin ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float-1 {
                    0%, 100% { transform: translateY(0px) rotate(-3deg); }
                    50% { transform: translateY(-15px) rotate(1deg); }
                }
                @keyframes float-2 {
                    0%, 100% { transform: translateY(0px) rotate(3deg); }
                    50% { transform: translateY(-10px) rotate(-1deg); }
                }
                @keyframes flip-interval {
                    0%, 90% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }
                .animate-float-1 { animation: float-1 6s ease-in-out infinite; }
                .animate-float-2 { animation: float-2 7s ease-in-out infinite; }
                .animate-flip-interval { animation: flip-interval 10s ease-in-out infinite; }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.3);
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}
