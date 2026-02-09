import { createStackNavigator } from "@react-navigation/stack";
import TabsNavigator from "./TabsNavigator";
import UpdateAccountScreen from "@/features/profile/screens/UpdateAccountScreen";
import ChangePasswordScreen from "@/features/profile/screens/ChangePasswordScreen";
import TransactionHistoryScreen from "@/features/profile/screens/TransactionHistoryScreen";
import TransactionDetailsScreen from "@/features/profile/screens/TransactionDetailsScreen";
import { MainStackParamList } from "./NavigationParamTypes";

const Stack = createStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="UpdateAccount" component={UpdateAccountScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
