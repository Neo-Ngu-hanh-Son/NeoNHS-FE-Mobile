import React, { useState, useRef } from 'react';
import { Image } from 'expo-image';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import type { StackScreenProps } from '@react-navigation/stack';

import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { userService } from '@/features/profile/services/userService';
import type { MainStackParamList } from '@/app/navigations/NavigationParamTypes';

type Props = StackScreenProps<MainStackParamList, 'KycVerification'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ImageKey = 'front' | 'back' | 'selfie';
type KycStep = ImageKey | 'review' | 'result';

interface StepConfig {
  key: ImageKey;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  cameraFacing: 'back' | 'front';
}

const STEPS: StepConfig[] = [
  {
    key: 'front',
    title: 'Front of ID Card',
    subtitle: 'Take a photo or upload the front side of your CCCD/ID card',
    icon: 'credit-card',
    cameraFacing: 'back',
  },
  {
    key: 'back',
    title: 'Back of ID Card',
    subtitle: 'Take a photo or upload the back side of your CCCD/ID card',
    icon: 'flip',
    cameraFacing: 'back',
  },
  {
    key: 'selfie',
    title: 'Selfie Verification',
    subtitle: 'Take a selfie photo to verify your identity',
    icon: 'face',
    cameraFacing: 'front',
  },
];

export default function KycVerificationScreen({ navigation }: Props) {
  const { user, updateUser } = useAuth();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentMode, setCurrentMode] = useState<'choose' | 'camera'>('choose');
  const [images, setImages] = useState<Record<ImageKey, string | undefined>>({
    front: undefined,
    back: undefined,
    selfie: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycResult, setKycResult] = useState<any>(null);
  const [activeStep, setActiveStep] = useState<KycStep>('front');

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const currentConfig = STEPS[currentStepIndex];

  // ─── Convert file URI to base64 ───
  const uriToBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // ─── Take Photo with Camera ───
  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (photo) {
        const base64Data = photo.base64 || (await uriToBase64(photo.uri));
        setImages((prev) => ({ ...prev, [currentConfig.key]: base64Data }));
        setCurrentMode('choose');
        moveToNextStep();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // ─── Pick Image from Gallery ───
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const base64Data = asset.base64 || (await uriToBase64(asset.uri));
        setImages((prev) => ({ ...prev, [currentConfig.key]: base64Data }));
        moveToNextStep();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // ─── Open Camera Mode ───
  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission required', 'Camera permission is needed to take photos for KYC verification.');
        return;
      }
    }
    setCurrentMode('camera');
  };

  // ─── Move to next step ───
  const moveToNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      const next = currentStepIndex + 1;
      setCurrentStepIndex(next);
      setActiveStep(STEPS[next].key);
    } else {
      setActiveStep('review');
    }
  };

  // ─── Go back to previous step ───
  const handleBack = () => {
    if (currentMode === 'camera') {
      setCurrentMode('choose');
      return;
    }
    if (activeStep === 'review') {
      setCurrentStepIndex(STEPS.length - 1);
      setActiveStep(STEPS[STEPS.length - 1].key);
      return;
    }
    if (currentStepIndex > 0) {
      const prev = currentStepIndex - 1;
      setCurrentStepIndex(prev);
      setActiveStep(STEPS[prev].key);
      // Clear current step image so user can retake
      setImages((prev) => ({ ...prev, [currentConfig.key]: undefined }));
    } else {
      navigation.goBack();
    }
  };

  // ─── Retake a specific step ───
  const handleRetake = (step: ImageKey) => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx >= 0) {
      setCurrentStepIndex(idx);
      setActiveStep(step);
      setImages((prev) => ({ ...prev, [step]: undefined }));
    }
  };

  // ─── Submit KYC ───
  const handleSubmit = async () => {
    if (!images.front || !images.back || !images.selfie) {
      Alert.alert('Missing images', 'Please capture all 3 required images.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await userService.performKyc(user.id, {
        frontImageBase64: images.front,
        backImageBase64: images.back,
        selfieImageBase64: images.selfie,
      });

      if (response.success && response.data) {
        setKycResult(response.data);
        setActiveStep('result');

        if (response.data.success) {
          // Update local user state
          updateUser({ kycVerified: true });
        }
      } else {
        // API returned error in wrapper
        setKycResult({
          success: false,
          message: response.message || 'KYC verification failed',
        });
        setActiveStep('result');
      }
    } catch (error: any) {
      setKycResult({
        success: false,
        message: error.message || 'An error occurred during KYC verification',
      });
      setActiveStep('result');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── RENDER: Step Indicator ───
  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {STEPS.map((step, index) => {
        const isCompleted = !!images[step.key];
        const isCurrent = activeStep === step.key;
        const isReview = activeStep === 'review' || activeStep === 'result';

        return (
          <React.Fragment key={step.key}>
            <View style={styles.stepDot}>
              <View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isCurrent && !isCompleted && styles.dotActive,
                  isReview && styles.dotCompleted,
                ]}>
                {isCompleted || isReview ? (
                  <MaterialIcons name="check" size={14} color="white" />
                ) : (
                  <Text style={[styles.dotText, isCurrent && styles.dotTextActive]}>{index + 1}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  { color: theme.mutedForeground },
                  (isCurrent || isCompleted || isReview) && { color: theme.primary, fontWeight: '600' },
                ]}
                numberOfLines={1}>
                {step.key === 'front' ? 'Front' : step.key === 'back' ? 'Back' : 'Selfie'}
              </Text>
            </View>
            {index < STEPS.length - 1 && (
              <View style={[styles.stepLine, (isCompleted || isReview) && { backgroundColor: theme.primary }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  // ─── RENDER: Camera View ───
  const renderCamera = () => (
    <View style={styles.cameraContainer}>
      <CameraView ref={cameraRef} style={styles.camera} facing={currentConfig.cameraFacing}>
        {/* Camera overlay frame */}
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraFrame}>
            {currentConfig.key === 'selfie' ? (
              <View style={styles.selfieFrame}>
                <MaterialIcons name="face" size={100} color="rgba(255,255,255,0.3)" />
              </View>
            ) : (
              <View style={styles.cardFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <MaterialIcons
                  name={currentConfig.icon}
                  size={48}
                  color="rgba(255,255,255,0.3)"
                  style={{ alignSelf: 'center' }}
                />
              </View>
            )}
          </View>
          <Text style={styles.cameraHint}>
            {currentConfig.key === 'selfie'
              ? 'Position your face in the center'
              : 'Align your ID card within the frame'}
          </Text>
        </View>
      </CameraView>

      {/* Camera controls */}
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.cameraBackBtn} onPress={() => setCurrentMode('choose')}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureBtn} onPress={handleTakePhoto}>
          <View style={styles.captureBtnInner} />
        </TouchableOpacity>

        <View style={{ width: 48 }} />
      </View>
    </View>
  );

  // ─── RENDER: Choose Mode (camera or gallery) ───
  const renderChooseMode = () => (
    <ScrollView contentContainerStyle={styles.chooseContent} showsVerticalScrollIndicator={false}>
      {/* Step icon */}
      <View style={[styles.stepIconCircle, { backgroundColor: theme.primary + '15' }]}>
        <MaterialIcons name={currentConfig.icon} size={48} color={theme.primary} />
      </View>

      <Text style={[styles.stepTitle, { color: theme.foreground }]}>{currentConfig.title}</Text>
      <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>{currentConfig.subtitle}</Text>

      {/* Preview if image already taken */}
      {images[currentConfig.key] && (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${images[currentConfig.key]}` }}
            style={styles.previewImage}
            contentFit="cover"
          />
          <View style={styles.previewBadge}>
            <MaterialIcons name="check-circle" size={20} color="#22C55E" />
            <Text style={styles.previewBadgeText}>Photo captured</Text>
          </View>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          onPress={handleOpenCamera}
          activeOpacity={0.8}>
          <MaterialIcons name="camera-alt" size={28} color="white" />
          <Text style={styles.actionBtnText}>Take Photo</Text>
          <Text style={styles.actionBtnHint}>Use your camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderWidth: 1.5, borderColor: theme.primary }]}
          onPress={handlePickImage}
          activeOpacity={0.8}>
          <MaterialIcons name="photo-library" size={28} color={theme.primary} />
          <Text style={[styles.actionBtnText, { color: theme.primary }]}>Upload Photo</Text>
          <Text style={[styles.actionBtnHint, { color: theme.mutedForeground }]}>From your gallery</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ─── RENDER: Review all images before submit ───
  const renderReview = () => (
    <ScrollView contentContainerStyle={styles.reviewContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.stepIconCircle, { backgroundColor: theme.primary + '15' }]}>
        <MaterialIcons name="verified" size={48} color={theme.primary} />
      </View>

      <Text style={[styles.stepTitle, { color: theme.foreground }]}>Review & Submit</Text>
      <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>
        Review your photos before submitting for verification
      </Text>

      {/* Image previews */}
      <View style={styles.reviewGrid}>
        {STEPS.map((step) => (
          <View key={step.key} style={[styles.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${images[step.key]}` }}
              style={styles.reviewImage}
              contentFit="cover"
            />
            <View style={styles.reviewCardInfo}>
              <Text style={[styles.reviewCardLabel, { color: theme.foreground }]}>{step.title}</Text>
              <TouchableOpacity onPress={() => handleRetake(step.key)} disabled={isSubmitting}>
                <Text
                  style={{
                    color: isSubmitting ? theme.mutedForeground : theme.primary,
                    fontSize: 12,
                    fontWeight: '600',
                  }}>
                  Retake
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Submit button */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: theme.primary }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}>
        {isSubmitting ? (
          <View style={styles.submitLoading}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.submitBtnText}>Verifying...</Text>
          </View>
        ) : (
          <>
            <MaterialIcons name="verified-user" size={22} color="white" />
            <Text style={styles.submitBtnText}>Submit Verification</Text>
          </>
        )}
      </TouchableOpacity>

      {isSubmitting && (
        <Text style={[styles.submitHint, { color: theme.mutedForeground }]}>
          This may take a moment. Please don't close the app.
        </Text>
      )}
    </ScrollView>
  );

  // ─── RENDER: Result ───
  const renderResult = () => {
    const isSuccess = kycResult?.success;

    return (
      <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.resultIconCircle, { backgroundColor: isSuccess ? '#22C55E15' : '#EF444415' }]}>
          <MaterialIcons
            name={isSuccess ? 'check-circle' : 'error'}
            size={72}
            color={isSuccess ? '#22C55E' : '#EF4444'}
          />
        </View>

        <Text style={[styles.resultTitle, { color: theme.foreground }]}>
          {isSuccess ? 'Verification Successful!' : 'Verification Failed'}
        </Text>
        <Text style={[styles.resultMessage, { color: theme.mutedForeground }]}>
          {kycResult?.message || 'Unknown result'}
        </Text>

        {isSuccess && kycResult?.fullName && (
          <View style={[styles.resultDetails, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: theme.mutedForeground }]}>Full Name</Text>
              <Text style={[styles.resultValue, { color: theme.foreground }]}>{kycResult.fullName}</Text>
            </View>
            {kycResult.idNumber && (
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: theme.mutedForeground }]}>ID Number</Text>
                <Text style={[styles.resultValue, { color: theme.foreground }]}>{kycResult.idNumber}</Text>
              </View>
            )}
            {kycResult.faceMatchScore != null && (
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: theme.mutedForeground }]}>Face Match</Text>
                <Text style={[styles.resultValue, { color: '#22C55E' }]}>{kycResult.faceMatchScore.toFixed(1)}%</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.primary, marginTop: 32 }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
          <Text style={styles.submitBtnText}>{isSuccess ? 'Back to Profile' : 'Try Again Later'}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // ─── RENDER: Main content ───
  const renderContent = () => {
    if (activeStep === 'result') return renderResult();
    if (activeStep === 'review') return renderReview();
    if (currentMode === 'camera') return renderCamera();
    return renderChooseMode();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkColorScheme ? theme.background : THEME.light.primary }]}>
      {/* Header */}
      <SafeAreaView
        edges={['top']}
        style={[styles.header, { backgroundColor: isDarkColorScheme ? theme.background : THEME.light.primary }]}>
        <TouchableOpacity style={styles.headerBack} onPress={handleBack}>
          <MaterialIcons name="chevron-left" size={28} color="white" />
          <Text style={styles.headerBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity Verification</Text>
        <View style={{ width: 60 }} />
      </SafeAreaView>

      {/* Main Sheet */}
      <View style={[styles.mainSheet, { backgroundColor: theme.background }]}>
        {/* Step indicator (hide during camera and result) */}
        {currentMode !== 'camera' && activeStep !== 'result' && renderStepIndicator()}

        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 80,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBack: { flexDirection: 'row', alignItems: 'center', width: 60 },
  headerBackText: { color: 'white', fontSize: 16, fontWeight: '500' },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: '700' },
  mainSheet: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },

  // Step indicator
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  stepDot: { alignItems: 'center', width: 60 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: { backgroundColor: '#22C55E' },
  dotActive: { backgroundColor: '#3B82F6' },
  dotText: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  dotTextActive: { color: 'white' },
  stepLabel: { fontSize: 11, marginTop: 4, fontWeight: '500' },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 18,
  },

  // Choose mode
  chooseContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  stepIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  stepSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 28, paddingHorizontal: 16 },
  actionButtons: { width: '100%', gap: 14 },
  actionBtn: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: { fontSize: 16, fontWeight: '700', color: 'white' },
  actionBtnHint: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },

  // Preview
  previewContainer: {
    width: '100%',
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  previewBadgeText: { fontSize: 13, fontWeight: '600', color: '#22C55E' },

  // Camera
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFrame: { justifyContent: 'center', alignItems: 'center' },
  cardFrame: {
    width: SCREEN_WIDTH - 64,
    height: (SCREEN_WIDTH - 64) * 0.63,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    justifyContent: 'center',
    position: 'relative',
  },
  selfieFrame: {
    width: 200,
    height: 260,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: 'white',
  },
  cornerTL: { top: -1, left: -1, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 16 },
  cornerTR: { top: -1, right: -1, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 16 },
  cornerBL: { bottom: -1, left: -1, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: -1, right: -1, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 16 },
  cameraHint: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  cameraBackBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  captureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
  },

  // Review
  reviewContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  reviewGrid: { width: '100%', gap: 12, marginTop: 8 },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  reviewImage: { width: '100%', height: 140 },
  reviewCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reviewCardLabel: { fontSize: 14, fontWeight: '600' },
  submitBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  submitLoading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  submitHint: { fontSize: 12, textAlign: 'center', marginTop: 12 },

  // Result
  resultContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  resultIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resultTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  resultMessage: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
  resultDetails: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: { fontSize: 13, fontWeight: '500' },
  resultValue: { fontSize: 14, fontWeight: '700' },
});
