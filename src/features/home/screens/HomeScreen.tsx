import { Button, Text, View } from "@ant-design/react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { logger } from "@/utils/logger";
import { useAuth } from "@/features/auth/context/AuthContext";
import { IconButton } from "@/components/Buttons/IconButton";
import { Pressable } from "react-native";

export default function HomeScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      logger.error("[HomeScreen] Logout failed:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 6 }}>
        <Ionicons name="home-outline" size={24} color="black" />
        <Text>This is a home screen</Text>
        <Button onPress={handleLogout}>Logout</Button>
        <Button type="ghost">Example ghost button</Button>
        <Button type="primary" >Example primary button</Button>
        <Button type="warning">Example warning button</Button>
        <IconButton icon="log-out-outline" loading={true}>
          Example loading button
        </IconButton>
        <IconButton icon="log-out-outline">Example normal icon button</IconButton>
        <IconButton icon="log-out-outline" borderless/>
      </View>
    </SafeAreaView>
  );
}
