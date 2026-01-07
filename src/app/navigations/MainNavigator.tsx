import { createStackNavigator } from "@react-navigation/stack";
import TabsNavigator from "./TabsNavigator";
import ProfileScreen from "@/features/profile/screens/ProfileScreen";
import HomeScreen from "@/features/home/screens/HomeScreen";
import type { MainStackParamList } from "./types";

const Stack = createStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="Tabs" screenOptions={{ animation: "fade" }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}
