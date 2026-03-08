import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PointDetailBottomBarProps = {
  pointId: string;
  onNavigate: () => void;
  onAudioGuide: () => void;
  hasAudio: boolean;
};

export function PointDetailBottomBar({
  pointId,
  onNavigate,
  onAudioGuide,
  hasAudio,
}: PointDetailBottomBarProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t border-border"
      style={{
        paddingBottom: Math.max(insets.bottom, 16),
        backgroundColor: isDarkColorScheme ? 'rgba(15,17,21,0.92)' : 'rgba(255,255,255,0.92)',
      }}>
      <View className="flex-row items-center gap-3 px-5 pt-4">
        {/* Main CTA */}
        <Button onPress={onNavigate} className="h-14 flex-1 rounded-2xl" size="lg">
          <View className="flex-row items-center gap-2">
            <Ionicons name="navigate" size={18} color="white" />
            <Text className="text-base font-bold text-primary-foreground">Take me there</Text>
          </View>
        </Button>

        {/* Audio guide button */}
        {hasAudio && (
          <Button
            onPress={onAudioGuide}
            variant="outline"
            className="h-14 w-14 rounded-2xl"
            size="icon">
            <Ionicons name="headset-outline" size={22} color={theme.foreground} />
          </Button>
        )}
      </View>
    </View>
  );
}
