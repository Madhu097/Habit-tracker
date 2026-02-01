# Habit Tracker - Production-Ready Web Application

A scalable, high-performance habit tracking application built with Next.js, Firebase, and Tailwind CSS. Designed to handle thousands of users with optimized Firestore queries and real-time updates.

## 🚀 Features

- **Email/Password Authentication** - Secure user authentication with Firebase Auth
- **Habit CRUD Operations** - Create, read, update, and delete habits
- **Daily Habit Tracking** - Mark habits as completed or missed each day
- **Automatic Missed Day Detection** - System automatically marks uncompleted habits as missed
- **Streak Tracking** - Track current and longest streaks for each habit
- **Completion Rate Analytics** - View your success rate over time
- **Weekly & Monthly Analytics** - Beautiful charts showing your progress
- **Real-time Updates** - Live updates for today's habits only (optimized)
- **Mobile-First Design** - Responsive UI that works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router) with React 18
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Charts**: Chart.js with react-chartjs-2
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Language**: TypeScript
- **Icons**: Lucide React
- **Date Utilities**: date-fns

## 📁 Project Structure

```
habit-tracker/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Dashboard page
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   ├── layout.tsx           # Root layout with AuthProvider
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── auth/               # Authentication components
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── habits/             # Habit-related components
│   │   ├── HabitCard.tsx
│   │   └── AddHabitModal.tsx
│   └── analytics/          # Analytics components
│       └── AnalyticsCharts.tsx
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication context
├── hooks/                  # Custom React hooks
│   └── useHabits.ts        # Habit management hook
├── lib/                    # Utility libraries
│   └── firebase/          # Firebase configuration
│       ├── config.ts       # Firebase initialization
│       ├── auth.ts         # Authentication functions
│       └── firestore.ts    # Firestore CRUD operations
├── types/                  # TypeScript type definitions
│   └── index.ts           # All data models
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore composite indexes
└── ENV_TEMPLATE.md         # Environment variables template
```

## 🔧 Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Firebase account (free tier)
- npm or yarn package manager

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Email/Password provider
4. Create a **Firestore Database** in production mode
5. Get your Firebase configuration from Project Settings

### 3. Local Setup

1. **Clone or navigate to the project**:
   ```bash
   cd habit-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   Create a `.env.local` file in the root directory with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Deploy Firestore Security Rules**:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   # Select your project
   # Use existing firestore.rules and firestore.indexes.json
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

5. **Run development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Add environment variables** in Vercel dashboard:
   - Go to your project settings
   - Add all `NEXT_PUBLIC_FIREBASE_*` variables

### Deploy to Firebase Hosting

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Initialize Firebase Hosting**:
   ```bash
   firebase init hosting
   # Select your project
   # Set public directory to: out
   # Configure as single-page app: Yes
   ```

3. **Update `next.config.ts`** for static export:
   ```typescript
   const nextConfig = {
     output: 'export',
   };
   ```

4. **Deploy**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## 📊 Data Model

### Collections

#### `habits`
- `id` (string) - Auto-generated document ID
- `userId` (string) - Owner's user ID
- `name` (string) - Habit name
- `description` (string) - Optional description
- `color` (string) - Hex color code
- `isActive` (boolean) - Soft delete flag
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

#### `habitLogs`
- `id` (string) - Auto-generated document ID
- `habitId` (string) - Reference to habit
- `userId` (string) - Owner's user ID
- `date` (string) - Format: YYYY-MM-DD
- `status` (string) - 'completed' | 'missed' | 'pending'
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

#### `habitStats`
- `id` (string) - Same as habitId
- `habitId` (string) - Reference to habit
- `userId` (string) - Owner's user ID
- `currentStreak` (number)
- `longestStreak` (number)
- `totalCompleted` (number)
- `totalMissed` (number)
- `completionRate` (number) - Percentage (0-100)
- `lastCompletedDate` (string) - YYYY-MM-DD
- `lastUpdated` (Timestamp)

## ⚡ Performance Optimizations

### 1. **Optimized Firestore Queries**
- Composite indexes for efficient filtering
- Date-range queries instead of full-table scans
- Fetch only required date ranges

### 2. **Pre-calculated Statistics**
- Stats stored in separate collection
- Avoids heavy real-time calculations
- Updated only when logs change

### 3. **Minimal Real-time Listeners**
- Real-time updates only for today's habits
- Historical data fetched on-demand
- Automatic cleanup of listeners

### 4. **Code Splitting**
- Analytics components lazy-loaded
- Chart.js loaded only when needed
- Reduced initial bundle size

### 5. **Server-Side Rendering**
- Static generation for landing page
- Fast initial page loads
- SEO-friendly

### 6. **Efficient State Management**
- React Context for global auth state
- Custom hooks for habit management
- Minimal re-renders

## 🔒 Security

- **Firestore Security Rules**: User-based access control
- **Field Validation**: Ensures data integrity
- **Authentication Required**: All operations require auth
- **No Cross-User Access**: Users can only access their own data

## 🎨 UI/UX Features

- **Mobile-First Design**: Optimized for mobile devices
- **Visual Status Indicators**: Clear distinction between completed/missed/pending
- **Streak Visualization**: Flame icon with current streak
- **Completion Rate**: Percentage display for each habit
- **Color-Coded Habits**: Custom colors for visual organization
- **Responsive Charts**: Beautiful analytics with Chart.js
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

## 📈 Scalability

This application is designed to handle **thousands of concurrent users**:

- **Indexed Queries**: All queries use composite indexes
- **Denormalized Data**: Stats pre-calculated to avoid heavy computations
- **Efficient Listeners**: Real-time updates only where necessary
- **Firebase Free Tier**: Optimized to stay within free tier limits
- **Serverless Architecture**: Scales automatically with Next.js and Firebase

## 🧪 Testing

To test the application:

1. **Create an account** at `/signup`
2. **Add habits** from the dashboard
3. **Mark habits** as completed or missed
4. **View analytics** to see charts and trends
5. **Check streaks** to see current and longest streaks

## 📝 Future Enhancements

- Habit categories and tags
- Reminders and notifications
- Social features (share progress)
- Habit templates
- Dark mode
- Export data to CSV
- Habit history calendar view

## 🤝 Contributing

This is a production-ready application. Feel free to fork and customize for your needs.

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for the backend infrastructure
- Tailwind CSS for the styling system
- Chart.js for beautiful charts
- Lucide for the icon library

---

**Built with ❤️ using Next.js, Firebase, and Tailwind CSS**
