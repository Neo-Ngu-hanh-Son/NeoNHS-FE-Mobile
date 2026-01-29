import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ProfileScreen from "@/features/profile/screens/ProfileScreen";
import HomeScreenNew from "@/features/home/screens/HomeScreenNew";
import type { TabsStackParamList } from "./NavigationParamTypes";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

const Tab = createBottomTabNavigator<TabsStackParamList>();

export default function TabsNavigator() {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        animation: "shift"
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreenNew}
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
