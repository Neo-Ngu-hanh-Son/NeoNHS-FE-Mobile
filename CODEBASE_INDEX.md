# MyNHS Codebase Index

## Project Overview

**MyNHS** is a React Native mobile application built with Expo, TypeScript, and Ant Design React Native. The app follows a feature-based architecture with navigation-based routing.

- **Framework**: React Native (0.81.5) with Expo (~54.0.31)
- **Language**: TypeScript
- **UI Library**: Ant Design React Native (^5.4.3)
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Architecture**: Feature-based modular structure
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API
- **Logging**: tslog


---

## Directory Structure

```
MyNHS/
├── app/                    # Application core
│   ├── App.tsx            # Root application component
│   ├── navigations/       # Navigation configuration
│   │   ├── RootNavigator.tsx  # Root navigator (Auth/Main switch)
│   │   ├── AuthNavigator.tsx  # Authentication flow navigator
│   │   ├── MainNavigator.tsx  # Main app navigator
│   │   ├── TabsNavigator.tsx # Bottom tab navigator
│   │   └── types.ts       # Navigation type definitions
│   └── providers/         # Context providers
│       ├── Providers.tsx      # Main provider wrapper
│       ├── AntDesignProvider.tsx # Ant Design provider
│       └── ApiProvider.tsx    # API client configuration
│
├── components/            # Shared UI components
│   ├── Buttons/          # Button components (empty)
│   ├── Loader/           # Loading components (empty)
│   ├── Navigator/         # Navigator components (empty)
│   └── Text/             # Text components (empty)
│
├── features/              # Feature modules
│   ├── auth/             # Authentication feature
│   │   ├── components/   # Auth-specific components (empty)
│   │   ├── context/      # Auth context and provider
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/       # Auth-specific hooks (empty)
│   │   ├── screens/     # Auth screens
│   │   │   ├── LoginScreen.tsx (placeholder)
│   │   │   ├── RegisterScreen.tsx (placeholder)
│   │   │   └── index.ts
│   │   ├── services/    # Auth API services
│   │   │   └── authService.ts
│   │   ├── types.ts     # Auth type definitions
│   │   ├── index.ts     # Module exports
│   │   └── README.md    # Auth documentation
│   ├── home/            # Home feature
│   │   ├── components/  # Home-specific components (empty)
│   │   ├── hooks/       # Home-specific hooks (empty)
│   │   └── screens/     # Home screens
│   │       ├── HomeScreen.tsx (basic implementation)
│   │       └── index.ts
│   └── profile/         # Profile feature
│       └── screens/     # Profile screens
│           ├── ProfileScreen.tsx (placeholder)
│           └── index.ts
│
├── services/             # API and external services
│   └── api/             # API client and configuration
│       ├── client.ts     # Axios-based API client ✅
│       ├── endpoints.ts  # API endpoints ✅
│       ├── types.ts      # API type definitions ✅
│       ├── index.ts      # Module exports ✅
│       ├── examples.ts   # Usage examples ✅
│       ├── README.md     # API documentation ✅
│       └── SETUP.md      # Setup guide ✅
│
├── hooks/                # Shared React hooks
│   ├── useApi.ts        # API hook with loading/error states ✅
│   └── index.ts         # Hooks exports ✅
│
├── utils/                # Utility functions
│   ├── constants.ts     # App constants ✅
│   ├── date.ts          # Date utilities (empty)
│   ├── logger.ts        # Logging utility ✅
│   └── storage.ts       # AsyncStorage wrapper ✅
│
├── types/                # TypeScript type definitions
│   ├── common.ts        # Common types (empty)
│   └── navigation.ts    # Navigation types (empty)
│
├── theme/                # Theming configuration
│   └── colors.ts        # Color definitions (empty)
│
├── assets/               # Static assets
│   ├── fonts/           # Custom fonts
│   ├── icon.png         # App icon
│   ├── adaptive-icon.png # Android adaptive icon
│   ├── splash-icon.png  # Splash screen icon
│   └── favicon.png      # Web favicon
│
├── index.ts              # Application entry point
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variables template ✅
├── ENV_SETUP.md          # Environment setup guide ✅
└── CODEBASE_INDEX.md     # This file
```

---

## Implementation Status

### ✅ Fully Implemented

1. **Project Infrastructure**
   - ✅ Expo setup with TypeScript
   - ✅ Navigation system (Root, Auth, Main, Tabs)
   - ✅ Type-safe navigation with proper types
   - ✅ Path aliases (`@/*`)
   - ✅ Safe area handling

2. **API Layer**
   - ✅ Axios-based API client with interceptors
   - ✅ Request/response transformation
   - ✅ Error handling and error types
   - ✅ Token injection
   - ✅ Centralized endpoints
   - ✅ useApi hook for React components

3. **Authentication System**
   - ✅ Auth context and provider
   - ✅ Auth state management (reducer-based)
   - ✅ Token storage (AsyncStorage)
   - ✅ Auto-logout on 401 errors
   - ✅ Auth service (login, register, logout, refresh)
   - ✅ Navigation integration (auto-switch Auth/Main)

4. **Utilities**
   - ✅ Logger (tslog integration)
   - ✅ Storage utility (AsyncStorage wrapper)
   - ✅ Constants configuration
   - ✅ Environment variable setup

5. **Provider Setup**
   - ✅ Providers wrapper
   - ✅ Ant Design provider
   - ✅ Auth provider
   - ✅ API provider (token injection)

### ⚠️ Partially Implemented / Placeholders

1. **Screens**
   - ⚠️ LoginScreen - Placeholder (needs form implementation)
   - ⚠️ RegisterScreen - Placeholder (needs form implementation)
   - ⚠️ HomeScreen - Basic structure (needs actual content)
   - ⚠️ ProfileScreen - Placeholder (needs user profile UI)

2. **Components**
   - ⚠️ Buttons/ - Empty directory
   - ⚠️ Loader/ - Empty directory
   - ⚠️ Text/ - Empty directory
   - ⚠️ Navigator/ - Empty directory

3. **Theme & Styling**
   - ⚠️ colors.ts - Empty file
   - ⚠️ No theme provider setup
   - ⚠️ No consistent styling system

4. **Utilities**
   - ⚠️ date.ts - Empty file
   - ⚠️ types/common.ts - Empty file
   - ⚠️ types/navigation.ts - Empty file

5. **Feature Components**
   - ⚠️ auth/components/ - Empty
   - ⚠️ home/components/ - Empty
   - ⚠️ Feature-specific hooks - Empty

---

## Key Files & Their Status

### Core Application
- ✅ `app/App.tsx` - Root component with providers
- ✅ `app/providers/Providers.tsx` - Provider composition
- ✅ `app/navigations/RootNavigator.tsx` - Auth-aware navigation

### Authentication
- ✅ `features/auth/context/AuthContext.tsx` - Auth state management
- ✅ `features/auth/services/authService.ts` - Auth API calls
- ✅ `features/auth/types.ts` - Auth type definitions
- ⚠️ `features/auth/screens/LoginScreen.tsx` - Needs form implementation
- ⚠️ `features/auth/screens/RegisterScreen.tsx` - Needs form implementation

### API & Services
- ✅ `services/api/client.ts` - Axios client with interceptors
- ✅ `services/api/endpoints.ts` - Endpoint definitions
- ✅ `services/api/types.ts` - API types
- ✅ `hooks/useApi.ts` - React hook for API calls

### Utilities
- ✅ `utils/logger.ts` - tslog logger
- ✅ `utils/storage.ts` - AsyncStorage wrapper
- ✅ `utils/constants.ts` - App constants
- ⚠️ `utils/date.ts` - Empty

---

## Technology Stack

### Core
- **React**: 19.1.0
- **React Native**: 0.81.5
- **Expo**: ~54.0.31
- **TypeScript**: ~5.9.2

### Navigation
- **@react-navigation/native**: ^7.1.26
- **@react-navigation/stack**: ^7.6.13
- **@react-navigation/bottom-tabs**: ^7.9.0

### UI Components
- **@ant-design/react-native**: ^5.4.3
- **@ant-design/icons-react-native**: ^2.3.2
- **@expo/vector-icons**: ^15.0.3

### HTTP & Storage
- **axios**: ^1.13.2
- **@react-native-async-storage/async-storage**: 2.2.0

### Utilities
- **tslog**: ^2.11.1
- **react-native-safe-area-context**: ~5.6.0
- **react-native-gesture-handler**: ~2.28.0
- **react-native-reanimated**: ~4.1.1

---

## Architecture Patterns

### Feature-Based Structure
Each feature module contains:
- `screens/` - Feature screens
- `components/` - Feature-specific components
- `hooks/` - Feature-specific hooks
- `services/` - Feature API services
- `types.ts` - Feature type definitions

### State Management
- **Auth State**: React Context + useReducer
- **API State**: Custom hooks (useApi)
- **Local State**: React useState/useReducer

### Navigation Hierarchy
```
RootNavigator
├── Auth (when not authenticated)
│   └── AuthNavigator
│       ├── Login
│       └── Register
└── Main (when authenticated)
    └── MainNavigator
        └── TabsNavigator
            ├── Home
            └── Profile
```

---

## Next Steps & Recommendations

### 🔴 High Priority

1. **Implement Login & Register Screens**
   - Create form components with validation
   - Integrate with auth context
   - Add error handling and loading states
   - Add navigation between login/register

2. **Create Shared UI Components**
   - Button component (with variants)
   - Input/TextInput component
   - Loader/Spinner component
   - Error message component
   - Card component

3. **Theme System**
   - Define color palette in `theme/colors.ts`
   - Create theme provider
   - Add typography system
   - Add spacing system

4. **Form Validation**
   - Add form validation library (e.g., react-hook-form + yup)
   - Create reusable form components
   - Add validation to login/register forms

### 🟡 Medium Priority

5. **Profile Screen Implementation**
   - Display user information
   - Add edit profile functionality
   - Add logout button
   - Add avatar upload

6. **Home Screen Content**
   - Remove test API call
   - Add actual home screen content
   - Add dashboard widgets/cards
   - Add navigation to other features

7. **Error Handling**
   - Create error boundary component
   - Add global error handler
   - Improve error messages in UI
   - Add retry mechanisms

8. **Loading States**
   - Create loading component
   - Add skeleton loaders
   - Improve loading UX across screens

### 🟢 Low Priority

9. **Date Utilities**
   - Implement date formatting functions
   - Add relative time helpers
   - Add date validation

10. **Common Types**
    - Add shared type definitions
    - Add utility types
    - Add API response types

11. **Feature-Specific Components**
    - Auth form components
    - Home dashboard components
    - Profile components

12. **Testing**
    - Add unit tests for utilities
    - Add integration tests for API
    - Add component tests

13. **Documentation**
    - Add JSDoc comments
    - Create component documentation
    - Add API documentation

---

## Development Workflow

### Current Setup
1. ✅ Environment variables configured (.env.example)
2. ✅ API client ready for backend integration
3. ✅ Auth system ready for backend integration
4. ✅ Navigation structure complete
5. ✅ Logging system in place

### Recommended Development Order

1. **UI Foundation** (Week 1)
   - Create theme system
   - Build shared components
   - Set up form validation

2. **Authentication UI** (Week 1-2)
   - Implement login screen
   - Implement register screen
   - Add form validation
   - Test auth flow

3. **Core Features** (Week 2-3)
   - Implement home screen
   - Implement profile screen
   - Add navigation between screens

4. **Polish & Enhancement** (Week 3-4)
   - Add error handling
   - Improve loading states
   - Add animations
   - Optimize performance

---

## File Organization Best Practices

### Current Structure ✅
- Feature-based organization
- Clear separation of concerns
- Type-safe navigation
- Centralized API layer

### Recommendations
- Keep feature modules self-contained
- Use barrel exports (index.ts) for clean imports
- Maintain consistent naming conventions
- Document complex logic

---

## Environment Setup

### Required Environment Variables
- `EXPO_PUBLIC_API_URL` - API base URL
- `EXPO_PUBLIC_ENV` - Environment (development/staging/production)

See `ENV_SETUP.md` for detailed setup instructions.

---

## Known Issues & Limitations

1. **Screens are placeholders** - Need actual UI implementation
2. **No form validation** - Need validation library
3. **No theme system** - Need color/typography definitions
4. **Limited error handling** - Need better error boundaries
5. **No loading states** - Need loading components
6. **Empty utility files** - Need date/common type utilities

---

*Last indexed: Updated after auth context implementation*
*Project: MyNHS v1.0.0*
*Status: Foundation Complete - Ready for UI Implementation*
