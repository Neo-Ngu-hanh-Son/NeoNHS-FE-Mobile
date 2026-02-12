import React from "react";
import { View, TouchableOpacity, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { MainStackParamList } from "@/app/navigations/NavigationParamTypes";
import { discoverService } from "../services/discoverServices";
import { MapPoint } from "../../map/types";

const { width, height } = Dimensions.get("window");

type Props = StackScreenProps<MainStackParamList, "ActiveNavigation">;

export default function ActiveNavigationScreen({ navigation, route }: Props) {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const { pointId } = route.params;
    const [point, setPoint] = React.useState<MapPoint | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchPoint = async () => {
            setLoading(true);
            try {
                const response = await discoverService.getPointById(pointId);
                if (response.success && response.data) {
                    setPoint(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch point for active navigation:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPoint();
    }, [pointId]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
                <Ionicons name="navigate" size={48} color={theme.primary} className="animate-pulse" />
                <Text className="mt-4" style={{ color: theme.mutedForeground }}>Calculating Route...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Map Background Placeholder */}
            <View className="absolute inset-0 bg-slate-100 dark:bg-slate-900">
                <Image
                    source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZZUY6Flmba_HEvAt4ainR9mU1Ih15CJYknjySCAY6HXreso2wZR4ulo-6AMHb7ZNGvHf3VSESxWVXMS5FcMwZtcrzfAfGnjVhV4WobVpcH1DN7XlsW948gScKtZF3ojUDUjCecJJ068oUFB_CMTDo2Oq8ggrJi7gZh9dV0Yh7X58OWkV2R-pXfiLwFvvJkL0OFUTCS_XbXix3pOeyvLiaj0TscMR7yGI2Qex9n1guvRUn84bSn1GDq7uaFrjzCsM8m421NJYC-EZ1" }}
                    className="w-full h-full object-cover opacity-30 grayscale"
                />

                {/* Mock Path Line Layer - Using Views as path segments for placeholder */}
                <View className="absolute inset-0 items-center justify-center">
                    {/* Simulation of a path */}
                    <View className="w-1 h-40 bg-primary opacity-50 rotate-[-10deg] absolute bottom-1/4" />
                    <View className="w-1 h-32 bg-primary opacity-50 rotate-[45deg] absolute top-1/3 left-1/2" />
                </View>

                {/* User Marker */}
                <View className="absolute bottom-1/4 left-1/2 -translate-x-3 items-center justify-center">
                    <View className="absolute w-12 h-12 bg-blue-500/20 rounded-full" />
                    <View className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
                </View>

                {/* Destination Marker */}
                <View className="absolute top-[260px] left-[245px] z-20 items-center">
                    <View className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-2">
                        <Image
                            source={{ uri: point?.thumbnailUrl }}
                            className="w-10 h-10 rounded object-cover"
                        />
                        <Text className="text-[10px] font-bold mt-1 text-center" style={{ color: theme.foreground }}>{point?.name}</Text>
                    </View>
                    <View className="w-3 h-3 bg-primary rounded-full border-2 border-white" />
                </View>
            </View>

            {/* Top Instruction Card */}
            <SafeAreaView className="absolute top-0 left-0 right-0 px-4" edges={["top"]}>
                <View className="bg-primary p-4 rounded-[24px] flex-row items-center shadow-xl shadow-primary/30">
                    <View className="w-12 h-12 rounded-full border-2 border-white/30 items-center justify-center mr-4">
                        <Ionicons name="arrow-undo-outline" size={32} color="white" style={{ transform: [{ scaleX: -1 }] }} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-white leading-tight">50m</Text>
                        <Text className="text-sm text-white/90">Turn right at the intersection</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Floating Controls */}
            <View className="absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-3">
                <View className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <TouchableOpacity className="p-3 border-b border-slate-100 dark:border-slate-700">
                        <Ionicons name="add" size={20} color={theme.foreground} />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-3">
                        <Ionicons name="remove" size={20} color={theme.foreground} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-3">
                    <Ionicons name="navigate-outline" size={20} color={theme.foreground} />
                </TouchableOpacity>
            </View>

            {/* Bottom Status Bar */}
            <View className="absolute bottom-6 left-4 right-4 items-center">
                <View className="w-full bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl p-4 rounded-[2rem] flex-row items-center justify-between shadow-2xl">
                    <View className="flex-col">
                        <View className="flex-row items-baseline gap-1">
                            <Text className="text-white font-bold text-lg">15 minutes</Text>
                            <Text className="text-slate-400 text-sm">(200 m)</Text>
                        </View>
                        <Text className="text-slate-400 text-xs">Walking to destination</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("ArrivalConfirmation", { pointId })}
                        className="bg-red-600 px-6 py-2.5 rounded-full flex-row items-center gap-2"
                    >
                        <Ionicons name="close-circle-outline" size={18} color="white" />
                        <Text className="text-white font-bold text-sm">End</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
