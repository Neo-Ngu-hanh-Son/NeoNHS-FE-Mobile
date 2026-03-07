import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useFocusEffect } from '@react-navigation/native';

import AudioProgressBar from './AudioProgressBar';
import AudioControls from './AudioControls';
import { PointHistoryAudioResponse } from '../../types';
import { logger } from '@/utils/logger';

type AudioPlayerProps = {
  /** The URL of the audio file to play */
  audioUrl: string | undefined;
  /** Called when the active word index changes (for transcript highlighting) */
  onActiveIndexChange?: (index: number) => void;
  audio: PointHistoryAudioResponse;
};

/**
 * A self-contained audio player card that loads, plays, and controls a remote
 * audio file. Automatically unloads the sound when the screen loses focus.
 *
 * Styled to sit inside a card on the PointHistoryAudioScreen.
 */
export default function AudioPlayer({ audioUrl, onActiveIndexChange, audio }: AudioPlayerProps) {
  const player = useAudioPlayer(audioUrl ?? null, {
    downloadFirst: true,
    updateInterval: 100,
    keepAudioSessionActive: true,
  });
  const status = useAudioPlayerStatus(player);

  const [playbackSpeed, setPlaybackSpeed] = useState('1x');
  const isReady = Boolean(audioUrl) && status.isLoaded;
  const isPlaying = status.playing;

  const position = useMemo(
    () => Math.round((status.currentTime || 0) * 1000),
    [status.currentTime]
  );
  const duration = useMemo(() => Math.round((status.duration || 0) * 1000), [status.duration]);
  const lockScreenMetadata = useMemo(
    () => ({
      title: audio.metadata.title,
      artist: audio.metadata.artist,
      albumTitle: audio.metadata.title,
      artworkUrl: audio.metadata.coverImage,
    }),
    [audio.metadata.title, audio.metadata.artist, audio.metadata.coverImage]
  );

  // Configure audio mode once for silent mode + background playback.
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
    }).catch((error) => {
      logger.error('AudioPlayer: Failed to set audio mode', error);
    });
  }, []);

  // Compute active word index and notify parent only when it changes.
  const activeIndexRef = useRef(-1);
  useEffect(() => {
    const posInSec = status.currentTime || 0;
    const newIndex = audio.words.findIndex((w) => posInSec >= w.start && posInSec <= w.end);
    if (newIndex !== activeIndexRef.current) {
      activeIndexRef.current = newIndex;
      onActiveIndexChange?.(newIndex);
    }
  }, [status.currentTime, audio.words, onActiveIndexChange]);

  // Reset playback speed indicator when source changes.
  useEffect(() => {
    setPlaybackSpeed('1x');
  }, [audioUrl]);

  // Source can auto-play after replace(); ensure lock-screen metadata follows playback state.
  useEffect(() => {
    if (!isReady) return;

    if (status.playing) {
      player.setActiveForLockScreen(true, lockScreenMetadata);
    } else {
      player.setActiveForLockScreen(false);
    }
  }, [audioUrl, isReady, status.playing, player, lockScreenMetadata]);

  // Release lock screen controls when a track completes.
  useEffect(() => {
    if (status.didJustFinish) {
      player.setActiveForLockScreen(false);
    }
  }, [status.didJustFinish, player]);

  // Pause and clear lock-screen controls when leaving this screen.
  useFocusEffect(
    useCallback(() => {
      return () => {
        player.pause();
        player.setActiveForLockScreen(false);
      };
    }, [player])
  );

  // ─── Controls ───
  const handlePlayPause = async () => {
    if (!isReady) return;

    if (isPlaying) {
      player.pause();
      player.setActiveForLockScreen(false);
    } else {
      player.setActiveForLockScreen(true, lockScreenMetadata);
      player.play();
    }
  };

  const handleSkip = async (amount: number) => {
    if (!isReady) return;

    const newPosition = Math.max(0, Math.min(position + amount, duration));
    await player.seekTo(newPosition / 1000);
  };

  const handleSeek = async (positionMillis: number) => {
    if (!isReady) return;
    await player.seekTo(positionMillis / 1000);
  };

  const handleSpeedChange = async () => {
    if (!isReady) return;

    const nextSpeedMap: Record<string, { label: string; value: number }> = {
      '1x': { label: '1.5x', value: 1.5 },
      '1.5x': { label: '2x', value: 2.0 },
      '2x': { label: '1x', value: 1.0 },
    };

    const next = nextSpeedMap[playbackSpeed];
    setPlaybackSpeed(next.label);
    player.playbackRate = next.value;
  };

  return (
    <View className="rounded-2xl border border-border bg-card p-5">
      {/* Progress */}
      <AudioProgressBar position={position} duration={duration} onSeek={handleSeek} />

      {/* Transport controls */}
      <View className="mt-5">
        <AudioControls
          isPlaying={isPlaying}
          isReady={isReady}
          playbackSpeed={playbackSpeed}
          onPlayPause={handlePlayPause}
          onSkipBackward={() => handleSkip(-15000)}
          onSkipForward={() => handleSkip(15000)}
          onSpeedChange={handleSpeedChange}
        />
      </View>
    </View>
  );
}
