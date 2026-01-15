import { createStackNavigator } from "@react-navigation/stack";
import {
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  ForgotPasswordOtpScreen,
} from "@/features/auth/screens";

import type { AuthStackParamList } from "./NavigationParamTypes";

const Stack = createStackNavigator<AuthStackParamList>();

/**
 * Note for future: If you somehow animate the navigation between Auth and Main,
 * you need to make them use the same stack navigator for smoother transitions.
 */

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ForgotPasswordOtp" component={ForgotPasswordOtpScreen} />
    </Stack.Navigator>
  );
}
