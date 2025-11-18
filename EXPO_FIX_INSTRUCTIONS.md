# Expo Setup Fix Instructions

## Problem
The lyriq-mobile app has incompatible dependencies preventing Expo from starting.

## Solution: Clean Reinstall

### Step 1: Create Fresh Expo SDK 53 Project
```bash
cd /home/user/LYRIQ_Geminiv3
npx create-expo-app lyriq-mobile-fixed --template blank-typescript
cd lyriq-mobile-fixed
```

### Step 2: Update to SDK 53 (if needed)
```bash
# Check current SDK version in package.json
# If it's not 53, downgrade by editing package.json manually
# Change "expo": "~XX.0.0" to "expo": "~53.0.0"
# Then run:
npm install
```

### Step 3: Install Required Dependencies
```bash
npm install @google/genai @gorhom/bottom-sheet @react-native-async-storage/async-storage expo-av expo-document-picker expo-file-system expo-haptics expo-linking expo-router expo-status-bar react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens react-native-svg metro@0.80.12
```

### Step 4: Copy Over App Code
```bash
# Copy the following directories from lyriq-mobile to lyriq-mobile-fixed:
cp -r ../lyriq-mobile/app ./
cp -r ../lyriq-mobile/components ./
cp -r ../lyriq-mobile/services ./
cp -r ../lyriq-mobile/hooks ./
cp -r ../lyriq-mobile/theme ./
cp -r ../lyriq-mobile/utils ./
cp ../lyriq-mobile/types.ts ./
cp ../lyriq-mobile/babel.config.js ./
cp ../lyriq-mobile/app.json ./
```

### Step 5: Update package.json main entry
Edit `package.json` and change:
```json
"main": "expo-router/entry"
```

### Step 6: Test
```bash
npx expo start
```

## Alternative: Fix Network Issue

If you want to fix the current setup, resolve the network/proxy issue preventing Expo API access:

1. Check your network proxy settings
2. Try: `export NO_PROXY=*` or configure proxy correctly
3. Then run: `npx expo install --fix` to auto-fix dependencies

## Current Package Versions (for reference)
- expo: ~53.0.0
- react: 18.2.0
- react-native: 0.74.5
- expo-router: ~4.0.17
- react-native-reanimated: ~3.16.1
- metro: 0.80.12
