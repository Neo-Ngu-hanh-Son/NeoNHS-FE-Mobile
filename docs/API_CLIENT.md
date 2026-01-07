# API Client Usage Guide

## Overview

The API client is built with **Axios** and provides a robust HTTP client with interceptors, automatic JSON parsing, and comprehensive error handling.

## Quick Start

### Configuration

The API client is already configured in `app/providers/ApiProvider.tsx`. It automatically:

- Injects authentication tokens into requests
- Handles unauthorized errors (auto-logout)
- Transforms responses to a consistent format
- Provides global error handling

### Basic Usage

```typescript
import { apiClient } from "@/services/api";
import { endpoints } from "@/services/api";

// GET request
const response = await apiClient.get<User>(endpoints.users.getProfile());

// GET with query parameters
const response = await apiClient.get<User[]>(endpoints.users.getUsers(), {
  params: { page: 1, limit: 10 },
});

// POST request
const response = await apiClient.post<LoginResponse>(
  endpoints.auth.login(),
  { email, password },
  { requiresAuth: false }
);

// PUT request
const response = await apiClient.put<User>(endpoints.users.updateProfile(), { name: "New Name" });

// PATCH request
const response = await apiClient.patch<User>(endpoints.users.updateProfile(), {
  name: "Updated Name",
});

// DELETE request
const response = await apiClient.delete<void>(endpoints.users.deleteUser(userId));
```

## Using the useApi Hook

For React components, use the `useApi` hook for automatic loading and error states (or just import and use
normally like the basic usage section):

```typescript
import { useApi } from "@/hooks";
import { userService } from "@/services/api/userService";

function ProfileScreen() {
  const { data: user, loading, error, execute } = useApi(userService.getProfile);

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (!user) return null;

  return <Text>Welcome, {user.name}!</Text>;
}
```

## Creating Service Functions

Create service files for each feature area:

```typescript
// services/api/userService.ts
import { apiClient } from "./client";
import { endpoints } from "./endpoints";

export const userService = {
  getProfile: () => apiClient.get<User>(endpoints.users.getProfile()),

  updateProfile: (data: Partial<User>) =>
    apiClient.put<User>(endpoints.users.updateProfile(), data),

  getUserById: (id: string) => apiClient.get<User>(endpoints.users.getUserById(id)),
};
```

## Error Handling

The API client automatically handles errors:

```typescript
try {
  const response = await apiClient.get<User>("/users/123");
  // Handle success
} catch (error) {
  const apiError = error as ApiError;

  switch (apiError.code) {
    case ApiErrorCode.UNAUTHORIZED:
      // Handle unauthorized (auto-logout already handled)
      break;
    case ApiErrorCode.NETWORK_ERROR:
      // Handle network error
      break;
    default:
    // Handle other errors
  }
}
```

## Configuration

### Environment Variables

Set your API base URL in `.env`:

```
EXPO_PUBLIC_API_URL=https://api.yourserver.com
```

If you forget to set in .env, the default will be used here `utils/constants.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: "https://api.yourserver.com",
  TIMEOUT: 30000,
};
```

### Custom Headers

```typescript
apiClient.updateConfig({
  headers: {
    "X-Custom-Header": "value",
  },
});
```

## API Response Format

Responses are automatically transformed to:

```typescript
{
    data: T,           // Your actual data
    message?: string,  // Optional message
    status: number,    // HTTP status
}
```

If you want to transform it by yourself, add `transformData == false` in the api methods

```typescript
    const response = await apiClient.get<string>("posts/1", {
        transformData: false,
        // ... other config
    });
```

## Advanced Usage

### Access Axios Instance

```typescript
import { apiClient } from "@/services/api";

const axiosInstance = apiClient.getAxiosInstance();
// Use axios features directly
```

### Request Cancellation

```typescript
const controller = new AbortController();

apiClient.get("/users", {
  signal: controller.signal,
});

// Cancel the request
controller.abort();
```

## Best Practices

1. **Use TypeScript types** - Always define types for requests and responses
2. **Centralize endpoints** - Use `endpoints.ts` for all API paths
3. **Handle errors** - Always wrap API calls in try-catch
4. **Service layer** - Create service functions instead of calling API directly in components
5. **Token management** - Tokens are automatically managed by ApiProvider
