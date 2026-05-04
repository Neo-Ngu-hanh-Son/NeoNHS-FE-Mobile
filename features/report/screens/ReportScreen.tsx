import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Platform, FlatList } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList, MainStackParamList, RootStackParamList } from '@/app/navigations/NavigationParamTypes';
import { useModal } from '@/app/providers/ModalProvider';
import { useReport } from '../hooks/useReport';
import { useUploadImage } from '@/hooks/useImageUtils';
import { X, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/features/auth';
import { generateImageUploadData } from '@/utils/uploadImageHelper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';
import { GestureViewer } from 'react-native-gesture-image-viewer';
import { cn } from '@/lib/utils';
import * as ImageManipulator from 'expo-image-manipulator';
import { CompositeScreenProps } from '@react-navigation/native';

type Props = CompositeScreenProps<
  StackScreenProps<MainStackParamList, "ReportScreen">,
  StackScreenProps<RootStackParamList>
>;

export default function ReportScreen({ route, navigation }: Props) {
  const { initialTargetId, initialTargetType, reportTargetName } = route.params;
  const { info, alert } = useModal();
  const insets = useSafeAreaInsets();

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const { accessToken } = useAuth();

  const { mutateAsync: uploadImage, isPending: isImageLoading, error: uploadError } = useUploadImage();
  const { mutateAsync: submitReport, isPending: isReportLoading, error: reportError } = useReport();

  useEffect(() => {
    if (!accessToken) {
      alert({
        title: "Cần đăng nhập",
        message: "Vui lòng đăng nhập để gửi báo cáo.",
        cancelable: true,
        buttons: [
          { text: 'Hủy', onPress: () => navigation.goBack(), style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
        ],
      });
    }
  }, [accessToken, alert, navigation])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Gửi báo cáo",
      headerShown: true,
      headerBackTitle: "Quay lại",
      headerTitleStyle: { fontSize: 17, fontWeight: '600' },
    });
  }, [navigation]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.6,
    });
    if (!result || result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [
        {
          resize: {
            width: Math.min(result.assets[0].width, 1000),
          },
        },
      ],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    if (!result.canceled) {
      const uri = manipulatedImage.uri;
      setLocalImageUri(uri);
      try {
        const uploadedUrl = await uploadImage({
          image: generateImageUploadData({ localUri: uri }),
          token: accessToken ?? '',
        });
        setEvidenceUrl(uploadedUrl.mediaUrl);
      } catch (err: any) {
        setLocalImageUri(null);
        alert({
          title: "Upload thất bại",
          message: err?.message || "Upload thất bại.",
          cancelable: true
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim() || reason.length < 10) {
      alert({
        title: "Cần chi tiết hơn",
        message: "Vui lòng cung cấp ít nhất 10 ký tự cho lý do.",
        cancelable: true
      });
      return;
    }

    try {
      await submitReport({
        targetId: initialTargetId,
        targetType: initialTargetType,
        reason,
        description,
        evidenceUrl,
      });
      info({ title: "Gửi thành công", message: "Chúng tôi đã nhận được báo cáo của bạn." });
      navigation.goBack();
    } catch (error: any) {
      alert({
        title: "Lỗi",
        message: error?.message || "Gửi thất bại.",
        cancelable: true
      });
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="p-5 pb-12"
      showsVerticalScrollIndicator={false}
    >
      {/* Header Info Card */}
      <View className="mb-8">
        <Text className="text-foreground text-lg font-bold uppercase tracking-wider mb-1">
          Báo cáo {initialTargetType}:
        </Text>
        <Text className="text-lg font-semibold text-slate-900">
          {reportTargetName ?? initialTargetId}
        </Text>
      </View>

      {/* Reason Input */}
      <View className="mb-6">
        <View className="flex-row justify-between items-end mb-2 px-1">
          <Text className="text-base font-semibold text-slate-800">Lý do</Text>
          <Text className={cn("text-xs font-medium", reason.length < 10 ? "text-slate-400" : "text-green-600")}>
            {reason.length} ký tự
          </Text>
        </View>
        <TextInput
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-[16px] text-slate-900 min-h-[80px] shadow-sm shadow-slate-200"
          placeholder="Short reason (e.g., Inappropriate content)"
          placeholderTextColor="#94a3b8"
          value={reason}
          onChangeText={setReason}
        />
      </View>

      {/* Description Input */}
      <View className="mb-6">
        <View className="flex-row justify-between items-end mb-2 px-1">
          <Text className="text-base font-semibold text-slate-800">Mô tả</Text>
          <Text className="text-xs font-medium text-slate-400">
            {description.length} ký tự
          </Text>
        </View>
        <TextInput
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          className="w-full p-4 border border-slate-200 rounded-2xl bg-white text-[16px] text-slate-900 min-h-[160px] shadow-sm shadow-slate-200"
          placeholder="Describe exactly what happened..."
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Evidence Upload */}
      <View className="mb-8">
        <Text className="text-base font-semibold text-slate-800 mb-2 px-1">Bằng chứng (Không bắt buộc)</Text>
        <View className="flex-row items-center">
          {!localImageUri ? (
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={isImageLoading}
              className="flex-row items-center justify-center bg-slate-50 py-3 px-5 rounded-xl border border-slate-200 border-dashed"
            >
              {isImageLoading ? (
                <ActivityIndicator color="#64748b" />
              ) : (
                <>
                  <ImageIcon size={18} color="#64748b" />
                  <Text className="text-slate-600 font-medium ml-2">Tải lên ảnh</Text>
                </>
              )}
            </TouchableOpacity>
          ) : isImageLoading ? (
            <View className="flex-row items-center justify-center bg-slate-50 py-3 px-5 rounded-xl border border-slate-200 border-dashed">
              <ActivityIndicator color="#64748b" />
              <Text className="text-slate-600 font-medium ml-2">Đang tải lên...</Text>
            </View>
          ) : (
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => setIsViewerVisible(true)}
                className="flex-row items-center justify-center bg-slate-100 py-3 px-5 rounded-xl border border-slate-200 flex-1"
              >
                <ImageIcon size={18} color="#0f172a" />
                <Text className="text-slate-900 font-medium ml-2">Xem bằng chứng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setLocalImageUri(null); setEvidenceUrl(''); }}
                className="p-3 bg-red-50 rounded-xl border border-red-100 ml-3"
              >
                <X size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {evidenceUrl ? (
          <View className="flex-row items-center mt-2 ml-1">
            <CheckCircle2 size={14} color="#16a34a" />
            <Text className="text-xs text-green-600 ml-1.5 font-medium">Đã tải lên ảnh</Text>
          </View>
        ) : null}
      </View>

      {/* Error Display */}
      {(reportError || uploadError) && (
        <View className="mb-6 flex-row items-center p-4 bg-red-50 border border-red-100 rounded-2xl">
          <AlertCircle size={20} color="#ef4444" />
          <Text className="ml-3 text-sm text-red-700 flex-1 font-medium">
            {uploadError ? "Upload ảnh thất bại." : "Gửi báo cáo thất bại. Vui lòng thử lại."}
          </Text>
        </View>
      )}

      {/* Warning/Disclaimer */}
      <View className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex-row">
        <AlertCircle size={20} color="#d97706" />
        <View className="flex-1 ml-3">
          <Text className="text-[13px] text-amber-900 leading-5">
            Báo cáo sẽ được xem xét trong vòng 24 giờ. Lạm dụng hệ thống báo cáo có thể dẫn đến việc bị khóa tài khoản vĩnh viễn.
          </Text>
        </View>
      </View>


      <Button
        onPress={handleSubmit}
        variant={'default'}
        size={'lg'}
        className="w-full h-14 rounded-full bg-primary"
        disabled={isReportLoading || isImageLoading}
      >
        {(isReportLoading || isImageLoading) && <ActivityIndicator color="white" />}
        <Text className='text-lg font-semibold text-white'>
          {isImageLoading ? 'Đang tải ảnh lên' : isReportLoading ? 'Đang gửi báo cáo' : 'Gửi báo cáo'}
        </Text>
      </Button>

      {/* Image Viewer Modal */}
      {localImageUri && (
        <Modal visible={isViewerVisible} transparent animationType="fade" onRequestClose={() => setIsViewerVisible(false)}>
          <GestureViewer
            data={[{ uri: localImageUri }]}
            initialIndex={0}
            onDismiss={() => setIsViewerVisible(false)}
            renderItem={(item) => (
              <SmartImage
                uri={item.uri}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain" />
            )}
            renderContainer={(children, helpers) => (
              <View style={{ flex: 1, backgroundColor: 'white' }}>
                {children}
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: Platform.OS === 'ios' ? 60 + insets.top : 20 + insets.top,
                    right: 20,
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: '#000000',
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99,
                  }}
                  onPress={() => helpers.dismiss()}
                >
                  <X size={24} color="black" />
                </TouchableOpacity>
              </View>
            )}
            ListComponent={FlatList}
          />
        </Modal>
      )}
    </ScrollView>
  );
}