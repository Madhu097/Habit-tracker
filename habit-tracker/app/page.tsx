'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white transition-opacity duration-500">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          <span className="text-slate-600 font-medium">Loading Routine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <h1 className="text-6xl sm:text-7xl font-black text-slate-900 mb-8 tracking-tight">
            Build Better Habits,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              One Day at a Time
            </span>
          </h1>
          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Track your daily routines, master your streaks, and transform your life with our simple yet powerful tracking tool.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-slate-900 border-2 border-slate-900 hover:bg-white hover:text-slate-900 text-white text-lg font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-slate-200 group"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Features Split */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="group p-8 rounded-3xl hover:bg-slate-50 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:-translate-y-1 transition-transform">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Daily Tracking</h3>
            <p className="text-slate-500 leading-relaxed">
              Precision tracking for your daily wins. Get real-time feedback on your progress.
            </p>
          </div>

          <div className="group p-8 rounded-3xl hover:bg-slate-50 transition-all duration-300">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:-translate-y-1 transition-transform">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Streak Power</h3>
            <p className="text-slate-500 leading-relaxed">
              Don't break the chain. Visualize your momentum and stay inspired every single day.
            </p>
          </div>

          <div className="group p-8 rounded-3xl hover:bg-slate-50 transition-all duration-300">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-200 group-hover:-translate-y-1 transition-transform">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Smart Insights</h3>
            <p className="text-slate-500 leading-relaxed">
              Beautiful charts and data-driven insights to help you understand your growth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
