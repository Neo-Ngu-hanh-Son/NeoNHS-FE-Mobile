import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { userService } from '../services/userService';
import { uploadImageToCloudinary } from '@/services/cloudinary';
import { ApiError } from '@/services/api/types';
import { logger } from '@/utils/logger';

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: string;
}

export default function UpdateAccountScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [fullName, setFullName] = useState(user?.fullname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [userId, setUserId] = useState(user?.id || '');

  // Bank info
  const [bankName, setBankName] = useState('');
  const [bankBin, setBankBin] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);
  const [searchBankQuery, setSearchBankQuery] = useState('');
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch dữ liệu mới nhất khi mở màn hình
  const fetchBanks = async () => {
    try {
      setIsLoadingBanks(true);
      const response = await fetch('https://api.vietqr.io/v2/banks');
      const data = await response.json();
      if (data.code === '00') {
        setBanks(data.data);
        setFilteredBanks(data.data);
      }
    } catch (error) {
      console.error('Fetch banks error:', error);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    if (searchBankQuery.trim() === '') {
      setFilteredBanks(banks);
    } else {
      const lowerQuery = searchBankQuery.toLowerCase();
      const filtered = banks.filter(
        (bank) =>
          bank.name.toLowerCase().includes(lowerQuery) ||
          bank.shortName.toLowerCase().includes(lowerQuery) ||
          bank.bin.toLowerCase().includes(lowerQuery)
      );
      setFilteredBanks(filtered);
    }
  }, [searchBankQuery, banks]);

  const handleSelectBank = (bank: Bank) => { // User yêu cầu: sẽ hiện list ... chọn xong set bin luôn
    setBankName(bank.shortName);
    setBankBin(bank.bin);
    setIsBankModalVisible(false);
    setSearchBankQuery('');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await userService.getProfile();
        if (response.success && response.data) {
          setFullName(response.data.fullname || '');
          setEmail(response.data.email || '');
          setPhoneNumber(response.data.phoneNumber || '');
          setAvatarUrl(response.data.avatarUrl || '');
          setUserId(response.data.id || '');
          setBankName(response.data.bankName || '');
          setBankBin(response.data.bankBin || '');
          setBankAccountNumber(response.data.bankAccountNumber || '');
          setBankAccountName(response.data.bankAccountName || '');
        }
      } catch (error) {
        console.error('Fetch initial data error:', error);
      }
    };
    fetchUserData();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop();
      const type = `image/${filename?.split('.').pop()}`;

      // Tạo object file đúng định dạng React Native FormData
      const fileObj = {
        uri: localUri,
        name: filename || 'upload.jpg',
        type: type,
      } as any;

      setIsUploading(true);
      try {
        const uploadedUrl = await uploadImageToCloudinary(fileObj);
        if (uploadedUrl) {
          setAvatarUrl(uploadedUrl);
        } else {
          Alert.alert('Error', 'Failed to upload image to Cloudinary');
        }
      } catch (error) {
        Alert.alert('Error', 'Cloudinary upload failed');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const updateData = {
        fullname: fullName.trim(),
        phoneNumber: phoneNumber ? phoneNumber.trim() : '',
        email: email.trim(),
        avatarUrl: avatarUrl ? avatarUrl : '',
        bankName: bankName.trim() || undefined,
        bankBin: bankBin.trim() || undefined,
        bankAccountNumber: bankAccountNumber.trim() || undefined,
        bankAccountName: bankAccountName.trim() || undefined,
      };

      console.log('Sending data to server:', updateData);

      const response = await userService.updateProfile(userId, updateData);

      if (response.success) {
        updateUser(response.data);
        Alert.alert('Success', 'User profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.log('Full Error Object:', JSON.stringify(error, null, 2));
      const apiError = error as ApiError;
      Alert.alert('System error', apiError.message || 'Server return 500');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              <Text className="mb-6 text-2xl font-bold" style={{ color: theme.foreground }}>
                Account Info
              </Text>

              <TouchableOpacity
                style={[
                  styles.photoCard,
                  { borderColor: theme.border, backgroundColor: theme.card },
                ]}
                activeOpacity={0.7}
                onPress={handlePickImage}
                disabled={isUploading}>
                <View style={styles.avatarWrapper}>
                  {isUploading ? (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.muted }]}>
                      <ActivityIndicator size="small" color={theme.primary} />
                    </View>
                  ) : avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatarPlaceholder} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                      <Ionicons name="person" size={32} color="white" />
                    </View>
                  )}
                  <View style={[styles.plusIcon, { backgroundColor: theme.foreground }]}>
                    <Ionicons name="camera" size={12} color={theme.background} />
                  </View>
                </View>
                <View style={styles.photoInfo}>
                  <Text className="text-sm font-bold" style={{ color: theme.foreground }}>
                    Your Photo
                  </Text>
                  <Text className="mt-1 text-xs" style={{ color: theme.mutedForeground }}>
                    Tap to change your profile picture.
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.foreground }]}>Full Name</Text>
                  <Input
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="Enter your full name"
                    style={[
                      styles.inputCustom,
                      { borderColor: errors.fullName ? theme.destructive : theme.border },
                    ]}
                  />
                  {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.foreground }]}>Email</Text>
                  <Input
                    value={email}
                    onChangeText={setEmail}
                    placeholder="youremail@yahoo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[
                      styles.inputCustom,
                      { borderColor: errors.email ? theme.destructive : theme.border },
                    ]}
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.foreground }]}>Phone Number</Text>
                  <View style={styles.phoneInputRow}>
                    <Input
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="**********"
                      keyboardType="phone-pad"
                      style={[styles.inputCustom, { flex: 1, borderColor: theme.border }]}
                    />
                  </View>
                </View>
              </View>

              {/* Bank Information Section */}
              <Text className="mt-6 mb-4 text-lg font-bold" style={{ color: theme.foreground }}>
                Bank Information
              </Text>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.foreground }]}>Bank Name</Text>
                  <TouchableOpacity
                    onPress={() => setIsBankModalVisible(true)}
                    style={[styles.inputCustom, { borderColor: theme.border, justifyContent: 'center' }]}>
                    <Text style={{ color: bankName ? theme.foreground : theme.mutedForeground }}>
                      {bankName ? banks.find(b => b.bin === bankBin)?.shortName || bankName : 'Select a bank'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.foreground }]}>Bank BIN</Text>
                  <View
                    style={[styles.inputCustom, { borderColor: theme.border, justifyContent: 'center', backgroundColor: theme.muted }]}>
                    <Text style={{ color: bankBin ? theme.foreground : theme.mutedForeground }}>
                      {bankBin ? bankBin : 'Auto-filled upon bank selection'}
                    </Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.foreground }]}>Account Number</Text>
                  <Input
                    value={bankAccountNumber}
                    onChangeText={setBankAccountNumber}
                    placeholder="Enter account number"
                    keyboardType="numeric"
                    style={[styles.inputCustom, { borderColor: theme.border }]}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.foreground }]}>Account Name</Text>
                  <Input
                    value={bankAccountName}
                    onChangeText={setBankAccountName}
                    placeholder="e.g. NGUYEN VAN A"
                    autoCapitalize="characters"
                    style={[styles.inputCustom, { borderColor: theme.border }]}
                  />
                </View>
              </View>

              <View style={styles.buttonWrapper}>
                <Button
                  onPress={handleSave}
                  disabled={isLoading || isUploading}
                  style={[
                    styles.saveButton,
                    { backgroundColor: theme.foreground },
                    (isLoading || isUploading) && { opacity: 0.7 },
                  ]}>
                  <Text style={{ color: theme.background, fontWeight: '700', fontSize: 16 }}>
                    {isLoading ? 'Saving...' : 'Save'}
                  </Text>
                </Button>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>

      <Modal
        visible={isBankModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsBankModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setIsBankModalVisible(false)} style={{ padding: 8, marginRight: 8 }}>
              <Ionicons name="close" size={24} color={theme.foreground} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.foreground, flex: 1 }}>Select Bank</Text>
          </View>
          <View style={{ padding: 16 }}>
            <Input
              value={searchBankQuery}
              onChangeText={setSearchBankQuery}
              placeholder="Search by name, short name or BIN..."
              style={[styles.inputCustom, { borderColor: theme.border }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {isLoadingBanks ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={filteredBanks}
              keyExtractor={(item) => item.bin}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}
                  onPress={() => handleSelectBank(item)}>
                  <Image source={{ uri: item.logo }} style={{ width: 40, height: 40, resizeMode: 'contain', marginRight: 16 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.foreground }}>{item.shortName}</Text>
                    <Text style={{ fontSize: 12, color: theme.mutedForeground }}>{item.name}</Text>
                  </View>
                  <Text style={{ fontSize: 14, color: theme.mutedForeground }}>{item.bin}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { height: 60, justifyContent: 'center', paddingHorizontal: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 4 },
  mainContent: { flex: 1, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: 30 },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 30,
  },
  avatarWrapper: { position: 'relative' },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  plusIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInfo: { flex: 1, marginLeft: 16 },
  formContainer: { gap: 20 },
  inputGroup: { marginBottom: 5 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  inputCustom: { height: 52, borderRadius: 15, borderWidth: 1, paddingHorizontal: 16 },
  phoneInputRow: { flexDirection: 'row', gap: 10 },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 12,
    height: 52,
  },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  buttonWrapper: { marginTop: 40 },
  saveButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
});
