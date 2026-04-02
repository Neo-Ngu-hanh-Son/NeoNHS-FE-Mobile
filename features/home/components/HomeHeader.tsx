import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { SmartImage } from '@/components/ui/smart-image';

type HomeHeaderProps = {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  userAvatar?: string;
};

export default function HomeHeader({
  onNotificationPress,
  onProfilePress,
  userAvatar,
}: HomeHeaderProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const normalizedUserAvatar = userAvatar?.trim();

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      {/* Logo */}
      <View className="flex-row items-center gap-2">
        <View className="elevation-md h-9 w-9 items-center justify-center rounded-full border border-black">
          <Image
            source={require('@/assets/images/NeoNHSLogo.png')}
            className="h-9 w-9 rounded-full object-cover"
          />
        </View>
        <Text className="text-xl font-bold" style={{ color: theme.primary }}>
          NeoNHS
        </Text>
      </View>

      {/* Right Actions */}
      <View className="flex-row items-center gap-3">
        <Button variant="ghost" size="icon" onPress={onNotificationPress} className="rounded-full">
          <Ionicons name="notifications-outline" size={20} color={theme.foreground} />
        </Button>

        <TouchableOpacity
          onPress={onProfilePress}
          className="h-9 w-9 items-center justify-center overflow-hidden rounded-full"
          style={{ backgroundColor: theme.primary }}>
          {normalizedUserAvatar ? (
            <SmartImage uri={normalizedUserAvatar} className="h-full w-full" />
          ) : (
            <Ionicons name="person" size={18} color={theme.primaryForeground} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
