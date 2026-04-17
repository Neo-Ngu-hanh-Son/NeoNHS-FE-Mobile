import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { MarkerStyle } from '../Marker/MarkerStyles';
import { hexAlpha, StatusInfo } from './helpers';

type PointDetailHeroProps = {
  heroImage: string;
  accentColor: string;
  markerStyle: MarkerStyle;
  typeLabel: string;
  status: StatusInfo | null;
};

export default function PointDetailHero({ heroImage, accentColor, markerStyle, typeLabel, status }: PointDetailHeroProps) {
  return (
    <View style={styles.heroWrap}>
      <Image source={{ uri: heroImage }} style={styles.hero} contentFit="cover" transition={300} />

      {/* Type chip overlaid on image */}
      <View style={[styles.heroTypeChip, { backgroundColor: accentColor }]}>
        <MaterialCommunityIcons name={markerStyle.icon} size={12} color="#fff" />
        <Text style={styles.heroTypeText}>{typeLabel}</Text>
      </View>

      {/* Status badge on image (events/workshops) */}
      {status ? (
        <View style={[styles.heroStatusChip, { backgroundColor: hexAlpha('#000', '55') }]}>
          <Ionicons name={status.icon as any} size={11} color={status.color} style={{ marginRight: 4 }} />
          <Text style={[styles.heroStatusText, { color: status.color }]}>{status.label}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  heroTypeChip: {
    position: 'absolute',
    top: 12,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  heroTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  heroStatusChip: {
    position: 'absolute',
    top: 12,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  heroStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
