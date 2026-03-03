import React, { useState, useEffect } from 'react';
import { View, ScrollView, Share } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { CompositeScreenProps } from '@react-navigation/native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { MainStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { discoverService } from '../../discover/services/discoverServices';
import { MapPoint } from '../../map/types';
import FullScreenLoader from '@/components/Loader/FullScreenLoader';

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

type Props = CompositeScreenProps<
  StackScreenProps<MainStackParamList, 'PointDetail'>,
  StackScreenProps<TabsStackParamList>
>;

export default function PointDetailScreen({ navigation, route }: Props) {
  const { pointId } = route.params;
  const [point, setPoint] = useState<MapPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReadMore, setIsReadMore] = useState(false);

  // ─── Data fetching ───
  useEffect(() => {
    const fetchPoint = async () => {
      setLoading(true);
      try {
        const response = await discoverService.getPointById(pointId);
        if (response.success && response.data) {
          setPoint(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch point:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPoint();
  }, [pointId]);

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
    navigation.navigate('Panorama', { pointId });
  };

  // ─── Loading state ───
  if (loading) {
    return <FullScreenLoader message="Loading point details..." />;
  }

  // ─── Error / not found state ───
  if (!point) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="mb-4 text-xl font-bold">Point not found</Text>
        <Button onPress={() => navigation.goBack()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  // ─── Main content ───
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
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
      </ScrollView>

      {/* Sticky bottom CTA bar */}
      <PointDetailBottomBar
        pointId={pointId}
        onNavigate={handleNavigate}
        onAudioGuide={handleAudioGuide}
      />
    </View>
  );
}
