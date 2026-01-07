import { Text, View } from "@ant-design/react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { apiClient } from "@/services/api";
import { logger } from "@/utils/logger";

export default function HomeScreen() {
  // Fetch data from the for testing the api client
  useEffect(() => {
    const fetchData = async () => {
      try {
        apiClient.updateConfig({
          baseURL: "https://jsonplaceholder.typicode.com",
        });
        const response = await apiClient.get<string>("posts/1", { requiresAuth: true, transformData: false });
        logger.info("[HomeScreen] Sample fetch response:", response.data);
      } catch (error) {
        logger.error("[HomeScreen] Sample fetch failed:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons name="home-outline" size={24} color="black" />
        <Text>This is a home screen</Text>
      </View>
    </SafeAreaView>
  );
}
