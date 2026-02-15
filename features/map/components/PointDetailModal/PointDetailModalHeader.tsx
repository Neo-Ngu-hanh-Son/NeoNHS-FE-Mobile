import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { MapPoint } from '../../types';
import PointDetailModalBadge from './PointDetailModalBadge';
import { getMarkerStyle } from '../Marker/MarkerStyles';
import { THEME } from '@/lib/theme';
import { useTheme } from '@/app/providers/ThemeProvider';
import { IconButton } from '@/components/Buttons/IconButton';

type PointDetailModalHeaderProps = {
  point: MapPoint;
};
export default function PointDetailModalHeader({ point }: PointDetailModalHeaderProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const style = getMarkerStyle(point.type);
  const typeColor = style.bg;
  const typeIcon = style.icon;
  return (
    <View style={styles.infoSection}>
      <Text style={[styles.title, { color: theme.foreground }]}>{point.name}</Text>
      <View className="mb-2 flex-row justify-start gap-2">
        <IconButton
          variant={'ghost'}
          icon="star"
          size={'sm'}
          color={theme.chart3}
          buttonStyle={styles.buttonStyle}>
          <Text className="text-yellow-600">4.5</Text>
        </IconButton>
        <IconButton
          variant={'ghost'}
          icon="walk"
          size={'sm'}
          color={theme.foreground}
          buttonStyle={styles.buttonStyle}>
          <Text className="text-muted-foreground">250m away</Text>
        </IconButton>
      </View>
      <View className="mb-2">
        <PointDetailModalBadge point={point} typeColor={typeColor} typeIcon={typeIcon} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  infoSection: {},
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
  },
  buttonStyle: {
    paddingLeft: 0,
  },
  coordinates: {
    fontSize: 12,
    justifyContent: 'flex-start',
  },
});
