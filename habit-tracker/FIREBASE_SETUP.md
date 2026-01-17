# Firebase Setup Guide

Complete guide to setting up Firebase for the Habit Tracker application.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter project name: `habit-tracker` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click **Create project**

## Step 2: Register Web App

1. In your Firebase project, click the **Web** icon (`</>`)
2. Register app nickname: `Habit Tracker Web`
3. **Do NOT** check "Set up Firebase Hosting" (we'll do this later)
4. Click **Register app**
5. **Copy the Firebase configuration** - you'll need this later

Example configuration:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "habit-tracker-xxxxx.firebaseapp.com",
  projectId: "habit-tracker-xxxxx",
  storageBucket: "habit-tracker-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 3: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **Get started**
3. Click on **Email/Password** provider
4. Toggle **Enable**
5. Click **Save**

### Configure Authorized Domains

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your deployment domains:
   - `localhost` (already added)
   - Your Vercel domain: `your-app.vercel.app`
   - Your custom domain (if any): `yourdomain.com`

## Step 4: Create Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Production mode** (we'll add security rules later)
4. Choose a location (select closest to your users):
   - `us-central1` (Iowa) - Good for North America
   - `europe-west1` (Belgium) - Good for Europe
   - `asia-southeast1` (Singapore) - Good for Asia
5. Click **Enable**

## Step 5: Deploy Security Rules

### Option A: Using Firebase CLI (Recommended)

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firestore**:
   ```bash
   cd habit-tracker
   firebase init firestore
   ```
   
   Configuration:
   - Select your Firebase project
   - Firestore rules file: `firestore.rules` (already exists)
   - Firestore indexes file: `firestore.indexes.json` (already exists)

4. **Deploy rules and indexes**:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

### Option B: Manual Setup (Console)

1. **Deploy Security Rules**:
   - Go to **Firestore Database** → **Rules**
   - Copy contents from `firestore.rules` file
   - Paste into the editor
   - Click **Publish**

2. **Create Indexes**:
   - Go to **Firestore Database** → **Indexes**
   - Click **Add Index** for each index in `firestore.indexes.json`

   **Index 1**: habits
   - Collection ID: `habits`
   - Fields:
     - `userId` (Ascending)
     - `isActive` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection

   **Index 2**: habitLogs (by habitId)
   - Collection ID: `habitLogs`
   - Fields:
     - `habitId` (Ascending)
     - `date` (Descending)
   - Query scope: Collection

   **Index 3**: habitLogs (by userId, ascending)
   - Collection ID: `habitLogs`
   - Fields:
     - `userId` (Ascending)
     - `date` (Ascending)
   - Query scope: Collection

   **Index 4**: habitLogs (by userId, descending)
   - Collection ID: `habitLogs`
   - Fields:
     - `userId` (Ascending)
     - `date` (Descending)
   - Query scope: Collection

## Step 6: Configure Environment Variables

1. Create `.env.local` file in your project root:
   ```bash
   cd habit-tracker
   touch .env.local
   ```

2. Add your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Important**: Add `.env.local` to `.gitignore` (already done)

## Step 7: Test the Setup

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Test Authentication**:
   - Navigate to `http://localhost:3000/signup`
   - Create a test account
   - Verify you're redirected to dashboard

3. **Test Firestore**:
   - Add a new habit
   - Mark it as completed
   - Check Firestore Console to see the data

4. **Verify Security Rules**:
   - Try accessing another user's data (should fail)
   - Check Firestore Console → Rules → Simulator

## Step 8: Set Up Firebase Hosting (Optional)

If deploying to Firebase Hosting:

1. **Initialize Hosting**:
   ```bash
   firebase init hosting
   ```
   
   Configuration:
   - Public directory: `out`
   - Single-page app: `Yes`
   - GitHub integration: `No` (for now)

2. **Update `next.config.ts`**:
   ```typescript
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   };
   ```

3. **Build and deploy**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Firestore Data Structure

After setup, your Firestore will have these collections:

```
firestore/
├── habits/
│   └── {habitId}/
│       ├── userId: string
│       ├── name: string
│       ├── description: string
│       ├── color: string
│       ├── isActive: boolean
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── habitLogs/
│   └── {logId}/
│       ├── habitId: string
│       ├── userId: string
│       ├── date: string (YYYY-MM-DD)
│       ├── status: string (completed|missed|pending)
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
└── habitStats/
    └── {statsId}/
        ├── habitId: string
        ├── userId: string
        ├── currentStreak: number
        ├── longestStreak: number
        ├── totalCompleted: number
        ├── totalMissed: number
        ├── completionRate: number
        ├── lastCompletedDate: string
        └── lastUpdated: timestamp
```

## Security Rules Explanation

The deployed security rules ensure:

1. **Authentication Required**: All operations require a logged-in user
2. **User Isolation**: Users can only access their own data
3. **Field Validation**: Ensures data integrity
4. **No Cross-User Access**: Prevents data leaks

Example rule:
```javascript
match /habits/{habitId} {
  allow read: if request.auth != null 
              && request.auth.uid == resource.data.userId;
  
  allow create: if request.auth != null 
                && request.resource.data.userId == request.auth.uid;
}
```

## Monitoring and Debugging

### View Firestore Data

1. Go to **Firestore Database** → **Data**
2. Browse collections and documents
3. Manually add/edit/delete data for testing

### Monitor Authentication

1. Go to **Authentication** → **Users**
2. View all registered users
3. Manually delete test accounts

### Check Usage

1. Go to **Usage and billing**
2. Monitor:
   - Firestore reads/writes
   - Authentication sign-ins
   - Storage usage

### Debug Security Rules

1. Go to **Firestore Database** → **Rules**
2. Click **Rules Playground**
3. Test different scenarios:
   - Authenticated user reading own data ✅
   - Authenticated user reading other's data ❌
   - Unauthenticated user reading data ❌

## Troubleshooting

### Issue: "Missing or insufficient permissions"

**Solution**: 
- Check security rules are deployed
- Verify user is authenticated
- Ensure `userId` matches `auth.uid`

### Issue: "Index required for query"

**Solution**:
- Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
- Or click the link in the error message to auto-create index

### Issue: "Firebase not initialized"

**Solution**:
- Check `.env.local` file exists
- Verify all environment variables are set
- Restart development server

### Issue: "Authentication domain not authorized"

**Solution**:
- Go to **Authentication** → **Settings** → **Authorized domains**
- Add your deployment domain

## Free Tier Limits

Firebase Free Tier (Spark Plan):

| Service | Limit | Our Usage (1000 users) |
|---------|-------|------------------------|
| Firestore Reads | 50K/day | ~30K/day ✅ |
| Firestore Writes | 20K/day | ~10K/day ✅ |
| Authentication | Unlimited | ✅ |
| Hosting | 10GB storage | ~100MB ✅ |
| Hosting Bandwidth | 360MB/day | ~200MB/day ✅ |

**Result**: Can support 1000+ users on free tier with our optimizations!

## Upgrade to Blaze Plan (Pay-as-you-go)

If you exceed free tier:

1. Go to **Usage and billing** → **Details & settings**
2. Click **Modify plan**
3. Select **Blaze** plan
4. Set budget alerts to avoid surprises

**Cost Estimate** (10,000 users):
- Firestore: ~$30/month
- Hosting: ~$5/month
- **Total**: ~$35/month

## Next Steps

1. ✅ Firebase project created
2. ✅ Authentication enabled
3. ✅ Firestore database created
4. ✅ Security rules deployed
5. ✅ Indexes created
6. ✅ Environment variables configured
7. ✅ Application tested locally

**You're ready to deploy!** 🚀

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

---

**Need Help?**
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Support](https://firebase.google.com/support)
