import React, { useEffect, useRef } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { logger } from '@/utils/logger';

type CheckinCameraCaptureProps = {
  isBusy: boolean;
  onClose: () => void;
  onImageSelected: (imageUri: string) => void;
};

export default function CheckinCameraCapture({
  isBusy,
  onClose,
  onImageSelected,
}: CheckinCameraCaptureProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleTakePicture = async () => {
    if (!cameraRef.current || isBusy) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });

      if (!photo?.uri) {
        Alert.alert('Capture failed', 'Could not capture photo. Please try again.');
        return;
      }

      onImageSelected(photo.uri);
    } catch (error) {
      logger.error('[CheckinCameraCapture] Failed to capture photo', error);
      Alert.alert('Error', 'Could not capture photo. Please try again.');
    }
  };

  const handlePickImage = async () => {
    if (isBusy) {
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      onImageSelected(result.assets[0].uri);
    } catch (error) {
      logger.error('[CheckinCameraCapture] Failed to pick image', error);
      Alert.alert('Error', 'Failed to process selected photo.');
    }
  };

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-4 text-center text-base text-foreground">
          We need camera permission to take photos for check-in.
        </Text>
        <Button onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back">
        <View style={styles.overlay}>
          <View className="px-5 pt-14">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={onClose}
                disabled={isBusy}
                className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
              >
                <Ionicons name="close" size={26} color="white" />
              </TouchableOpacity>

              <Text className="text-base font-semibold text-white">Check in</Text>

              <TouchableOpacity
                onPress={handlePickImage}
                disabled={isBusy}
                className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
              >
                <Ionicons name="image" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-1 items-center justify-center px-6">
            <View className="h-64 w-64 rounded-2xl border-2 border-green-500" />
            <Text className="mt-4 text-center text-sm font-semibold text-white">
              Take a photo to complete check-in
            </Text>
          </View>
        </View>
      </CameraView>

      <View className="absolute bottom-9 left-0 right-0 items-center">
        <TouchableOpacity
          style={[styles.captureButton, isBusy ? styles.captureButtonDisabled : null]}
          onPress={handleTakePicture}
          disabled={isBusy}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
});
