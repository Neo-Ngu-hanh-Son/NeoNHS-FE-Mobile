# NeoNHS Mobile

NeoNHS Mobile is an Expo + React Native + TypeScript application.

## System Requirements

### Base Requirements

- Node.js 20 LTS (recommended), or Node.js 18.18+
- npm 9+
- Git

### Android Development

- Android Studio (latest stable)
- Android SDK and platform tools
- Android Emulator or a physical Android device with USB debugging enabled

### iOS Development (macOS only)

- macOS
- Xcode (latest stable)
- CocoaPods

### Optional Tools

- Expo Go app (for quick testing on a physical device)
- EAS CLI for cloud build and deployment

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd NeoNHS-Mobile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_ENV=development
```

Environment variables:

- `EXPO_PUBLIC_API_URL` (required): Base URL of your backend API
- `EXPO_PUBLIC_ENV` (optional): `development`, `staging`, or `production`

After updating `.env`, restart the Expo server.

### 4. Start the development server

```bash
npm run dev
```

This starts Expo with dev client mode.

If you want the standard Expo start flow instead:

```bash
npm start
```

## Run on Platforms

### Android

```bash
npm run android
```

### iOS (macOS only)

```bash
npm run ios
```

### Web or Expo Go

Start the server with `npm start`, then:

- Press `w` for web
- Scan the QR code with Expo Go on your device

## Useful Scripts

- `npm start`: Start Expo
- `npm run dev`: Start Expo in dev client mode
- `npm run android`: Run Android app
- `npm run ios`: Run iOS app
- `npm run typecheck`: Run TypeScript checks
- `npm run lint`: Run lint checks
- `npm test`: Run tests in watch mode

## Troubleshooting

- If environment values are not applied, stop and restart Expo.
- If Metro cache causes stale behavior, run `npx expo start -c`.
- If Android is not detected, verify SDK path and that an emulator/device is running.

## Documentation

Additional project documentation is available in the `docs` directory:

- `docs/ENVIRONMENT_SETUP.md`
- `docs/FOLDER_STRUCTURE.md`
- `docs/AUTH_SYSTEM.md`
- `docs/API_CLIENT.md`
- `docs/NAVIGATION_GUIDE.md`
