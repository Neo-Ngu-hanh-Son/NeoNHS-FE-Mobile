import { Text, View } from "@ant-design/react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons name="person-outline" size={24} color="black" />
        <Text>This is a profile screen</Text>
      </View>
    </SafeAreaView>
  );
}
