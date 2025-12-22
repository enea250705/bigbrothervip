# Firebase Setup Instructions for Live Chat

## Quick Setup Guide

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project" or select an existing project
3. Follow the setup wizard (you can disable Google Analytics if you want)

### Step 2: Enable Realtime Database
1. In your Firebase project, go to "Realtime Database" in the left menu
2. Click "Create Database"
3. Choose a location (closest to your users)
4. Start in **test mode** (we'll update rules next)

### Step 3: Set Database Rules
1. Go to "Realtime Database" > "Rules" tab
2. Replace the rules with:

```json
{
  "rules": {
    "chats": {
      ".read": true,
      ".write": true
    },
    "viewers": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. Click "Publish"

### Step 4: Get Your Config
1. Go to Project Settings (gear icon) > General tab
2. Scroll down to "Your apps"
3. If you don't have a web app, click "</>" (Web) icon to add one
4. Register your app with a nickname (e.g., "Big Brother VIP Albania")
5. Copy the `firebaseConfig` object

### Step 5: Update chat.js
1. Open `chat.js`
2. Find the `firebaseConfig` object (around line 20)
3. Replace it with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com/"
};
```

### Step 6: Test
1. Save `chat.js`
2. Refresh your website
3. The live chat should now work!

## Free Tier Limits
- Firebase Realtime Database free tier includes:
  - 1 GB storage
  - 10 GB/month bandwidth
  - 100 simultaneous connections
  - This should be more than enough for most websites

## Security Note
The current rules allow anyone to read/write. For production, you might want to add authentication, but for a public chat, this is fine.

## Troubleshooting
- **Chat not loading?** Check browser console for errors
- **Messages not sending?** Verify database rules are published
- **Viewer count not updating?** Make sure database URL is correct in config




