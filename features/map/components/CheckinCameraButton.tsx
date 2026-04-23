import React, { useEffect, useRef } from 'react';
import { Animated, View, Text } from 'react-native';
import { Button } from '@/components/ui/button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CheckinCameraButton({
  onOpenCamera,
  isSugestingCheckin,
}: {
  onOpenCamera: () => void;
  isSugestingCheckin: boolean;
}) {
  const scale1 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.6)).current;

  const scale2 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(0.6)).current;

  const scale3 = useRef(new Animated.Value(1)).current;
  const opacity3 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!isSugestingCheckin) return;

    const duration = 1500;
    const delay = duration / 3;

    const animation = Animated.loop(
      Animated.parallel([
        // Ring 1
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale1, {
              toValue: 2.4,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(opacity1, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(scale1, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity1, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),

        // Ring 2
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale2, {
              toValue: 2.4,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(opacity2, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(scale2, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity2, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),

        // Ring 3
        Animated.sequence([
          Animated.delay(delay * 2),
          Animated.parallel([
            Animated.timing(scale3, {
              toValue: 2.4,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(opacity3, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(scale3, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity3, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [isSugestingCheckin, opacity1, opacity2, opacity3, scale1, scale2, scale3]);

  const ringStyle = (scale: Animated.Value, opacity: Animated.Value) => ({
    position: 'absolute' as const,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16a34a',
    transform: [{ scale }],
    opacity,
    borderWidth: 1,
    borderColor: 'white',
  });

  return (
    <View className="absolute bottom-6 z-0 w-full items-center justify-center">
      {isSugestingCheckin && (
        <>
          <Animated.View style={ringStyle(scale1, opacity1)} />
          <Animated.View style={ringStyle(scale2, opacity2)} />
          <Animated.View style={ringStyle(scale3, opacity3)} />
          <View className="absolute bottom-20 flex-row items-center gap-1 rounded-md bg-white bg-opacity-70 px-2 py-1">
            <Text className="text-sm font-medium text-primary">Check-in nearby!</Text>
          </View>
        </>
      )}

      <Button
        className="elevation-5 h-16 w-16 rounded-full bg-primary p-3 shadow-lg"
        onPress={onOpenCamera}
        variant={'default'}>
        <MaterialCommunityIcons name="camera" size={24} color="white" />
      </Button>
    </View>
  );
}
