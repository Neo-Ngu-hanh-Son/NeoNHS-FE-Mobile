import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

import { Text } from '@/components/ui/text';

const HINT_VISIBLE_MS = 5000;
const FADE_DURATION_MS = 500;

export default function CheckinCameraCenterHint() {
  const [showText, setShowText] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fadeDelay = Math.max(0, HINT_VISIBLE_MS - FADE_DURATION_MS);

    const animation = Animated.sequence([
      Animated.delay(fadeDelay),
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        setShowText(false);
      }
    });

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <View className="absolute left-0 right-0 top-0 bottom-0 items-center justify-center px-6">
      <Animated.View className="h-64 w-64 rounded-2xl border-2 border-green-500" style={{ opacity }} />
      {showText ? (
        <Animated.View style={{ opacity }}>
          <Text className="mt-4 text-center text-sm font-semibold text-white">
            Take a photo to complete check-in
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}
