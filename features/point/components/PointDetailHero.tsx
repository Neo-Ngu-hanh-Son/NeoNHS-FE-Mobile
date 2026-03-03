import React from 'react';
import { View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/text';
import { MapPoint } from '../../map/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HERO_HEIGHT = 460;

const FALLBACK_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB3Ia_EuMeNQ959XrpwY2a1J_TuVJ291xVgqM8xsvUJdodBE7LCnMIA0x-ghOu4lbre-GSjYW13HzY2kLERvBawPRSZpjREaWbILuLpEz2u4Z1UV3VB_cvk4wjtzFiPQWOag9LoI7TPaV9SXrQDmMqJAG3T0ESdAJ2tbESgWdgcV_UMKQLzTe6YywP2RWr_F2LY2mTnUf2fTCWzLxRapDORR6G94zVmM0k1OPeYk9bHR3Hj9yzvwDSeqpLPTHgf4UaOlwNkg75KxtAt';

type PointDetailHeroProps = {
  point: MapPoint;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
};

export function PointDetailHero({
  point,
  isFavorite,
  onBack,
  onToggleFavorite,
  onShare,
}: PointDetailHeroProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="relative" style={{ height: HERO_HEIGHT }}>
      {/* Hero Image */}
      <Image
        source={{ uri: point.thumbnailUrl || FALLBACK_IMAGE }}
        className="absolute inset-0 h-full w-full"
        resizeMode="cover"
      />

      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        locations={[0.35, 1]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      {/* Top navigation buttons */}
      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-5"
        style={{ top: insets.top + 8 }}>
        <TouchableOpacity
          onPress={onBack}
          className="h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/30"
          activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>

        <View className="flex-row gap-2.5">
          <TouchableOpacity
            onPress={onToggleFavorite}
            className="h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/30"
            activeOpacity={0.7}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#f43f5e' : 'white'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onShare}
            className="h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/30"
            activeOpacity={0.7}>
            <Ionicons name="share-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom content overlay */}
      <View className="absolute bottom-8 left-6 right-6">
        {/* Type badge */}
        <View className="mb-3 self-start rounded-full bg-primary/90 px-3.5 py-1.5">
          <Text className="text-[10px] font-black uppercase tracking-widest text-white">
            {point.type || 'LANDMARK'}
          </Text>
        </View>

        {/* Title */}
        <Text className="mb-2.5 text-3xl font-black leading-[38px] text-white">{point.name}</Text>

        {/* Quick info */}
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text className="text-sm font-semibold text-white/90">4.8 (1.2k)</Text>
          </View>
          <View className="h-1 w-1 rounded-full bg-white/40" />
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="walk" size={14} color="white" />
            <Text className="text-sm font-medium text-white/80">15 mins away</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
