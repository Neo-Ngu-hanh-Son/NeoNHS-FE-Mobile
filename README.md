# NeoNHS Mobile

NeoNHS Mobile is a feature-rich travel and navigation application built with **Expo 54** and **React Native**. It utilizes a feature-first architecture to manage complex domain modules including real-time mapping, audio guides, workshops, and secure payments.

## 🛠 Tech Stack

- **Framework**: Expo 54 (SDK 54) / React Native 0.81
- **Language**: TypeScript 5.9
- **Styling**: NativeWind 4 (Tailwind CSS for React Native)
- **Navigation**: React Navigation 7
- **Data Fetching**: TanStack Query 5 (React Query)
- **Storage**: MMKV (via `persistQueryClient`)

---

## 🏗 Project Architecture

The project follows a **Feature-First** separation of concerns. This ensures that domain logic (like Map or Auth) is self-contained and scalable.

- **`app/`**: Application shell, root navigation, and global context providers.
- **`features/`**: Domain-specific modules. Each feature contains its own `screens`, `hooks`, `services`, `components`, and `types`.
- **`components/`**: Shared UI primitives and atomic components (Buttons, Loaders, Inputs).
- **`services/`**: Centralized API clients and third-party integrations (Cloudinary, Axios).
- **`utils/`**: Global constants, formatting helpers, and storage utilities.

---

## 🚦 System Requirements & Setup

### ⚠️ Critical: Native Environment

Because this app uses native modules for **Location, Speech, and Maps**, you **cannot** use standard Expo Go for full feature testing. You **must** set up a local native development environment.

#### Android Setup

1.  **Android Studio**: Install the latest version.
2.  **SDK**: Ensure Android SDK 34+ is installed.
3.  **Environment Variables**: Ensure `ANDROID_HOME` is set and `platform-tools` is in your system PATH.
4.  **Emulator**: Have an Android Virtual Device (AVD) running or a physical device connected via USB with Debugging enabled.

#### iOS Setup (macOS Only)

1.  **Xcode**: Latest version with Command Line Tools.
2.  **CocoaPods**: Install via `sudo gem install cocoapods`.

---

## 📥 Installation

1.  **Clone the repository**

    ```bash
    git clone <your-repo-url>
    cd NeoNHS-Mobile
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    EXPO_PUBLIC_API_URL=https://your-api-url.com
    EXPO_PUBLIC_GOOGLE_MAP_API=your_google_maps_key
    EXPO_PUBLIC_ENV=development
    ```

---

## 🚀 Running the App

Do not use `npm start` for the initial run if you haven't built the native code yet. Use the native run commands to compile the Development Client.

### **Android (Recommended)**

```bash
npx expo run:android
```

### **iOS**

```bash
npx expo run:ios
```

### **Subsequent Starts**

Once the native app is installed on your device/emulator, you can use the standard dev server:

```bash
npm run dev
```

---

## 📂 Codebase Index

### Top-Level Distribution

- **Features (225 files)**: The heart of the app's logic.
- **Components (25 files)**: Shared UI primitives.
- **Services (13 files)**: API and external integrations.

### Feature Inventory

| Feature              | Primary Responsibilities                                  |
| :------------------- | :-------------------------------------------------------- |
| `features/map`       | Directions, clustering, off-route detection, GPS tracking |
| `features/home`      | Dashboard, featured content, overview data                |
| `features/workshops` | Session browsing, review system, workshop APIs            |
| `features/chat`      | Real-time messaging, chat rooms                           |
| `features/profile`   | KYC verification, transactions, account management        |
| `features/cart`      | Payment flows, checkout logic                             |
| `features/panorama`  | 360° panorama rendering                                   |

### Runtime Boot Flow

`index.tsx` → `app/App.tsx` → **Global Providers** (Auth, Theme, Api, etc.) → **RootNavigator** → **Stacks** (Main/Auth).

---

## 🛠 Development Commands

| Command             | Purpose                                        |
| :------------------ | :--------------------------------------------- |
| `npm run typecheck` | Validates TypeScript types across the project  |
| `npm run lint`      | Runs ESLint to enforce code style              |
| `npm test`          | Launches Jest in watch mode                    |
| `npx expo start -c` | Starts Expo and clears the Metro bundler cache |

---

## 📝 Conventions

1.  **Imports**: Use `@/` alias for all internal imports (e.g., `@/components/ui/button`).
2.  **API Flow**: `Screen` → `Feature Hook` → `Feature Service` → `apiClient`.
3.  **Styles**: Use NativeWind `className` strings. Prefer shared primitives from `components/ui` over ad-hoc styling.
4.  **Navigation**: All route types must be defined in `app/navigations/NavigationParamTypes.ts`.

---
