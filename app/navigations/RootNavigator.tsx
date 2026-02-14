import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import type { RootStackParamList } from './NavigationParamTypes';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/app/providers/ThemeProvider';
import { NAV_THEME } from '@/lib/theme';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isInitialized } = useAuth();
  const { colorScheme, isDarkColorScheme, isLoading: isThemeLoading } = useTheme();

  // Show loading screen while initializing auth state or theme
  // if (!isInitialized || isThemeLoading) {
  //   return <LoadingOverlay visible={true} message="Initializing..." />;
  // }

  return (
    <View className={`flex-1 ${isDarkColorScheme ? 'dark' : ''}`}>
      <NavigationContainer theme={NAV_THEME[colorScheme]}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
