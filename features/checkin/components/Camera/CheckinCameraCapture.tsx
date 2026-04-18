import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Feather, Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { logger } from '@/utils/logger';
import CheckinCameraCenterHint from '@/features/checkin/components/Camera/CheckinCameraCenterHint';
import { CameraIcon } from 'lucide-react-native';

type CheckinCameraCaptureProps = {
  isBusy: boolean;
  onClose: () => void;
  onOpenGallery: () => void;
  onImageSelected: (imageUri: string) => void;
  pointName?: string;
};

export default function CheckinCameraCapture({
  isBusy,
  onClose,
  onOpenGallery,
  onImageSelected,
  pointName,
}: CheckinCameraCaptureProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleTakePicture = async () => {
    if (!cameraRef.current || isBusy || !cameraReady) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
      });
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

  const handleUploadImageFromLib = async () => {
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

  const handleToggleCameraFacing = () => {
    if (isBusy) {
      return;
    }

    setCameraReady(false);
    setCameraFacing((currentFacing) => (currentFacing === 'back' ? 'front' : 'back'));
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
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={cameraFacing}
        onCameraReady={() => setCameraReady(true)}
      />
      <View style={styles.overlay} pointerEvents="box-none">
        <View className="px-5 pt-14">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={onClose}
              disabled={isBusy}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/40">
              <Ionicons name="close" size={26} color="white" />
            </TouchableOpacity>

            <View className="mx-3 flex-1">
              <Text className="text-center text-base font-semibold leading-5 text-white" numberOfLines={2}>
                Checking in at: {pointName}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={handleUploadImageFromLib}
                disabled={isBusy}
                className="h-10 w-10 items-center justify-center rounded-full bg-black/40">
                <Feather name="upload" size={26} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <CheckinCameraCenterHint />

      <View className="absolute bottom-9 left-0 right-0 w-full items-center" pointerEvents="box-none">
        <View className="flex-1 flex-row items-center justify-between gap-12">
          <TouchableOpacity
            onPress={onOpenGallery}
            disabled={isBusy}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/40">
            <Ionicons name="images" size={26} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.captureButton, isBusy ? styles.captureButtonDisabled : null]}
            onPress={handleTakePicture}
            disabled={isBusy || !cameraReady}>
            <CameraIcon size={26} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleToggleCameraFacing}
            disabled={isBusy}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/40">
            <Ionicons name="camera-reverse" size={26} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
});
