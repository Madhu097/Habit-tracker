import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Habit Tracker - Build Better Habits, One Day at a Time",
    template: "%s | Habit Tracker"
  },
  description: "Track your daily habits, build streaks, and achieve your goals with our powerful habit tracking application. Features analytics, streak tracking, and beautiful insights to transform your life.",
  keywords: ["habit tracker", "daily habits", "streak tracking", "goal setting", "productivity", "self improvement", "habit building", "routine tracker"],
  authors: [{ name: "Habit Tracker Team" }],
  creator: "Habit Tracker",
  publisher: "Habit Tracker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://habit-tracker.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Habit Tracker - Build Better Habits, One Day at a Time",
    description: "Track your daily habits, build streaks, and achieve your goals with powerful analytics and insights.",
    url: '/',
    siteName: 'Habit Tracker',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Habit Tracker - Build Better Habits',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Habit Tracker - Build Better Habits",
    description: "Track your daily habits, build streaks, and achieve your goals with powerful analytics.",
    images: ['/og-image.png'],
    creator: '@habittracker',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    // Add your verification codes here when ready
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

// Separate viewport export (Next.js 15+ recommendation)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
