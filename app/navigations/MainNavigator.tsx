import { createStackNavigator } from "@react-navigation/stack";
import TabsNavigator from "./TabsNavigator";
import UpdateAccountScreen from "@/features/profile/screens/UpdateAccountScreen";
import { MainStackParamList } from "./NavigationParamTypes";

const Stack = createStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="UpdateAccount" component={UpdateAccountScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
