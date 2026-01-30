# NeoNHS Mobile Codebase Index

## Project Overview

**NeoNHS** is a React Native mobile application built with Expo, TypeScript, and NativeWind (TailwindCSS for RN). The app follows a feature-based architecture with navigation-based routing.

- **Framework**: React Native (0.81.5) with Expo (~54.0.29)
- **Language**: TypeScript (~5.9.2)
- **UI Library**: NativeWind + RN Primitives + Lucide Icons
- **Navigation**: React Navigation (Stack & Bottom Tabs v7)
- **Architecture**: Feature-based modular structure
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API
- **Authentication**: Google Sign-In + Custom Auth
- **Logging**: react-native-logs

---

## Directory Structure

```
NeoNHS-Mobile/
├── app/                          # Application core
│   ├── App.tsx                   # Root application component ✅
│   ├── navigations/              # Navigation configuration
│   │   ├── RootNavigator.tsx     # Root navigator (Auth/Main switch) ✅
│   │   ├── AuthNavigator.tsx     # Authentication flow navigator ✅
│   │   ├── MainNavigator.tsx     # Main app navigator ✅
│   │   ├── TabsNavigator.tsx     # Bottom tab navigator ✅
│   │   └── NavigationParamTypes.ts # Navigation type definitions ✅
│   └── providers/                # Context providers
│       ├── Providers.tsx         # Main provider wrapper ✅
│       ├── ThemeProvider.tsx     # Dark/Light theme provider ✅
│       ├── ApiProvider.tsx       # API client configuration ✅
│       └── GoogleLoginProvider.tsx # Google Sign-In provider ⚠️
│
├── components/                   # Shared UI components
│   ├── Buttons/                  # Button components
│   │   └── (empty)
│   ├── Loader/                   # Loading components
│   │   └── (empty)
│   ├── Navigator/                # Navigator components
│   │   └── (empty)
│   ├── TestComponent.tsx         # Test component
│   └── ui/                       # Reusable UI primitives ✅
│       ├── button.tsx            # Button variants ✅
│       ├── card.tsx              # Card component ✅
│       ├── checkbox.tsx          # Checkbox component ✅
│       ├── icon.tsx              # Icon wrapper ✅
│       ├── input.tsx             # Input component ✅
│       ├── label.tsx             # Label component ✅
│       ├── radio-group.tsx       # Radio group ✅
│       ├── select.tsx            # Select dropdown ✅
│       ├── separator.tsx         # Separator component ✅
│       ├── switch.tsx            # Switch toggle ✅
│       ├── text.tsx              # Text typography ✅
│       ├── textarea.tsx          # Textarea component ✅
│       └── native-only-animated-view.tsx # Animation helper ✅
│
├── features/                     # Feature modules
│   ├── auth/                     # Authentication feature ✅
│   │   ├── components/           # Auth-specific components
│   │   │   ├── AuthLayout.tsx    # Auth screen layout ✅
│   │   │   ├── LoginForm.tsx     # Login form component ✅
│   │   │   └── RegisterForm.tsx  # Register form component ✅
│   │   ├── context/              # Auth context and provider
│   │   │   └── AuthContext.tsx   # Auth state management ✅
│   │   ├── hooks/                # Auth-specific hooks (empty)
│   │   ├── screens/              # Auth screens
│   │   │   ├── LoginScreen.tsx   # Login screen ✅
│   │   │   ├── RegisterScreen.tsx # Register screen ✅
│   │   │   ├── ForgotPasswordScreen.tsx # Forgot password ✅
│   │   │   ├── ForgotPasswordOtpScreen.tsx # OTP verification ✅
│   │   │   └── index.ts          # Screen exports ✅
│   │   ├── services/             # Auth API services
│   │   │   └── authService.ts    # Auth API calls ✅
│   │   ├── types.ts              # Auth type definitions ✅
│   │   └── index.ts              # Module exports ✅
│   ├── home/                     # Home feature
│   │   ├── components/           # (empty)
│   │   └── screens/              # Home screens
│   │       └── HomeScreen.tsx    # Home screen ⚠️
│   └── profile/                  # Profile feature
│       └── screens/              # Profile screens
│           └── ProfileScreen.tsx # Profile screen ⚠️
│
├── services/                     # API and external services
│   └── api/                      # API client and configuration
│       ├── client.ts             # Axios-based API client ✅
│       ├── endpoints.ts          # API endpoints ✅
│       ├── types.ts              # API type definitions ✅
│       ├── examples.ts           # Usage examples ✅
│       └── index.ts              # Module exports ✅
│
├── hooks/                        # Shared React hooks
│   ├── useApi.ts                 # API hook with loading/error states ✅
│   └── index.ts                  # Hooks exports ✅
│
├── utils/                        # Utility functions
│   ├── constants.ts              # App constants ✅
│   ├── date.ts                   # Date utilities (empty)
│   ├── logger.ts                 # Logging utility ✅
│   └── storage.ts                # AsyncStorage wrapper ✅
│
├── lib/                          # Library utilities
│   └── (styling utilities)
│
├── types/                        # TypeScript type definitions
│   └── (type definitions)
│
├── docs/                         # Documentation
│   ├── README.md                 # Docs overview ✅
│   ├── API_CLIENT.md             # API client documentation ✅
│   ├── AUTH_SYSTEM.md            # Auth system documentation ✅
│   ├── ENVIRONMENT_SETUP.md      # Environment setup guide ✅
│   ├── FOLDER_STRUCTURE.md       # Project structure guide ✅
│   └── NAVIGATION_GUIDE.md       # Navigation documentation ✅
│
├── assets/                       # Static assets
│   └── images/                   # App images & icons
│
├── __tests__/                    # Test files
├── __mocks__/                    # Test mocks
├── coverage/                     # Test coverage reports
│
├── android/                      # Android native project
│
├── index.tsx                     # Application entry point ✅
├── app.json                      # Expo configuration ✅
├── package.json                  # Dependencies and scripts ✅
├── tsconfig.json                 # TypeScript configuration ✅
├── tailwind.config.js            # TailwindCSS configuration ✅
├── global.css                    # Global styles ✅
├── babel.config.js               # Babel configuration ✅
├── metro.config.js               # Metro bundler config ✅
├── components.json               # UI components config ✅
├── .env.example                  # Environment variables template ✅
├── .env                          # Environment variables (local)
└── CODEBASE_INDEX.md             # This file
```

---

## Technology Stack

### Core
| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.1.0 | UI framework |
| React Native | 0.81.5 | Mobile framework |
| Expo | ~54.0.29 | Development platform |
| TypeScript | ~5.9.2 | Type safety |

### Navigation
| Package | Version | Purpose |
|---------|---------|---------|
| @react-navigation/native | ^7.0.0 | Navigation core |
| @react-navigation/stack | ^7.6.14 | Stack navigator |
| @react-navigation/bottom-tabs | ^7.9.1 | Tab navigator |
| react-native-screens | ~4.16.0 | Native screens |
| react-native-gesture-handler | ^2.30.0 | Gesture support |

### UI & Styling
| Package | Version | Purpose |
|---------|---------|---------|
| NativeWind | ^4.2.1 | TailwindCSS for RN |
| TailwindCSS | ^3.4.14 | Utility-first CSS |
| lucide-react-native | ^0.545.0 | Icon library |
| @rn-primitives/* | ^1.2.0 | UI primitives |
| react-native-reanimated | ^4.2.1 | Animations |
| react-native-svg | 15.12.1 | SVG support |

### Authentication
| Package | Version | Purpose |
|---------|---------|---------|
| @react-native-google-signin/google-signin | ^16.1.1 | Google Sign-In |
| expo-auth-session | ~7.0.10 | OAuth support |
| expo-crypto | ~15.0.8 | Crypto utilities |
| expo-web-browser | ~15.0.10 | Web browser |

### HTTP & Storage
| Package | Version | Purpose |
|---------|---------|---------|
| axios | ^1.13.2 | HTTP client |
| @react-native-async-storage/async-storage | 2.2.0 | Local storage |

### Development
| Package | Version | Purpose |
|---------|---------|---------|
| Jest | ~29.7.0 | Testing framework |
| jest-expo | ~54.0.16 | Expo Jest preset |
| Prettier | ^3.6.2 | Code formatting |

---

## Implementation Status

### ✅ Fully Implemented

1. **Project Infrastructure**
   - ✅ Expo setup with TypeScript & new architecture
   - ✅ NativeWind (TailwindCSS) styling system
   - ✅ Navigation system (Root, Auth, Main, Tabs)
   - ✅ Type-safe navigation with proper types
   - ✅ Safe area handling
   - ✅ Dark/Light theme support

2. **UI Component Library** (`components/ui/`)
   - ✅ Button (multiple variants)
   - ✅ Card
   - ✅ Input & Textarea
   - ✅ Checkbox & Radio Group
   - ✅ Select dropdown
   - ✅ Switch toggle
   - ✅ Text typography
   - ✅ Label & Separator
   - ✅ Icon wrapper

3. **API Layer**
   - ✅ Axios-based API client with interceptors
   - ✅ Request/response transformation
   - ✅ Error handling and error types
   - ✅ Token injection
   - ✅ Centralized endpoints
   - ✅ useApi hook for React components

4. **Authentication System**
   - ✅ Auth context and provider
   - ✅ Auth state management (reducer-based)
   - ✅ Token storage (AsyncStorage)
   - ✅ Auto-logout on 401 errors
   - ✅ Auth service (login, register, logout, refresh)
   - ✅ Navigation integration (auto-switch Auth/Main)
   - ✅ Login screen with form
   - ✅ Register screen with form
   - ✅ Forgot password flow (email + OTP)

5. **Provider Setup**
   - ✅ Providers wrapper composition
   - ✅ Theme provider (Dark/Light mode)
   - ✅ Auth provider
   - ✅ API provider (token injection)
   - ⚠️ Google Login provider (placeholder)

6. **Utilities**
   - ✅ Logger (react-native-logs)
   - ✅ Storage utility (AsyncStorage wrapper)
   - ✅ Constants configuration
   - ✅ Environment variable setup

7. **Documentation**
   - ✅ API Client documentation
   - ✅ Auth System documentation
   - ✅ Environment Setup guide
   - ✅ Folder Structure guide
   - ✅ Navigation guide

### ⚠️ Partially Implemented / Placeholders

1. **Screens**
   - ⚠️ HomeScreen - Basic structure (needs actual content)
   - ⚠️ ProfileScreen - Placeholder (needs user profile UI)

2. **Features**
   - ⚠️ Google Sign-In - Provider exists but not fully integrated
   - ⚠️ Feature-specific hooks - Empty directories

3. **Utilities**
   - ⚠️ date.ts - Empty file

---

## Navigation Structure

```
RootNavigator
├── Auth (when not authenticated)
│   └── AuthNavigator (Stack)
│       ├── Login
│       ├── Register
│       ├── ForgotPassword
│       └── ForgotPasswordOtp
└── Main (when authenticated)
    └── MainNavigator (Stack)
        └── TabsNavigator (Bottom Tabs)
            ├── Home
            └── Profile
```

---

## Key Files Reference

### Entry Points
- `index.tsx` - App registration
- `app/App.tsx` - Root component with providers

### Navigation
- `app/navigations/RootNavigator.tsx` - Auth-aware root
- `app/navigations/AuthNavigator.tsx` - Auth flow
- `app/navigations/MainNavigator.tsx` - Main app
- `app/navigations/TabsNavigator.tsx` - Bottom tabs
- `app/navigations/NavigationParamTypes.ts` - Type definitions

### Authentication
- `features/auth/context/AuthContext.tsx` - Auth state
- `features/auth/services/authService.ts` - API calls
- `features/auth/types.ts` - Type definitions
- `features/auth/screens/*.tsx` - Auth screens
- `features/auth/components/*.tsx` - Auth components

### API
- `services/api/client.ts` - Axios client
- `services/api/endpoints.ts` - Endpoint definitions
- `services/api/types.ts` - API types
- `hooks/useApi.ts` - React hook

### Providers
- `app/providers/Providers.tsx` - Composition
- `app/providers/ThemeProvider.tsx` - Theme
- `app/providers/ApiProvider.tsx` - API
- `app/providers/GoogleLoginProvider.tsx` - Google Sign-In

### Styling
- `global.css` - Global styles
- `tailwind.config.js` - Tailwind config
- `components/ui/*.tsx` - UI components

---

## Scripts

```bash
npm start        # Start Expo dev server
npm run dev      # Start Expo with cache clear
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run test     # Run tests in watch mode
npm run clean    # Clean .expo and node_modules
```

---

## Environment Variables

Required in `.env`:
```
EXPO_PUBLIC_API_URL=<your-api-url>
EXPO_PUBLIC_ENV=development|staging|production
```

---

## Next Steps & Recommendations

### 🔴 High Priority
1. **Complete Google Sign-In Integration**
   - Configure Google OAuth credentials
   - Complete GoogleLoginProvider implementation
   - Add Google Sign-In button to login screen

2. **Implement Home Screen**
   - Design dashboard layout
   - Add feature navigation
   - Display user-relevant content

3. **Implement Profile Screen**
   - Display user information
   - Add edit profile functionality
   - Add logout button
   - Add settings

### 🟡 Medium Priority
4. **Add More Features**
   - Events feature
   - Chat feature
   - Map/Location feature
   - Notifications

5. **Enhance UI/UX**
   - Add loading skeletons
   - Improve error messages
   - Add pull-to-refresh
   - Add offline support

### 🟢 Low Priority
6. **Testing**
   - Add unit tests for utilities
   - Add component tests
   - Add integration tests

7. **Performance**
   - Optimize bundle size
   - Add caching strategies
   - Profile and optimize renders

---

_Last indexed: 2026-01-28_
_Project: NeoNHS v1.0.0_
_Status: Foundation Complete - Auth UI Implemented - Ready for Feature Development_
