import { Button } from '@/components/ui/button';
import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

export default function CheckinPhotoPreviewActions({
  onFinishCheckin,
  onTakeAnother,
  isSubmitting,
  isSavingPhoto,
  photoUri,
}: {
  onFinishCheckin: () => void;
  onTakeAnother: () => void;
  isSubmitting: boolean;
  isSavingPhoto: boolean;
  photoUri: string | null;
}) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <View className="gap-4">
      <Button
        onPress={onFinishCheckin}
        disabled={isSubmitting || isSavingPhoto || !photoUri}
        className="h-14 w-full flex-row items-center justify-center rounded-2xl shadow-lg shadow-primary/20">
        {isSubmitting ? (
          <ActivityIndicator color="white" className="mr-2" />
        ) : (
          <Ionicons name="checkmark" size={22} color="white" className="mr-2" />
        )}
        <Text className="text-lg font-bold text-white">{isSubmitting ? 'Posting...' : 'Finish Check-in'}</Text>
      </Button>

      <Button
        onPress={onTakeAnother}
        variant="outline"
        disabled={isSubmitting || isSavingPhoto}
        className="h-14 w-full flex-row items-center justify-center rounded-2xl border-2 border-primary/10">
        <Ionicons name="camera-outline" size={20} color={theme.foreground} className="mr-2" />
        <Text className="font-semibold text-foreground">Save and take another</Text>
      </Button>
    </View>
  );
}
