import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '@/features/home/screens/HomeScreen';
import { DiscoverScreen } from '@/features/discover/screens';
import { CheckinCompleteScreen, MapScreen } from '@/features/map/screens';
// import { BookingsScreen } from '@/features/bookings/screens';
import ProfileScreen from '@/features/profile/screens/ProfileScreen';
import CartListScreen from '@/features/cart/screens/CartListScreen';
import ChatRoomListScreen from '@/features/chat/screens/ChatRoomListScreen';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import type { TabsStackParamList } from './NavigationParamTypes';
import { useTranslation } from 'react-i18next';
import CustomTabBarButton from './components/MapTabBarButton';

const Tab = createBottomTabNavigator<TabsStackParamList>();

export default function TabsNavigator() {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // Calculate tab bar height with safe area bottom inset
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        freezeOnBlur: true,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          height: tabBarHeight,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        // animation: 'shift',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          title: t('tabs.discover'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: t('tabs.map'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} color={color} size={size} />
          ),
        }}
      />
      {/* // <Tab.Screen
      //   name="Map"
      //   component={MapScreen}
      //   options={{
      //     title: 'Map',
      //     tabBarIcon: ({ focused, size }) => (
      //       <Ionicons name={focused ? 'map' : 'map-outline'} size={size} color="#FFFFFF" />
      //     ),
      //     // Use the custom button wrapper here
      //     tabBarButton: (props) => {
      //       return <CustomTabBarButton {...props} onPress={props.onPress} theme={theme}></CustomTabBarButton>;
      //     },
      //     tabBarLabel: () => null, // Hide the label for the Map tab
      //   }}
      // /> */}
      <Tab.Screen
        name="TestCart"
        component={CartListScreen}
        options={{
          title: t('cart.title'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Chat"
        component={ChatRoomListScreen}
        options={{
          title: t('tabs.chat'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
