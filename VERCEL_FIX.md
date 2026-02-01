# Vercel Deployment Error Fix

## Error Message
```
The specified Root Directory "habit-tracker" does not exist. 
Please update your Project Settings.
```

## Problem
Vercel is configured to look for a root directory called "habit-tracker", but your Next.js project is in the repository root directory, not in a subdirectory.

## Solution

You need to update your Vercel project settings. Here are **two ways** to fix this:

### Option 1: Update Vercel Project Settings (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (Habit Tracker)
3. **Click "Settings"** tab
4. **Click "General"** in the left sidebar
5. **Scroll down to "Root Directory"**
6. **Clear the field** or set it to `./` (current directory)
7. **Click "Save"**
8. **Go to "Deployments"** tab
9. **Click "Redeploy"** on the latest deployment

### Option 2: Fix via Vercel CLI

If you have Vercel CLI installed:

```bash
# Navigate to your project
cd c:\Users\kuruv\OneDrive\Desktop\HabitTracker

# Link to your Vercel project (if not already linked)
vercel link

# Deploy
vercel --prod
```

## Vercel Configuration Files

### Current `vercel.json`
```json
{
  "framework": "nextjs"
}
```

This is the minimal configuration. Vercel will auto-detect:
- ✅ Next.js framework
- ✅ Build command (`npm run build`)
- ✅ Output directory (`.next`)
- ✅ Install command (`npm install`)

## Project Structure Verification

Your project structure should be:
```
HabitTracker/                    ← Repository root (this is where Vercel should build)
├── app/                         ← Next.js app directory
├── components/
├── lib/
├── public/
├── package.json                 ← Vercel looks for this
├── next.config.ts
├── vercel.json
└── ... other files
```

**NOT**:
```
Repository/
└── habit-tracker/               ← Vercel is looking here (WRONG!)
    └── ... project files
```

## Step-by-Step Fix

### 1. Update Vercel Settings

**Via Vercel Dashboard:**
1. Go to: https://vercel.com/[your-username]/[project-name]/settings
2. Under "General" → "Root Directory"
3. **Leave it empty** or set to `./`
4. Save changes

### 2. Verify Environment Variables

Make sure these are set in Vercel:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 3. Trigger New Deployment

After updating settings:
1. Go to "Deployments" tab
2. Click the three dots (...) on the latest deployment
3. Click "Redeploy"
4. Wait for the build to complete

## Expected Build Output

After fixing, you should see:
```
✓ Cloning completed
✓ Installing dependencies
✓ Building Next.js application
✓ Compiled successfully
✓ Deployment ready
```

## Common Issues & Solutions

### Issue: "Root Directory not found"
**Solution**: Clear the Root Directory field in Vercel settings

### Issue: "No package.json found"
**Solution**: Ensure Root Directory is set to `./` or empty

### Issue: "Build failed"
**Solution**: Check that all environment variables are set

### Issue: "Module not found"
**Solution**: Delete `node_modules` and `package-lock.json`, then redeploy

## Verification Steps

After deployment succeeds:

1. ✅ Visit your Vercel URL
2. ✅ Check that the login page loads
3. ✅ Try logging in
4. ✅ Test habit creation and logging
5. ✅ Verify Firebase connection works

## Quick Fix Commands

```bash
# Commit the vercel.json fix
git add vercel.json
git commit -m "Fix Vercel configuration"
git push origin main

# Then update Vercel settings via dashboard
# and trigger a redeploy
```

## Need Help?

If the issue persists:
1. Check Vercel build logs for specific errors
2. Verify your GitHub repository structure
3. Ensure the main branch is selected in Vercel
4. Try disconnecting and reconnecting the GitHub integration

## Summary

✅ **Root Cause**: Vercel looking for wrong directory  
✅ **Fix**: Clear Root Directory in Vercel settings  
✅ **Config**: Simplified `vercel.json` to minimal setup  
✅ **Next Step**: Update Vercel settings and redeploy  

Your deployment should work after clearing the Root Directory setting! 🚀
