import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { SmartImage } from '@/components/ui/smart-image';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MapPoint } from '../../map/types';
import { useTranslation } from 'react-i18next';

type PointDetailLocationProps = {
  point: MapPoint;
  onOpenMap: () => void;
};

export function PointDetailLocation({ point, onOpenMap }: PointDetailLocationProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const googleMapApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAP_API;
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      <Text className="text-xl font-black tracking-tight">{t('point.location')}</Text>
      <TouchableOpacity
        onPress={onOpenMap}
        className="relative h-48 overflow-hidden rounded-2xl border border-border"
        activeOpacity={0.8}>
        <SmartImage
          uri={`https://maps.googleapis.com/maps/api/staticmap?center=${point.latitude},${point.longitude}&zoom=17&size=600x300&markers=color:red%7C${point.latitude},${point.longitude}&key=${googleMapApiKey}`}
          className="h-full w-full"
        />
        <View
          className="absolute bottom-3 right-3 flex-row items-center gap-2 rounded-xl px-4 py-2.5"
          style={{
            backgroundColor: isDarkColorScheme ? 'rgba(23,25,35,0.9)' : 'rgba(255,255,255,0.92)',
          }}>
          <Ionicons name="map-outline" size={15} color={theme.primary} />
          <Text className="text-xs font-bold">{t('point.open_in_maps')}</Text>
        </View>
      </TouchableOpacity>
      <View className="">
        <Text variant="muted" className="text-start">
          {point.address || 'Ngũ Hành Sơn, Đà Nẵng'}
        </Text>
      </View>
    </View>
  );
}
