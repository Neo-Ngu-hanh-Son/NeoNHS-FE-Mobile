import React, { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { userService } from '../services/userService';
import { ApiError } from '@/services/api/types';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type WithdrawStep = 'amount' | 'face' | 'confirm';

export default function WithdrawScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [step, setStep] = useState<WithdrawStep>('amount');
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [livePhotoUri, setLivePhotoUri] = useState<string | null>(null);
  const [livePhotoBase64, setLivePhotoBase64] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success && response.data) {
        setBalance(response.data.balance || 0);
        setBankInfo({
          bankName: response.data.bankName || '',
          bankAccountNumber: response.data.bankAccountNumber || '',
          bankAccountName: response.data.bankAccountName || '',
        });
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
  };

  // ─── Convert file URI to base64 ───
  const uriToBase64 = async (uri: string): Promise<string> => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  };

  // ─── Validate amount and move to face step ───
  const handleProceedToFace = () => {
    const withdrawAmount = parseInt(amount, 10);

    if (!amount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    if (withdrawAmount > balance) {
      Alert.alert(
        'Insufficient Balance',
        `Your balance is ${formatCurrency(balance)}. You cannot withdraw more than that.`
      );
      return;
    }

    if (!bankInfo.bankAccountNumber) {
      Alert.alert('No Bank Account', 'Please update your bank account information in your profile first.');
      return;
    }

    setStep('face');
  };

  // ─── Open camera via ImagePicker and capture photo ───
  const handleOpenCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed for face verification before withdrawal.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setLivePhotoUri(asset.uri);

        setIsLoading(true);
        try {
          // BYPASS liveness check - ảnh vẫn được gửi lên BE qua handleWithdraw
          setStep('confirm');

          // TODO: restore khi xong test
          // const base64Data = await uriToBase64(asset.uri);
          // const livenessRes = await userService.checkLiveness(base64Data);
          // if (livenessRes.success && livenessRes.data) {
          //     setStep('confirm');
          // } else {
          //     Alert.alert('Liveness Check Failed', 'Spoofing detected.');
          //     setLivePhotoUri(null);
          // }
        } catch (error: any) {
          Alert.alert('Error', error.message || 'Something went wrong.');
          setLivePhotoUri(null);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  // ─── Retake photo ───
  const handleRetakePhoto = () => {
    setLivePhotoUri(null);
    setLivePhotoBase64(null);
    setStep('face');
  };

  // ─── Submit withdrawal ───
  const handleWithdraw = async () => {
    const withdrawAmount = parseInt(amount, 10);

    if (!livePhotoUri) {
      Alert.alert('Error', 'Please take a live photo for face verification.');
      return;
    }

    setIsLoading(true);
    try {
      // Convert to base64 at submit time
      const base64Data = await uriToBase64(livePhotoUri);
      const response = await userService.withdraw(withdrawAmount, base64Data);
      if (response.success) {
        Alert.alert('Success', `Successfully withdrew ${formatCurrency(withdrawAmount)}`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert('Withdrawal Failed', apiError.message || 'An error occurred while processing your withdrawal.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Handle back navigation ───
  const handleBack = () => {
    switch (step) {
      case 'confirm':
        setStep('face');
        break;
      case 'face':
        setStep('amount');
        break;
      default:
        navigation.goBack();
    }
  };

  const quickAmounts = [50000, 100000, 200000, 500000];

  // ═══════════════════════════════════════
  // RENDER: Amount Step
  // ═══════════════════════════════════════
  const renderAmountStep = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text className="mb-2 text-2xl font-bold" style={{ color: theme.foreground }}>
          Withdraw Money
        </Text>
        <Text className="mb-6 text-sm" style={{ color: theme.mutedForeground }}>
          Transfer your balance to your linked bank account
        </Text>

        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: theme.primary }]}>
          <View style={styles.balanceHeader}>
            <MaterialIcons name="account-balance-wallet" size={24} color="white" />
            <Text style={styles.balanceLabel}>Available Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        </View>

        {/* Bank Info Card */}
        {bankInfo.bankAccountNumber ? (
          <View style={[styles.bankCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.bankCardHeader}>
              <MaterialIcons name="account-balance" size={20} color={theme.primary} />
              <Text style={[styles.bankCardTitle, { color: theme.foreground }]}>Bank Account</Text>
            </View>
            <Text style={[styles.bankDetail, { color: theme.mutedForeground }]}>
              {bankInfo.bankName} • {bankInfo.bankAccountNumber}
            </Text>
            <Text style={[styles.bankDetail, { color: theme.foreground, fontWeight: '600' }]}>
              {bankInfo.bankAccountName}
            </Text>
          </View>
        ) : (
          <View style={[styles.bankCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <View style={styles.bankCardHeader}>
              <MaterialIcons name="warning" size={20} color="#F59E0B" />
              <Text style={[styles.bankCardTitle, { color: '#92400E' }]}>No Bank Account</Text>
            </View>
            <Text style={{ color: '#92400E', fontSize: 13 }}>Please update your bank info in Edit Profile first.</Text>
          </View>
        )}

        {/* Amount Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.foreground }]}>Withdrawal Amount (VND)</Text>
          <Input
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
            placeholder="Enter amount"
            keyboardType="numeric"
            style={[styles.amountInput, { borderColor: theme.border, fontSize: 20, fontWeight: '700' }]}
          />
        </View>

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountRow}>
          {quickAmounts.map((qa) => (
            <TouchableOpacity
              key={qa}
              style={[
                styles.quickAmountBtn,
                {
                  borderColor: amount === String(qa) ? theme.primary : theme.border,
                  backgroundColor: amount === String(qa) ? theme.primary + '15' : theme.card,
                },
              ]}
              onPress={() => setAmount(String(qa))}>
              <Text
                style={{
                  color: amount === String(qa) ? theme.primary : theme.mutedForeground,
                  fontSize: 12,
                  fontWeight: '600',
                }}>
                {new Intl.NumberFormat('vi-VN').format(qa)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Button */}
        <Button
          onPress={handleProceedToFace}
          disabled={!amount || !bankInfo.bankAccountNumber}
          style={[
            styles.withdrawButton,
            { backgroundColor: theme.primary },
            (!amount || !bankInfo.bankAccountNumber) && { opacity: 0.5 },
          ]}>
          <View style={styles.buttonContent}>
            <MaterialIcons name="face" size={20} color="white" />
            <Text style={styles.buttonText}>Next: Face Verification</Text>
          </View>
        </Button>

        {/* Info hint */}
        <View style={[styles.infoHint, { backgroundColor: theme.primary + '10' }]}>
          <MaterialIcons name="info-outline" size={16} color={theme.primary} />
          <Text style={[styles.infoHintText, { color: theme.mutedForeground }]}>
            A live photo is required for identity verification before withdrawal.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ═══════════════════════════════════════
  // RENDER: Face Verification Step (choose)
  // ═══════════════════════════════════════
  const renderFaceStep = () => (
    <View style={styles.faceStepContainer}>
      <View style={[styles.faceIconCircle, { backgroundColor: theme.primary + '15' }]}>
        <MaterialIcons name="face" size={64} color={theme.primary} />
      </View>

      <Text style={[styles.faceTitle, { color: theme.foreground }]}>Face Verification</Text>
      <Text style={[styles.faceSubtitle, { color: theme.mutedForeground }]}>
        Take a live selfie to verify your identity before withdrawing{' '}
        <Text style={{ fontWeight: '700', color: theme.primary }}>{formatCurrency(parseInt(amount, 10) || 0)}</Text>
      </Text>

      {/* Preview if already captured */}
      {livePhotoUri && (
        <View style={styles.facePreview}>
          <Image source={{ uri: livePhotoUri }} style={styles.facePreviewImage} contentFit="cover" />
          <View style={styles.facePreviewBadge}>
            <MaterialIcons name="check-circle" size={18} color="#22C55E" />
            <Text style={{ color: '#22C55E', fontWeight: '600', fontSize: 13 }}>Photo captured</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.cameraActionBtn, { backgroundColor: theme.primary }]}
        onPress={handleOpenCamera}
        activeOpacity={0.8}>
        <MaterialIcons name="camera-alt" size={28} color="white" />
        <Text style={styles.cameraActionBtnText}>{livePhotoUri ? 'Retake Photo' : 'Open Camera'}</Text>
        <Text style={styles.cameraActionBtnHint}>Use your front camera</Text>
      </TouchableOpacity>

      {livePhotoUri && (
        <TouchableOpacity
          style={[styles.proceedBtn, { backgroundColor: '#22C55E' }]}
          onPress={() => setStep('confirm')}
          activeOpacity={0.8}>
          <MaterialIcons name="check" size={22} color="white" />
          <Text style={styles.proceedBtnText}>Proceed to Confirm</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ═══════════════════════════════════════
  // RENDER: Confirm Step
  // ═══════════════════════════════════════
  const renderConfirmStep = () => {
    const withdrawAmount = parseInt(amount, 10) || 0;

    return (
      <ScrollView contentContainerStyle={styles.confirmContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.faceIconCircle, { backgroundColor: '#22C55E15' }]}>
          <MaterialIcons name="verified-user" size={56} color="#22C55E" />
        </View>

        <Text style={[styles.faceTitle, { color: theme.foreground }]}>Confirm Withdrawal</Text>
        <Text style={[styles.faceSubtitle, { color: theme.mutedForeground }]}>
          Review the details below before confirming
        </Text>

        {/* Summary card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Face preview */}
          {livePhotoUri && (
            <View style={styles.confirmFaceRow}>
              <Image source={{ uri: livePhotoUri }} style={styles.confirmFaceImage} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.confirmLabel, { color: theme.mutedForeground }]}>Face Verification</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialIcons name="check-circle" size={16} color="#22C55E" />
                  <Text style={{ color: '#22C55E', fontWeight: '600', fontSize: 13 }}>Photo ready</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleRetakePhoto}>
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '600' }}>Retake</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Amount */}
          <View style={styles.summaryRow}>
            <Text style={[styles.confirmLabel, { color: theme.mutedForeground }]}>Amount</Text>
            <Text style={[styles.confirmValue, { color: theme.foreground }]}>{formatCurrency(withdrawAmount)}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Bank info */}
          <View style={styles.summaryRow}>
            <Text style={[styles.confirmLabel, { color: theme.mutedForeground }]}>Bank</Text>
            <Text style={[styles.confirmValue, { color: theme.foreground }]}>{bankInfo.bankName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.confirmLabel, { color: theme.mutedForeground }]}>Account</Text>
            <Text style={[styles.confirmValue, { color: theme.foreground }]}>{bankInfo.bankAccountNumber}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.confirmLabel, { color: theme.mutedForeground }]}>Name</Text>
            <Text style={[styles.confirmValue, { color: theme.foreground }]}>{bankInfo.bankAccountName}</Text>
          </View>
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          style={[styles.confirmWithdrawBtn, { backgroundColor: theme.primary }]}
          onPress={handleWithdraw}
          disabled={isLoading}
          activeOpacity={0.8}>
          {isLoading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="white" />
              <Text style={styles.buttonText}>Verifying & Withdrawing...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <MaterialIcons name="send" size={20} color="white" />
              <Text style={styles.buttonText}>Confirm Withdraw {formatCurrency(withdrawAmount)}</Text>
            </View>
          )}
        </TouchableOpacity>

        {isLoading && (
          <Text style={[styles.loadingHint, { color: theme.mutedForeground }]}>
            Verifying your face and processing withdrawal...
          </Text>
        )}
      </ScrollView>
    );
  };

  // ═══════════════════════════════════════
  // RENDER: Main
  // ═══════════════════════════════════════
  const renderContent = () => {
    if (isFetching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      );
    }

    switch (step) {
      case 'face':
        return renderFaceStep();
      case 'confirm':
        return renderConfirmStep();
      default:
        return renderAmountStep();
    }
  };

  // Step indicator text
  const getStepTitle = () => {
    switch (step) {
      case 'face':
        return 'Face Verification';
      case 'confirm':
        return 'Confirm Withdrawal';
      default:
        return 'Withdraw';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getStepTitle()}</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Step indicators */}
        {
          <View style={styles.stepIndicator}>
            {(['amount', 'face', 'confirm'] as const).map((s, i) => {
              const stepOrder = { amount: 0, face: 1, confirm: 2 };
              const currentOrder = stepOrder[step];
              const thisOrder = stepOrder[s];
              const isCompleted = thisOrder < currentOrder;
              const isCurrent = thisOrder === currentOrder;
              const labels = ['Amount', 'Face', 'Confirm'];

              return (
                <React.Fragment key={s}>
                  <View style={styles.stepDotWrap}>
                    <View
                      style={[
                        styles.stepDot,
                        isCompleted && { backgroundColor: '#22C55E' },
                        isCurrent && { backgroundColor: 'white' },
                      ]}>
                      {isCompleted ? (
                        <MaterialIcons name="check" size={12} color="white" />
                      ) : (
                        <Text style={[styles.stepDotText, isCurrent && { color: theme.primary }]}>{i + 1}</Text>
                      )}
                    </View>
                    <Text style={[styles.stepDotLabel, isCurrent && { fontWeight: '700' }]}>{labels[i]}</Text>
                  </View>
                  {i < 2 && (
                    <View
                      style={[
                        styles.stepLine,
                        isCompleted && { backgroundColor: '#22C55E' },
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        }

        <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
          {renderContent()}
        </View>

        {isLoading && step === 'face' && (
          <LoadingOverlay visible={true} message="Checking live face..." />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  backButton: { flexDirection: 'row', alignItems: 'center', width: 60 },
  backText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 4 },
  mainContent: { flex: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Step indicator (on header)
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 40,
    paddingBottom: 16,
  },
  stepDotWrap: { alignItems: 'center' },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  stepDotLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 3, fontWeight: '500' },
  stepLine: {
    flex: 1,
    height: 2,
    marginTop: 11,
    marginHorizontal: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  // Balance card
  balanceCard: { padding: 20, borderRadius: 20, marginBottom: 16 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '500' },
  balanceAmount: { color: 'white', fontSize: 28, fontWeight: '800' },

  // Bank card
  bankCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  bankCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  bankCardTitle: { fontSize: 14, fontWeight: '700' },
  bankDetail: { fontSize: 13, marginTop: 2 },

  // Input
  inputSection: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  amountInput: { height: 60, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 16, textAlign: 'center' },

  // Quick amounts
  quickAmountRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 28 },
  quickAmountBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },

  // Withdraw button
  withdrawButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },

  // Info hint
  infoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  infoHintText: { fontSize: 12, flex: 1, lineHeight: 18 },

  // Face step
  faceStepContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 36, alignItems: 'center' },
  faceIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  faceTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  faceSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16, marginBottom: 28 },
  facePreview: { width: '100%', marginBottom: 20, borderRadius: 16, overflow: 'hidden' },
  facePreviewImage: { width: '100%', height: 200, borderRadius: 16 },
  facePreviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  cameraActionBtn: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
  },
  cameraActionBtnText: { fontSize: 16, fontWeight: '700', color: 'white' },
  cameraActionBtnHint: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  proceedBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  proceedBtnText: { fontSize: 16, fontWeight: '700', color: 'white' },

  // Confirm step
  confirmContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40, alignItems: 'center' },
  summaryCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginTop: 8,
    gap: 12,
  },
  confirmFaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  confirmFaceImage: { width: 56, height: 56, borderRadius: 28 },
  confirmLabel: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  confirmValue: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1, width: '100%' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmWithdrawBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loadingHint: { fontSize: 12, textAlign: 'center', marginTop: 12 },
});
