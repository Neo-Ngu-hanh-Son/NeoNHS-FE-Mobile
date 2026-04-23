import React from 'react'
import { View, Text } from 'react-native';
import { Attraction } from '@/features/map';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

interface Props {
  attraction: Attraction;
}

export default function DestinationListHeader({ attraction }: Props) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  return (
    <View
      className="px-5 py-4 flex-row items-center justify-between"
      style={{
        backgroundColor: theme.background,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,

        elevation: 2,
      }}
    >
      <View className="flex-1 mr-4">
        <Text
          className="font-black uppercase tracking-[2px]"
          style={{ color: theme.primary }}
        >
          {attraction.name}
        </Text>
        <Text
          className="mt-0.5"
          numberOfLines={1}
          style={{ color: theme.mutedForeground }}
        >
          {attraction.address}
        </Text>
      </View>

      {/* Minimalist Status Badge */}
      <View
        className="flex-row items-center px-2.5 py-1 rounded-full"
        style={{ backgroundColor: attraction.status === 'OPEN' ? '#10b98115' : '#ef444415' }}
      >
        <View
          className={`h-1.5 w-1.5 rounded-full mr-2 ${attraction.status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'}`}
        />
        <Text
          className="text-[10px] font-bold tracking-tight"
          style={{ color: attraction.status === 'OPEN' ? '#10b981' : '#ef4444' }}
        >
          {attraction.status || 'CLOSED'}
        </Text>
      </View>
    </View>
  );
}