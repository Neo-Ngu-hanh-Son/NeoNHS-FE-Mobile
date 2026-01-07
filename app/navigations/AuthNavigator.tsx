import { createStackNavigator } from "@react-navigation/stack";
import { LoginScreen, RegisterScreen } from "@/features/auth/screens";

import type { AuthStackParamList } from "./types";

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
