import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { Image } from 'expo-image';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { discoverService } from '../services/discoverServices';
import { MapPoint } from '../../map/types';

type Props = StackScreenProps<MainStackParamList, 'ArrivalConfirmation'>;

export default function ArrivalConfirmationScreen({ navigation, route }: Props) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { pointId } = route.params;
  const [point, setPoint] = useState<MapPoint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoint = async () => {
      setLoading(true);
      try {
        const response = await discoverService.getPointById(pointId);
        if (response.success && response.data) {
          setPoint(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch point for arrival confirmation:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPoint();
  }, [pointId]);

  const onShare = async () => {
    if (!point) return;
    try {
      await Share.share({
        message: `I've arrived at ${point.name}! It's amazing here. Shared via NeoNHS.`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Scenic Background with Blur */}
      <Image
        source={{
          uri:
            point?.thumbnailUrl ||
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBiXP9rjKZ38JUBgVn2hBs-HfbKpdrGf5_eWGiTRAyOlhyi8zNHS3TP4vhoABhmKP30d5fuqoBIsn3xPBoaFIdroHYYGUPmLhb2seNBDOujGvicKa44_0vuFPctPL-afvX3cNwghZJz8-eubDL_Gi7AvCA74EcXSbb6-U6jMuB3K0R2tf5aw9R5yIZtjV2LBoeCjPkY9GhWKxIEDeVYbZ-ePZq3bidR0OnsFcgAt9m32xhjCvkcxENR6m9wlU1UCgnWeDjz8Er-dQw0',
        }}
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        blurRadius={4}
      />
      <View className="absolute inset-0 bg-black/20" />

      {/* Header Overlay */}
      <SafeAreaView className="absolute left-0 right-0 top-0 px-6" edges={['top']}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.navigate('Tabs', { screen: 'Discover' } as any)}
            className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/30 backdrop-blur-md">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="rounded-full border border-white/20 bg-white/30 px-4 py-1.5 backdrop-blur-md">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-white">Ngu Hanh Son</Text>
          </View>
          <View className="w-10" />
        </View>
      </SafeAreaView>

      {/* Modal Content */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-sm items-center rounded-[40px] bg-white p-8 shadow-2xl dark:bg-slate-900">
          {/* Success Icon */}
          <View className="relative mb-8">
            <View className="absolute -left-6 -top-4 h-4 w-4 rounded-full bg-amber-200 opacity-60" />
            <View className="absolute -left-10 top-4 h-8 w-8 rounded-full bg-pink-100 opacity-60" />
            <View className="absolute -top-6 left-12 h-6 w-6 rounded-full bg-blue-100 opacity-60" />

            <View className="h-24 w-24 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20">
                <Ionicons name="checkmark" size={40} color="white" />
              </View>
            </View>
          </View>

          {/* Title and Subtitle */}
          <View className="mb-8 items-center">
            <Text className="mb-2 text-center text-3xl font-bold tracking-tight" style={{ color: theme.foreground }}>
              You have arrived!
            </Text>
            <Text className="text-center text-lg" style={{ color: theme.mutedForeground }}>
              Welcome to{' '}
              <Text className="font-semibold" style={{ color: theme.foreground }}>
                {point?.name}
              </Text>
            </Text>
          </View>

          {/* Stats Bar */}
          <View className="mb-8 w-full flex-row items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <View className="flex-1 flex-row items-center justify-center gap-2 border-r border-slate-200 dark:border-slate-700">
              <Ionicons name="navigate-outline" size={20} color={theme.primary} />
              <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
                1.2 km traveled
              </Text>
            </View>
            <View className="flex-1 flex-row items-center justify-center gap-2 pl-2">
              <Ionicons name="time-outline" size={20} color={theme.primary} />
              <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
                15 min
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="w-full gap-3">
            <Button
              onPress={() => navigation.navigate('PointDetail', { pointId })}
              className="h-14 w-full rounded-2xl bg-primary shadow-lg shadow-primary/25">
              <Text className="text-lg font-bold text-white">View Attraction Details</Text>
            </Button>
            <TouchableOpacity
              onPress={onShare}
              className="h-14 w-full flex-row items-center justify-center gap-2 rounded-2xl border-2 border-primary/20">
              <Ionicons name="share-social-outline" size={20} color={theme.primary} />
              <Text className="text-lg font-bold" style={{ color: theme.primary }}>
                Share Trip
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Bar Simulator */}
      <View className="absolute bottom-10 left-1/2 h-1.5 w-32 -translate-x-1/2 rounded-full bg-white/40" />
    </View>
  );
}
