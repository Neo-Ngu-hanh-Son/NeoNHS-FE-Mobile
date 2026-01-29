import { View, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { TabsStackParamList } from "@/app/navigations/NavigationParamTypes";

type MapScreenProps = StackScreenProps<TabsStackParamList, "Map">;

export default function MapScreen({ navigation }: MapScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text className="text-2xl font-bold" style={{ color: theme.foreground }}>
          Map
        </Text>
      </View>

      {/* Map Placeholder */}
      <View style={[styles.mapPlaceholder, { backgroundColor: theme.muted }]}>
        <View
          style={[styles.iconContainer, { backgroundColor: theme.card }]}
        >
          <Ionicons name="map-outline" size={64} color={theme.primary} />
        </View>
        <Text
          className="text-xl font-semibold mt-4"
          style={{ color: theme.foreground }}
        >
          Interactive Map
        </Text>
        <Text
          className="text-base text-center mt-2 px-8"
          style={{ color: theme.mutedForeground }}
        >
          Explore Ngu Hanh Son with our interactive map. Find destinations, trails, and points of interest.
        </Text>
        <Button className="mt-6" variant="outline">
          <Ionicons name="locate-outline" size={18} color={theme.foreground} />
          <Text className="ml-2 font-medium" style={{ color: theme.foreground }}>
            Enable Location
          </Text>
        </Button>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text
          className="text-lg font-semibold mb-3"
          style={{ color: theme.foreground }}
        >
          Quick Actions
        </Text>
        <View style={styles.actionsRow}>
          <View style={[styles.actionCard, { backgroundColor: theme.card }]}>
            <Ionicons name="navigate-outline" size={24} color={theme.primary} />
            <Text className="text-sm mt-2" style={{ color: theme.foreground }}>
              Directions
            </Text>
          </View>
          <View style={[styles.actionCard, { backgroundColor: theme.card }]}>
            <Ionicons name="search-outline" size={24} color={theme.primary} />
            <Text className="text-sm mt-2" style={{ color: theme.foreground }}>
              Search
            </Text>
          </View>
          <View style={[styles.actionCard, { backgroundColor: theme.card }]}>
            <Ionicons name="bookmark-outline" size={24} color={theme.primary} />
            <Text className="text-sm mt-2" style={{ color: theme.foreground }}>
              Saved
            </Text>
          </View>
          <View style={[styles.actionCard, { backgroundColor: theme.card }]}>
            <Ionicons name="download-outline" size={24} color={theme.primary} />
            <Text className="text-sm mt-2" style={{ color: theme.foreground }}>
              Offline
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  mapPlaceholder: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
});
