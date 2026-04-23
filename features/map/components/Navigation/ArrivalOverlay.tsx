import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';

type ArrivalOverlayProps = {
  onExit: () => void;
};

export default function ArrivalOverlay({ onExit }: ArrivalOverlayProps) {
  const { t } = useTranslation();
  return (
    <View pointerEvents="box-none" className="absolute inset-0 items-center justify-center px-6">
      <View className="w-full items-center rounded-3xl px-6 py-8" style={{ backgroundColor: 'rgba(21,128,61,0.96)' }}>
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-white/20">
          <Ionicons name="checkmark-circle" size={36} color="#ffffff" />
        </View>

        <Text className="mb-1 text-center text-xl font-bold text-white">{t('map.you_arrived', 'You have arrived!')}</Text>
        <Text className="mb-6 text-center text-sm text-white/85">
          {t('map.enjoy_stay', 'Enjoy your stay at this location. Feel free to explore nearby points of interest and earn rewards!')}
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Close navigation"
          activeOpacity={0.85}
          onPress={onExit}
          className="w-full flex-row items-center justify-center gap-2 rounded-full py-3"
          style={{ backgroundColor: '#ffffff' }}>
          <Text className="text-sm font-bold" style={{ color: '#15803d' }}>
            {t('common.done', 'Done')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
