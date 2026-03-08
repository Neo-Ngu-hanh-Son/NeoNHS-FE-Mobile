import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

type AudioControlsProps = {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether the player is ready (sound loaded) */
  isReady: boolean;
  /** Current playback speed label (e.g. "1x", "1.5x", "2x") */
  playbackSpeed: string;
  /** Called when the play/pause button is pressed */
  onPlayPause: () => void;
  /** Called to skip backward (in ms, e.g. -15000) */
  onSkipBackward: () => void;
  /** Called to skip forward (in ms, e.g. +15000) */
  onSkipForward: () => void;
  /** Called to cycle the playback speed */
  onSpeedChange: () => void;
};

/**
 * Audio transport controls — play/pause, skip ±15s, and speed toggle.
 * Styled after the AudioGuideScreen's glassmorphic control row.
 */
export default function AudioControls({
  isPlaying,
  isReady,
  playbackSpeed,
  onPlayPause,
  onSkipBackward,
  onSkipForward,
  onSpeedChange,
}: AudioControlsProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const iconColor = theme.foreground;
  const mutedBg = isDarkColorScheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';

  return (
    <View className="flex-row items-center justify-between">
      {/* Speed toggle */}
      <TouchableOpacity
        onPress={onSpeedChange}
        disabled={!isReady}
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: mutedBg,
          borderWidth: 1,
          borderColor: isDarkColorScheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          opacity: isReady ? 1 : 0.4,
        }}>
        <Text className="text-xs font-black" style={{ color: iconColor }}>
          {playbackSpeed}
        </Text>
      </TouchableOpacity>

      {/* Skip / Play cluster */}
      <View className="flex-row items-center gap-6">
        {/* Skip backward 15s */}
        <TouchableOpacity onPress={onSkipBackward} disabled={!isReady} style={{ opacity: isReady ? 1 : 0.4 }}>
          <View className="items-center">
            <Ionicons
              name="refresh-outline"
              size={28}
              color={iconColor}
              style={{ transform: [{ scaleX: -1 }] }}
            />
            <Text className="mt-0.5 text-[9px] font-bold" style={{ color: theme.mutedForeground }}>
              15s
            </Text>
          </View>
        </TouchableOpacity>

        {/* Play / Pause */}
        <TouchableOpacity
          onPress={onPlayPause}
          disabled={!isReady}
          className="items-center justify-center rounded-full"
          style={{
            width: 64,
            height: 64,
            backgroundColor: theme.primary,
            opacity: isReady ? 1 : 0.5,
            // shadow
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 8,
          }}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={28}
            color="#fff"
            style={!isPlaying ? { marginLeft: 3 } : {}}
          />
        </TouchableOpacity>

        {/* Skip forward 15s */}
        <TouchableOpacity onPress={onSkipForward} disabled={!isReady} style={{ opacity: isReady ? 1 : 0.4 }}>
          <View className="items-center">
            <Ionicons name="refresh-outline" size={28} color={iconColor} />
            <Text className="mt-0.5 text-[9px] font-bold" style={{ color: theme.mutedForeground }}>
              15s
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Placeholder for symmetry (could be share, etc.) */}
      <View className="h-12 w-12" />
    </View>
  );
}
