import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Image, Dimensions, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { MainStackParamList } from "@/app/navigations/NavigationParamTypes";

const { width } = Dimensions.get("window");

type Props = StackScreenProps<MainStackParamList, "PointDetail">;

const GALLERY_PHOTOS = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCKm5L5M0j5L2QmffIZ0pnmgadfS9Cw9bXKb96m8HynEEq-90T5nXhkuENGaOC3-Ij8snTadpmTYieZZpifEVrEMdOhGIxTAOfDvxi1tfqkodtk1E2Ey-fU2pbdlKvgxgGk7TSIWNjZlEBTogUGYmiqoNNkZbe9jAsZpkHZxvMvBt-DHknqpkvLyUjpZPKS1UpCUWFlj34ijpaFbfz7OBDE39rfUkf9qPN1laOPKe6WRXKv1FYkxXYsL1R9COyGPeRk2565jgKH9tPB",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDsSVWdk4xdgOBN8Jt4LxtXEgN6_Y1TTlWaorIF0TZBFfMTJP53DaLgzm1SCz2uHVEJ2iQwmjof0HFQp7fwdAztWvmGs1crUR-LPyV7kfsvIMh00-xQjrNpoFPKtSpJ49feaad9bp3V0XVfBwsEkU30lgQVThaET83tV7e08lBTFpOQI7raFI0UM9XgB3iC54sjnGwb5bwVzROaZOouG1u76Ijsam0P4i6EBI8TSarKCtojQVXqUKvi6iZ9FEVxdVglC2qxmCShwq_3",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCjLJD_UcqL87_A5cxKEI9OItTiFnAm6qFpNlYguEHg3RvNRzNkEPrMZq_YCCy560V4iyAPieGxv1oJq5bjd9Cqx1iLF95JfxQSNGyLB24OIVnfQFYZ75UpyC-zi7q2zAafB4nsbVQ3cIduxcikNrPS4CkDbnDusH8tHWHFYYoAuXBxjJFW5rv2idB03vckyRdaJ8QrJwqCZqG5xBBW7HksTb_e1PmiHIfcq8P_52fzc4Szz096UO-85NJKbQnYxkxxmqYRckbSK-Pw",
];

export default function PointDetailScreen({ navigation, route }: Props) {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const { pointId } = route.params;
    const [isFavorite, setIsFavorite] = useState(false);
    const [isReadMore, setIsReadMore] = useState(false);

    const onShare = async () => {
        try {
            await Share.share({
                message: "Check out this beautiful point of interest on NeoNHS!",
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View className="relative h-[400px]">
                    <Image
                        source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3Ia_EuMeNQ959XrpwY2a1J_TuVJ291xVgqM8xsvUJdodBE7LCnMIA0x-ghOu4lbre-GSjYW13HzY2kLERvBawPRSZpjREaWbILuLpEz2u4Z1UV3VB_cvk4wjtzFiPQWOag9LoI7TPaV9SXrQDmMqJAG3T0ESdAJ2tbESgWdgcV_UMKQLzTe6YywP2RWr_F2LY2mTnUf2fTCWzLxRapDORR6G94zVmM0k1OPeYk9bHR3Hj9yzvwDSeqpLPTHgf4UaOlwNkg75KxtAt" }}
                        className="w-full h-full object-cover"
                    />
                    <View className="absolute top-12 left-0 right-0 px-4 flex-row justify-between items-center">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 items-center justify-center bg-black/30 rounded-full"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setIsFavorite(!isFavorite)}
                                className="w-10 h-10 items-center justify-center bg-black/30 rounded-full"
                            >
                                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#ef4444" : "white"} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onShare}
                                className="w-10 h-10 items-center justify-center bg-black/30 rounded-full"
                            >
                                <Ionicons name="share-outline" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View className="absolute bottom-6 left-4">
                        <View className="bg-primary px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
                            <Ionicons name="checkmark-circle-outline" size={14} color="white" />
                            <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Open Now</Text>
                        </View>
                    </View>
                </View>

                <View className="px-5 py-6 space-y-8">
                    {/* Header Info */}
                    <View>
                        <View className="flex-row justify-between items-start mb-2">
                            <Text className="text-3xl font-bold tracking-tight pr-4 flex-1" style={{ color: theme.foreground }}>
                                Huyền Không cave
                            </Text>
                            <View className="flex-row items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg">
                                <Ionicons name="star" size={14} color={theme.primary} />
                                <Text className="text-sm font-bold" style={{ color: theme.primary }}>4.8</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="location-outline" size={16} color={theme.mutedForeground} />
                            <Text className="text-sm" style={{ color: theme.mutedForeground }}>15 minutes walk from your current location</Text>
                        </View>
                    </View>

                    {/* About */}
                    <View className="gap-2">
                        <Text className="text-lg font-bold" style={{ color: theme.foreground }}>About</Text>
                        <Text className="leading-relaxed" style={{ color: theme.mutedForeground }}>
                            Discover the hidden trails of Mossy Falls, a serene nature reserve known for its bioluminescent flora and ancient limestone caves. This destination offers a unique blend of natural beauty and spiritual tranquility...
                            {!isReadMore && <Text onPress={() => setIsReadMore(true)} className="font-bold" style={{ color: theme.primary }}> Read more</Text>}
                            {isReadMore && <Text> The cave system features stunning rock formations and is a place of worship for many locals. Visitors are encouraged to dress modestly and respect the sacred atmosphere.</Text>}
                        </Text>
                    </View>

                    {/* Location Map Preview */}
                    <View className="gap-3">
                        <Text className="text-lg font-bold" style={{ color: theme.foreground }}>Location</Text>
                        <TouchableOpacity className="relative h-48 rounded-2xl overflow-hidden bg-muted/20">
                            <Image
                                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZZUY6Flmba_HEvAt4ainR9mU1Ih15CJYknjySCAY6HXreso2wZR4ulo-6AMHb7ZNGvHf3VSESxWVXMS5FcMwZtcrzfAfGnjVhV4WobVpcH1DN7XlsW948gScKtZF3ojUDUjCecJJ068oUFB_CMTDo2Oq8ggrJi7gZh9dV0Yh7X58OWkV2R-pXfiLwFvvJkL0OFUTCS_XbXix3pOeyvLiaj0TscMR7yGI2Qex9n1guvRUn84bSn1GDq7uaFrjzCsM8m421NJYC-EZ1" }}
                                className="w-full h-full object-cover grayscale opacity-50"
                            />
                            <View className="absolute inset-0 items-center justify-center">
                                <View className="bg-primary p-3 rounded-full shadow-lg border-2 border-white">
                                    <Ionicons name="map" size={24} color="white" />
                                </View>
                            </View>
                            <View className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-lg flex-row items-center gap-1.5 shadow-sm">
                                <Ionicons name="expand" size={14} color={theme.foreground} />
                                <Text className="text-xs font-bold" style={{ color: theme.foreground }}>Expand</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Check-in Gallery */}
                    <View className="gap-4">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-lg font-bold" style={{ color: theme.foreground }}>Check-in Gallery</Text>
                            <TouchableOpacity>
                                <Text className="text-sm font-bold" style={{ color: theme.primary }}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                            {GALLERY_PHOTOS.map((uri, index) => (
                                <View key={index} className="relative w-28 h-28">
                                    <Image source={{ uri }} className="w-full h-full rounded-2xl object-cover" />
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Reviews */}
                    <View className="gap-4">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-lg font-bold" style={{ color: theme.foreground }}>Reviews</Text>
                            <TouchableOpacity className="flex-row items-center gap-1">
                                <Text className="text-sm font-bold" style={{ color: theme.primary }}>Write a review</Text>
                                <Ionicons name="arrow-forward" size={16} color={theme.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Rating Summary */}
                        <View className="bg-card p-6 rounded-3xl border shadow-sm flex-row items-center gap-8" style={{ borderColor: theme.border }}>
                            <View className="items-center">
                                <Text className="text-4xl font-bold mb-1" style={{ color: theme.foreground }}>4.8</Text>
                                <View className="flex-row text-primary">
                                    {[1, 2, 3, 4].map(i => <Ionicons key={i} name="star" size={12} color="#1d6d45" />)}
                                    <Ionicons name="star-half" size={12} color="#1d6d45" />
                                </View>
                                <Text className="text-[10px] mt-1" style={{ color: theme.mutedForeground }}>324 reviews</Text>
                            </View>
                            <View className="flex-1 gap-1">
                                {[85, 10, 2, 1, 2].map((percent, i) => (
                                    <View key={i} className="flex-row items-center gap-2">
                                        <Text className="text-[10px] w-2" style={{ color: theme.mutedForeground }}>{5 - i}</Text>
                                        <View className="h-1 flex-1 bg-muted/20 rounded-full overflow-hidden">
                                            <View className="h-full bg-primary" style={{ width: `${percent}%` }} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Sample Review */}
                        <View className="bg-card p-4 rounded-3xl border shadow-sm gap-3" style={{ borderColor: theme.border }}>
                            <View className="flex-row justify-between items-start">
                                <View className="flex-row gap-3">
                                    <Image
                                        source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyA0J5rjp-aat59aZlP_WPjj2erMvBLSVc3jMNbe2unFO_xI0RXTo7kfksioeO335FoVJHhTzY5ACTZKVFHxXj2J1-190VmStf7Z5nZF99bv-kFmgd7-KKn02qB_mvBya6bARq9ILUymtkP1dEuQvBUxC2HWNVmmv8hnucAalFtRq3KfhaLuRpVGGnoCzPfCkrHfO_IlgghxAGez_M-m6TIrMMatVy7I838qCmfBm_Weznr7MqF8Pr-BuL5pSj5Yuwt_y-2Muv82bD" }}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <View>
                                        <Text className="text-sm font-bold" style={{ color: theme.foreground }}>Sarah Jenkins</Text>
                                        <Text className="text-[10px]" style={{ color: theme.mutedForeground }}>2 days ago</Text>
                                    </View>
                                </View>
                                <TouchableOpacity>
                                    <Ionicons name="ellipsis-vertical" size={16} color={theme.muted} />
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row">
                                {[1, 2, 3, 4, 5].map(i => <Ionicons key={i} name="star" size={12} color="#f97316" />)}
                            </View>
                            <Text className="text-sm leading-relaxed" style={{ color: theme.mutedForeground }}>
                                Absolutely stunning views! The hike was moderate but well worth it. Make sure to bring bug spray though.
                            </Text>
                        </View>

                        <TouchableOpacity className="py-2 flex-row justify-center items-center gap-1">
                            <Text className="text-primary text-sm font-bold">View all reviews</Text>
                            <Ionicons name="arrow-forward" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Bottom Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 p-4 pb-8 border-t backdrop-blur-xl" style={{ borderColor: theme.border }}>
                <View className="flex-row gap-3 max-w-md mx-auto">
                    <Button
                        onPress={() => navigation.navigate("PointMapSelection", { pointId })}
                        className="flex-1 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/20"
                    >
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="navigate" size={20} color="white" />
                            <Text className="text-white font-bold text-lg">Take me there</Text>
                        </View>
                    </Button>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("AudioGuide", { pointId })}
                        className="w-14 h-14 items-center justify-center border rounded-2xl bg-card"
                        style={{ borderColor: theme.border }}
                    >
                        <Ionicons name="headset-outline" size={24} color={theme.foreground} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
