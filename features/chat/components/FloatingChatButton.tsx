import React from 'react';
import { View, TouchableOpacity, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/text';
import { useChatContext } from '../context/ChatProvider';

export function FloatingChatButton() {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { totalUnreadCount, isConnected } = useChatContext();

  // Find the exact currently active route name across nested navigators
  const currentRouteName = useNavigationState((state) => {
    if (!state) return null;
    let current: any = state;
    while (current?.routes && current.routes[current.index]?.state) {
      current = current.routes[current.index].state;
    }
    return current?.routes?.[current.index]?.name;
  });

  // Specifically hide on Map & Chat screens
  const hiddenOnScreens = ['Map', 'Chat', 'ChatRoom'];
  if (currentRouteName && hiddenOnScreens.includes(currentRouteName)) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        bottom: insets.bottom + 80, // slightly above the bottom tab bar mapping
        right: 20,
        zIndex: 9999,
      }}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        onPress={() => navigation.navigate('Main', { screen: 'Tabs', params: { screen: 'Chat' } })}
        activeOpacity={0.8}
        className="items-center justify-center shadow-lg"
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.primary,
          elevation: 5, // for android shadow
          shadowColor: '#000', // for ios shadow
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
        }}
      >
        <Ionicons name="chatbubble" size={28} color="#FFFFFF" />
        
        {totalUnreadCount > 0 && (
          <View
            className="absolute -top-1 -right-1 items-center justify-center"
            style={{
              backgroundColor: 'red',
              minWidth: 22,
              height: 22,
              borderRadius: 11,
              paddingHorizontal: 4,
              borderWidth: 2,
              borderColor: theme.background,
            }}
          >
            <Text className="text-white text-xs font-bold" style={{ fontSize: 10 }}>
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
