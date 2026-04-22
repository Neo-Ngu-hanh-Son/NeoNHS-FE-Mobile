import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/app/providers/ThemeProvider';
import { SmartImage } from '@/components/ui/smart-image';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

import CheckinGalleryViewerModal from './CheckinGalleryViewerModal';
import { CheckinSessionGalleryImage } from '../../../map/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';

type UploadProgress = {
  total: number;
  uploaded: number;
  pending: number;
  failed: number;
};

type CheckinHistoryBottomSheetProps = {
  sheetRef: React.RefObject<BottomSheet | null>;
  onClose?: () => void;
  onSelectImage?: (image: CheckinSessionGalleryImage) => void;
  onChangeImageCaption?: (image: CheckinSessionGalleryImage, nextCaption: string) => void;
  onDeleteImage?: (image: CheckinSessionGalleryImage) => Promise<void> | void;
  images: CheckinSessionGalleryImage[];
  pointName?: string;
  onFinishCheckin?: () => void;
  uploadProgress?: UploadProgress;
  isSubmitting?: boolean;
};

export default function CheckinHistoryBottomSheet({
  sheetRef,
  onClose,
  onSelectImage,
  onChangeImageCaption,
  onDeleteImage,
  images,
  pointName,
  onFinishCheckin,
  uploadProgress,
  isSubmitting = false,
}: CheckinHistoryBottomSheetProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { top } = useSafeAreaInsets();

  const snapPoints = useMemo(() => ['80%'], []);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.45} pressBehavior="close" />
    ),
    []
  );

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose?.();
      }
    },
    [onClose]
  );

  const handleOpenViewer = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setViewerVisible(true);
  }, []);

  const renderImageItem = useCallback(
    ({ item, index }: { item: CheckinSessionGalleryImage; index: number }) => (
      <Pressable
        style={[styles.card, { borderColor: theme.border, backgroundColor: theme.card }]}
        onPress={() => {
          handleOpenViewer(index);
        }}
        android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
        onLongPress={() => handleOpenViewer(index)}>
        <SmartImage uri={item.uri} style={styles.cardImage} contentFit="cover" />
        <View style={styles.cardBody}>
          <Text className="text-xs font-medium text-foreground" numberOfLines={2}>
            {item.caption?.trim() || 'No caption'}
          </Text>
          <Text className="mt-1 text-[11px] text-muted-foreground" numberOfLines={1}>
            {item.label}
          </Text>
          <View style={styles.statusRow}>
            {item.uploadStatus === 'pending' ? (
              <>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text className="text-[11px] text-muted-foreground">Uploading...</Text>
              </>
            ) : null}

            {item.uploadStatus === 'uploaded' ? (
              <>
                <Ionicons name="checkmark-circle" size={14} color={theme.primary} />
                <Text className="text-[11px] text-muted-foreground">Uploaded</Text>
              </>
            ) : null}

            {item.uploadStatus === 'failed' ? (
              <>
                <Ionicons name="alert-circle" size={14} color={theme.destructive} />
                <Text className="text-[11px]" style={{ color: theme.destructive }}>
                  Failed
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </Pressable>
    ),
    [handleOpenViewer, theme.border, theme.card, theme.destructive, theme.primary]
  );

  const progressRatio = useMemo(() => {
    const total = uploadProgress?.total ?? 0;
    if (!total) {
      return 0;
    }
    return Math.min(1, (uploadProgress?.uploaded ?? 0) / total);
  }, [uploadProgress?.total, uploadProgress?.uploaded]);

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.background }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
        topInset={top}>
        <View style={styles.headerContainer}>
          <View>
            <Text className="text-lg font-semibold text-foreground">Current check-in photos</Text>
            <Text className="text-xs text-muted-foreground">
              {images.length
                ? `${images.length} photos captured here${pointName ? `: ${pointName}` : ''}`
                : 'No photos captured yet for this check-in'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => sheetRef.current?.close()}
            className="h-9 w-9 items-center justify-center rounded-full bg-muted"
            accessibilityRole="button"
            accessibilityLabel="Close check-in gallery">
            <Ionicons name="close" size={20} color={theme.foreground} />
          </TouchableOpacity>
        </View>

        {uploadProgress?.total ? (
          <View style={styles.progressWrapper}>
            <View style={styles.progressTextRow}>
              <Text className="text-xs text-muted-foreground">
                Uploaded {uploadProgress.uploaded}/{uploadProgress.total}
              </Text>
              {uploadProgress.pending > 0 ? (
                <View style={styles.pendingIndicatorRow}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text className="text-xs text-muted-foreground">Uploading...</Text>
                </View>
              ) : null}
            </View>
            <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(progressRatio * 100)}%`, backgroundColor: theme.primary },
                ]}
              />
            </View>
          </View>
        ) : null}

        {images.length ? (
          <>
            <BottomSheetFlatList
              data={images}
              keyExtractor={(item: CheckinSessionGalleryImage) => item.id}
              renderItem={renderImageItem}
              numColumns={2}
              contentContainerStyle={styles.listContentContainer}
              columnWrapperStyle={styles.listColumnWrapper}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.centerState}>
                  <Text className="text-sm text-muted-foreground">No photos captured yet for this check-in.</Text>
                </View>
              }
            />
            {/* <Button variant={'default'} className="mx-2 mb-6 mt-4 flex justify-center gap-3" onPress={onFinishCheckin}>
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              <Text>Complete check-in</Text>
            </Button> */}
            <Button
              onPress={onFinishCheckin}
              disabled={isSubmitting}
              className="mx-2 mb-6 mt-4 h-14 flex-row items-center justify-center rounded-2xl shadow-lg shadow-primary/20">
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              )}
              <Text className="text-primary-foreground">{isSubmitting ? 'Please wait...' : 'Complete check-in'}</Text>
            </Button>
          </>
        ) : (
          <View style={styles.centerState}>
            <Text className="text-sm text-muted-foreground">No photos captured yet. Take a photo to get started!</Text>
          </View>
        )}
      </BottomSheet>

      <CheckinGalleryViewerModal
        visible={viewerVisible}
        images={images}
        initialIndex={selectedImageIndex}
        onChangeCaption={onChangeImageCaption}
        onDeleteImage={onDeleteImage}
        onClose={() => setViewerVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  listContentContainer: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  listColumnWrapper: {
    gap: 8,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
  },
  cardBody: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 58,
  },
  statusRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  progressTextRow: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});
