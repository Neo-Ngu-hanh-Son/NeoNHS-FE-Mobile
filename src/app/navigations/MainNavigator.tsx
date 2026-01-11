import { createStackNavigator } from "@react-navigation/stack";
import TabsNavigator from "./TabsNavigator";
import ProfileScreen from "@/features/profile/screens/ProfileScreen";
import HomeScreen from "@/features/home/screens/HomeScreen";
import { MainStackParamList, TabsStackParamList } from "./NavigationParamTypes";

const Stack = createStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ animation: "fade" }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
