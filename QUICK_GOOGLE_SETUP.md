# Quick Google Authentication Setup

## Problem
You're seeing "Google authentication not configured" when clicking the Google login button.

## Solution: Get Your Google Client ID

### Step 1: Create Google OAuth Credentials (5 minutes)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Click "New Project" or select an existing one
   - Give it a name (e.g., "iWorkSocial")

3. **Enable Google+ API** (if needed)
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Identity Toolkit API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" (unless you have Google Workspace)
   - Fill in:
     - App name: `iWorkSocial`
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (your email) if in testing mode
   - Click "Save and Continue"

5. **Create OAuth Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" > "OAuth client ID"
   - Application type: **Web application**
   - Name: `iWorkSocial Web Client`
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:5173
     ```
   - Click "Create"
   - **Copy the Client ID** (looks like: `123456789-abc123def456.apps.googleusercontent.com`)

### Step 2: Update Environment Files

1. **Backend Configuration**
   - Open `backend/.env`
   - Find the line: `GOOGLE_CLIENT_ID=your_google_client_id_here`
   - Replace `your_google_client_id_here` with your actual Client ID:
     ```
     GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
     ```

2. **Frontend Configuration**
   - Open `frontend/.env`
   - Find the line: `VITE_GOOGLE_CLIENT_ID=your_google_client_id_here`
   - Replace `your_google_client_id_here` with the **same** Client ID:
     ```
     VITE_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
     ```

### Step 3: Restart Your Servers

**Important:** You must restart both servers for the changes to take effect!

1. **Stop your backend server** (Ctrl+C)
2. **Stop your frontend server** (Ctrl+C)
3. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```
4. **Restart frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

### Step 4: Test

1. Go to your login page
2. You should see the Google Sign-In button (no error message)
3. Click it and sign in with your Google account
4. You should be redirected to your app

## Troubleshooting

### Still seeing "Google authentication not configured"?
- ✅ Check that you replaced `your_google_client_id_here` in both `.env` files
- ✅ Make sure you restarted both servers after updating `.env` files
- ✅ Verify the Client ID doesn't have extra spaces or quotes
- ✅ Check browser console for errors (F12)

### "Invalid Google token" error?
- ✅ Make sure you're using the same Client ID in both backend and frontend
- ✅ Verify `http://localhost:5173` is in "Authorized JavaScript origins"
- ✅ Check that your Google account email is added as a test user (if app is in testing mode)

### Button not showing?
- ✅ Check browser console (F12) for JavaScript errors
- ✅ Verify the Google Identity Services script is loading
- ✅ Make sure `VITE_GOOGLE_CLIENT_ID` is set correctly

## Need Help?

- Google Cloud Console: https://console.cloud.google.com/
- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2

