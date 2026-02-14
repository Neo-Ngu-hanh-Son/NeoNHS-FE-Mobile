import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { MaterialIcons } from '@expo/vector-icons';
import { MapPoint } from '../../types';

interface PointDetailModalBadgeProps {
  point: MapPoint;
  typeColor: string;
  typeIcon: keyof typeof MaterialIcons.glyphMap;
}

export default function PointDetailModalBadge({
  point,
  typeColor,
  typeIcon,
}: PointDetailModalBadgeProps) {
  return (
    <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
      <MaterialIcons name={typeIcon} size={14} color="white" />
      <Text style={styles.typeBadgeText}>{point.type[0].toUpperCase() + point.type.slice(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    width: 100,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
