import {
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  ForgotPasswordOtpScreen,
  EnterOtpScreen,
  VerifyEmailScreen
} from "@/features/auth/screens";

import type { AuthStackParamList } from "./NavigationParamTypes";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<AuthStackParamList>();
/**
 * Note for future: If you somehow animate the navigation between Auth and Main,
 * you need to make them use the same stack navigator for smoother transitions.
 */

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{
        animationTypeForReplace: 'pop',
      }} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="EnterOtp" component={EnterOtpScreen} />
      <Stack.Screen name="ForgotPasswordOtp" component={ForgotPasswordOtpScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    </Stack.Navigator>
  );
}

