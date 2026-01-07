// navigation/types.ts
import type { NavigatorScreenParams } from "@react-navigation/native";

/**
 * Authentication Stack Navigation Parameters
 * Contains screens for user authentication flow
 */
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

/**
 * Bottom Tabs Navigation Parameters
 * Contains the main app screens accessible via bottom tabs
 */
export type TabsStackParamList = {
    Home: undefined;
    Profile: undefined;
};

/**
 * Main Stack Navigation Parameters
 * Contains screens accessible after authentication
 * Includes both direct stack screens and nested tab navigator
 */
export type MainStackParamList = {
    Tabs: NavigatorScreenParams<TabsStackParamList>;
    Home: undefined;
    Profile: undefined;
};

/**
 * Root Stack Navigation Parameters
 * Top-level navigation that switches between Auth and Main flows
 */
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainStackParamList>;
};

// Re-export for convenience
export type {
    AuthStackParamList as AuthStackParams,
    TabsStackParamList as TabsStackParams,
    MainStackParamList as MainStackParams,
    RootStackParamList as RootStackParams,
};
