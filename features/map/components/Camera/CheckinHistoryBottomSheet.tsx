import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/app/providers/ThemeProvider';
import { SmartImage } from '@/components/ui/smart-image';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

import CheckinGalleryViewerModal from './CheckinGalleryViewerModal';
import { CheckinSessionGalleryImage } from '../../types';

type CheckinHistoryBottomSheetProps = {
  sheetRef: React.RefObject<BottomSheet | null>;
  onClose?: () => void;
  onSelectImage?: (image: CheckinSessionGalleryImage) => void;
  images: CheckinSessionGalleryImage[];
  pointName?: string;
};

export default function CheckinHistoryBottomSheet({
  sheetRef,
  onClose,
  onSelectImage,
  images,
  pointName,
}: CheckinHistoryBottomSheetProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
          if (onSelectImage) {
            onSelectImage(item);
            sheetRef.current?.close();
            return;
          }

          handleOpenViewer(index);
        }}
        onLongPress={() => handleOpenViewer(index)}>
        <SmartImage uri={item.uri} style={styles.cardImage} contentFit="cover" />
        <View style={styles.cardBody}>
          <Text className="text-xs font-medium text-foreground" numberOfLines={2}>
            {item.caption?.trim() || 'No caption'}
          </Text>
          <Text className="mt-1 text-[11px] text-muted-foreground" numberOfLines={1}>
            {item.label}
          </Text>
        </View>
      </Pressable>
    ),
    [handleOpenViewer, onSelectImage, sheetRef, theme.border, theme.card]
  );

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.background }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
        detached={true}
        bottomInset={8}>
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

        {images.length ? (
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
        ) : (
          <View style={styles.centerState}>
            <Text className="text-sm text-muted-foreground">No photos captured yet for this check-in.</Text>
          </View>
        )}
      </BottomSheet>

      <CheckinGalleryViewerModal
        visible={viewerVisible}
        images={images}
        initialIndex={selectedImageIndex}
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
});
