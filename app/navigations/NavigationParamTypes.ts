// navigation/types.ts
import type { NavigatorScreenParams } from "@react-navigation/native";

/**
 * Authentication Stack Navigation Parameters
 * Contains screens for user authentication flow
 */
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    ForgotPasswordOtp: undefined;
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
 * Contains the primary app flow including the bottom tabs (Put your other main app screens here if they are not in the tabs navigator)
 */
export type MainStackParamList = {
    Tabs: NavigatorScreenParams<TabsStackParamList>;
    UpdateAccount: undefined;
};


/**
 * Root Stack Navigation Parameters
 * Top-level navigation that switches between Auth and Main flows
 */
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainStackParamList>;
};