import React, { useState, useEffect, useCallback } from "react";
import { View, TouchableOpacity, ScrollView, Dimensions, Image, ImageBackground } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { MainStackParamList } from "@/app/navigations/NavigationParamTypes";
import { discoverService } from "../services/discoverServices";
import { MapPoint } from "../../map/types";

const { width, height } = Dimensions.get("window");

type Props = StackScreenProps<MainStackParamList, "AudioGuide">;

export default function AudioGuideScreen({ navigation, route }: Props) {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const { pointId } = route.params;

    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState("1x");
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [point, setPoint] = useState<MapPoint | null>(null);
    const [loading, setLoading] = useState(true);

    // --- Strict Lifecycle: Stop Audio on Leave ---
    useFocusEffect(
        useCallback(() => {
            return () => {
                if (sound) {
                    console.log("Unloading sound as screen is focused out");
                    sound.unloadAsync();
                }
            };
        }, [sound])
    );

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
            }
        }
    };

    const loadSound = async (url: string) => {
        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: false, rate: 1.0 },
                onPlaybackStatusUpdate
            );
            setSound(newSound);
        } catch (error) {
            console.error("Error loading sound:", error);
        }
    };

    useEffect(() => {
        const fetchPoint = async () => {
            setLoading(true);
            try {
                const response = await discoverService.getPointById(pointId);
                if (response.success && response.data) {
                    setPoint(response.data);
                    if (response.data.historyAudioUrl) {
                        await loadSound(response.data.historyAudioUrl);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch point for audio guide:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPoint();
    }, [pointId]);

    const handlePlayPause = async () => {
        if (!sound) return;
        if (isPlaying) {
            await sound.pauseAsync();
        } else {
            await sound.playAsync();
        }
    };

    const handleSkip = async (amount: number) => {
        if (!sound) return;
        const newPosition = Math.max(0, Math.min(position + amount, duration));
        await sound.setPositionAsync(newPosition);
    };

    const handleSpeedChange = async () => {
        if (!sound) return;
        const nextSpeedMap: Record<string, { label: string; value: number }> = {
            "1x": { label: "1.5x", value: 1.5 },
            "1.5x": { label: "2x", value: 2.0 },
            "2x": { label: "1x", value: 1.0 },
        };
        const next = nextSpeedMap[playbackSpeed];
        setPlaybackSpeed(next.label);
        await sound.setRateAsync(next.value, true);
    };

    const formatTime = (millis: number) => {
        const totalSeconds = millis / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
                <Ionicons name="headset" size={48} color={theme.primary} className="animate-pulse" />
                <Text className="mt-4" style={{ color: theme.mutedForeground }}>Preparing Audio Guide...</Text>
            </View>
        );
    }

    return (
        <ImageBackground
            source={{ uri: point?.thumbnailUrl }}
            className="flex-1"
            blurRadius={20}
        >
            <View className="flex-1 bg-black/60">
                {/* Header */}
                <SafeAreaView edges={["top"]} className="px-6 py-2 flex-row items-center justify-between z-10">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-12 h-12 items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl border border-white/20"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-0.5">Audio Guide</Text>
                        <Text className="text-lg font-bold text-white tracking-tight">{point?.name}</Text>
                    </View>
                    <TouchableOpacity className="w-12 h-12 items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                        <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                    </TouchableOpacity>
                </SafeAreaView>

                <View className="flex-1 flex-col items-center justify-center px-10">
                    {/* Visualizer / Thumbnail Area */}
                    <View className="relative w-72 h-72 items-center justify-center mb-12">
                        <View className="absolute inset-0 rounded-[48px] overflow-hidden border-2 border-white/20 rotate-6" />
                        <Image
                            source={{ uri: point?.thumbnailUrl }}
                            className="w-full h-full rounded-[48px] border-4 border-white/40 shadow-2xl"
                        />

                        <TouchableOpacity
                            onPress={handlePlayPause}
                            className="absolute bottom-[-24px] w-20 h-20 bg-primary rounded-full items-center justify-center shadow-2xl shadow-primary/40 border-4 border-white"
                        >
                            <Ionicons
                                name={isPlaying ? "pause" : "play"}
                                size={32}
                                color="white"
                                style={!isPlaying ? { marginLeft: 4 } : {}}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Progress Bar */}
                    <View className="w-full mb-12">
                        <View className="relative h-2 w-full bg-white/20 rounded-full overflow-hidden">
                            <View className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
                        </View>
                        <View className="flex-row justify-between mt-4">
                            <Text className="text-xs font-bold text-white/60">{formatTime(position)}</Text>
                            <Text className="text-xs font-bold text-white/60">{formatTime(duration)}</Text>
                        </View>
                    </View>

                    {/* Controls */}
                    <View className="flex-row items-center justify-between w-full">
                        <TouchableOpacity
                            onPress={handleSpeedChange}
                            className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl items-center justify-center border border-white/10"
                        >
                            <Text className="text-sm font-black text-white">{playbackSpeed}</Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center gap-8">
                            <TouchableOpacity onPress={() => handleSkip(-15000)}>
                                <Ionicons name="refresh-outline" size={32} color="white" style={{ transform: [{ scaleX: -1 }] }} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSkip(15000)}>
                                <Ionicons name="refresh-outline" size={32} color="white" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl items-center justify-center border border-white/10">
                            <Ionicons name="share-social-outline" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content Section (Pull up like) */}
                <View className="bg-white/95 dark:bg-slate-900/95 rounded-t-[48px] px-8 pt-8 pb-12 h-[35%] border-t border-white/20">
                    <View className="w-16 h-1.5 bg-slate-300 dark:bg-slate-800 rounded-full self-center mb-8" />
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-black tracking-tight" style={{ color: theme.foreground }}>Story & History</Text>
                        <TouchableOpacity className="bg-primary/10 px-3 py-1.5 rounded-xl">
                            <Text className="text-xs font-bold text-primary">Transcript</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        <Text className="leading-relaxed text-lg font-medium opacity-80" style={{ color: theme.foreground }}>
                            {point?.description || "No description available for this point."}
                        </Text>
                        <Text className="leading-relaxed text-lg font-medium opacity-80 mt-4" style={{ color: theme.foreground }}>
                            {point?.history || "Steeped in centuries of tradition, this place whispers tales of ancient kings and spiritual masters who once sought solace within these stone walls."}
                        </Text>
                    </ScrollView>
                </View>
            </View>
        </ImageBackground>
    );
}
