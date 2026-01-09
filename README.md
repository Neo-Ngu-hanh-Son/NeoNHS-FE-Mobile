# MyNHS - React Native Mobile Application

A modern, feature-based mobile application built with React Native and Expo, designed for NHS (National Health Service) functionality.

## 📱 What is MyNHS?

MyNHS is a cross-platform mobile application that provides a secure authentication system and modular architecture for NHS-related services. The app is built with scalability and maintainability in mind, following best practices in React Native development.

## ✨ Key Features

- **Secure Authentication System**: Complete auth flow with login, registration, and token management
- **Modern Navigation**: Stack and tab-based navigation with type-safe routing
- **API Integration**: Axios-based HTTP client with request/response interceptors
- **State Management**: React Context API with reducer pattern for predictable state updates
- **Persistent Storage**: Secure token storage with AsyncStorage
- **Feature-Based Architecture**: Modular structure for easy feature additions
- **TypeScript Support**: Full type safety across the application
- **Responsive UI**: Ant Design React Native components

## 🛠️ Technology Stack

### Core Framework

- **React Native** 0.81.5
- **Expo** ~54.0.31
- **TypeScript** ~5.9.2
- **React** 19.1.0

### Navigation

- **React Navigation** 7.x
  - Stack Navigator for screen transitions
  - Bottom Tabs Navigator for main app navigation
  - Type-safe navigation with TypeScript

### UI & Components

- **Ant Design React Native** ^5.4.3 - Production-ready UI components
- **Ant Design Icons** ^2.3.2 - Icon library
- **Expo Vector Icons** ^15.0.3 - Additional icons

### HTTP & API

- **Axios** ^1.13.2 - HTTP client with interceptors
- **Custom API Client** - Centralized API layer with error handling

### Storage & State

- **AsyncStorage** 2.2.0 - Persistent local storage
- **React Context API** - Global state management
- **useReducer** - Predictable state updates

### Utilities

- **react-native-safe-area-context** - Handle device notches and safe areas
- **react-native-gesture-handler** - Touch gesture handling
- **react-native-reanimated** - Smooth animations

### Development & Testing

- **Jest** ^30.2.0 - Unit testing framework
- **TypeScript** - Static type checking
- **Babel** - JavaScript transpilation

## 📁 Project Structure

```
MyNHS/
├── src/
│   ├── app/                    # Application core
│   │   ├── App.tsx            # Root component
│   │   ├── navigations/       # Navigation configuration
│   │   └── providers/         # Context providers
│   ├── features/              # Feature modules
│   │   ├── auth/             # Authentication feature
│   │   ├── home/             # Home screen feature
│   │   └── profile/          # Profile feature
│   ├── services/             # API and external services
│   │   └── api/             # Axios API client
│   ├── components/           # Shared UI components
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── theme/               # Theming configuration
│   └── types/               # TypeScript definitions
├── assets/                  # Static assets (images, fonts)
├── tests/                   # Test files
└── docs/                    # Documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **iOS Simulator** (Mac only) or **Android Emulator**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd NeoNHS
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the API URL and environment settings:
     ```
     EXPO_PUBLIC_API_URL=https://your-api-url.com
     EXPO_PUBLIC_ENV=development
     ```

### Running the Application

#### Development Mode

```bash
npm start
```

#### Run on iOS Simulator

```bash
npm run ios
```

#### Run on Android Emulator

```bash
npm run android
```

#### Run on Web

```bash
npm run web
```

### Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## 🏗️ Architecture

### Feature-Based Structure

Each feature module is self-contained with:

- **screens/** - UI screens for the feature
- **components/** - Feature-specific components
- **hooks/** - Feature-specific hooks
- **services/** - API services for the feature
- **types.ts** - TypeScript type definitions

### Navigation Hierarchy

```
RootNavigator
├── AuthNavigator (when not authenticated)
│   ├── Login Screen
│   └── Register Screen
└── MainNavigator (when authenticated)
    └── TabsNavigator
        ├── Home Tab
        └── Profile Tab
```

### State Management

- **Authentication**: Context API with useReducer
- **API Calls**: Custom useApi hook with loading/error states
- **Local Storage**: AsyncStorage wrapper utility

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- [API Client Documentation](docs/API_CLIENT.md)
- [Authentication System](docs/AUTH_SYSTEM.md)
- [Environment Setup](docs/ENVIRONMENT_SETUP.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)
- [Codebase Index](CODEBASE_INDEX.md) - Comprehensive project overview

## 🔧 Current Implementation Status

### ✅ Completed

- Project infrastructure and configuration
- Navigation system (Root, Auth, Main, Tabs)
- API client with interceptors and error handling
- Authentication context and state management
- Token storage and auto-logout
- Utility functions (logger, storage, constants)
- Provider setup

### 🚧 In Progress / Placeholders

- Login and Register screen UI
- Home screen content
- Profile screen implementation
- Shared UI components library
- Theme system
- Form validation

## 🤝 Contributing

1. Follow the feature-based architecture pattern
2. Maintain TypeScript type safety
3. Add tests for new features
4. Update documentation as needed
5. Follow existing code style and conventions

## 📝 License

[Include your license information here]

## 👥 Team

NeoNHS Development Team

---

**Version:** 1.0.0  
**Last Updated:** January 2026
