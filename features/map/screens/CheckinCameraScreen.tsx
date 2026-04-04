import React, { useCallback, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import * as MediaLibrary from 'expo-media-library';

import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { THEME } from '@/lib/theme';
import { useTheme } from '@/app/providers/ThemeProvider';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';
import { logger } from '@/utils/logger';
import CheckinCameraCapture from '@/features/map/components/Camera/CheckinCameraCapture';
import CheckinPhotoReviewModal from '@/features/map/components/Camera/CheckinPhotoReviewModal';
import { CheckinDraftImage, useSubmitUserCheckin } from '@/features/map/hooks/useSubmitUserCheckin';

type CheckinCameraScreenProps = StackScreenProps<MainStackParamList, 'CheckinCamera'>;

export default function CheckinCameraScreen({ navigation, route }: CheckinCameraScreenProps) {
  const { pointId, pointName } = route.params;
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [capturedCaption, setCapturedCaption] = useState('');
  const [draftImages, setDraftImages] = useState<CheckinDraftImage[]>([]);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const { isSubmitting, submit } = useSubmitUserCheckin();
  const { isDarkColorScheme } = useTheme();

  const theme = useMemo(() => (isDarkColorScheme ? THEME.dark : THEME.light), [isDarkColorScheme]);

  const persistCurrentCapture = useCallback(() => {
    if (!capturedPhotoUri) {
      return;
    }

    setDraftImages((currentImages) => [
      ...currentImages,
      {
        localUri: capturedPhotoUri,
        caption: capturedCaption.trim() || undefined,
      },
    ]);
    setCapturedPhotoUri(null);
    setCapturedCaption('');
    setIsReviewModalVisible(false);
  }, [capturedCaption, capturedPhotoUri]);

  const handleImageSelected = useCallback((imageUri: string) => {
    setCapturedPhotoUri(imageUri);
    setCapturedCaption('');
    setIsReviewModalVisible(true);
  }, []);

  const handleFinishCheckin = useCallback(async () => {
    if (!pointId) {
      Alert.alert('Missing check-in point', 'No check-in point selected. Please return to the map and try again.');
      return;
    }

    if (!capturedPhotoUri) {
      Alert.alert('No photo selected', 'Please take or pick a photo before finishing check-in.');
      return;
    }

    const payloadImages: CheckinDraftImage[] = [
      ...draftImages,
      {
        localUri: capturedPhotoUri,
        caption: capturedCaption.trim() || undefined,
      },
    ];

    try {
      const response = await submit({
        checkinPointId: pointId,
        images: payloadImages,
      });

      navigation.replace('CheckinComplete', {
        imageUrl: response.imageUrl,
        rewardPoints: response.earnedPoints,
        userTotalPoints: response.userTotalPoints,
      });
    } catch (error) {
      logger.error('[CheckinCameraScreen] Failed to finish check-in', error);
      Alert.alert('Check-in failed', error instanceof Error ? error.message : 'Unable to complete check-in right now.');
    }
  }, [capturedCaption, capturedPhotoUri, draftImages, navigation, pointId, submit]);

  const handleSavePhoto = useCallback(async () => {
    if (!capturedPhotoUri) {
      Alert.alert('No image to save', 'Please capture an image before saving.');
      return;
    }

    setIsSavingPhoto(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Please allow media library permission to save photos.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(capturedPhotoUri);
      Alert.alert('Saved', 'Photo has been saved to your device.');
    } catch (error) {
      logger.error('[CheckinCameraScreen] Failed to save review photo', error);
      Alert.alert('Save failed', 'Could not save this photo right now.');
    } finally {
      setIsSavingPhoto(false);
    }
  }, [capturedPhotoUri]);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <CheckinCameraCapture
        isBusy={isSubmitting}
        onClose={() => navigation.goBack()}
        onImageSelected={handleImageSelected}
        pointName={pointName}
      />

      <CheckinPhotoReviewModal
        visible={isReviewModalVisible}
        photoUri={capturedPhotoUri}
        caption={capturedCaption}
        isSubmitting={isSubmitting}
        isSavingPhoto={isSavingPhoto}
        onClose={() => setIsReviewModalVisible(false)}
        onCaptionChange={setCapturedCaption}
        onSavePhoto={handleSavePhoto}
        onTakeAnother={persistCurrentCapture}
        onFinishCheckin={handleFinishCheckin}
      />

      <LoadingOverlay visible={isSubmitting} message="Processing check-in..." />
    </View>
  );
}
