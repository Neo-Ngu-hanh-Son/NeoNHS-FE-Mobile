import { View, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

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

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      {/* Logo */}
      <View className="flex-row items-center gap-2">
        <View
          className="w-7 h-7 rounded-md items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <Ionicons name="home" size={16} color={theme.primaryForeground} />
        </View>
        <Text className="text-xl font-bold" style={{ color: theme.primary }}>
          NeoNHS
        </Text>
      </View>

      {/* Right Actions */}
      <View className="flex-row items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onPress={onNotificationPress}
          className="rounded-full"
        >
          <Ionicons name="notifications-outline" size={20} color={theme.foreground} />
        </Button>

        <TouchableOpacity
          onPress={onProfilePress}
          className="w-9 h-9 rounded-full items-center justify-center overflow-hidden"
          style={{ backgroundColor: theme.primary }}
        >
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} className="w-full h-full" />
          ) : (
            <Ionicons name="person" size={18} color={theme.primaryForeground} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
