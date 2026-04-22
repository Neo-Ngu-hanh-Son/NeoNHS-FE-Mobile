import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureViewer, useGestureViewerState } from 'react-native-gesture-image-viewer';
import * as MediaLibrary from 'expo-media-library';
import { SmartImage } from '@/components/ui/smart-image';
import { Text } from '@/components/ui/text';
import { CheckinSessionGalleryImage } from '../../../map/types';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useModal } from '@/app/providers/ModalProvider';
import { logger } from '@/utils/logger';

type CheckinGalleryViewerModalProps = {
  visible: boolean;
  images: CheckinSessionGalleryImage[];
  initialIndex: number;
  onChangeCaption?: (image: CheckinSessionGalleryImage, nextCaption: string) => void;
  onDeleteImage?: (image: CheckinSessionGalleryImage) => Promise<void> | void;
  onClose: () => void;
};

export default function CheckinGalleryViewerModal({
  visible,
  images,
  initialIndex,
  onChangeCaption,
  onDeleteImage,
  onClose,
}: CheckinGalleryViewerModalProps) {
  const { currentIndex } = useGestureViewerState();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { confirm, alert } = useModal();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionInput, setCaptionInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const safeInitialIndex = useMemo(() => {
    if (!images.length) {
      return 0;
    }
    return Math.min(Math.max(initialIndex, 0), images.length - 1);
  }, [images.length, initialIndex]);

  const activeImage = useMemo(() => {
    if (!images.length) {
      return null;
    }

    const index = Math.min(Math.max(currentIndex, 0), images.length - 1);
    return images[index] ?? images[safeInitialIndex] ?? null;
  }, [currentIndex, images, safeInitialIndex]);

  const handleDownloadImage = useCallback(async () => {
    if (!activeImage) {
      return;
    }
    setIsSavingPhoto(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        alert('Permission required', 'Please allow media library permission to save photos.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(activeImage.uri);
      alert('Saved', 'Photo has been saved to your device.');
    } catch (error) {
      logger.error('[CheckinCameraScreen] Failed to save review photo', error);
      alert('Save failed', 'Could not save this photo right now.');
    } finally {
      setIsSavingPhoto(false);
    }
  }, [activeImage, alert]);

  const handleOpenCaptionEditor = () => {
    if (!activeImage) {
      return;
    }

    setCaptionInput(activeImage.caption ?? '');
    setIsMenuVisible(false);
    setIsEditingCaption(true);
  };

  const handleSaveCaption = () => {
    if (!activeImage || !onChangeCaption) {
      setIsEditingCaption(false);
      return;
    }

    onChangeCaption(activeImage, captionInput);
    setIsEditingCaption(false);
  };

  const handleDeleteImage = async () => {
    if (!activeImage || !onDeleteImage || isDeleting) {
      return;
    }

    setIsMenuVisible(false);
    const confirmed = await confirm('Delete this photo?', 'This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDeleteImage(activeImage);
    } catch {
      alert('Delete failed', 'Unable to delete this photo right now. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureViewer
        data={images}
        initialIndex={safeInitialIndex}
        ListComponent={ScrollView}
        renderItem={(item) => <SmartImage uri={item.uri} style={styles.viewerImage} contentFit="contain" />}
        onDismiss={onClose}
        renderContainer={(children, helpers) => (
          <View style={styles.viewerContainer}>
            {children}

            <TouchableOpacity
              style={[styles.viewerMenuButton, { opacity: isDeleting ? 0.6 : 1 }]}
              onPress={() => setIsMenuVisible((currentValue) => !currentValue)}
              disabled={isDeleting}>
              {isDeleting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="ellipsis-vertical" size={20} color="white" />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.viewerCloseButton} onPress={() => helpers.dismiss()}>
              <Ionicons name="close" size={22} color="white" />
            </TouchableOpacity>

            {isMenuVisible ? (
              <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>
                <TouchableOpacity style={styles.menuItem} onPress={handleDownloadImage}>
                  <Ionicons name="download" size={18} color={theme.foreground} />
                  <Text className="text-sm text-foreground">Download image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleOpenCaptionEditor}>
                  <Ionicons name="create-outline" size={18} color={theme.foreground} />
                  <Text className="text-sm text-foreground">Change caption</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleDeleteImage}>
                  <Ionicons name="trash-outline" size={18} color={theme.destructive} />
                  <Text className="text-sm" style={{ color: theme.destructive }}>
                    Delete image
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {activeImage ? (
              <View style={styles.viewerMetadataContainer}>
                <Text className="text-base font-semibold text-white">
                  {activeImage.caption?.trim() || 'No caption'}
                </Text>
                <Text className="mt-1 text-xs text-white/80">{activeImage.label}</Text>
              </View>
            ) : null}

            {isEditingCaption ? (
              <View style={styles.editorBackdrop}>
                <View style={[styles.editorCard, { backgroundColor: theme.card }]}>
                  <Text className="mb-2 text-base font-semibold text-foreground">Update caption</Text>
                  <TextInput
                    value={captionInput}
                    onChangeText={setCaptionInput}
                    placeholder="Write a caption"
                    placeholderTextColor={theme.mutedForeground}
                    style={[
                      styles.editorInput,
                      {
                        color: theme.foreground,
                        borderColor: theme.border,
                        backgroundColor: theme.background,
                      },
                    ]}
                    maxLength={120}
                  />
                  <View style={styles.editorActions}>
                    <TouchableOpacity
                      style={[styles.editorButton, { borderColor: theme.border }]}
                      onPress={() => setIsEditingCaption(false)}>
                      <Text className="text-sm text-muted-foreground">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.editorButton, { backgroundColor: theme.primary }]}
                      onPress={handleSaveCaption}>
                      <Text className="text-sm font-semibold text-white">Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        )}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerCloseButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerMenuButton: {
    position: 'absolute',
    top: 56,
    right: 62,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContainer: {
    position: 'absolute',
    top: 102,
    right: 16,
    borderRadius: 12,
    minWidth: 170,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewerMetadataContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  editorBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  editorCard: {
    width: '100%',
    borderRadius: 16,
    padding: 14,
  },
  editorInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  editorActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editorButton: {
    minWidth: 76,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: 'center',
  },
});
