import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import type { RootStackParamList } from './NavigationParamTypes';
import { useTheme } from '@/app/providers/ThemeProvider';
import { NAV_THEME } from '@/lib/theme';
import { PanoramaProvider } from '../providers/PanoramaProvider';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { colorScheme, isDarkColorScheme } = useTheme();

  // Show loading screen while initializing auth state or theme
  // if (!isInitialized || isThemeLoading) {
  //   return <LoadingOverlay visible={true} message="Initializing..." />;
  // }

  return (
    <View className={`flex-1 ${isDarkColorScheme ? 'dark' : ''}`}>
      <NavigationContainer theme={NAV_THEME[colorScheme]}>
        <PanoramaProvider>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </Stack.Navigator>
        </PanoramaProvider>
      </NavigationContainer>
    </View>
  );
}
