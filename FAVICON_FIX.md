# 🔖 Fix Favicon - Replace Vercel Logo with QLite Logo

## Problem
Your site is currently showing Vercel's default favicon instead of the QLite logo.

## Quick Fix Options

### Option 1: Use Online Converter (Easiest) ⭐
1. Go to **https://favicon.io/favicon-converter/**
2. Upload `public/logoqliteweb.png` or `public/logo.jpg`
3. Click "Download" to get the favicon package
4. Extract and copy `favicon.ico` from the downloaded zip
5. **Replace** the file at: `app/favicon.ico`
6. Restart dev server and clear browser cache (Ctrl+Shift+R)

### Option 2: Use Local HTML Tool
1. Open `scripts/create-favicon.html` in your browser
2. Upload your QLite logo (`logoqliteweb.png`)
3. Click "Download favicon.ico"
4. **Replace** the file at: `app/favicon.ico`
5. Restart dev server and clear browser cache

### Option 3: Simple PNG Rename (Quick Test)
If you just want to test quickly:
```bash
# Copy your logo as favicon (Next.js also accepts PNG)
copy public\logoqliteweb.png app\favicon.ico
```

## File Location
- **Current favicon**: `app/favicon.ico` (Vercel's logo - DELETE THIS)
- **Your logo**: `public/logoqliteweb.png` or `public/logo.jpg`
- **New favicon**: Should replace `app/favicon.ico`

## After Replacing

1. **Delete old favicon**:
   ```bash
   del app\favicon.ico
   ```

2. **Add new favicon** to `app` folder

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

4. **Clear browser cache**:
   - Chrome/Edge: Press `Ctrl + Shift + R`
   - Or open DevTools (F12) → Right-click refresh → "Empty Cache and Hard Reload"

## Verify It Works

1. Open your site in the browser
2. Check the browser tab - you should see the QLite logo
3. If still showing Vercel logo, clear cache again

## Why This Happens

Next.js 15 looks for `favicon.ico` in the `app` directory by default. The starter template includes Vercel's favicon, which needs to be replaced with your own.

## Additional Info

The `app/layout.tsx` metadata configuration will work once the physical `favicon.ico` file is replaced. The metadata points to `/favicon.ico`, which Next.js serves from the `app` directory.
