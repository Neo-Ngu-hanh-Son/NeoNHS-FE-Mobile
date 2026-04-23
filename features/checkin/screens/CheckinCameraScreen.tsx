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
import CheckinCameraCapture from '@/features/checkin/components/Camera/CheckinCameraCapture';
import CheckinPhotoPreviewModal from '@/features/checkin/components/CheckinPhotoPreview/CheckinPhotoPreviewModal';
import CheckinHistoryBottomSheet from '@/features/checkin/components/CheckinHistory/CheckinHistoryBottomSheet';
import { CheckinDraftImage, useSubmitUserCheckin } from '@/features/map/hooks/useSubmitUserCheckin';
import { useModal } from '@/app/providers/ModalProvider';
import { CheckinSessionGalleryImage } from '../../map/types';
import { useAuth } from '@/features/auth';
import imageService from '@/services/api/common/uploadImageService';
import { generateImageUploadData } from '@/utils/uploadImageHelper';

type CheckinCameraScreenProps = StackScreenProps<MainStackParamList, 'CheckinCamera'>;

export default function CheckinCameraScreen({ navigation, route }: CheckinCameraScreenProps) {
  const { checkinPointId, pointName } = route.params;
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [capturedCaption, setCapturedCaption] = useState('');
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [draftImages, setDraftImages] = useState<CheckinDraftImage[]>([]);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const historySheetRef = useRef<BottomSheet>(null);
  const reviewSheetRef = useRef<BottomSheet>(null);
  const { isSubmitting, submit } = useSubmitUserCheckin();
  const { mutateAsync: uploadImageAsync } = imageService.useUploadImage();
  const { mutateAsync: deleteImageAsync } = imageService.useDeleteImage();
  const { isDarkColorScheme } = useTheme();
  const { user, updateUser, accessToken } = useAuth();
  const { alert } = useModal();

  const theme = useMemo(() => (isDarkColorScheme ? THEME.dark : THEME.light), [isDarkColorScheme]);

  const uploadProgress = useMemo(() => {
    const total = draftImages.length;
    const uploaded = draftImages.filter((image) => image.uploadStatus === 'uploaded').length;
    const pending = draftImages.filter((image) => image.uploadStatus === 'pending').length;
    const failed = draftImages.filter((image) => image.uploadStatus === 'failed').length;
    return {
      total,
      uploaded,
      pending,
      failed,
    };
  }, [draftImages]);

  const sessionGalleryImages = useMemo<CheckinSessionGalleryImage[]>(() => {
    const draftGallery = [...draftImages].reverse().map((image, index) => ({
      id: image.id ?? `draft-${index}-${image.localUri}`,
      uri: image.localUri,
      caption: image.caption,
      label: `Photo ${draftImages.length - index}`,
      uploadStatus: image.uploadStatus,
      draftId: image.id,
      publicId: image.publicId,
    }));

    const currentImage = capturedPhotoUri
      ? [
        {
          id: 'current-capture',
          uri: capturedPhotoUri,
          caption: capturedCaption.trim() || undefined,
          label: 'Current photo',
          uploadStatus: capturedImageUrl ? ('uploaded' as const) : ('pending' as const),
          draftId: 'current-capture',
        },
      ]
      : [];

    return [...currentImage, ...draftGallery];
  }, [capturedCaption, capturedImageUrl, capturedPhotoUri, draftImages]);

  const startUploadForDraft = useCallback(
    (draft: CheckinDraftImage, forceRetry: boolean = false) => {
      if (!draft.id) {
        return;
      }

      if (!forceRetry && draft.uploadStatus === 'uploaded' && draft.imageUrl) {
        return;
      }

      if (!accessToken) {
        setDraftImages((currentImages) =>
          currentImages.map((image) =>
            image.id === draft.id
              ? {
                ...image,
                uploadStatus: 'failed',
                uploadError: 'You are not authenticated to upload images.',
              }
              : image
          )
        );
        return;
      }

      setDraftImages((currentImages) =>
        currentImages.map((image) =>
          image.id === draft.id
            ? {
              ...image,
              uploadStatus: 'pending',
              uploadError: undefined,
            }
            : image
        )
      );

      void uploadImageAsync({
        image: generateImageUploadData({ localUri: draft.localUri }),
        token: accessToken,
      })
        .then((uploadResponse) => {
          setDraftImages((currentImages) =>
            currentImages.map((image) =>
              image.id === draft.id
                ? {
                  ...image,
                  uploadStatus: 'uploaded',
                  imageUrl: uploadResponse.mediaUrl,
                  publicId: uploadResponse.publicId,
                  uploadError: undefined,
                }
                : image
            )
          );
        })
        .catch((error) => {
          logger.error('[CheckinCameraScreen] Failed to upload draft image', error);
          setDraftImages((currentImages) =>
            currentImages.map((image) =>
              image.id === draft.id
                ? {
                  ...image,
                  uploadStatus: 'failed',
                  uploadError:
                    error instanceof Error ? error.message : 'Unable to upload this image. Please try again.',
                }
                : image
            )
          );
        });
    },
    [accessToken, uploadImageAsync]
  );

  /**
   * Add the current photo to the draft list and reset capture state to allow taking another photo
   */
  const handleTakeAnother = useCallback(async () => {
    if (!capturedPhotoUri) {
      return;
    }

    const draftId = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const draftImage: CheckinDraftImage = {
      id: draftId,
      localUri: capturedPhotoUri,
      caption: capturedCaption.trim() || undefined,
      uploadStatus: capturedImageUrl ? 'uploaded' : 'pending',
      imageUrl: capturedImageUrl ?? undefined,
    };

    setDraftImages((currentImages) => [...currentImages, draftImage]);

    if (!capturedImageUrl) {
      void startUploadForDraft(draftImage);
    }

    reviewSheetRef.current?.close();
    setCapturedPhotoUri(null);
    setCapturedCaption('');
    setCapturedImageUrl(null);
  }, [capturedCaption, capturedImageUrl, capturedPhotoUri, startUploadForDraft]);

  const handleImageSelected = useCallback((imageUri: string) => {
    setCapturedPhotoUri(imageUri);
    setCapturedCaption('');
    setCapturedImageUrl(null);
    reviewSheetRef.current?.snapToIndex(0);
  }, []);

  /**
   * Finalize the check-in by submitting the captured photo and any additional draft photos, then navigate to the completion screen
   */
  const handleFinishCheckin = useCallback(() => {
    if (!checkinPointId) {
      alert('Missing check-in point', 'No check-in point detected. Please return to the map and try again.');
      return;
    }

    if (!draftImages.length && !capturedPhotoUri) {
      alert('No photo selected', 'Please capture at least one photo before finishing check-in.');
      return;
    }

    // Persist any in-preview capture first, then let the coordinator effect finalize submission.
    if (capturedPhotoUri) {
      const currentCaptureDraft: CheckinDraftImage = {
        id: `current-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        localUri: capturedPhotoUri,
        caption: capturedCaption.trim() || undefined,
        uploadStatus: capturedImageUrl ? 'uploaded' : 'pending',
        imageUrl: capturedImageUrl ?? undefined,
      };

      setDraftImages((currentImages) => [...currentImages, currentCaptureDraft]);

      if (!currentCaptureDraft.imageUrl) {
        startUploadForDraft(currentCaptureDraft);
      }

      setCapturedPhotoUri(null);
      setCapturedCaption('');
      setCapturedImageUrl(null);
      reviewSheetRef.current?.close();
    }

    setIsFinalizing(true);
  }, [
    checkinPointId,
    draftImages.length,
    capturedPhotoUri,
    capturedCaption,
    capturedImageUrl,
    alert,
    startUploadForDraft,
  ]);

  React.useEffect(() => {
    if (!isFinalizing) {
      return;
    }

    if (!checkinPointId) {
      setIsFinalizing(false);
      return;
    }

    const pendingDrafts = draftImages.filter((image) => image.uploadStatus === 'pending');
    const failedDrafts = draftImages.filter((image) => image.uploadStatus === 'failed');
    const pendingCount = pendingDrafts.length;
    const failedCount = failedDrafts.length;

    if (pendingCount > 0) {
      return;
    }

    if (failedCount > 0) {
      setIsFinalizing(false);
      alert('Upload incomplete', `${failedCount} photo(s) failed to upload. Retry failed uploads?`, [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Retry',
          style: 'default',
          onPress: () => {
            failedDrafts.forEach((failedDraft) => startUploadForDraft(failedDraft, true));
            setIsFinalizing(true);
          },
        },
      ]);
      return;
    }

    if (draftImages.length === 0) {
      return;
    }

    const allUploaded = draftImages.every((image) => image.uploadStatus === 'uploaded' && Boolean(image.imageUrl));
    if (!allUploaded) {
      return;
    }

    setIsFinalizing(false);

    const submitFinalCheckin = async () => {
      try {
        const res = await submit({
          checkinPointId,
          images: draftImages,
        });

        updateUser?.({
          ...user,
          userPoint: res.userTotalPoints,
        });

        // Get all image that user uploaded
        let imageUrls: string[] = [];
        draftImages.forEach((image) => {
          if (image.imageUrl) {
            imageUrls.push(image.imageUrl);
          }
        });

        navigation.replace('CheckinComplete', {
          rewardPoints: res.earnedPoints,
          userTotalPoints: res.userTotalPoints,
          imageUrl: res.imageUrl,
          destinationName: pointName,
          checkinPointId,
          parentCheckinPointId: res.parentCheckinPointId,
          imageUrls: imageUrls,
        });
      } catch (error) {
        logger.error('[CheckinCameraScreen] Failed to finish check-in', error);
        setIsFinalizing(false);
        alert(
          'Check-in failed',
          error instanceof Error ? error.message : 'Unable to complete check-in right now. Please try again later.'
        );
      }
    };

    void submitFinalCheckin();
  }, [
    isFinalizing,
    draftImages,
    checkinPointId,
    alert,
    startUploadForDraft,
    submit,
    updateUser,
    user,
    navigation,
    pointName,
  ]);

  /**
   * Save photo to device gallery
   */
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

  const handleSelectHistoryImage = useCallback(
    (image: CheckinSessionGalleryImage) => {
      const selectedDraft =
        draftImages.find((draft) =>
          image.draftId
            ? draft.id === image.draftId
            : draft.localUri === image.uri && (draft.caption ?? '') === (image.caption ?? '')
        ) ?? null;

      setDraftImages((currentImages) => {
        const matchIndex = currentImages.findIndex((draft) =>
          image.draftId
            ? draft.id === image.draftId
            : draft.localUri === image.uri && (draft.caption ?? '') === (image.caption ?? '')
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
      setCapturedImageUrl(selectedDraft?.imageUrl ?? null);
      reviewSheetRef.current?.snapToIndex(0);
    },
    [draftImages]
  );

  const handleUpdateHistoryImageCaption = useCallback((image: CheckinSessionGalleryImage, nextCaption: string) => {
    const normalizedCaption = nextCaption.trim() || undefined;

    if (image.draftId === 'current-capture') {
      setCapturedCaption(normalizedCaption ?? '');
      return;
    }

    setDraftImages((currentImages) =>
      currentImages.map((draft) =>
        image.draftId
          ? draft.id === image.draftId
            ? { ...draft, caption: normalizedCaption }
            : draft
          : draft.localUri === image.uri && (draft.caption ?? '') === (image.caption ?? '')
            ? { ...draft, caption: normalizedCaption }
            : draft
      )
    );
  }, []);

  const handleDeleteHistoryImage = useCallback(
    async (image: CheckinSessionGalleryImage) => {
      if (image.draftId === 'current-capture') {
        setCapturedPhotoUri(null);
        setCapturedCaption('');
        setCapturedImageUrl(null);
        return;
      }

      const targetDraft =
        draftImages.find((draft) =>
          image.draftId
            ? draft.id === image.draftId
            : draft.localUri === image.uri && (draft.caption ?? '') === (image.caption ?? '')
        ) ?? null;

      if (!targetDraft) {
        return;
      }

      if (targetDraft.publicId) {
        try {
          await deleteImageAsync(targetDraft.publicId);
        } catch (error) {
          logger.error('[CheckinCameraScreen] Failed to delete image from server', error);
          alert('Delete failed', 'Could not delete this image from server. Please try again.');
          return;
        }
      }

      setDraftImages((currentImages) =>
        currentImages.filter((draft) =>
          image.draftId
            ? draft.id !== image.draftId
            : !(draft.localUri === image.uri && (draft.caption ?? '') === (image.caption ?? ''))
        )
      );
    },
    [alert, deleteImageAsync, draftImages]
  );

  const handleOpenHistorySheet = useCallback(() => {
    reviewSheetRef.current?.close();
    historySheetRef.current?.snapToIndex(0);
  }, []);

  const handleCancelCheckinPhoto = useCallback(() => {
    setCapturedPhotoUri(null);
    setCapturedCaption('');
    setCapturedImageUrl(null);
    reviewSheetRef.current?.close();
  }, []);

  const pendingCount = uploadProgress.pending;
  const isBusy = isSubmitting || (isFinalizing && pendingCount > 0);

  const uploadOverlayMessage = useMemo(() => {
    if (isFinalizing && pendingCount > 0) {
      return `Uploading photos... ${uploadProgress.uploaded}/${uploadProgress.total || 1}`;
    }

    if (isSubmitting) {
      return 'Submitting final check-in...';
    }

    return 'Processing check-in...';
  }, [isFinalizing, isSubmitting, pendingCount, uploadProgress.total, uploadProgress.uploaded]);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <CheckinCameraCapture
        isBusy={isBusy}
        onClose={() => navigation.replace('Tabs', { screen: 'Map' })}
        onOpenGallery={handleOpenHistorySheet}
        onImageSelected={handleImageSelected}
        pointName={pointName}
      />

      <CheckinHistoryBottomSheet
        sheetRef={historySheetRef}
        onSelectImage={handleSelectHistoryImage}
        onFinishCheckin={handleFinishCheckin}
        onChangeImageCaption={handleUpdateHistoryImageCaption}
        onDeleteImage={handleDeleteHistoryImage}
        images={sessionGalleryImages}
        pointName={pointName}
        uploadProgress={uploadProgress}
        isSubmitting={isBusy}
      />

      <CheckinPhotoPreviewModal
        sheetRef={reviewSheetRef}
        photoUri={capturedPhotoUri}
        caption={capturedCaption}
        isSubmitting={isBusy}
        isSavingPhoto={isSavingPhoto}
        onCaptionChange={setCapturedCaption}
        onSavePhoto={handleSavePhoto}
        onTakeAnother={handleTakeAnother}
        onFinishCheckin={handleFinishCheckin}
        handleCancelCheckinPhoto={handleCancelCheckinPhoto}
      />

      <LoadingOverlay visible={isBusy} message={uploadOverlayMessage} />
    </View>
  );
}
