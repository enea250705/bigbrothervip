# Firebase Domain Authorization Setup

## Why you might need to add your domain

If your chat is not working, you may need to authorize your domain in Firebase Console. Here's how:

## Step 1: Add Authorized Domain (if using Authentication)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **bbvip-63bea**
3. Click on **Authentication** (left sidebar)
4. Click on **Settings** tab
5. Scroll down to **Authorized domains**
6. Click **Add domain**
7. Add your domain: **bigbrothervipalbania.stream**
8. Also add: **www.bigbrothervipalbania.stream** (if you use www)
9. Click **Add**

**Note:** This is mainly needed if you're using Firebase Authentication. For Realtime Database with public read/write rules, this might not be necessary.

## Step 2: Check Realtime Database Rules

1. In Firebase Console, go to **Realtime Database** (left sidebar)
2. Click on **Rules** tab
3. Make sure your rules look like this:

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
    },
    "test": {
      ".read": true,
      ".write": true
    }
  }
}
```

4. Click **Publish**

## Step 3: Verify Database Location

1. In Firebase Console, go to **Realtime Database**
2. Check the database URL matches: `https://bbvip-63bea-default-rtdb.firebaseio.com`
3. If you see a different region, make sure your `databaseURL` in `chat.js` matches

## Step 4: Test Connection

1. Open your website: https://bigbrothervipalbania.stream
2. Open browser console (F12)
3. Look for these messages:
   - ✅ Firebase SDK loaded
   - ✅ Firebase config found
   - ✅ Firebase initialized successfully
   - ✅ Firebase Realtime Database connected!

If you see errors, check:
- Network tab for CORS errors
- Console for specific error messages
- Firebase Console > Realtime Database > Data tab to see if data is being written

## Common Issues

### Issue: "Permission denied"
**Solution:** Check Realtime Database rules (Step 2)

### Issue: "Network error" or CORS error
**Solution:** 
- Add domain to Authorized domains (Step 1)
- Check if database is in correct region
- Verify database URL in chat.js matches Firebase Console

### Issue: "Database not found"
**Solution:**
- Make sure Realtime Database is enabled (not Firestore)
- Check database URL in Firebase Console matches chat.js

## Still Not Working?

1. Check browser console (F12) for specific errors
2. Check Network tab for failed requests to `firebaseio.com`
3. Verify Firebase project is active (not deleted/suspended)
4. Make sure you're using the correct Firebase project credentials




