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
    default: "HabitFlow - Build Better Habits, Flow Through Life",
    template: "%s | HabitFlow"
  },
  description: "Track your daily habits, build streaks, and achieve your goals with HabitFlow. Features analytics, streak tracking, and beautiful insights to transform your life.",
  keywords: ["habit tracker", "habitflow", "daily habits", "streak tracking", "goal setting", "productivity", "self improvement", "habit building", "routine tracker"],
  authors: [{ name: "HabitFlow Team" }],
  creator: "HabitFlow",
  publisher: "HabitFlow",
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
    title: "HabitFlow - Build Better Habits, Flow Through Life",
    description: "Track your daily habits, build streaks, and achieve your goals with powerful analytics and insights.",
    url: '/',
    siteName: 'HabitFlow',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HabitFlow - Build Better Habits',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "HabitFlow - Build Better Habits",
    description: "Track your daily habits, build streaks, and achieve your goals with powerful analytics.",
    images: ['/og-image.png'],
    creator: '@habitflow',
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
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
