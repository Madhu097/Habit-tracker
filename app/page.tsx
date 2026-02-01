'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking auth or if user is authenticated (redirecting)
  if (loading || user) {
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
    <div className="min-h-screen bg-white overflow-hidden">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Habit Tracker",
            "description": "Track your daily habits, build streaks, and achieve your goals with our powerful habit tracking application.",
            "url": "https://habit-tracker.vercel.app",
            "applicationCategory": "ProductivityApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Daily habit tracking",
              "Streak monitoring",
              "Analytics and insights",
              "Progress visualization"
            ]
          })
        }}
      />

      {/* Premium Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl sm:text-7xl font-black text-slate-900 mb-8 tracking-tight"
          >
            Build Better Habits,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              One Day at a Time
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Track your daily routines, master your streaks, and transform your life with our simple yet powerful tracking tool.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-slate-900 border-2 border-slate-900 hover:bg-white hover:text-slate-900 text-white text-lg font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-slate-200 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Split */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          {[
            {
              icon: CheckCircle,
              color: "blue",
              title: "Daily Tracking",
              desc: "Precision tracking for your daily wins. Get real-time feedback on your progress."
            },
            {
              icon: Zap,
              color: "indigo",
              title: "Streak Power",
              desc: "Don't break the chain. Visualize your momentum and stay inspired every single day."
            },
            {
              icon: TrendingUp,
              color: "slate",
              title: "Smart Insights",
              desc: "Beautiful charts and data-driven insights to help you understand your growth."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + (index * 0.2), duration: 0.6 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group p-8 rounded-3xl bg-white/50 backdrop-blur-sm hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300"
            >
              <div className={`w-14 h-14 bg-${feature.color === 'slate' ? 'slate-900' : feature.color + '-600'} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${feature.color === 'slate' ? 'slate-200' : feature.color + '-200'} group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
