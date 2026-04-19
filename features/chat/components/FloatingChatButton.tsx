import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigationState, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { Text } from "@/components/ui/text";
import { useChatContext } from "../context/ChatProvider";
import { useAuth } from "@/features/auth";

export function FloatingChatButton() {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const { supportUnreadCount, createOrOpenRoom, rooms } = useChatContext();
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);

  // Determine the deepest active route name
  const currentRouteName = useNavigationState((state) => {
    if (!state) return null;
    let current: any = state;
    while (current?.routes && current.routes[current.index]?.state) {
      current = current.routes[current.index].state;
    }
    return current?.routes?.[current.index]?.name;
  });

  const [supportRoomId, setSupportRoomId] = useState<string | null>(null);
  const preloadAttemptedRef = React.useRef(false);

  // Pre-load the support room ID in the background (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated || preloadAttemptedRef.current) return;
    preloadAttemptedRef.current = true;

    const existing = rooms?.find(r => r.roomType === "AI_CHAT");
    if (existing) {
      setSupportRoomId(existing.id);
    } else {
      createOrOpenRoom("AI_CHAT", [], "Trợ lý AI")
        .then(room => setSupportRoomId(room.id))
        .catch(err => console.log("Silent support chat preload failed:", err?.message || err));
    }
  }, [isAuthenticated]);

  const allowedScreens = ["Home", "Discover", "Tabs", "Main"];
  // Fallback to "Home" on initial load if route name is not yet resolved
  const effectiveRouteName = currentRouteName ?? "Home";

  if (!allowedScreens.includes(effectiveRouteName)) {
    return null;
  }

  const handlePress = async () => {
    // 1. If we preloaded the room ID successfully, navigate instantly!
    if (supportRoomId) {
      navigation.navigate("Main", {
        screen: "ChatRoom",
        params: { roomId: supportRoomId },
      });
      return;
    }

    // 2. Fallback if the preload hasn't finished yet or failed
    if (isLoading) return;
    setIsLoading(true);
    try {
      const room = await createOrOpenRoom("AI_CHAT", [], "Trợ lý AI");
      setSupportRoomId(room.id);
      navigation.navigate("Main", {
        screen: "ChatRoom",
        params: { roomId: room.id },
      });
    } catch (error) {
      console.error("Failed to open support chat", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + 80,
        right: 20,
        zIndex: 9999,
      }}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        className="items-center justify-center shadow-lg"
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.primary,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <AntDesign name="message" size={24} color="white" />
        )}

        {supportUnreadCount > 0 && !isLoading && (
          <View
            className="absolute -top-1 -right-1 items-center justify-center"
            style={{
              backgroundColor: "red",
              minWidth: 22,
              height: 22,
              borderRadius: 11,
              paddingHorizontal: 4,
              borderWidth: 2,
              borderColor: theme.background,
            }}
          >
            <Text className="text-white text-xs font-bold" style={{ fontSize: 10 }}>
              {supportUnreadCount > 99 ? "99+" : supportUnreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
