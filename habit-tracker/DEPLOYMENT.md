# Deployment Guide

This guide covers deploying the Habit Tracker application to production.

## Prerequisites

- Firebase project created
- Firebase CLI installed: `npm install -g firebase-tools`
- Vercel account (for Vercel deployment) or Firebase project (for Firebase Hosting)

## Option 1: Deploy to Vercel (Recommended)

Vercel provides the best Next.js hosting experience with automatic deployments.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

From the project root:

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- Project name? **habit-tracker** (or your preferred name)
- Directory? **./** (current directory)
- Override settings? **No**

### Step 4: Add Environment Variables

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

5. Redeploy: `vercel --prod`

### Step 5: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Option 2: Deploy to Firebase Hosting

Firebase Hosting is free and integrates well with Firebase services.

### Step 1: Update Next.js Config

Edit `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### Step 2: Build the Application

```bash
npm run build
```

This creates an `out` directory with static files.

### Step 3: Initialize Firebase Hosting

```bash
firebase login
firebase init hosting
```

Configuration:
- Select your Firebase project
- Public directory: **out**
- Configure as single-page app: **Yes**
- Set up automatic builds: **No**
- Overwrite index.html: **No**

### Step 4: Deploy

```bash
firebase deploy --only hosting
```

Your app will be available at: `https://your-project-id.web.app`

### Step 5: Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click **Add custom domain**
3. Follow DNS configuration instructions

## Deploy Firestore Rules and Indexes

### Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

## Environment Variables

Create a `.env.local` file (for local development):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important**: Never commit `.env.local` to version control!

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Firestore security rules deployed
- [ ] Firestore indexes deployed
- [ ] Firebase Authentication enabled (Email/Password)
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test habit creation
- [ ] Test habit logging
- [ ] Test analytics view
- [ ] Verify mobile responsiveness
- [ ] Check console for errors

## Continuous Deployment

### Vercel (Automatic)

1. Connect your GitHub repository to Vercel
2. Push to main branch → automatic deployment
3. Pull requests get preview deployments

### Firebase Hosting (Manual)

```bash
npm run build
firebase deploy --only hosting
```

## Monitoring and Analytics

### Vercel Analytics

1. Go to Vercel dashboard → Analytics
2. View real-time performance metrics
3. Monitor Core Web Vitals

### Firebase Analytics

1. Enable Firebase Analytics in console
2. Add Analytics SDK to your app
3. Track custom events

## Performance Optimization

### Enable Caching

Vercel automatically caches static assets. For Firebase Hosting, add to `firebase.json`:

```json
{
  "hosting": {
    "public": "out",
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### Enable Compression

Both Vercel and Firebase Hosting automatically compress responses.

## Troubleshooting

### Build Fails

- Check Node.js version (18+)
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Firebase Connection Issues

- Verify environment variables
- Check Firebase project settings
- Ensure Firestore is in production mode

### Authentication Not Working

- Verify Firebase Auth is enabled
- Check authorized domains in Firebase Console
- Add your deployment domain to authorized domains

## Cost Optimization

### Firebase Free Tier Limits

- **Firestore**: 50K reads, 20K writes, 20K deletes per day
- **Authentication**: Unlimited
- **Hosting**: 10GB storage, 360MB/day transfer

### Staying Within Free Tier

- Use indexed queries (already implemented)
- Minimize real-time listeners (already optimized)
- Pre-calculate stats (already implemented)
- Cache data on client side

### Vercel Free Tier

- 100GB bandwidth per month
- Unlimited deployments
- Automatic SSL
- Edge network

## Security Checklist

- [ ] Firestore security rules deployed
- [ ] Environment variables not in source code
- [ ] HTTPS enabled (automatic)
- [ ] Authentication required for all operations
- [ ] Input validation on client and server
- [ ] Rate limiting (Firebase handles this)

## Backup and Recovery

### Backup Firestore Data

```bash
gcloud firestore export gs://your-bucket-name
```

### Restore Firestore Data

```bash
gcloud firestore import gs://your-bucket-name/[EXPORT_PREFIX]
```

## Support

For issues or questions:
- Check the README.md
- Review Firebase documentation
- Check Next.js documentation
- Review Vercel documentation

---

**Deployment Complete! 🚀**
