# NeoNHS Mobile User Guide

## Installation and System Requirements

This document is a user-guide version of project setup instructions for NeoNHS Mobile.

## 1. System Requirements

### 1.1 Required Software

- Node.js: 20 LTS (recommended) or 18.18+
- npm: version 9 or later
- Git: latest stable version

### 1.2 Android Development Requirements

- Android Studio (latest stable)
- Android SDK + Platform Tools
- One of the following:
  - Android Emulator
  - Physical Android device with USB debugging enabled

### 1.3 iOS Development Requirements (macOS only)

- macOS
- Xcode (latest stable)
- CocoaPods

### 1.4 Optional Tools

- Expo Go (for quick device testing)
- EAS CLI (for cloud builds and releases)

## 2. Installation Procedure

### Step 1: Clone the project

```bash
git clone <repository-url>
cd NeoNHS-Mobile
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Create environment file

Create a `.env` file in the project root with the following values:

```env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_ENV=development
```

Variable definitions:

- `EXPO_PUBLIC_API_URL` (required): Backend API base URL
- `EXPO_PUBLIC_ENV` (optional): `development`, `staging`, or `production`

Note: Restart Expo after changing `.env`.

### Step 4: Start development server

```bash
npm run dev
```

Alternative standard Expo mode:

```bash
npm start
```

## 3. Run the Application

### Android

```bash
npm run android
```

### iOS (macOS only)

```bash
npm run ios
```

### Web and Device Testing

Run:

```bash
npm start
```

Then:

- Press `w` to open web preview
- Scan QR code using Expo Go on a physical device

## 4. Useful Commands

- `npm start`: Start Expo server
- `npm run dev`: Start Expo in dev client mode
- `npm run android`: Launch Android app
- `npm run ios`: Launch iOS app (macOS only)
- `npm run typecheck`: Run TypeScript checks
- `npm run lint`: Run lint checks
- `npm test`: Run Jest in watch mode

## 5. Troubleshooting

- Environment value changes are not reflected:
  - Stop Expo and start again.
- Build seems stale or cache-related:
  - Run `npx expo start -c`.
- Android app does not launch:
  - Confirm Android SDK is configured and an emulator/device is connected.

## 6. Related Documentation

- `ENVIRONMENT_SETUP.md`
- `FOLDER_STRUCTURE.md`
- `AUTH_SYSTEM.md`
- `API_CLIENT.md`
- `NAVIGATION_GUIDE.md`
