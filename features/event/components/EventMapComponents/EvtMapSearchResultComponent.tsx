import { Pressable, View, StyleSheet, Text } from 'react-native';
import { EventMapPoint } from '../../types';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onSelect: (point: EventMapPoint) => void;
  item: EventMapPoint;
  tagColor: string;
  tagIconUrl?: string | null;
  name: string;
  address?: string;
};

export default function EvtMapSearchResultComponent({ onSelect, item, tagColor, tagIconUrl, name, address }: Props) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  return (
    <Pressable
      onPress={() => onSelect(item)}
      style={resultStyles.row}
      android_ripple={{ color: isDarkColorScheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
      {/* Tag icon */}
      <View style={[resultStyles.iconWrap, { backgroundColor: `${tagColor}`, borderColor: `${tagColor}` }]}>
        {tagIconUrl ? (
          <Image source={{ uri: tagIconUrl }} style={resultStyles.tagIcon} contentFit="cover" />
        ) : (
          <Ionicons name="location" size={16} color={tagColor} />
        )}
      </View>

      {/* Name + address */}
      <View style={resultStyles.textWrap}>
        <Text style={[resultStyles.nameText, { color: theme.foreground }]} numberOfLines={1}>
          {name}
        </Text>
        {address ? (
          <Text style={[resultStyles.addressText, { color: theme.mutedForeground }]} numberOfLines={1}>
            {address}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const resultStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tagIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  nameText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 11,
  },
});
