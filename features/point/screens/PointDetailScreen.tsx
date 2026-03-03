import React, { useState } from 'react';
import { View, Share } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { CompositeScreenProps } from '@react-navigation/native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { MainStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { discoverService } from '../../discover/services/discoverServices';
import FullScreenLoader from '@/components/Loader/FullScreenLoader';
import { RefreshableScrollView } from '@/components/common/RefreshableScrollView';

import {
  PointDetailHero,
  PointDetailStats,
  PointDetailOverview,
  PointDetailLocation,
  PointDetailPanorama,
  PointDetailGallery,
  PointDetailReviews,
  PointDetailBottomBar,
} from '../components';
import { useQuery } from '@tanstack/react-query';
import { logger } from '@/utils/logger';
import { usePanorama } from '@/app/providers/ParanomaProvider';

type Props = CompositeScreenProps<
  StackScreenProps<MainStackParamList, 'PointDetail'>,
  StackScreenProps<TabsStackParamList>
>;

export default function PointDetailScreen({ navigation, route }: Props) {
  const { pointId } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReadMore, setIsReadMore] = useState(false);
  const { openPanorama, closePanorama } = usePanorama();

  const {
    data: point,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['pointDetail', pointId],
    queryFn: async () => {
      const response = await discoverService.getPointById(pointId);
      return response.data;
    },
  });

  // ─── Actions ───
  const handleShare = async () => {
    if (!point) return;
    try {
      await Share.share({ message: `Check out ${point.name} on NeoNHS!` });
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenMap = () => {
    navigation.navigate('Tabs', { screen: 'Map', params: { pointId } });
  };

  const handleNavigate = () => {
    navigation.navigate('PointMapSelection', { pointId });
  };

  const handleAudioGuide = () => {
    navigation.navigate('AudioGuide', { pointId });
  };

  const handleOpenPanorama = () => {
    if (!point) return;
    openPanorama(pointId);
  };

  // ─── Loading state ───
  if (isLoading) {
    return <FullScreenLoader message="Loading point details..." />;
  }

  if (isError || !point) {
    logger.error('Error fetching point details:', isError);
    return (
      <View className="flex-1 items-center justify-center bg-background px-5">
        <Text variant="muted" className="text-center">
          Unable to load point details. Please try again later.
        </Text>
        <Button variant="outline" onPress={() => navigation.goBack()} className="mt-4">
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  // ─── Main content ───
  return (
    <View className="flex-1 bg-background">
      <RefreshableScrollView
        onRefresh={() => refetch()}
        contentContainerStyle={{ paddingBottom: 120 }}
        edges={[]}>
        {/* Hero image with nav buttons */}
        <PointDetailHero
          point={point}
          isFavorite={isFavorite}
          onBack={() => navigation.goBack()}
          onToggleFavorite={() => setIsFavorite((prev) => !prev)}
          onShare={handleShare}
        />

        {/* Content sections */}
        <View className="gap-8 px-5 pb-4 pt-7">
          {/* Quick stats bar */}
          <PointDetailStats point={point} />

          {/* Overview / description */}
          <PointDetailOverview
            point={point}
            isReadMore={isReadMore}
            onToggleReadMore={() => setIsReadMore((prev) => !prev)}
          />

          {/* Location map preview */}
          <PointDetailLocation point={point} onOpenMap={handleOpenMap} />

          {/* 360° panorama (conditionally rendered) */}
          <PointDetailPanorama point={point} onOpenPanorama={handleOpenPanorama} />

          {/* Check-in gallery */}
          <PointDetailGallery />

          {/* Reviews */}
          <PointDetailReviews />
        </View>
      </RefreshableScrollView>

      {/* Sticky bottom CTA bar */}
      <PointDetailBottomBar
        pointId={pointId}
        onNavigate={handleNavigate}
        onAudioGuide={handleAudioGuide}
      />
    </View>
  );
}
