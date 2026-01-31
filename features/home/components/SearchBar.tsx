import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
};

export default function SearchBar({
  placeholder = "Search caves, pagodas, or history...",
  value,
  onChangeText,
  onPress,
}: SearchBarProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  // If onPress is provided, render as a touchable button-like element
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-row items-center mx-4 px-4 py-3 rounded-xl border gap-3"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
        }}
      >
        <Ionicons name="search" size={20} color={theme.mutedForeground} />
        <View className="flex-1">
          <Input
            placeholder={placeholder}
            value={value}
            editable={false}
            pointerEvents="none"
            className="border-0 p-0 h-auto bg-transparent shadow-none"
          />
        </View>
      </TouchableOpacity>
    );
  }

  // Editable input version
  return (
    <View
      className="flex-row items-center mx-4 px-4 py-3 rounded-xl border gap-3"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}
    >
      <Ionicons name="search" size={20} color={theme.mutedForeground} />
      <Input
        placeholder={placeholder}
        placeholderTextColor={theme.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        className="flex-1 border-0 p-0 h-auto bg-transparent shadow-none"
        style={{ color: theme.foreground }}
      />
    </View>
  );
}
