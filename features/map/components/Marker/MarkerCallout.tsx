import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { Callout } from 'react-native-maps';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MapPoint } from '../../types';

interface MarkerCalloutProps {
  point: MapPoint;
  onPress?: (point: MapPoint) => void;
}

export default function MarkerCallout({ point, onPress }: MarkerCalloutProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <Callout tooltip onPress={() => onPress?.(point)}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {/* Header */}
        <View style={styles.header}>
          <View className="h-10 w-10 rounded-md border" style={{ borderColor: theme.border }}>
            <Image
              source={require('@/assets/images/NeoNHSLogo.png')}
              className="h-full w-full rounded-md object-cover"
              style={{ width: 40, height: 40, borderRadius: 6 }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.foreground }]}>{point.name}</Text>
            <Text style={{ color: theme.muted, fontSize: 12 }}>{point.type}</Text>
          </View>
        </View>

        {/* Description */}
        {point.description && (
          <Text numberOfLines={3} style={[styles.description, { color: theme.foreground }]}>
            {point.description}
          </Text>
        )}

        {/* CTA */}
        <Pressable
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => onPress?.(point)}>
          <Text style={styles.buttonText}>View Destination</Text>
        </Pressable>
      </View>
    </Callout>
  );
}

const styles = StyleSheet.create({
  /* Marker */
  markerContainer: { alignItems: 'center' },
  markerBubble: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 5,
  },
  markerIcon: { fontSize: 16 },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },

  /* Callout card */
  card: {
    width: 280,
    borderRadius: 16,
    padding: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderColor: 'gray',
    borderWidth: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    marginVertical: 8,
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
