import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

type CheckinPhotoReviewModalProps = {
  visible: boolean;
  photoUri: string | null;
  caption: string;
  isSubmitting: boolean;
  onClose: () => void;
  onCaptionChange: (value: string) => void;
  onTakeAnother: () => void;
  onFinishCheckin: () => void;
};

export default function CheckinPhotoReviewModal({
  visible,
  photoUri,
  caption,
  isSubmitting,
  onClose,
  onCaptionChange,
  onTakeAnother,
  onFinishCheckin,
}: CheckinPhotoReviewModalProps) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="rounded-t-3xl bg-background px-5 pb-8 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Review photo</Text>
              <TouchableOpacity
                onPress={onClose}
                disabled={isSubmitting}
                className="h-9 w-9 items-center justify-center rounded-full bg-muted"
              >
                <Ionicons name="close" size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                className="mb-4 h-64 w-full rounded-2xl bg-muted"
                resizeMode="cover"
              />
            ) : null}

            <View className="mb-6">
              <Text className="mb-2 text-sm text-muted-foreground">Caption (optional)</Text>
              <Input
                value={caption}
                onChangeText={onCaptionChange}
                editable={!isSubmitting}
                placeholder="Write a caption for this check-in photo"
              />
            </View>

            <View className="gap-3">
              <Button
                onPress={onTakeAnother}
                variant="outline"
                disabled={isSubmitting || !photoUri}
                className="h-12 rounded-xl"
              >
                <Text>Take Another</Text>
              </Button>
              <Button
                onPress={onFinishCheckin}
                disabled={isSubmitting || !photoUri}
                className="h-12 rounded-xl"
              >
                <Text>{isSubmitting ? 'Finishing...' : 'Finish Check-in'}</Text>
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
