import React, { useEffect, useRef } from 'react';
import { Alert, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import Animated, {
  FadeInUp,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { AfterCheckinReviewModal } from '../components/CheckinReview/AfterCheckinReviewModal';
import { CheckinSocialShareActions } from '../components/CheckinComplete/CheckinSocialShareActions';
import { ReviewTypeFlg } from '@/features/reviews/types';
import { useCreateReview } from '@/features/reviews/hooks/useReview';

type CheckinCompleteScreenProps = StackScreenProps<MainStackParamList, 'CheckinComplete'>;

export default function CheckinCompleteScreen({ navigation, route }: CheckinCompleteScreenProps) {
  const { rewardPoints, userTotalPoints, imageUrl, destinationName, checkinPointId, parentCheckinPointId, imageUrls } =
    route.params;
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const reviewSheetRef = useRef<BottomSheetModal>(null);
  const createReviewMutation = useCreateReview();

  // Animation values
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Start infinite pulse for the checkmark aura
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
      true
    );
  }, [pulseScale]);

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 1.5 - pulseScale.value,
  }));

  const handleSubmitReviewDraft = async (payload: { rating: number; description: string; imageUrls: string[] }) => {
    if (!checkinPointId) {
      Alert.alert('Missing review target', 'Could not find this check-in point. Please try again from the map.');
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        reviewTypeFlg: ReviewTypeFlg.POINT,
        // Review a checkin point is actually reviewing it's parent.
        reviewTypeId: parentCheckinPointId || checkinPointId,
        rating: payload.rating,
        comment: payload.description.trim() || undefined,
        imageUrls: payload.imageUrls.length ? payload.imageUrls : undefined,
      });

      reviewSheetRef.current?.dismiss();
      Alert.alert('Review submitted', 'Thank you for sharing your experience.');
    } catch (error) {
      Alert.alert(
        'Submit failed',
        error instanceof Error ? error.message : 'Unable to submit your review right now. Please try again later.'
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Decorative Floating Blobs */}
      <Animated.View
        entering={ZoomIn.duration(1000)}
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10"
      />
      <Animated.View
        entering={ZoomIn.delay(300).duration(1000)}
        className="absolute -left-20 top-60 h-40 w-40 rounded-full bg-green-500/10"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-2">
          <TouchableOpacity
            onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted/50">
            <Ionicons name="close" size={22} color={theme.foreground} />
          </TouchableOpacity>
          <Text className="text-lg font-bold tracking-tight">Checkin Completed!</Text>
          <CheckinSocialShareActions
            destinationName={destinationName}
            hashtags={['NeoNHS', 'DaNang']}
            imageUrls={imageUrls?.length ? imageUrls : imageUrl ? [imageUrl] : undefined}
          />
        </View>

        <View className="px-6 py-4">
          {/* Success Checkmark Section */}
          <View className="items-center py-6">
            <View className="relative h-44 w-44 items-center justify-center">
              {/* Pulsing Aura */}
              <Animated.View style={animatedPulse} className="absolute h-40 w-40 rounded-full bg-primary/20" />
              <Animated.View
                style={animatedPulse}
                className="absolute h-32 w-32 rounded-full border border-primary/30"
              />

              <Animated.View
                entering={ZoomIn.springify()}
                className="h-24 w-24 items-center justify-center rounded-full bg-primary shadow-2xl shadow-primary">
                <Ionicons name="checkmark" size={54} color="white" />
              </Animated.View>
            </View>

            <Animated.View entering={FadeInUp.delay(300).springify()} className="mt-6 items-center">
              <Text className="text-4xl font-extrabold text-foreground">Awesome!</Text>
              <View className="mt-3 flex-row items-center rounded-2xl bg-green-100 px-5 py-2">
                <Ionicons name="sparkles" size={20} color={theme.primary} />
                <Text className="ml-2 text-2xl font-black text-green-800">+{rewardPoints ?? 50}</Text>
              </View>
              <Text className="mt-3 text-sm font-medium text-muted-foreground">
                New Balance: <Text className="font-bold text-foreground">{userTotalPoints ?? '0'} Points</Text>
              </Text>
            </Animated.View>
          </View>

          {/* Animated Image Card */}
          {imageUrl && (
            <></>
            // <Animated.View
            //   entering={FadeInDown.delay(500).springify()}
            //   className="mb-8 overflow-hidden rounded-[40px] border-[6px] border-white bg-white shadow-2xl shadow-black/20">
            //   <SmartImage uri={imageUrl} className="h-72 w-full" />

            //   {/* Floating Action Overlay */}
            //   <View className="absolute bottom-4 right-4 flex-row gap-3">
            //     <TouchableOpacity
            //       onPress={handleShare}
            //       className="h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
            //       <Ionicons name="share-social" size={22} color="#15803d" />
            //     </TouchableOpacity>
            //     <TouchableOpacity
            //       onPress={handleDownload}
            //       className="h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
            //       <Ionicons name="download-outline" size={22} color="#15803d" />
            //     </TouchableOpacity>
            //   </View>
            // </Animated.View>
          )}

          {/* Rewards Card */}
          <Animated.View
            entering={FadeInDown.delay(700)}
            className="rounded-[32px] border border-border bg-card p-6 shadow-sm">
            <View className="flex-row items-center gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Ionicons name="gift" size={28} color={theme.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold">Rewards Unlocked</Text>
                <Text className="text-sm leading-5 text-muted-foreground">
                  Use your point to redeem exclusive rewards and discounts!
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <Animated.View entering={FadeInUp.delay(900)} className="gap-3 px-6 pb-8 pt-4">
        <Button
          onPress={() => reviewSheetRef.current?.present()}
          className="h-16 rounded-2xl bg-primary shadow-xl shadow-primary/40">
          <MaterialIcons name="reviews" size={24} color="white" />
          <Text className="text-xl font-bold text-white">Write a review!</Text>
        </Button>

        <Button
          onPress={() => navigation.navigate('Tabs', { screen: 'Map' })}
          variant="outline"
          className="h-14 bg-transparent">
          <Text className="text-lg font-bold text-foreground">Return to Map</Text>
        </Button>
      </Animated.View>

      <AfterCheckinReviewModal
        sheetRef={reviewSheetRef}
        destinationName={destinationName || 'Marble Mountains'}
        checkinPointId={checkinPointId}
        checkinImageUrl={imageUrl}
        isSubmitting={createReviewMutation.isPending}
        onSubmit={handleSubmitReviewDraft}
      />
    </SafeAreaView>
  );
}
