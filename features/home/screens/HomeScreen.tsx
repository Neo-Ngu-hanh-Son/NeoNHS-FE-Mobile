import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { CommonActions, CompositeScreenProps } from "@react-navigation/native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { logger } from "@/utils/logger";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTheme } from "@/app/providers/ThemeProvider";
import { RootStackParamList, TabsStackParamList } from "@/app/navigations/NavigationParamTypes";
import { THEME } from "@/lib/theme";
import { IconButton } from "@/components/Buttons/IconButton";

type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, "Home">,
  StackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { logout, user } = useAuth();
  const { colorScheme, isDarkColorScheme, toggleColorScheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "Auth",
              params: { screen: "Login" },
            },
          ],
        })
      );
    } catch (error) {
      logger.error("[HomeScreen] Logout failed:", error);
    }
  };

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
            Welcome Home
          </Text>
          <Text className="text-base mt-1" style={{ color: theme.mutedForeground }}>
            {user?.fullName || user?.email || "Guest"}
          </Text>
        </View>

        {/* Theme Toggle Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons 
              name={isDarkColorScheme ? "moon" : "sunny"} 
              size={24} 
              color={theme.primary} 
            />
            <Text className="text-lg font-semibold ml-3" style={{ color: theme.foreground }}>
              Appearance
            </Text>
          </View>
          
          <View style={[styles.themeRow, { borderTopColor: theme.border }]}>
            <View style={styles.themeInfo}>
              <Text className="text-base font-medium" style={{ color: theme.foreground }}>
                Dark Mode
              </Text>
              <Text className="text-sm" style={{ color: theme.mutedForeground }}>
                {isDarkColorScheme ? "Currently enabled" : "Currently disabled"}
              </Text>
            </View>
            <Switch
              checked={isDarkColorScheme}
              onCheckedChange={toggleColorScheme}
            />
          </View>

          {/* Quick Theme Buttons */}
          <View style={[styles.themeButtons, { borderTopColor: theme.border }]} className="flex-row gap-2">
            <Button
              variant={!isDarkColorScheme ? "default" : "outline"}
              onPress={() => !isDarkColorScheme || toggleColorScheme()}
              className="flex-1 mr-2"
            >
              <Ionicons 
                name="sunny-outline" 
                size={18} 
                color={isDarkColorScheme ? "black" : "white"} 
              />
              <Text className="ml-2 font-medium">
                Light
              </Text>
            </Button>
            <Button
              variant={isDarkColorScheme ? "default" : "outline"}
              onPress={() => isDarkColorScheme || toggleColorScheme()}
              className="flex-1 ml-2"
            >
              <Ionicons 
                name="moon-outline" 
                size={18} 
                color={isDarkColorScheme ? theme.primaryForeground : theme.foreground} 
              />
              <Text className="ml-2 font-medium">
                Dark
              </Text>
            </Button>
          </View>
        </View>

        {/* User Info Card */}
        {user && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle-outline" size={24} color={theme.primary} />
              <Text className="text-lg font-semibold ml-3" style={{ color: theme.foreground }}>
                Profile
              </Text>
            </View>
            
            <View style={[styles.infoRow, { borderTopColor: theme.border }]}>
              <Text className="text-sm" style={{ color: theme.mutedForeground }}>Name</Text>
              <Text className="text-base font-medium" style={{ color: theme.foreground }}>
                {user.fullName || "Not set"}
              </Text>
            </View>
            
            <View style={[styles.infoRow, { borderTopColor: theme.border }]}>
              <Text className="text-sm" style={{ color: theme.mutedForeground }}>Email</Text>
              <Text className="text-base font-medium" style={{ color: theme.foreground }}>
                {user.email || "Not set"}
              </Text>
            </View>
          </View>
        )}

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button 
            variant="destructive" 
            onPress={handleLogout}
            className="w-full"
          >
            <Ionicons name="log-out-outline" size={20} color={theme.primaryForeground} />
            <Text className="font-semibold ml-2" style={{ color: theme.primaryForeground }}>Sign Out</Text>
          </Button>
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
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  themeInfo: {
    flex: 1,
  },
  themeButtons: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  infoRow: {
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  logoutContainer: {
    marginTop: "auto",
    paddingBottom: 24,
  },
});
