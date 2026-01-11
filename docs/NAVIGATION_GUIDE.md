# Navigation Guide

This guide explains how to implement navigation for new screens in the NeoNHS application, including how to get navigation and route objects.

## Table of Contents

- [Overview](#overview)
- [Navigation Structure](#navigation-structure)
- [Adding a New Screen](#adding-a-new-screen)
- [Getting Navigation and Route Objects](#getting-navigation-and-route-objects)
- [Navigation Methods](#navigation-methods)
- [Passing Parameters](#passing-parameters)
- [TypeScript Typing](#typescript-typing)
- [Best Practices](#best-practices)

## Overview

The NeoNHS app uses **React Navigation** (v6) with the following navigator types:
- **Stack Navigator** - For hierarchical navigation with push/pop
- **Bottom Tab Navigator** - For main app screens accessible via tabs
- **Composite Navigation** - Combining multiple navigators

The navigation structure follows this hierarchy:
```
RootNavigator (Stack)
├── AuthNavigator (Stack) - Authentication flow
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   └── ForgotPasswordOtp
└── MainNavigator (Stack) - Main app flow
    └── TabsNavigator (Bottom Tabs)
        ├── Home
        └── Profile
```

## Navigation Structure

### Root Navigator (`RootNavigator.tsx`)
The top-level navigator that switches between authenticated and unauthenticated states.

### Auth Navigator (`AuthNavigator.tsx`)
Handles all authentication-related screens (login, register, password reset).

### Main Navigator (`MainNavigator.tsx`)
Contains the main application flow. Currently wraps the Tabs Navigator but can include additional stack screens.

### Tabs Navigator (`TabsNavigator.tsx`)
Bottom tab navigator for main app screens (Home, Profile, etc.).

## Adding a New Screen

### Step 1: Create the Screen Component

Create your screen component in the appropriate feature folder:

```typescript
// src/features/your-feature/screens/YourScreen.tsx
import { View, Text } from "@ant-design/react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { CompositeScreenProps } from "@react-navigation/native";
import { YourStackParamList, RootStackParamList } from "@/app/navigations/NavigationParamTypes";

type YourScreenProps = CompositeScreenProps<
  StackScreenProps<YourStackParamList, "YourScreen">,
  StackScreenProps<RootStackParamList>
>;

export default function YourScreen({ navigation, route }: YourScreenProps) {
  return (
    <View>
      <Text>Your Screen Content</Text>
    </View>
  );
}
```

### Step 2: Update Navigation Parameter Types

Add your screen to the appropriate param list in `NavigationParamTypes.ts`:

```typescript
// src/app/navigations/NavigationParamTypes.ts

// For a new tab screen:
export type TabsStackParamList = {
    Home: undefined;
    Profile: undefined;
    YourScreen: undefined; // Add this
};

// For a new auth screen:
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    ForgotPasswordOtp: undefined;
    YourScreen: undefined; // Add this
};

// For a new main stack screen (not in tabs):
export type MainStackParamList = {
    Tabs: NavigatorScreenParams<TabsStackParamList>;
    YourScreen: undefined; // Add this
};
```

**Note:** If your screen accepts parameters, define them instead of `undefined`:

```typescript
export type MainStackParamList = {
    Tabs: NavigatorScreenParams<TabsStackParamList>;
    DetailScreen: { 
        itemId: string;
        title?: string;
    };
};
```

### Step 3: Register the Screen in Navigator

Add your screen to the appropriate navigator file:

#### For Tab Screens (`TabsNavigator.tsx`):

```typescript
import YourScreen from "@/features/your-feature/screens/YourScreen";

export default function TabsNavigator() {
  return (
    <Tab.Navigator>
      {/* ... existing screens ... */}
      <Tab.Screen
        name="YourScreen"
        component={YourScreen}
        options={{
          title: "Your Screen",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="your-icon-name" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

#### For Auth Screens (`AuthNavigator.tsx`):

```typescript
import YourScreen from "@/features/your-feature/screens/YourScreen";

export default function AuthNavigator() {
  return (
    <Stack.Navigator>
      {/* ... existing screens ... */}
      <Stack.Screen 
        name="YourScreen" 
        component={YourScreen}
        options={{ headerShown: false }} // or customize header
      />
    </Stack.Navigator>
  );
}
```

#### For Main Stack Screens (`MainNavigator.tsx`):

```typescript
import YourScreen from "@/features/your-feature/screens/YourScreen";

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      <Stack.Screen 
        name="YourScreen" 
        component={YourScreen}
        options={{ title: "Your Screen" }}
      />
    </Stack.Navigator>
  );
}
```

## Getting Navigation and Route Objects

### Method 1: Props (Recommended)

The most common and type-safe way is to receive `navigation` and `route` as props:

```typescript
import { StackScreenProps } from "@react-navigation/stack";
import { CompositeScreenProps } from "@react-navigation/native";
import { YourStackParamList, RootStackParamList } from "@/app/navigations/NavigationParamTypes";

type YourScreenProps = CompositeScreenProps<
  StackScreenProps<YourStackParamList, "YourScreen">,
  StackScreenProps<RootStackParamList>
>;

export default function YourScreen({ navigation, route }: YourScreenProps) {
  // Use navigation and route here
  const itemId = route.params?.itemId; // Access route parameters
  
  return (
    <View>
      <Button onPress={() => navigation.navigate("OtherScreen")}>
        Navigate
      </Button>
    </View>
  );
}
```

### Method 2: Hooks (Alternative)

You can also use hooks, but you'll need to manually type them:

```typescript
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { YourStackParamList } from "@/app/navigations/NavigationParamTypes";

type NavigationProp = StackNavigationProp<YourStackParamList, "YourScreen">;

export default function YourScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  
  // Access params (less type-safe with hooks)
  const params = route.params as YourStackParamList["YourScreen"];
  
  return (
    <View>
      <Button onPress={() => navigation.navigate("OtherScreen")}>
        Navigate
      </Button>
    </View>
  );
}
```

**Note:** Using props is recommended because:
- Better TypeScript inference
- Automatic type checking for route params
- Cleaner code
- Matches React Navigation's recommended pattern

## Navigation Methods

### Basic Navigation

```typescript
// Navigate to a screen (pushes onto stack)
navigation.navigate("ScreenName");

// Navigate with parameters
navigation.navigate("DetailScreen", { itemId: "123", title: "Details" });

// Navigate to nested navigator
navigation.navigate("Main", {
  screen: "Tabs",
  params: { screen: "Home" }
});
```

### Replace Navigation

```typescript
// Replace current screen (removes from stack)
navigation.replace("ScreenName");

// Replace with nested navigation
navigation.replace("Main", {
  screen: "Tabs",
  params: { screen: "Home" }
});
```

### Go Back

```typescript
// Go back to previous screen
navigation.goBack();

// Go back to a specific screen (if it exists in stack)
navigation.navigate("PreviousScreen");
```

### Reset Navigation Stack

```typescript
import { CommonActions } from "@react-navigation/native";

// Reset entire navigation stack
navigation.dispatch(
  CommonActions.reset({
    index: 0,
    routes: [
      { name: "Auth", params: { screen: "Login" } }
    ],
  })
);
```

### Example: Navigation from Login Screen

```typescript
// From LoginScreen.tsx
const handleLogin = async (values: { email: string; password: string }) => {
  try {
    await login(values);
    // Navigate to main app after successful login
    navigation.replace("Main", {
      screen: "Tabs",
      params: { screen: "Home" },
    });
  } catch (error) {
    // Handle error
  }
};
```

### Example: Logout Navigation

```typescript
// From HomeScreen.tsx
const handleLogout = async () => {
  try {
    await logout();
    // Reset navigation stack and go to login
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "Auth",
            params: { screen: "Login" },
          },
        ],
      })
    );
  } catch (error) {
    // Handle error
  }
};
```

## Passing Parameters

### Define Parameters in Types

```typescript
// NavigationParamTypes.ts
export type MainStackParamList = {
    Tabs: NavigatorScreenParams<TabsStackParamList>;
    DetailScreen: {
        itemId: string;
        title?: string;
        userId: number;
    };
};
```

### Navigate with Parameters

```typescript
// Navigate to DetailScreen with parameters
navigation.navigate("DetailScreen", {
  itemId: "123",
  title: "Product Details",
  userId: 456
});
```

### Access Parameters in Screen

```typescript
type DetailScreenProps = CompositeScreenProps<
  StackScreenProps<MainStackParamList, "DetailScreen">,
  StackScreenProps<RootStackParamList>
>;

export default function DetailScreen({ navigation, route }: DetailScreenProps) {
  // Access parameters with full type safety
  const { itemId, title, userId } = route.params;
  
  return (
    <View>
      <Text>Item ID: {itemId}</Text>
      <Text>Title: {title}</Text>
      <Text>User ID: {userId}</Text>
    </View>
  );
}
```

### Optional Parameters

If parameters are optional, use optional chaining:

```typescript
const title = route.params?.title || "Default Title";
```

## TypeScript Typing

### Understanding CompositeScreenProps

`CompositeScreenProps` combines multiple navigation prop types to allow navigation across different navigators:

```typescript
type YourScreenProps = CompositeScreenProps<
  StackScreenProps<YourStackParamList, "YourScreen">,  // Direct parent navigator
  StackScreenProps<RootStackParamList>                  // Root navigator (for cross-navigator navigation)
>;
```

This allows you to:
- Navigate within your current navigator
- Navigate to screens in parent navigators
- Access route params with full type safety

### Type Definitions Location

All navigation types are defined in:
- `src/app/navigations/NavigationParamTypes.ts`

Keep this file updated when adding new screens or parameters.

## Best Practices

### 1. **Use Props Over Hooks**
Prefer receiving `navigation` and `route` as props for better type safety.

### 2. **Always Update Types**
When adding a new screen, always update `NavigationParamTypes.ts` first.

### 3. **Use Descriptive Screen Names**
Use clear, descriptive names for screens (e.g., `ProductDetailScreen` not `Detail`).

### 4. **Organize by Feature**
Place screens in their respective feature folders:
```
features/
  └── your-feature/
      └── screens/
          └── YourScreen.tsx
```

### 5. **Use CompositeScreenProps for Cross-Navigator Navigation**
When you need to navigate to screens in different navigators, use `CompositeScreenProps`.

### 6. **Handle Optional Parameters Safely**
Always check for optional parameters before using them.

### 7. **Use Replace for Authentication Flows**
Use `navigation.replace()` instead of `navigate()` when switching between auth and main flows to prevent back navigation.

### 8. **Use Reset for Complete Navigation Resets**
Use `CommonActions.reset()` when you want to completely reset the navigation stack (e.g., after logout).

### 9. **Keep Navigators Focused**
- Auth Navigator: Only authentication screens
- Tabs Navigator: Only main app screens accessible via tabs
- Main Navigator: Additional stack screens not in tabs

### 10. **Export Screens from Index Files**
Use barrel exports for cleaner imports:

```typescript
// features/your-feature/screens/index.ts
export { default as YourScreen } from "./YourScreen";
export { default as AnotherScreen } from "./AnotherScreen";
```

Then import:
```typescript
import { YourScreen, AnotherScreen } from "@/features/your-feature/screens";
```

## Common Patterns

### Pattern 1: Simple Screen Navigation

```typescript
// Navigate to another screen in the same navigator
<Button onPress={() => navigation.navigate("OtherScreen")}>
  Go to Other Screen
</Button>
```

### Pattern 2: Navigation with Parameters

```typescript
<Button 
  onPress={() => navigation.navigate("DetailScreen", { itemId: "123" })}
>
  View Details
</Button>
```

### Pattern 3: Using AppLink Component

```typescript
import AppLink from "@/components/Navigator/AppLink";

<AppLink screen="Register" params={{}}>
  Register Now
</AppLink>
```

### Pattern 4: Conditional Navigation

```typescript
const handleAction = async () => {
  try {
    const result = await someAction();
    if (result.success) {
      navigation.navigate("SuccessScreen");
    } else {
      navigation.navigate("ErrorScreen", { error: result.error });
    }
  } catch (error) {
    // Handle error
  }
};
```

## Troubleshooting

### Issue: TypeScript errors when navigating

**Solution:** Ensure you've:
1. Added the screen to the appropriate `ParamList` in `NavigationParamTypes.ts`
2. Used the correct type for `CompositeScreenProps`
3. Registered the screen in the navigator

### Issue: Cannot navigate to screen in different navigator

**Solution:** Use `CompositeScreenProps` with the root navigator type, or use nested navigation:

```typescript
navigation.navigate("Main", {
  screen: "Tabs",
  params: { screen: "Home" }
});
```

### Issue: Route params are undefined

**Solution:** 
1. Check that parameters are defined in the `ParamList` type
2. Ensure you're passing parameters when navigating
3. Use optional chaining: `route.params?.paramName`

## Additional Resources

- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [Type Checking with TypeScript](https://reactnavigation.org/docs/typescript)
- [Navigation Actions](https://reactnavigation.org/docs/navigation-actions)

---

**Last Updated:** Based on React Navigation v6 and the current NeoNHS codebase structure.
