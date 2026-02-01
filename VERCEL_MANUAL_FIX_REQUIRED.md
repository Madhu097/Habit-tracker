# URGENT: Vercel Deployment Fix - Manual Steps Required

## Current Error
```
The specified Root Directory "habit-tracker" does not exist.
```

## Why This Keeps Happening
The error is **NOT in your code**. It's in your **Vercel project settings**. The Vercel dashboard has a setting that overrides everything else.

## ⚠️ CRITICAL: You MUST Do This Manually

The `vercel.json` file **CANNOT** override project settings. You **MUST** update the settings in the Vercel dashboard.

## Step-by-Step Fix (DO THIS NOW)

### Option 1: Via Vercel Dashboard (Easiest)

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Login if needed

2. **Find Your Project**
   - Look for "Habit Tracker" or "habit-tracker" in your projects list
   - Click on it

3. **Go to Settings**
   - Click the "Settings" tab at the top
   - Click "General" in the left sidebar

4. **Find Root Directory Setting**
   - Scroll down until you see "Root Directory"
   - You'll see a text field that probably says "habit-tracker"

5. **CLEAR THE FIELD**
   - Click in the "Root Directory" field
   - Delete everything (make it completely empty)
   - OR type just: `./`
   - **DO NOT** leave "habit-tracker" in there

6. **Save Changes**
   - Scroll to the bottom
   - Click "Save" button
   - Wait for confirmation

7. **Redeploy**
   - Go to "Deployments" tab
   - Find the latest failed deployment
   - Click the three dots (⋯) menu
   - Click "Redeploy"
   - Select "Use existing Build Cache" (optional)
   - Click "Redeploy" button

### Option 2: Delete and Recreate Project (If Option 1 Doesn't Work)

If clearing the Root Directory doesn't work:

1. **Go to Project Settings**
   - Settings → General
   - Scroll to bottom
   - Click "Delete Project"
   - Confirm deletion

2. **Create New Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `Madhu097/Habit-tracker`
   - **IMPORTANT**: Leave "Root Directory" **EMPTY**
   - Configure environment variables (see below)
   - Click "Deploy"

## Environment Variables to Add

When creating the new project or in Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAXqT96fD1K_JyOlyOWwVF7l_ht_rQKXOA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=habit-tracker-13dcb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=habit-tracker-13dcb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=habit-tracker-13dcb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=254531253622
NEXT_PUBLIC_FIREBASE_APP_ID=1:254531253622:web:af362922b55cab41087657
```

**Important**: Select "Production", "Preview", and "Development" for each variable.

## What I've Done in the Code

✅ Simplified `vercel.json` to empty object `{}`
✅ Removed all custom build configurations
✅ Let Vercel auto-detect Next.js (this is the best practice)

## Why vercel.json Can't Fix This

The `vercel.json` file is for **build configuration**, not for **project settings**. The "Root Directory" is a **project setting** that can ONLY be changed in the Vercel dashboard.

## After You Fix It

Once you clear the Root Directory and redeploy, you should see:

```
✓ Cloning github.com/Madhu097/Habit-tracker
✓ Installing dependencies
✓ Building Next.js application  
✓ Compiled successfully
✓ Deployment ready
```

## Verification

After successful deployment:
1. Visit your Vercel URL (e.g., `your-project.vercel.app`)
2. You should see the login page
3. Try logging in with your credentials
4. Test creating and logging habits

## Still Not Working?

If you still see the error after following these steps:

### Check These:
1. ✅ Root Directory is **completely empty** or set to `./`
2. ✅ You clicked "Save" after changing it
3. ✅ You redeployed AFTER saving
4. ✅ You're looking at the right project

### Screenshot What You See:
Take a screenshot of:
1. Settings → General → Root Directory section
2. The deployment error message
3. Share them so I can help further

## Quick Checklist

- [ ] Opened Vercel dashboard
- [ ] Found the Habit Tracker project
- [ ] Went to Settings → General
- [ ] Found "Root Directory" field
- [ ] Cleared the field (made it empty)
- [ ] Clicked "Save"
- [ ] Went to Deployments tab
- [ ] Clicked "Redeploy" on latest deployment
- [ ] Waited for build to complete

## Summary

🚫 **Cannot be fixed in code** - This is a Vercel dashboard setting  
✅ **Must be fixed manually** - Clear Root Directory in Vercel settings  
⏱️ **Takes 2 minutes** - Follow the steps above  
🎯 **Will work immediately** - Once settings are updated  

**Please follow the steps above and let me know the result!**
