import React from "react";
import { View, TouchableOpacity, TextInput, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { MainStackParamList } from "@/app/navigations/NavigationParamTypes";

const { width, height } = Dimensions.get("window");

type Props = StackScreenProps<MainStackParamList, "PointMapSelection">;

export default function PointMapSelectionScreen({ navigation, route }: Props) {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const { pointId } = route.params;

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Map Placeholder */}
            <View className="absolute inset-0 bg-slate-200 dark:bg-slate-800">
                <Image
                    source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZZUY6Flmba_HEvAt4ainR9mU1Ih15CJYknjySCAY6HXreso2wZR4ulo-6AMHb7ZNGvHf3VSESxWVXMS5FcMwZtcrzfAfGnjVhV4WobVpcH1DN7XlsW948gScKtZF3ojUDUjCecJJ068oUFB_CMTDo2Oq8ggrJi7gZh9dV0Yh7X58OWkV2R-pXfiLwFvvJkL0OFUTCS_XbXix3pOeyvLiaj0TscMR7yGI2Qex9n1guvRUn84bSn1GDq7uaFrjzCsM8m421NJYC-EZ1" }}
                    className="w-full h-full object-cover opacity-50 grayscale"
                />

                {/* User Location Pulse (Mock) */}
                <View className="absolute bottom-[480px] left-[100px] items-center justify-center">
                    <View className="absolute w-12 h-12 bg-blue-500/20 rounded-full" />
                    <View className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-md shadow-blue-500/50" />
                </View>

                {/* Destination Marker (Mock) */}
                <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-20 items-center">
                    <Text className="text-[10px] font-bold mb-1 text-black bg-white/80 px-2 py-0.5 rounded shadow-sm">Động Huyền Không</Text>
                    <View className="bg-white p-1 rounded-lg shadow-lg border border-slate-200">
                        <Image
                            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtps6U5-X4KnttnXCGcdQheGvVcWjuMCvFEa1lMqVgI6E1qBoW78X2YYxo7dYACANRH0JG1EWbLcdX9AAVdSPFOXRf7zhoaTfelK7CiM5J-j21ijJbHowqyMhv80vmRf1bovjGyH2L9dIqsA46iId3gZHsFEWbmcVrLv9PO6_QmGeL8lFvTrQ4tvfbNjThUKouWEjuU_IDqo7tkIWMZGQno9qzq_7ucgxZGbQ6jsqXszlh7Un_gYYhVlrmj8xyXGMT1LSD_sbmEGWt" }}
                            className="w-12 h-8 object-contain"
                        />
                    </View>
                </View>
            </View>

            {/* Floating Header Search */}
            <View className="absolute top-14 left-0 right-0 px-5 flex-row items-center gap-3">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-12 h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md items-center justify-center rounded-2xl shadow-lg border border-white/20"
                >
                    <Ionicons name="arrow-back" size={24} color={theme.foreground} />
                </TouchableOpacity>
                <View className="flex-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-lg flex-row items-center px-4 py-3 border border-white/20">
                    <Ionicons name="search" size={20} color={theme.mutedForeground} className="mr-3" />
                    <TextInput
                        placeholder="Search for a location"
                        placeholderTextColor={theme.mutedForeground}
                        className="flex-1 text-sm pt-0 pb-0"
                        style={{ color: theme.foreground }}
                    />
                </View>
            </View>

            {/* Zoom Controls & My Location */}
            <View className="absolute top-32 right-4 flex-col gap-2">
                <View className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl shadow-md border border-white/20">
                    <TouchableOpacity className="p-3 border-b border-slate-100 dark:border-slate-700">
                        <Ionicons name="add" size={20} color={theme.foreground} />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-3">
                        <Ionicons name="remove" size={20} color={theme.foreground} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl shadow-md p-3 border border-white/20">
                    <Ionicons name="navigate" size={20} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {/* Bottom Sheet */}
            <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[32px] shadow-2xl border-t border-slate-100 dark:border-slate-800">
                <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-4 mb-2" />
                <View className="px-6 py-4 pb-12">
                    <View className="flex-row items-start gap-4 mb-6">
                        <Image
                            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEXx8D6nEQRUWftQLi07tHWHVaaJ80f0Ie4Okl7SZoJNNi5FuoyCOKEzgj6LfcMjEajYWZvlojnm4_VugMUpxhJd-CsdcNBQQ5VDwUPX3saXKF4pJJYuoga_wiDRdigvn3nBT3qj_bDe8iy9wpUBEwj1smVeBzv4sEgbAjhvsk6s4T9TuS6URSi6LTuALQq3yjzkodYnxalycGMcEI3vWFOqQM2HSR_la4BMxeMgiyWXMa8ftowAyfaBG-iJDLugEeM1AmO5EP4Zlm" }}
                            className="w-16 h-16 rounded-2xl object-cover"
                        />
                        <View className="flex-1">
                            <Text className="text-xl font-bold" style={{ color: theme.foreground }}>Huyền Không Cave</Text>
                            <View className="flex-row items-center gap-1 mt-1">
                                <Text className="text-sm" style={{ color: theme.mutedForeground }}>Park • 0.5 mi away</Text>
                                <Text className="mx-1" style={{ color: theme.mutedForeground }}>•</Text>
                                <Text className="text-sm font-semibold" style={{ color: theme.primary }}>Open now</Text>
                            </View>
                        </View>
                    </View>

                    <Text className="text-sm leading-relaxed mb-8" style={{ color: theme.mutedForeground }} numberOfLines={4}>
                        Central Park is an urban park in New York City located between the Upper West and Upper East Sides of Manhattan...
                    </Text>

                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={() => navigation.navigate("PointDetail", { pointId })}
                            className="flex-1 bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
                        >
                            <Text className="text-white font-bold text-lg">View Destination</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="w-14 h-14 bg-teal-500 items-center justify-center rounded-2xl shadow-lg shadow-teal-500/20">
                            <Ionicons name="location" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}
