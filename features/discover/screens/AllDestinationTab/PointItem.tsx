import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PointPreview } from '@/features/map';
import { SmartImage } from '@/components/ui/smart-image';

const PointItem = memo(({ item, theme, onPress }: {
  item: PointPreview;
  theme: any;
  onPress: (id: string) => void
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="mx-4 mt-3 flex-row items-center gap-4 rounded-3xl border p-3.5"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        // Simple shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
      onPress={() => onPress(item.id)}
    >
      <SmartImage uri={item.thumbnailUrl} className="h-20 w-20 rounded-2xl object-cover" />
      <View className="flex-1 justify-center">
        <Text className="text-lg font-bold tracking-tight" style={{ color: theme.foreground }}>
          {item.name}
        </Text>
        {item.description && (
          <Text className="text-sm mt-1 leading-4" numberOfLines={2} style={{ color: theme.mutedForeground }}>
            {item.description}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.mutedForeground} />
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.description === nextProps.item.description &&
    prevProps.theme.card === nextProps.theme.card;
});

PointItem.displayName = 'PointItem';
export default PointItem;