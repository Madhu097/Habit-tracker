# Quick Start Guide

Get your Habit Tracker up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Firebase account (free)

## Step 1: Install Dependencies

```bash
cd habit-tracker
npm install
```

## Step 2: Set Up Firebase

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it "habit-tracker"
4. Click "Create project"

### Enable Authentication

1. Go to **Authentication** → **Get started**
2. Enable **Email/Password**
3. Click **Save**

### Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Select **Production mode**
3. Choose a location (closest to you)
4. Click **Enable**

### Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register app as "Habit Tracker Web"
5. Copy the config values

## Step 3: Configure Environment Variables

Create `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your Firebase config from Step 2.

## Step 4: Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize Firestore
firebase init firestore

# Select your project
# Use existing firestore.rules and firestore.indexes.json files

# Deploy
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Step 5: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Test the App

1. Click **Sign Up**
2. Create an account with email/password
3. You'll be redirected to the dashboard
4. Click **Add New Habit**
5. Create your first habit
6. Mark it as completed or missed
7. Click **Analytics** to view charts

## That's it! 🎉

You now have a fully functional habit tracker!

## Next Steps

- **Deploy to Production**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Understand Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Customize**: Modify components in `components/` folder

## Troubleshooting

### "Firebase auth not initialized"

- Make sure `.env.local` file exists
- Verify all environment variables are set correctly
- Restart the development server

### "Missing or insufficient permissions"

- Deploy Firestore security rules: `firebase deploy --only firestore:rules`
- Make sure you're logged in

### "Index required for query"

- Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
- Or click the link in the error to auto-create the index

## Need Help?

Check out the detailed guides:
- [README.md](./README.md) - Full documentation
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Detailed Firebase setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details

---

**Happy habit tracking! 🚀**
