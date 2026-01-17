# Fixing 404 Not Found on Vercel

## Problem
Your Habit Tracker app deployed to Vercel shows "404 Not Found" error.

## Root Cause
The Next.js app is located in the `habit-tracker` subdirectory, but Vercel was trying to build from the root directory.

## Solution Applied

### 1. Fixed `vercel.json` Configuration
Created/updated `vercel.json` in the root directory with:

```json
{
  "buildCommand": "cd habit-tracker && npm run build",
  "devCommand": "cd habit-tracker && npm run dev",
  "installCommand": "cd habit-tracker && npm install",
  "framework": "nextjs",
  "outputDirectory": "habit-tracker/.next"
}
```

This tells Vercel:
- Where to find your Next.js app (`habit-tracker` directory)
- How to install dependencies
- How to build the app
- Where to find the build output

### 2. Simplified `next.config.ts`
Removed `output: 'standalone'` which can cause issues with Vercel deployment.

## How to Redeploy

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from the root directory**:
   ```bash
   cd c:\Users\kuruv\OneDrive\Desktop\HabitTracker
   vercel --prod
   ```

### Option 2: Using Git Push (if connected to GitHub)

1. **Commit the changes**:
   ```bash
   git add vercel.json habit-tracker/next.config.ts
   git commit -m "Fix: Configure Vercel for subdirectory deployment"
   git push
   ```

2. Vercel will automatically detect the changes and redeploy.

### Option 3: Using Vercel Dashboard

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **General**
4. Under **Build & Development Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `cd habit-tracker && npm run build`
   - **Install Command**: `cd habit-tracker && npm install`
   - **Output Directory**: `habit-tracker/.next`
5. Click **Save**
6. Go to **Deployments** tab
7. Click **Redeploy** on the latest deployment

## Verify Environment Variables

Make sure all Firebase environment variables are set in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Ensure these are set:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

## Testing After Deployment

1. Wait for deployment to complete
2. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
3. You should see the login page
4. Test the following:
   - ✅ Login page loads
   - ✅ Can create an account
   - ✅ Can log in
   - ✅ Dashboard loads
   - ✅ Can create habits
   - ✅ Can log habits
   - ✅ Analytics page works

## Common Issues

### Still Getting 404?

1. **Check build logs** in Vercel dashboard:
   - Go to **Deployments**
   - Click on the latest deployment
   - Check the **Build Logs** for errors

2. **Verify vercel.json** is in the correct location:
   - Should be at: `c:\Users\kuruv\OneDrive\Desktop\HabitTracker\vercel.json`
   - NOT at: `c:\Users\kuruv\OneDrive\Desktop\HabitTracker\habit-tracker\vercel.json`

3. **Clear Vercel cache**:
   ```bash
   vercel --prod --force
   ```

### Build Fails?

1. **Check Node.js version**:
   - Vercel uses Node.js 18+ by default
   - Ensure your app is compatible

2. **Test build locally**:
   ```bash
   cd habit-tracker
   npm install
   npm run build
   ```

3. **Check for TypeScript errors**:
   - Fix any TypeScript errors before deploying

### Firebase Connection Issues?

1. **Verify environment variables** are set in Vercel
2. **Check Firebase Console**:
   - Ensure your Vercel domain is added to **Authorized domains**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your Vercel domain (e.g., `your-project.vercel.app`)

## Success Indicators

✅ Deployment status shows "Ready"
✅ No 404 errors
✅ Login page loads correctly
✅ Firebase authentication works
✅ Dashboard displays properly
✅ All features functional

## Next Steps

After successful deployment:
1. Test all features thoroughly
2. Set up a custom domain (optional)
3. Monitor performance in Vercel Analytics
4. Set up continuous deployment with GitHub

---

**Need Help?**
- Check Vercel deployment logs
- Review Firebase Console for errors
- Test locally first: `cd habit-tracker && npm run dev`
