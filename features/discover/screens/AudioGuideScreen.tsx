import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { MainStackParamList } from "@/app/navigations/NavigationParamTypes";

const { width } = Dimensions.get("window");

type Props = StackScreenProps<MainStackParamList, "AudioGuide">;

export default function AudioGuideScreen({ navigation, route }: Props) {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const { pointId } = route.params;

    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState("1x");

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Header */}
            <SafeAreaView edges={["top"]} className="px-6 py-2 flex-row items-center justify-between z-10">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-sm"
                    style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.foreground} />
                </TouchableOpacity>
                <Text className="text-lg font-bold tracking-tight" style={{ color: theme.foreground }}>Huyền Không Cave</Text>
                <View className="w-10" />
            </SafeAreaView>

            <View className="flex-1 flex-col items-center justify-center px-8">
                {/* Visualizer / Play Button Area */}
                <View className="relative w-64 h-64 items-center justify-center mb-10">
                    {/* Concentric Circles Simulation */}
                    <View className="absolute inset-0 rounded-full border border-primary/20 scale-[1.05]" style={{ borderStyle: "dashed" }} />
                    <View className="absolute inset-0 rounded-full border border-primary/10 scale-[0.85]" />
                    <View className="absolute inset-0 rounded-full border border-primary/20 scale-[0.70]" />

                    <TouchableOpacity
                        onPress={() => setIsPlaying(!isPlaying)}
                        className="w-32 h-32 bg-primary rounded-full items-center justify-center shadow-xl shadow-primary/30 z-20"
                    >
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={48}
                            color="white"
                            style={!isPlaying ? { marginLeft: 6 } : {}}
                        />
                    </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View className="w-full mb-10">
                    <View className="relative h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <View className="absolute top-0 left-0 h-full bg-primary w-[40%] rounded-full" />
                    </View>
                    <View className="absolute top-2 left-[40%] -translate-x-2 w-4 h-4 bg-primary border-4 border-white dark:border-slate-900 rounded-full shadow-md" />

                    <View className="flex-row justify-between mt-4">
                        <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">02:14</Text>
                        <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">05:30</Text>
                    </View>
                </View>

                {/* Controls */}
                <View className="flex-row items-center justify-between w-full max-w-[280px]">
                    <View className="items-center gap-2">
                        <TouchableOpacity className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-sm items-center justify-center">
                            <Ionicons name="play-back-outline" size={20} color={theme.foreground} />
                        </TouchableOpacity>
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">-15S</Text>
                    </View>

                    <View className="items-center gap-2">
                        <TouchableOpacity
                            onPress={() => setPlaybackSpeed(playbackSpeed === "1x" ? "1.5x" : playbackSpeed === "1.5x" ? "2x" : "1x")}
                            className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-sm items-center justify-center"
                        >
                            <Text className="text-sm font-bold" style={{ color: theme.foreground }}>{playbackSpeed}</Text>
                        </TouchableOpacity>
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SPEED</Text>
                    </View>

                    <View className="items-center gap-2">
                        <TouchableOpacity className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-sm items-center justify-center">
                            <Ionicons name="play-forward-outline" size={20} color={theme.foreground} />
                        </TouchableOpacity>
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+15S</Text>
                    </View>
                </View>
            </View>

            {/* Content Section (BottomSheet-like) */}
            <View className="bg-white dark:bg-slate-900 rounded-t-[32px] shadow-2xl px-6 pt-8 pb-12 h-[45%] border-t border-slate-100 dark:border-slate-800">
                <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full self-center mb-6" />
                <Text className="text-xl font-bold mb-4" style={{ color: theme.foreground }}>The Sacred History of Huyền Không</Text>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <Text className="leading-relaxed text-[15px] mb-4" style={{ color: theme.mutedForeground }}>
                        The Huyền Không Cave is one of the largest and most beautiful caves in the Marble Mountains. As you enter, notice the open ceiling allowing shafts of sunlight to pierce through, creating a divine atmosphere.
                    </Text>

                    <View className="bg-primary/5 dark:bg-primary/20 border-l-4 border-primary rounded-xl p-4 my-2">
                        <Text className="italic" style={{ color: theme.primary }}>
                            Statues of Buddhist deities line the walls, watching over pilgrims. The air here is cooler, filled with the scent of incense and the echoes of prayers from centuries past.
                        </Text>
                    </View>

                    <Text className="leading-relaxed text-[15px] mt-4" style={{ color: theme.mutedForeground }}>
                        Historically, this cave served as a secret base for revolutionaries during wartime. The natural fortifications provided safety and a vantage point for those protecting the heritage of the region.
                    </Text>
                </ScrollView>
            </View>

            {/* Language Selection Overlay (Floating) */}
            <TouchableOpacity className="absolute bottom-12 right-6 flex-row items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 shadow-lg rounded-full border border-slate-100 dark:border-slate-800">
                <Ionicons name="language-outline" size={18} color={theme.mutedForeground} />
                <Text className="text-sm font-bold" style={{ color: theme.foreground }}>EN</Text>
                <Ionicons name="chevron-down" size={14} color={theme.mutedForeground} />
            </TouchableOpacity>

            <View className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full opacity-30" />
        </View>
    );
}
