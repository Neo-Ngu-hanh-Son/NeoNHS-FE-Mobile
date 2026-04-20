import React, { useState, useEffect, useCallback } from "react";
import { View, ActivityIndicator, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigationState, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { Text } from "@/components/ui/text";
import { useChatContext } from "../context/ChatProvider";
import { useAuth } from "@/features/auth";

const BUTTON_SIZE = 56;
const EDGE_MARGIN = 12;
const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.8 };
const DRAG_THRESHOLD = 8;

export function FloatingChatButton() {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { supportUnreadCount, createOrOpenRoom, rooms } = useChatContext();
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);

  // Boundaries
  const minX = EDGE_MARGIN;
  const maxX = screenW - BUTTON_SIZE - EDGE_MARGIN;
  const minY = insets.top + EDGE_MARGIN;
  const maxY = screenH - insets.bottom - BUTTON_SIZE - 70;

  // Position (start bottom-right)
  const translateX = useSharedValue(maxX);
  const translateY = useSharedValue(maxY);
  const isDragging = useSharedValue(false);
  const hasMoved = useSharedValue(false);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  // Snap to nearest horizontal edge
  const snapToEdge = useCallback(
    (x: number) => {
      "worklet";
      const midpoint = screenW / 2;
      return x + BUTTON_SIZE / 2 < midpoint
        ? withSpring(minX, SPRING_CONFIG)
        : withSpring(maxX, SPRING_CONFIG);
    },
    [screenW, minX, maxX],
  );

  const clamp = (val: number, lo: number, hi: number) => {
    "worklet";
    return Math.min(Math.max(val, lo), hi);
  };

  const handlePress = useCallback(async () => {
    if (supportRoomIdRef.current) {
      navigation.navigate("Main", {
        screen: "ChatRoom",
        params: { roomId: supportRoomIdRef.current },
      });
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    try {
      const room = await createOrOpenRoom("AI_CHAT", [], "Trợ lý AI");
      supportRoomIdRef.current = room.id;
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
  }, [isLoading, createOrOpenRoom, navigation]);

  const onTap = useCallback(() => {
    handlePress();
  }, [handlePress]);

  const pan = Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      isDragging.value = true;
      hasMoved.value = false;
      buttonScale.value = withTiming(1.1, { duration: 100 });
    })
    .onUpdate((e) => {
      if (
        !hasMoved.value &&
        Math.abs(e.translationX) < DRAG_THRESHOLD &&
        Math.abs(e.translationY) < DRAG_THRESHOLD
      ) {
        return;
      }
      hasMoved.value = true;
      translateX.value = clamp(startX.value + e.translationX, minX, maxX);
      translateY.value = clamp(startY.value + e.translationY, minY, maxY);
    })
    .onEnd(() => {
      isDragging.value = false;
      buttonScale.value = withTiming(1, { duration: 100 });
      translateX.value = snapToEdge(translateX.value);
      translateY.value = withSpring(
        clamp(translateY.value, minY, maxY),
        SPRING_CONFIG,
      );
      if (!hasMoved.value) {
        runOnJS(onTap)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: buttonScale.value },
    ],
  }));

  // ── Route visibility ──
  const currentRouteName = useNavigationState((state) => {
    if (!state) return null;
    let current: any = state;
    while (current?.routes && current.routes[current.index]?.state) {
      current = current.routes[current.index].state;
    }
    return current?.routes?.[current.index]?.name;
  });

  // ── Support room preload ──
  const [supportRoomId, setSupportRoomId] = useState<string | null>(null);
  const supportRoomIdRef = React.useRef<string | null>(null);
  const preloadAttemptedRef = React.useRef(false);

  useEffect(() => {
    if (!isAuthenticated || preloadAttemptedRef.current) return;
    preloadAttemptedRef.current = true;

    const existing = rooms?.find((r) => r.roomType === "AI_CHAT");
    if (existing) {
      setSupportRoomId(existing.id);
      supportRoomIdRef.current = existing.id;
    } else {
      createOrOpenRoom("AI_CHAT", [], "Trợ lý AI")
        .then((room) => {
          setSupportRoomId(room.id);
          supportRoomIdRef.current = room.id;
        })
        .catch((err) =>
          console.log("Silent support chat preload failed:", err?.message || err),
        );
    }
  }, [isAuthenticated, rooms, createOrOpenRoom]);

  // Keep initial position in sync when layout changes
  useEffect(() => {
    translateX.value = withSpring(
      translateX.value + BUTTON_SIZE / 2 < screenW / 2 ? minX : maxX,
      SPRING_CONFIG,
    );
    translateY.value = withSpring(clamp(translateY.value, minY, maxY), SPRING_CONFIG);
  }, [screenW, screenH, minX, maxX, minY, maxY, translateX, translateY]);

  const allowedScreens = ["Home", "Discover", "Tabs", "Main"];
  const effectiveRouteName = currentRouteName ?? "Home";

  if (!allowedScreens.includes(effectiveRouteName)) {
    return null;
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            zIndex: 9999,
          },
          animatedStyle,
        ]}
      >
        <View
          className="items-center justify-center"
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            backgroundColor: theme.primary,
            elevation: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.35,
            shadowRadius: 4,
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
              <Text
                className="text-white text-xs font-bold"
                style={{ fontSize: 10 }}
              >
                {supportUnreadCount > 99 ? "99+" : supportUnreadCount}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}