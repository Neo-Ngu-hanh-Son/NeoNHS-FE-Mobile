import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import type { RootStackParamList } from './NavigationParamTypes';
import { useTheme } from '@/app/providers/ThemeProvider';
import { NAV_THEME } from '@/lib/theme';
import { PanoramaProvider } from '../providers/PanoramaProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { colorScheme, isDarkColorScheme } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}
