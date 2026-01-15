import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import type { MainStackParamList } from "@/app/navigations/NavigationParamTypes";

type ProfileNavigationProp = StackNavigationProp<MainStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { user } = useAuth();
  const { isDarkColorScheme, toggleColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text className="text-2xl font-bold" style={{ color: theme.foreground }}>
            Profile
          </Text>
        </View>

        {/* Avatar Section */}
        <View style={[styles.avatarSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Ionicons name="person" size={48} color={theme.primaryForeground} />
          </View>
          <Text className="text-xl font-semibold mt-4" style={{ color: theme.foreground }}>
            {user?.fullName || "Guest User"}
          </Text>
          <Text className="text-base" style={{ color: theme.mutedForeground }}>
            {user?.email || "No email"}
          </Text>
          <TouchableOpacity
            style={[styles.editProfileButton, { borderColor: theme.primary }]}
            onPress={() => navigation.navigate("UpdateAccount")}
          >
            <Ionicons name="pencil-outline" size={16} color={theme.primary} />
            <Text className="text-sm font-medium ml-2" style={{ color: theme.primary }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text className="text-lg font-semibold mb-4" style={{ color: theme.foreground }}>
            Settings
          </Text>

          {/* Dark Mode Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name={isDarkColorScheme ? "moon" : "sunny-outline"} 
                size={22} 
                color={theme.primary} 
              />
              <Text className="text-base ml-3" style={{ color: theme.foreground }}>
                Dark Mode
              </Text>
            </View>
            <Switch
              checked={isDarkColorScheme}
              onCheckedChange={toggleColorScheme}
            />
          </View>

          {/* Notifications - Placeholder */}
          <View style={[styles.settingRow, { borderTopColor: theme.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={22} color={theme.primary} />
              <Text className="text-base ml-3" style={{ color: theme.foreground }}>
                Notifications
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.mutedForeground} />
          </View>

          {/* Language - Placeholder */}
          <View style={[styles.settingRow, { borderTopColor: theme.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="language-outline" size={22} color={theme.primary} />
              <Text className="text-base ml-3" style={{ color: theme.foreground }}>
                Language
              </Text>
            </View>
            <View style={styles.settingValue}>
              <Text className="text-sm mr-2" style={{ color: theme.mutedForeground }}>
                English
              </Text>
              <Ionicons name="chevron-forward" size={20} color={theme.mutedForeground} />
            </View>
          </View>
        </View>

        {/* About Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text className="text-lg font-semibold mb-4" style={{ color: theme.foreground }}>
            About
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={22} color={theme.primary} />
              <Text className="text-base ml-3" style={{ color: theme.foreground }}>
                App Version
              </Text>
            </View>
            <Text className="text-sm" style={{ color: theme.mutedForeground }}>
              1.0.0
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    flexDirection: "row",
    alignItems: "center",
  },
});
