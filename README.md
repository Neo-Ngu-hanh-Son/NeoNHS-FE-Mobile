## NeoNHS – Mobile App

NeoNHS is an Expo + React Native app that demonstrates a modern, production-style architecture with:

- Auth flow (login, register, forgot password, OTP)
- Profile & update-account screens
- Typed API client on top of Axios
- Global light/dark theme with runtime toggle
- Tailwind-style styling via NativeWind

It is intended as a clean starter for feature-based React Native apps.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
# or
yarn
```

### 2. Configure environment

Create a `.env` file in the project root (see `docs/ENVIRONMENT_SETUP.md` for details):

```env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_ENV=development
```

If you omit `EXPO_PUBLIC_API_URL`, the app will fall back to the default in `utils/constants.ts`.

### 3. Run the app

```bash
npm run dev          # expo start -c (recommended for dev)
# or
npm start            # expo start
```

Then:
- Press **i** for iOS simulator (macOS)
- Press **a** for Android emulator
- Press **w** for web
- Or scan the QR code with the Expo Go app

---

## Architecture Overview

The app uses a **feature-based structure**. See `docs/FOLDER_STRUCTURE.md` for the full tree.

- `app/`
  - `navigations/` – React Navigation stacks & tabs
  - `providers/` – Global providers (Auth, API, Theme)
- `features/`
  - `auth/` – Auth context, screens, and service
  - `home/` – Home screen (theme toggle entry point)
  - `profile/` – Profile & Update Account screens
- `components/` – Shared UI + primitive components (button, input, text, etc.)
- `services/api/` – API client, endpoints, and types
- `docs/` – In-repo documentation

More detail:
- **Auth docs**: `docs/AUTH_SYSTEM.md`
- **API client docs**: `docs/API_CLIENT.md`
- **Navigation docs**: `docs/NAVIGATION_GUIDE.md`

---

## Key Features

### Authentication Flow

Located in `features/auth/`:

- `LoginScreen` – email/password login + Google button (stub)
- `RegisterScreen` – full name, email, password + Google sign-up (stub)
- `ForgotPasswordScreen` – request reset code
- `ForgotPasswordOtpScreen` – verify code & set new password
- `AuthContext` – handles auth state, storage, and integration with the API client
- `authService` – currently returns **dummy responses** and logs warnings via `logger`

Auth navigation is wired via:

- `app/navigations/AuthNavigator.tsx`
- `app/navigations/RootNavigator.tsx` (switches between Auth/Main flows)

See `docs/AUTH_SYSTEM.md` for usage and flow diagrams.

### API Client

The API layer lives under `services/api/`:

- `client.ts` – Axios wrapper with:
  - request/response interceptors
  - typed `get/post/put/patch/delete` helpers
  - unified `ApiResponse<T>` / `ApiError` types
- `endpoints.ts` – central endpoint definitions
- `useApi` hook – convenience hook for handling loading/error state in components

The API client is configured in `app/providers/ApiProvider.tsx` to:

- inject the auth token
- call `logout()` on 401 responses
- log errors via `logger`

Details: `docs/API_CLIENT.md`.

### Theming & Dark Mode

The app uses a custom theme system plus NativeWind:

- `lib/theme.ts`
  - `THEME.light` and `THEME.dark` color tokens
  - `NAV_THEME` for React Navigation
- `global.css`
  - HSL variables mapped for NativeWind (`--background`, `--foreground`, `--primary`, etc.)
- `app/providers/ThemeProvider.tsx`
  - `useTheme()` hook
  - Persists user preference (light/dark) using AsyncStorage
  - Falls back to system color scheme on first run

Where it’s used:

- `HomeScreen` – central **light/dark toggle** (switch + quick Light/Dark buttons)
- `ProfileScreen` – duplicate dark mode toggle in settings card
- `RootNavigator` – wraps NavigationContainer in the correct theme and sets the `dark` class for NativeWind

---

## Profile & Account Management

Profile-related code lives in `features/profile/`:

- `ProfileScreen.tsx`
  - shows basic user info (name, email)
  - exposes an **“Edit Profile”** button
  - dark mode toggle in the settings card
- `UpdateAccountScreen.tsx`
  - full name, email, and phone number form
  - inline client-side validation
  - calls `userService.updateAccount` and then updates the `AuthContext` via `updateUser`
  - currently uses **dummy API** and logs a warning via `logger`
- `services/userService.ts`
  - `updateAccount` returns a dummy successful response
  - can be wired to a real backend later

Navigation:

- `MainNavigator` (`app/navigations/MainNavigator.tsx`) defines a `UpdateAccount` stack screen reachable from the Profile tab.

---

## Styling & UI

- **Styling**: [NativeWind](https://www.nativewind.dev/) (`className` on React Native components)
- **Design tokens**: `global.css` + `lib/theme.ts`
- **UI primitives**: `components/ui/`
  - `button`, `input`, `text`, `label`, `switch`, `select`, `card`, etc.
- **Helpers**:
  - `components/Buttons/IconButton.tsx` – wraps `Button` with an Ionicon
  - `components/Loader/LoadingOverlay.tsx` – simple blocking loader
  - `features/auth/components/AuthLayout.tsx` – shared auth screen layout with top image + bottom sheet card

---

## Scripts

From `package.json`:

- **`npm run dev`** – `expo start -c` (clear cache, recommended during development)
- **`npm start`** – `expo start`
- **`npm run android`** – run app on Android
- **`npm run ios`** – run app on iOS (macOS only)

---

## Further Reading

For deeper details, see the docs in `docs/`:

- `docs/README.md` – index of all project docs
- `docs/ENVIRONMENT_SETUP.md` – environment variables
- `docs/FOLDER_STRUCTURE.md` – structure & best practices
- `docs/AUTH_SYSTEM.md` – full auth system guide
- `docs/API_CLIENT.md` – API client usage
- `docs/NAVIGATION_GUIDE.md` – how navigation is wired and how to add screens

# Minimal Template

This is a [React Native](https://reactnative.dev/) project built with [Expo](https://expo.dev/) and [React Native Reusables](https://reactnativereusables.com).

It was initialized using the following command:

```bash
npx @react-native-reusables/cli@latest init -t test
```

## Getting Started

To run the development server:

```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
```

This will start the Expo Dev Server. Open the app in:

- **iOS**: press `i` to launch in the iOS simulator _(Mac only)_
- **Android**: press `a` to launch in the Android emulator
- **Web**: press `w` to run in a browser

You can also scan the QR code using the [Expo Go](https://expo.dev/go) app on your device. This project fully supports running in Expo Go for quick testing on physical devices.

## Adding components

You can add more reusable components using the CLI:

```bash
npx react-native-reusables/cli@latest add [...components]
```

> e.g. `npx react-native-reusables/cli@latest add input textarea`

If you don't specify any component names, you'll be prompted to select which components to add interactively. Use the `--all` flag to install all available components at once.

## Project Features

- ⚛️ Built with [Expo Router](https://expo.dev/router)
- 🎨 Styled with [Tailwind CSS](https://tailwindcss.com/) via [Nativewind](https://www.nativewind.dev/)
- 📦 UI powered by [React Native Reusables](https://github.com/founded-labs/react-native-reusables)
- 🚀 New Architecture enabled
- 🔥 Edge to Edge enabled
- 📱 Runs on iOS, Android, and Web

## Learn More

To dive deeper into the technologies used:

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Nativewind Docs](https://www.nativewind.dev/)
- [React Native Reusables](https://reactnativereusables.com)

## Deploy with EAS

The easiest way to deploy your app is with [Expo Application Services (EAS)](https://expo.dev/eas).

- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Updates](https://docs.expo.dev/eas-update/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)

---

If you enjoy using React Native Reusables, please consider giving it a ⭐ on [GitHub](https://github.com/founded-labs/react-native-reusables). Your support means a lot!
