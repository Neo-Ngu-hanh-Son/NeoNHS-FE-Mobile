import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { WebView } from "react-native-webview";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { TabsStackParamList } from "@/app/navigations/NavigationParamTypes";

type MapScreenProps = StackScreenProps<TabsStackParamList, "Map">;

// Demo URLs for WebView testing
const DEMO_URLS = [
  {
    id: "openstreetmap",
    name: "OpenStreetMap",
    url: "https://www.openstreetmap.org/#map=15/16.0047/108.2628",
  },
  {
    id: "pannellum",
    name: "Pannellum",
    url: "https://pannellum.org",
  },
  {
    id: "virtualtour",
    name: "Virtual Tour",
    url: "https://photo-sphere-viewer.js.org/plugins/virtual-tour.html#virtualtourplugin",
  },
];

export default function MapScreen({ navigation }: MapScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [isLoading, setIsLoading] = useState(true);
  const [activeUrl, setActiveUrl] = useState(DEMO_URLS[0]);

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
        <Text className="text-sm mt-1" style={{ color: theme.mutedForeground }}>
          WebView Performance Demo
        </Text>
      </View>

      {/* URL Selector */}
      <View style={styles.urlSelector}>
        {DEMO_URLS.map((item) => (
          <Button
            key={item.id}
            variant={activeUrl.id === item.id ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onPress={() => {
              setIsLoading(true);
              setActiveUrl(item);
            }}
          >
            <Text
              className="text-xs font-medium"
              style={{
                color: activeUrl.id === item.id ? theme.primaryForeground : theme.foreground,
              }}
            >
              {item.name}
            </Text>
          </Button>
        ))}
      </View>

      {/* WebView Container */}
      <View style={[styles.webviewContainer, { borderColor: theme.border }]}>
        <WebView
          source={{ uri: activeUrl.url }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          geolocationEnabled={true}
          renderLoading={() => (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text className="mt-3" style={{ color: theme.mutedForeground }}>
                Loading map...
              </Text>
            </View>
          )}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <View style={[styles.loadingOverlay, { backgroundColor: theme.background + "CC" }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text className="mt-3" style={{ color: theme.foreground }}>
              Loading {activeUrl.name}...
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <View style={styles.actionsRow}>
          <View style={[styles.actionCard, { backgroundColor: theme.card }]}>
            <Ionicons name="navigate-outline" size={20} color={theme.primary} />
            <Text className="text-xs mt-1" style={{ color: theme.foreground }}>
              Directions
            </Text>
          </View>
          <View style={[styles.actionCard, { backgroundColor: theme.card }]}>
            <Ionicons name="search-outline" size={20} color={theme.primary} />
            <Text className="text-xs mt-1" style={{ color: theme.foreground }}>
              Search
            </Text>
          </View>
          <View style={[styles.actionCard, { backgroundColor: theme.card }]}>
            <Ionicons name="bookmark-outline" size={20} color={theme.primary} />
            <Text className="text-xs mt-1" style={{ color: theme.foreground }}>
              Saved
            </Text>
          </View>
          <View style={[styles.actionCard, { backgroundColor: theme.card }]}>
            <Ionicons name="refresh-outline" size={20} color={theme.primary} />
            <Text className="text-xs mt-1" style={{ color: theme.foreground }}>
              Reload
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
    paddingVertical: 12,
  },
  urlSelector: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  webviewContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
