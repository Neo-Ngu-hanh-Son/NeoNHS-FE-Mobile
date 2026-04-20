import React from "react";
import { View, Animated as RNAnimated } from "react-native";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

/**
 * Animated three-dot typing indicator using React Native Animated API.
 * Shows when the other user is currently typing.
 */
export function TypingIndicator() {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const dot1 = React.useRef(new RNAnimated.Value(0.3)).current;
  const dot2 = React.useRef(new RNAnimated.Value(0.3)).current;
  const dot3 = React.useRef(new RNAnimated.Value(0.3)).current;

  React.useEffect(() => {
    const createPulse = (dot: RNAnimated.Value, delay: number) =>
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.delay(delay),
          RNAnimated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          RNAnimated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );

    const a1 = createPulse(dot1, 0);
    const a2 = createPulse(dot2, 200);
    const a3 = createPulse(dot3, 400);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dotStyle = (opacity: RNAnimated.Value) => ({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.mutedForeground,
    marginHorizontal: 2,
    opacity,
  });

  return (
    <View className="flex-row items-center px-10 py-2">
      <View
        className="flex-row items-center rounded-2xl px-4 py-3"
        style={{ backgroundColor: theme.muted }}
      >
        <RNAnimated.View style={dotStyle(dot1)} />
        <RNAnimated.View style={dotStyle(dot2)} />
        <RNAnimated.View style={dotStyle(dot3)} /> 
      </View>
    </View>
  );
}
