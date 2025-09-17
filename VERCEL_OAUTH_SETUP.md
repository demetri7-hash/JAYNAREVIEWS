# 🔧 Google OAuth 2.0 Configuration for Vercel Deployment

## Issue
Google OAuth error: "You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy"

## Root Cause
The redirect URI `https://jaynareviews-b1q1.vercel.app/api/auth/callback/google` is not registered in Google Cloud Console.

## ✅ Solution Steps

### 1. Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find and edit OAuth 2.0 Client ID: `939439455906-ch526140sa12hie1hkq4jh0qmgpm17a8.apps.googleusercontent.com`
4. In **Authorized redirect URIs** section, add:
   ```
   https://jaynareviews-b1q1.vercel.app/api/auth/callback/google
   ```
5. Click **Save**

### 2. Update Vercel Environment Variables
Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Update these variables:
```bash
NEXTAUTH_URL=https://jaynareviews-b1q1.vercel.app
GOOGLE_REDIRECT_URI_PRODUCTION=https://jaynareviews-b1q1.vercel.app/api/auth/callback/google
```

### 3. Redeploy
After updating both Google Cloud Console and Vercel environment variables, trigger a new deployment or wait for the next git push.

## 🔍 Current Configuration
- **Vercel URL**: `https://jaynareviews-b1q1.vercel.app`
- **Google Client ID**: `939439455906-ch526140sa12hie1hkq4jh0qmgpm17a8.apps.googleusercontent.com`
- **Required Redirect URI**: `https://jaynareviews-b1q1.vercel.app/api/auth/callback/google`

## ✨ After Fix
Users will be able to sign in with Google OAuth without any compliance errors.

---
*Created: September 17, 2025*
*THE PASS - Restaurant Management System*