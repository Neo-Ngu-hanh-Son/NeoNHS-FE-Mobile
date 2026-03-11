import React from 'react';
import { Alert, Image, Share, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';

import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { logger } from '@/utils/logger';

type CheckinCompleteScreenProps = StackScreenProps<MainStackParamList, 'CheckinComplete'>;

export default function CheckinCompleteScreen({ navigation, route }: CheckinCompleteScreenProps) {
  const { imageUrl, rewardPoints } = route.params;

  const handleShare = async () => {
    if (!imageUrl) {
      Alert.alert('No image to share', 'This check-in has no image available to share.');
      return;
    }

    try {
      await Share.share({
        message: `I just completed a check-in on NeoNHS! ${imageUrl}`,
      });
    } catch (error) {
      logger.error('[CheckinCompleteScreen] Failed to share check-in image', error);
      Alert.alert('Share failed', 'Could not share your check-in right now.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5]" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="h-9 w-9 items-center justify-center">
          <Ionicons name="close" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-foreground">Check-in</Text>
        <View className="h-9 w-9" />
      </View>

      <View className="px-6 pt-6">
        <View className="items-center">
          <View className="relative mb-6 h-36 w-36 items-center justify-center">
            <View className="absolute h-36 w-36 rounded-full border border-[#c6d8ce]" />
            <View className="absolute h-28 w-28 rounded-full border border-[#c6d8ce]" />
            <View className="absolute h-20 w-20 rounded-full border border-[#c6d8ce]" />
            <View className="h-20 w-20 items-center justify-center rounded-full bg-primary">
              <Ionicons name="checkmark" size={42} color="white" />
            </View>
          </View>

          <Text className="text-3xl font-bold text-foreground">Check-in Successful!</Text>
          <View className="mt-2 flex-row items-center">
            <Ionicons name="star" size={16} color="#15803d" />
            <Text className="ml-2 text-lg font-semibold text-[#15803d]">
              You earned {rewardPoints ?? 50} Points!
            </Text>
          </View>
        </View>

        <View className="mt-6 rounded-full border border-border bg-card px-4 py-4">
          <View className="flex-row items-center">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-green-100">
              <Ionicons name="gift" size={18} color="#166534" />
            </View>
            <View className="ml-3">
              <Text className="text-sm font-semibold text-foreground">Rewards Unlocked</Text>
              <Text className="text-xs text-muted-foreground">Photo Sharing, New Vouchers</Text>
            </View>
          </View>
        </View>

        <View className="mt-5 overflow-hidden rounded-3xl bg-muted">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} className="h-48 w-full" resizeMode="cover" />
          ) : (
            <View className="h-48 w-full items-center justify-center">
              <Text className="text-sm text-muted-foreground">No image available</Text>
            </View>
          )}
        </View>
      </View>

      <View className="mt-auto gap-3 px-6 pb-8 pt-6">
        <Button onPress={handleShare} variant="outline" className="h-12 rounded-full border-primary">
          <Ionicons name="camera" size={18} color="#15803d" />
          <Text className="text-primary">Share Photo</Text>
        </Button>
        <Button
          onPress={() => navigation.navigate('Tabs', { screen: 'Map' })}
          className="h-12 rounded-full"
        >
          <Text>Back To Map</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
