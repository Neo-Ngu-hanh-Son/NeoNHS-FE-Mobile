import React, { useRef, useState, useMemo } from 'react';
import { View, PanResponder, type LayoutChangeEvent } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

type AudioProgressBarProps = {
  /** Current playback position in milliseconds */
  position: number;
  /** Total duration in milliseconds */
  duration: number;
  /** Called when the user drags / taps the bar to seek (value in ms) */
  onSeek?: (positionMillis: number) => void;
};

/**
 * A draggable progress bar with time labels.
 * Uses PanResponder for touch handling — no external slider dependency.
 */
export default function AudioProgressBar({ position, duration, onSeek }: AudioProgressBarProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const trackWidth = useRef(0);
  const trackRef = useRef<View>(null);
  const trackPageX = useRef(0);
  // Use a ref to avoid stale closures inside PanResponder callbacks
  const seekPositionRef = useRef(0);

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const progress = duration > 0 ? (position / duration) * 100 : 0;
  const displayProgress = isSeeking ? (seekPosition / duration) * 100 : progress;

  const clampSeek = (pageX: number, trackX: number) => {
    const x = pageX - trackX;
    const clamped = Math.max(0, Math.min(x, trackWidth.current));
    return duration > 0 ? (clamped / trackWidth.current) * duration : 0;
  };

  // Recreate PanResponder when onSeek or duration changes so closures stay fresh
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Capture phase — grab the touch BEFORE the parent ScrollView can steal it
        onStartShouldSetPanResponderCapture: () => !!onSeek && duration > 0,
        onMoveShouldSetPanResponderCapture: () => !!onSeek && duration > 0,
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: (evt) => {
          trackRef.current?.measureInWindow((x) => {
            trackPageX.current = x;
            const seekMs = clampSeek(evt.nativeEvent.pageX, x);
            seekPositionRef.current = seekMs;
            setSeekPosition(seekMs);
            setIsSeeking(true);
          });
        },

        onPanResponderMove: (evt) => {
          const seekMs = clampSeek(evt.nativeEvent.pageX, trackPageX.current);
          seekPositionRef.current = seekMs;
          setSeekPosition(seekMs);
        },

        onPanResponderRelease: () => {
          setIsSeeking(false);
          // Read from ref so we always get the latest value
          onSeek?.(Math.round(seekPositionRef.current));
        },

        onPanResponderTerminate: () => {
          setIsSeeking(false);
        },
      }),
    [onSeek, duration],
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const displayPosition = isSeeking ? seekPosition : position;

  return (
    <View className="w-full">
      {/* Hit area — taller than the visible track for easier tapping */}
      <View
        ref={trackRef}
        onLayout={handleLayout}
        className="justify-center py-3"
        {...panResponder.panHandlers}>
        {/* Visible track */}
        <View
          className="relative h-1.5 w-full overflow-hidden rounded-full"
          style={{
            backgroundColor: isDarkColorScheme
              ? 'rgba(255,255,255,0.12)'
              : 'rgba(0,0,0,0.08)',
          }}>
          <View
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${Math.min(displayProgress, 100)}%`,
              backgroundColor: theme.primary,
            }}
          />
        </View>

        {/* Thumb / knob */}
        {duration > 0 && (
          <View
            className="absolute items-center justify-center"
            style={{
              left: `${Math.min(displayProgress, 100)}%`,
              marginLeft: -8,
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: theme.primary,
              transform: [{ scale: isSeeking ? 1.3 : 1 }],
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 4,
              elevation: 4,
            }}
          />
        )}
      </View>

      {/* Time labels */}
      <View className="mt-1 flex-row justify-between">
        <Text className="text-xs font-medium" style={{ color: theme.mutedForeground }}>
          {formatTime(displayPosition)}
        </Text>
        <Text className="text-xs font-medium" style={{ color: theme.mutedForeground }}>
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}
