import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import * as MediaLibrary from 'expo-media-library';
import type BottomSheet from '@gorhom/bottom-sheet';

import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { THEME } from '@/lib/theme';
import { useTheme } from '@/app/providers/ThemeProvider';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';
import { logger } from '@/utils/logger';
import CheckinCameraCapture from '@/features/map/components/Camera/CheckinCameraCapture';
import CheckinPhotoReviewModal from '@/features/map/components/Camera/CheckinPhotoReviewModal';
import CheckinHistoryBottomSheet from '@/features/map/components/Camera/CheckinHistoryBottomSheet';
import { CheckinDraftImage, useSubmitUserCheckin } from '@/features/map/hooks/useSubmitUserCheckin';
import { useModal } from '@/app/providers/ModalProvider';
import { CheckinSessionGalleryImage } from '../types';
import { useAuth } from '@/features/auth';

type CheckinCameraScreenProps = StackScreenProps<MainStackParamList, 'CheckinCamera'>;

export default function CheckinCameraScreen({ navigation, route }: CheckinCameraScreenProps) {
  const { pointId, pointName, pointRewardPoints } = route.params;
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [capturedCaption, setCapturedCaption] = useState('');
  const [draftImages, setDraftImages] = useState<CheckinDraftImage[]>([]);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const historySheetRef = useRef<BottomSheet>(null);
  const reviewSheetRef = useRef<BottomSheet>(null);
  const { isSubmitting, submit } = useSubmitUserCheckin();
  const { isDarkColorScheme } = useTheme();
  const { user, updateUser } = useAuth();
  const { alert } = useModal();

  const theme = useMemo(() => (isDarkColorScheme ? THEME.dark : THEME.light), [isDarkColorScheme]);

  const sessionGalleryImages = useMemo<CheckinSessionGalleryImage[]>(() => {
    const draftGallery = [...draftImages].reverse().map((image, index) => ({
      id: `draft-${index}-${image.localUri}`,
      uri: image.localUri,
      caption: image.caption,
      label: `Photo ${draftImages.length - index}`,
    }));

    const currentImage = capturedPhotoUri
      ? [
          {
            id: 'current-capture',
            uri: capturedPhotoUri,
            caption: capturedCaption.trim() || undefined,
            label: 'Current photo',
          },
        ]
      : [];

    return [...currentImage, ...draftGallery];
  }, [capturedCaption, capturedPhotoUri, draftImages]);

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
    reviewSheetRef.current?.close();
    setCapturedPhotoUri(null);
    setCapturedCaption('');
  }, [capturedCaption, capturedPhotoUri]);

  const handleImageSelected = useCallback((imageUri: string) => {
    setCapturedPhotoUri(imageUri);
    setCapturedCaption('');
    reviewSheetRef.current?.snapToIndex(0);
  }, []);

  const handleFinishCheckin = useCallback(async () => {
    if (!pointId) {
      alert('Missing check-in point', 'No check-in point selected. Please return to the map and try again.');
      return;
    }

    if (!capturedPhotoUri) {
      alert('No photo selected', 'Please take or pick a photo before finishing check-in.');
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
      const res = await submit({
        checkinPointId: pointId,
        images: payloadImages,
      });

      // Before leaving, update user state to get the new points first.
      const userPoint = user?.userPoint ?? 0;
      const newPoint = userPoint + (pointRewardPoints ?? 0);
      updateUser?.({
        ...user,
        userPoint: newPoint,
      });

      navigation.replace('CheckinComplete', {
        rewardPoints: res.earnedPoints,
        userTotalPoints: res.userTotalPoints,
        imageUrl: res.imageUrl,
      });
    } catch (error) {
      logger.error('[CheckinCameraScreen] Failed to finish check-in', error);
      alert('Check-in failed', error instanceof Error ? error.message : 'Unable to complete check-in right now.');
    }
  }, [
    pointId,
    capturedPhotoUri,
    draftImages,
    capturedCaption,
    alert,
    submit,
    user,
    pointRewardPoints,
    updateUser,
    navigation,
  ]);

  const handleSavePhoto = useCallback(async () => {
    if (!capturedPhotoUri) {
      alert('No image to save', 'Please capture an image before saving.');
      return;
    }
    setIsSavingPhoto(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        alert('Permission required', 'Please allow media library permission to save photos.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(capturedPhotoUri);
      alert('Saved', 'Photo has been saved to your device.');
    } catch (error) {
      logger.error('[CheckinCameraScreen] Failed to save review photo', error);
      alert('Save failed', 'Could not save this photo right now.');
    } finally {
      setIsSavingPhoto(false);
    }
  }, [capturedPhotoUri, alert]);

  const handleSelectHistoryImage = useCallback((image: CheckinSessionGalleryImage) => {
    setDraftImages((currentImages) => {
      const matchIndex = currentImages.findIndex(
        (draft) => draft.localUri === image.uri && (draft.caption ?? '') === (image.caption ?? '')
      );

      if (matchIndex < 0) {
        return currentImages;
      }

      const nextImages = [...currentImages];
      nextImages.splice(matchIndex, 1);
      return nextImages;
    });

    setCapturedPhotoUri(image.uri);
    setCapturedCaption(image.caption ?? '');
    reviewSheetRef.current?.snapToIndex(0);
  }, []);

  const handleOpenHistorySheet = useCallback(() => {
    historySheetRef.current?.snapToIndex(0);
  }, []);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <CheckinCameraCapture
        isBusy={isSubmitting}
        onClose={() => navigation.replace('Tabs', { screen: 'Map' })}
        onOpenGallery={handleOpenHistorySheet}
        onImageSelected={handleImageSelected}
        pointName={pointName}
      />

      <CheckinHistoryBottomSheet
        sheetRef={historySheetRef}
        onSelectImage={handleSelectHistoryImage}
        images={sessionGalleryImages}
        pointName={pointName}
      />

      <CheckinPhotoReviewModal
        sheetRef={reviewSheetRef}
        photoUri={capturedPhotoUri}
        caption={capturedCaption}
        isSubmitting={isSubmitting}
        isSavingPhoto={isSavingPhoto}
        onCaptionChange={setCapturedCaption}
        onSavePhoto={handleSavePhoto}
        onTakeAnother={persistCurrentCapture}
        onFinishCheckin={handleFinishCheckin}
      />

      <LoadingOverlay visible={isSubmitting} message="Processing check-in..." />
    </View>
  );
}
