import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

export interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  image?: string;
  type: 'entrance' | 'stairs' | 'junction' | 'checkpoint' | 'landmark' | 'waypoint';
}

interface CustomMarkerProps {
  point: MapPoint;
  onPress?: (point: MapPoint) => void;
}

const markerColors: Record<MapPoint['type'], string> = {
  entrance: '#22c55e', // green
  stairs: '#3b82f6', // blue
  junction: '#f59e0b', // amber
  checkpoint: '#ef4444', // red
  landmark: '#8b5cf6', // purple
  waypoint: '#6b7280', // gray
};

const markerIcons: Record<MapPoint['type'], string> = {
  entrance: '🚪',
  stairs: '🪜',
  junction: '🔀',
  checkpoint: '📍',
  landmark: '🏛️',
  waypoint: '•',
};

export default function MarkerVisual({ point }: CustomMarkerProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const markerColor = markerColors[point.type];

  return (
    <View style={styles.markerContainer} className='flex-col gap-2'>
      <View style={[styles.markerBubble, { backgroundColor: markerColor }]}>
        <Text style={styles.markerIcon}>{markerIcons[point.type]}</Text>
      </View>
      <View style={[styles.markerArrow, { borderTopColor: markerColor }]} />
      <View className="bg-white p-2 rounded-md">
        <Text className="text-xs text-center text-black text-pretty">Test some text here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerBubble: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 16,
  },
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
});
