import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  isDarkColorScheme: boolean;
  theme: any;
  navigation: any;
}

export default function DestinationHeader({ isDarkColorScheme, theme, navigation }: Props) {
  let title = 'Destinations';
  return (
    <View className="flex-row items-center justify-between border-b px-4 py-3" style={{ borderColor: theme.border }}>
      <View className="flex-1 flex-row items-center">
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          className="-ml-2 p-2">
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text className="ml-1 text-lg font-bold" style={{ color: theme.foreground }}>
          {title}
        </Text>
      </View>
    </View>
  );
};
