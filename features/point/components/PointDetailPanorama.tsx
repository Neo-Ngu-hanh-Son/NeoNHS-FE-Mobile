import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { SmartImage } from '@/components/ui/smart-image';
import { MapPoint } from '../../map/types';

type PointDetailPanoramaProps = {
  point: MapPoint;
  onOpenPanorama: () => void;
};

export function PointDetailPanorama({ point, onOpenPanorama }: PointDetailPanoramaProps) {
  if (!point.panoramaImageUrl) return null;

  return (
    <View className="gap-3">
      <Text className="text-xl font-black tracking-tight">360° View</Text>
      <TouchableOpacity
        onPress={onOpenPanorama}
        className="relative h-48 overflow-hidden rounded-2xl border border-border"
        activeOpacity={0.8}>
        <SmartImage uri={point.panoramaImageUrl} className="h-full w-full" />
        {/* Overlay with 360 icon */}
        <View className="absolute inset-0 items-center justify-center bg-black/25">
          <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-white/80 bg-primary/90">
            <Ionicons name="eye" size={28} color="white" />
          </View>
          <Text className="mt-2 text-sm font-bold text-white">Tap to explore</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
