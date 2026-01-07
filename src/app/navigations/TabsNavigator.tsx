import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProfileScreen from "@/features/profile/screens/ProfileScreen";
import HomeScreen from "@/features/home/screens/HomeScreen";
import type { TabsStackParamList } from "./types";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator<TabsStackParamList>();

export default function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1890ff",
        tabBarInactiveTintColor: "#8c8c8c",
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
