import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { THEME } from '@/lib/theme';
import { useTheme } from '@/app/providers/ThemeProvider';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';
import checkinServices from '../services/checkinServices';
import { logger } from '@/utils/logger';
import { uploadImageToCloudinary } from '@/services/cloudinary';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

type CheckinCameraScreenProps = StackScreenProps<MainStackParamList, 'CheckinCamera'>;

export default function CheckinCameraScreen({ navigation, route }: CheckinCameraScreenProps) {
  const { pointId } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isDarkColorScheme } = useTheme();
  const theme = useMemo(() => (isDarkColorScheme ? THEME.dark : THEME.light), [isDarkColorScheme]);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const finalizeSuccess = (message?: string) => {
    Alert.alert('Check-in completed', message ?? 'Your check-in was successful.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const submitCheckinWithImage = async (imageUri: string) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      if (!pointId) {
        Alert.alert('Missing check-in point', 'No check-in point selected. Please return to the map and try again.');
        return;
      }

      const imageUrl = await uploadImageToCloudinary(imageUri);

      if (!imageUrl) {
        Alert.alert('Upload failed', 'Could not upload the photo. Please try again.');
        return;
      }

      const response = await checkinServices.checkIn(pointId, { imageUrl });
      const isSuccess = Boolean(response?.success) || response?.status === 200;

      if (isSuccess) {
        finalizeSuccess(response?.message);
        return;
      }

      Alert.alert('Check-in failed', response?.message ?? 'Unable to complete check-in right now.', [
        {
          text: 'Try again',
        },
      ]);
    } catch (error) {
      logger.error('[CheckinCameraScreen] Check-in failed', error);
      Alert.alert('Error', 'Something went wrong while processing your check-in.', [
        {
          text: 'Try again',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
      });

      if (!photo?.uri) {
        Alert.alert('Capture failed', 'Could not capture photo. Please try again.');
        return;
      }

      await submitCheckinWithImage(photo.uri);
    } catch (error) {
      logger.error('[CheckinCameraScreen] Failed to capture photo', error);
      Alert.alert('Error', 'Could not capture photo. Please try again.');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const imageUri = result.assets[0].uri;
      await submitCheckinWithImage(imageUri);
    } catch (error) {
      logger.error('[CheckinCameraScreen] Checkin failed', error);
      Alert.alert('Error', 'Failed to process selected photo.');
    }
  };

  if (!permission) {
    return <View style={[styles.container, { backgroundColor: theme.background }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.permissionText, { color: theme.foreground }]}>We need camera permission to take photos for check-in.</Text>
        <Button onPress={requestPermission} variant={'default'}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Ionicons name="close" size={26} color="white" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Check in</Text>

            <TouchableOpacity onPress={handlePickImage} style={styles.iconButton}>
              <Ionicons name="image" size={22} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.scanContainer}>
            <View style={styles.scanFrame} />
            <Text style={styles.instructionText}>Point: Nearby check-in</Text>
            <Text style={styles.instructionSubText}>Take a photo to complete check-in</Text>
          </View>
        </View>
      </CameraView>

      <View style={styles.captureControls}>
        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
          onPress={handleTakePicture}
          disabled={isProcessing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>

      <LoadingOverlay visible={isProcessing} message="Processing check-in..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 15,
  },
  permissionButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 58,
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  scanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scanFrame: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: 'white',
    marginTop: 18,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  instructionSubText: {
    color: 'white',
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.85,
  },
  captureControls: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: 'center',
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