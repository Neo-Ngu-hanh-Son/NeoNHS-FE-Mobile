import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Image, Share, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { MainStackParamList } from "@/app/navigations/NavigationParamTypes";
import { discoverService } from "../services/discoverServices";
import { MapPoint } from "../../map/types";

type Props = StackScreenProps<MainStackParamList, "ArrivalConfirmation">;

export default function ArrivalConfirmationScreen({ navigation, route }: Props) {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const { pointId } = route.params;
    const [point, setPoint] = useState<MapPoint | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPoint = async () => {
            setLoading(true);
            try {
                const response = await discoverService.getPointById(pointId);
                if (response.success && response.data) {
                    setPoint(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch point for arrival confirmation:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPoint();
    }, [pointId]);

    const onShare = async () => {
        if (!point) return;
        try {
            await Share.share({
                message: `I've arrived at ${point.name}! It's amazing here. Shared via NeoNHS.`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            {/* Scenic Background with Blur */}
            <Image
                source={{ uri: point?.thumbnailUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBiXP9rjKZ38JUBgVn2hBs-HfbKpdrGf5_eWGiTRAyOlhyi8zNHS3TP4vhoABhmKP30d5fuqoBIsn3xPBoaFIdroHYYGUPmLhb2seNBDOujGvicKa44_0vuFPctPL-afvX3cNwghZJz8-eubDL_Gi7AvCA74EcXSbb6-U6jMuB3K0R2tf5aw9R5yIZtjV2LBoeCjPkY9GhWKxIEDeVYbZ-ePZq3bidR0OnsFcgAt9m32xhjCvkcxENR6m9wlU1UCgnWeDjz8Er-dQw0" }}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                blurRadius={4}
            />
            <View className="absolute inset-0 bg-black/20" />

            {/* Header Overlay */}
            <SafeAreaView className="absolute top-0 left-0 right-0 px-6" edges={["top"]}>
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Tabs", { screen: "Discover" } as any)}
                        className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md items-center justify-center border border-white/20"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="px-4 py-1.5 rounded-full bg-white/30 backdrop-blur-md border border-white/20">
                        <Text className="text-white text-[10px] font-bold tracking-widest uppercase">Ngu Hanh Son</Text>
                    </View>
                    <View className="w-10" />
                </View>
            </SafeAreaView>

            {/* Modal Content */}
            <View className="flex-1 items-center justify-center px-6">
                <View className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl p-8 items-center">
                    {/* Success Icon */}
                    <View className="mb-8 relative">
                        <View className="absolute -top-4 -left-6 w-4 h-4 rounded-full bg-amber-200 opacity-60" />
                        <View className="absolute top-4 -left-10 w-8 h-8 rounded-full bg-pink-100 opacity-60" />
                        <View className="absolute -top-6 left-12 w-6 h-6 rounded-full bg-blue-100 opacity-60" />

                        <View className="w-24 h-24 rounded-full bg-green-50 dark:bg-green-950/30 items-center justify-center">
                            <View className="w-16 h-16 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/20">
                                <Ionicons name="checkmark" size={40} color="white" />
                            </View>
                        </View>
                    </View>

                    {/* Title and Subtitle */}
                    <View className="items-center mb-8">
                        <Text className="text-3xl font-bold tracking-tight mb-2 text-center" style={{ color: theme.foreground }}>You have arrived!</Text>
                        <Text className="text-lg text-center" style={{ color: theme.mutedForeground }}>
                            Welcome to <Text className="font-semibold" style={{ color: theme.foreground }}>{point?.name}</Text>
                        </Text>
                    </View>

                    {/* Stats Bar */}
                    <View className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex-row items-center justify-between mb-8 border border-slate-100 dark:border-slate-700">
                        <View className="flex-1 flex-row items-center justify-center gap-2 border-r border-slate-200 dark:border-slate-700">
                            <Ionicons name="navigate-outline" size={20} color={theme.primary} />
                            <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>1.2 km traveled</Text>
                        </View>
                        <View className="flex-1 flex-row items-center justify-center gap-2 pl-2">
                            <Ionicons name="time-outline" size={20} color={theme.primary} />
                            <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>15 min</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View className="w-full gap-3">
                        <Button
                            onPress={() => navigation.navigate("PointDetail", { pointId })}
                            className="w-full h-14 bg-primary rounded-2xl shadow-lg shadow-primary/25"
                        >
                            <Text className="text-white font-bold text-lg">View Attraction Details</Text>
                        </Button>
                        <TouchableOpacity
                            onPress={onShare}
                            className="w-full h-14 flex-row items-center justify-center gap-2 border-2 border-primary/20 rounded-2xl"
                        >
                            <Ionicons name="share-social-outline" size={20} color={theme.primary} />
                            <Text className="font-bold text-lg" style={{ color: theme.primary }}>Share Trip</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Bottom Bar Simulator */}
            <View className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/40 rounded-full" />
        </View>
    );
}
