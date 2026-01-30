import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { logger } from "@/utils/logger";
import type { RootStackParamList } from "@/app/navigations/NavigationParamTypes";

type ProfileNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkColorScheme, toggleColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const handleLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Auth", params: { screen: "Login" } }],
      })
    );
  };

  const handleRegister = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Auth", params: { screen: "Register" } }],
      })
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "Auth", params: { screen: "Login" } }],
                })
              );
            } catch (error) {
              logger.error("[ProfileScreen] Logout failed:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
  };

  // ============================================
  // Guest View (Not Logged In)
  // ============================================
  if (!isAuthenticated || !user) {
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

          {/* Guest Welcome Card */}
          <View
            style={[styles.guestCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={[styles.guestAvatar, { backgroundColor: theme.muted }]}>
              <Ionicons name="person-outline" size={48} color={theme.mutedForeground} />
            </View>

            <Text className="text-xl font-semibold mt-4" style={{ color: theme.foreground }}>
              Welcome, Guest!
            </Text>
            <Text
              className="text-base text-center mt-2 px-4"
              style={{ color: theme.mutedForeground }}
            >
              Sign in to access your profile, save favorites, and get personalized recommendations.
            </Text>

            {/* Login Button */}
            <Button className="w-full mt-6" onPress={handleLogin}>
              <Ionicons name="log-in-outline" size={20} color={theme.primaryForeground} />
              <Text className="ml-2 font-semibold" style={{ color: theme.primaryForeground }}>
                Sign In
              </Text>
            </Button>

            {/* Register Link */}
            <View className="flex-row items-center mt-4">
              <Text className="text-sm" style={{ color: theme.mutedForeground }}>
                Don't have an account?
              </Text>
              <Button variant="link" className="p-0 ml-1 h-auto" onPress={handleRegister}>
                <Text className="text-primary text-sm font-semibold">Sign Up</Text>
              </Button>
            </View>
          </View>

          {/* Settings Card (Available for guests too) */}
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
              <Switch checked={isDarkColorScheme} onCheckedChange={toggleColorScheme} />
            </View>

            {/* Language */}
            <TouchableOpacity style={[styles.settingRow, { borderTopColor: theme.border }]}>
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
            </TouchableOpacity>
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

  // ============================================
  // Authenticated View (Logged In)
  // ============================================
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text className="text-2xl font-bold" style={{ color: theme.foreground }}>
              Profile
            </Text>
          </View>

          {/* Avatar Section */}
          <View
            style={[styles.avatarSection, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <Ionicons name="person" size={48} color={theme.primaryForeground} />
              </View>
            )}
            <Text className="text-xl font-semibold mt-4" style={{ color: theme.foreground }}>
              {user.fullname || "User"}
            </Text>
            <Text className="text-base" style={{ color: theme.mutedForeground }}>
              {user.email}
            </Text>
            <TouchableOpacity
              style={[styles.editProfileButton, { borderColor: theme.primary }]}
              onPress={handleEditProfile}
            >
              <Ionicons name="pencil-outline" size={16} color={theme.primary} />
              <Text className="text-sm font-medium ml-2" style={{ color: theme.primary }}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* Account Card */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text className="text-lg font-semibold mb-4" style={{ color: theme.foreground }}>
              Account
            </Text>

            {/* My Favorites */}
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="heart-outline" size={22} color={theme.primary} />
                <Text className="text-base ml-3" style={{ color: theme.foreground }}>
                  My Favorites
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.mutedForeground} />
            </TouchableOpacity>

            {/* My Bookings */}
            <TouchableOpacity style={[styles.settingRow, { borderTopColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="calendar-outline" size={22} color={theme.primary} />
                <Text className="text-base ml-3" style={{ color: theme.foreground }}>
                  My Bookings
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.mutedForeground} />
            </TouchableOpacity>

            {/* Visit History */}
            <TouchableOpacity style={[styles.settingRow, { borderTopColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="time-outline" size={22} color={theme.primary} />
                <Text className="text-base ml-3" style={{ color: theme.foreground }}>
                  Visit History
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.mutedForeground} />
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
              <Switch checked={isDarkColorScheme} onCheckedChange={toggleColorScheme} />
            </View>

            {/* Notifications */}
            <TouchableOpacity style={[styles.settingRow, { borderTopColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={22} color={theme.primary} />
                <Text className="text-base ml-3" style={{ color: theme.foreground }}>
                  Notifications
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.mutedForeground} />
            </TouchableOpacity>

            {/* Language */}
            <TouchableOpacity style={[styles.settingRow, { borderTopColor: theme.border }]}>
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
            </TouchableOpacity>
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

            <TouchableOpacity style={[styles.settingRow, { borderTopColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="document-text-outline" size={22} color={theme.primary} />
                <Text className="text-base ml-3" style={{ color: theme.foreground }}>
                  Terms of Service
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingRow, { borderTopColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="shield-checkmark-outline" size={22} color={theme.primary} />
                <Text className="text-base ml-3" style={{ color: theme.foreground }}>
                  Privacy Policy
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <Button variant="destructive" className="w-full mb-8" onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text className="ml-2 font-semibold text-white">Sign Out</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  // Guest Card Styles
  guestCard: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  guestAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  // Avatar Section Styles
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
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
  // Card Styles
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
