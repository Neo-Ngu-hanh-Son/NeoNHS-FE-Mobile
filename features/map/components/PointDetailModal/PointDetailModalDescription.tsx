import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { MapPoint } from '../../types';
import { THEME } from '@/lib/theme';
import { useTheme } from '@/app/providers/ThemeProvider';

type PointDetailModalDescriptionProps = {
  point: MapPoint;
};

export default function PointDetailModalDescription({ point }: PointDetailModalDescriptionProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  return (
    <View style={{ marginBottom: 20 }}>
      {point.description && (
        <Text
          style={[styles.description, { color: theme.foreground }]}
          ellipsizeMode="tail"
          numberOfLines={3}>
          {point.description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
});
