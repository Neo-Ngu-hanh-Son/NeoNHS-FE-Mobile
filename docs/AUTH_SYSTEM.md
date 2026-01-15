# Authentication System Guide

## Overview

The authentication system provides complete auth state management, token storage, and automatic navigation switching based on authentication status.

## Architecture

- **AuthContext**: React Context with useReducer for state management
- **AuthProvider**: Wraps the app and provides auth state
- **authService**: API service for auth operations
- **Storage**: Automatic token storage in AsyncStorage
- **Navigation**: Automatic switching between Auth/Main stacks

## Usage

### Accessing Auth State

The `AuthProvider` is already set up in `app/providers/Providers.tsx`. Use the `useAuth` hook:

```typescript
import { useAuth } from "@/features/auth";

function MyComponent() {
    const { 
        user, 
        isAuthenticated, 
        isLoading, 
        login, 
        logout 
    } = useAuth();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View>
            {isAuthenticated ? (
                <Text>Welcome, {user?.fullName}!</Text>
            ) : (
                <Text>Please login</Text>
            )}
        </View>
    );
}
```

## Auth Methods

### Login

```typescript
import { useAuth } from "@/features/auth";

function LoginScreen() {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        try {
            setError(null);
            await login({ email, password });
            // Navigation happens automatically via RootNavigator
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        }
    };

    return (
        <View>
            <Button onPress={handleLogin} loading={isLoading}>
                Login
            </Button>
            {error && <Text>{error}</Text>}
        </View>
    );
}
```

### Register

```typescript
import { useAuth } from "@/features/auth";

function RegisterScreen() {
    const { register, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
    });

    const handleRegister = async () => {
        try {
            await register(formData);
            // Redirection is automatically happen in root navigator
        } catch (err) {
            // Handle error
        }
    };

    // ... rest of component
}
```

### Logout

```typescript
import { useAuth } from "@/features/auth";

function ProfileScreen() {
    const { logout, user } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            // User automatically redirected to login screen
        } catch (err) {
            // Handle error
        }
    };

    return (
        <View>
            <Text>Welcome, {user?.fullName}</Text>
            <Button onPress={handleLogout}>Logout</Button>
        </View>
    );
}
```

### Update User Data

```typescript
const { updateUser } = useAuth();

// Update user data in context and storage
updateUser({ fullName: "New Name" });
```

### Refresh Token

```typescript
const { refreshAuth } = useAuth();

// Manually refresh authentication token
await refreshAuth();
```

## Auth State

The auth context provides:

- `user: User | null` - Current user data
- `token: string | null` - Authentication token
- `refreshToken: string | null` - Refresh token (if available)
- `isAuthenticated: boolean` - Whether user is authenticated
- `isLoading: boolean` - Whether an auth operation is in progress
- `isInitialized: boolean` - Whether auth state has been initialized from storage

## Automatic Features

1. **Token Storage**: Tokens are automatically stored in AsyncStorage
2. **Token Injection**: API client automatically includes auth token in requests
3. **Auto Logout**: On 401 errors, user is automatically logged out
4. **Navigation**: RootNavigator automatically switches between Auth and Main stacks
5. **Initialization**: Auth state is loaded from storage on app startup

## Type Definitions

See `features/auth/types.ts` for:
- `User` - User data structure (`userId`, `fullName`, `email`, `phoneNumber`, `avatarUrl`, `roles`, etc.)
- `LoginCredentials` - Login form data (`email`, `password`)
- `RegisterData` - Registration form data (`email`, `password`, `name`)
- `AuthState` - Auth state structure
- `AuthContextValue` - Context value type

## Flow Diagram

```
App Start
  ↓
AuthProvider initializes
  ↓
Load token/user from storage
  ↓
┌─────────────────┬─────────────────┐
│ Token Found     │ No Token        │
│ ↓               │ ↓               │
│ Set Auth State │ Set Unauthenticated
│ ↓               │ ↓               │
│ Main Stack      │ Auth Stack      │
└─────────────────┴─────────────────┘
```

## Integration with API Client

The API client is automatically configured to:
- Use the auth token from context
- Call `logout()` on 401 errors
- Handle unauthorized responses

This is set up in `app/providers/ApiProvider.tsx`.

