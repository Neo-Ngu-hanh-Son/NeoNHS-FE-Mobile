import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { MainStackParamList } from "@/app/navigations/NavigationParamTypes";

type Props = StackScreenProps<MainStackParamList, "AllDestinations">;

type CategoryType = "Areas" | "Points" | "Workshops" | "Events" | "Blogs";

const AREAS = [
    { id: "a1", name: "Marble Mountains", pointCount: 12, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBa6-99J4reJyPVNYeLjRuRJhzgC5HHsr75LLKs1aQuE3hNNTbpltxkvuc547JZSUO_TSCRnXd24rYs5a2lY5_ECS0aAWv3xXFPwAKmCmSRiQyzKWMyn4lweuHt9ad1jXa0BWLI24EXgTncjFRQZVI2Jd5f8WcjfwnWWqRMGvIlpqxD465PoSjo3tyNP18wie0h3avj8-maK3d0lahf2HD6ju7dtnWOfTXC8dBYG1NvxGJ17T54JNG78HKIU4fBwHL7LWuVGbKCLYc7" },
    { id: "a2", name: "Son Tra Peninsula", pointCount: 8, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDD5Mg6L5aaP2nTuVwIUuy1BNm5Ojsx2noIkG00c0HRvHzBxlg4OwbH8JdDe35H3rBgkTA0_9vyCO-hCVoOgzgGqvmB0shg5rsl-5EcWWeg16oX-rTFsaJAnem_a_2jTDsY9n6296km-BPglqVayvaXJ2Stwux5WWwmvCbmB_144klz8e1OUtTmlPxFCkBQMkDNfCgcrUVrQuc3L2tJK945TX355ahaE80CJB3yMWx7aJ6qZHh0EYhs8NB6baONOOHPWWFu7Pf5BwLM" },
    { id: "a3", name: "Ba Na Hills", pointCount: 15, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3oKnvJLQXNuh8ttNjcYXPFjtcC-JpI_pZwn3emLHwUaYt1SlmcHZaPXvVumlxytx7KEN1sya1mJrCgOlGag6X5P9QP5ITEkKsWKf15P5_Ueh8GCGC8thKXTpEuwZrCeAfQgoB6QRquovVR49olR-0EDwBH2WArTIMHoOwT7vP1Yk6GMeom0bCYO60htpeqHAG_9y-VsFlEnNCOOtgyUgYoCDY6jELXcbjbSVCbyWwjw29JzsjxhbMdFDSDsAZszJaPX5tgXKGfAJT" },
    { id: "a4", name: "Da Nang Center", pointCount: 5, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlBL2MEUjO22ot5RbjjD7IvbMjfziNB-wg8Qgw3q2HpbxOwXjAwoWIDtWDQa8CvjbV1FptCpEvdaFPjFMEXeRlDl2yFSgtJL1NVM16wtNydkCkxicyG7EBcPRd6RI1RkZXs2c3W1V_vByQIvXF3Sp0cNFj_Kp9xAr7zgwvrH5BjzL_y5mIyyTgBLJmqPVuWQMJjSgef2zD73uxO-kSI8A6AvAaAgEHBtVewl3w-Te4Rsx4IA3ltN2n2Zblupgefwdq5me5jfHfCeBL" },
    { id: "a5", name: "Hai Van Pass", pointCount: 3, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA05rl9fL4ehVJow_qcd_JxweHUm7clURu71rCu2hzSvbV8LYDwxDtNMF3zkIuGesF6o9OFbQCSPiEjRDQb4tpa0_uPYTN9DvY2U2mSvHxnqX9LXtoqMg8pWG81nqdlOlOtWL75X4J5s7c1Tby5Ym-5ohzlJmAL6hQdzb_l31WEChi9ro3YNOCA2E5jh__VGG1mBlq15uSTk6-C0qEuUeuik3FVnlNqhK9tOjtQfN7QI9icnFSIPIXq0QQtJFxReIYHCCp-bBaM6Sp4" },
];

const POINTS = [
    { id: "p1", name: "Động Huyền Không", rating: 4.8, reviews: 120, time: "15 mins walk", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCeGFLjBassiZf5jVtQ7fnCNlOTT1L6NkNM_UFiu3oLWKEiUVmq3cTWsvnjgdYveosDxKtunnCzPEUdk5rtuIaISli73zIB3VhkvUTaqKQABjPfO-UMs6-LN_E6N7T4CS_FvRR50hhJiLbZCffCg20tkwGUMdWswhBeclHlBeBy6OkIMB64nQ9sGavGgIVZLaSu9WcFIkO6HlfvEDbJJewF-DQbHc_Nm6EyhAwqmjRHjCNgY6Awh8mmERPMgyPwkhxmR3zUHbWd7SbE" },
    { id: "p2", name: "Linh Ung Pagoda", rating: 4.9, reviews: 324, time: "10 mins drive", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDD5Mg6L5aaP2nTuVwIUuy1BNm5Ojsx2noIkG00c0HRvHzBxlg4OwbH8JdDe35H3rBgkTA0_9vyCO-hCVoOgzgGqvmB0shg5rsl-5EcWWeg16oX-rTFsaJAnem_a_2jTDsY9n6296km-BPglqVayvaXJ2Stwux5WWwmvCbmB_144klz8e1OUtTmlPxFCkBQMkDNfCgcrUVrQuc3L2tJK945TX355ahaE80CJB3yMWx7aJ6qZHh0EYhs8NB6baONOOHPWWFu7Pf5BwLM" },
    { id: "p3", name: "Golden Bridge", rating: 4.9, reviews: 2400, time: "45 mins drive", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3oKnvJLQXNuh8ttNjcYXPFjtcC-JpI_pZwn3emLHwUaYt1SlmcHZaPXvVumlxytx7KEN1sya1mJrCgOlGag6X5P9QP5ITEkKsWKf15P5_Ueh8GCGC8thKXTpEuwZrCeAfQgoB6QRquovVR49olR-0EDwBH2WArTIMHoOwT7vP1Yk6GMeom0bCYO60htpeqHAG_9y-VsFlEnNCOOtgyUgYoCDY6jELXcbjbSVCbyWwjw29JzsjxhbMdFDSDsAZszJaPX5tgXKGfAJT" },
    { id: "p4", name: "Dragon Bridge", rating: 4.6, reviews: 540, time: "10 mins walk", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlBL2MEUjO22ot5RbjjD7IvbMjfziNB-wg8Qgw3q2HpbxOwXjAwoWIDtWDQa8CvjbV1FptCpEvdaFPjFMEXeRlDl2yFSgtJL1NVM16wtNydkCkxicyG7EBcPRd6RI1RkZXs2c3W1V_vByQIvXF3Sp0cNFj_Kp9xAr7zgwvrH5BjzL_y5mIyyTgBLJmqPVuWQMJjSgef2zD73uxO-kSI8A6AvAaAgEHBtVewl3w-Te4Rsx4IA3ltN2n2Zblupgefwdq5me5jfHfCeBL" },
];

const WORKSHOPS = [
    { id: "w1", name: "Stone Carving Workshop", rating: 4.7, distance: "0.2 km", image: "https://images.unsplash.com/photo-1590424753825-3dd234185897?w=500&auto=format&fit=crop" },
    { id: "w2", name: "Lantern Making", rating: 4.8, distance: "1.5 km", image: "https://images.unsplash.com/photo-1549462980-6a013627d729?w=500&auto=format&fit=crop" },
];

const EVENTS = [
    { id: "e1", name: "Full Moon Festival", date: "Feb 24, 2024", location: "Hoi An Ancient Town", image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=500&auto=format&fit=crop" },
    { id: "e2", name: "Dragon Bridge Show", date: "Sat & Sun Night", location: "Dragon Bridge", image: "https://images.unsplash.com/photo-1606751271131-4a4be5a04eb7?w=500&auto=format&fit=crop" },
];

const BLOGS = [
    { id: "b1", title: "Top 5 Views in Marble Mountains", author: "Alex J.", date: "Jan 15", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop" },
    { id: "b2", title: "A Spiritual Journey to Linh Ung", author: "Maria K.", date: "Feb 2", image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=500&auto=format&fit=crop" },
];

export default function AllDestinationsScreen({ navigation, route }: Props) {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const [activeTab, setActiveTab] = useState<CategoryType>(route.params?.initialTab || "Areas");

    useEffect(() => {
        if (route.params?.initialTab) {
            setActiveTab(route.params.initialTab);
        }
    }, [route.params?.initialTab]);

    const renderHeader = () => {
        let title = "Discover";
        switch (activeTab) {
            case "Areas": title = "All Destinations"; break;
            case "Points": title = "All Attractions"; break;
            case "Workshops": title = "Craft Workshops"; break;
            case "Events": title = "Upcoming Events"; break;
            case "Blogs": title = "Travel Stories"; break;
        }
        return (
            <View className="px-4 py-3 flex-row items-center justify-between border-b" style={{ borderColor: theme.border }}>
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color={theme.foreground} />
                </TouchableOpacity>
                <Text className="text-lg font-bold" style={{ color: theme.foreground }}>{title}</Text>
                <View className="w-10" />
            </View>
        );
    };

    const renderTabs = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} className="py-4">
            {(["Areas", "Points", "Workshops", "Events", "Blogs"] as CategoryType[]).map((tab) => (
                <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 rounded-2xl border ${activeTab === tab ? "bg-primary border-primary" : "bg-transparent border-slate-200 dark:border-slate-800"}`}
                >
                    <Text className={`font-bold ${activeTab === tab ? "text-white" : "text-muted-foreground"}`}>{tab}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderList = () => {
        let data: any[] = [];
        switch (activeTab) {
            case "Areas": data = AREAS; break;
            case "Points": data = POINTS; break;
            case "Workshops": data = WORKSHOPS; break;
            case "Events": data = EVENTS; break;
            case "Blogs": data = BLOGS; break;
        }

        return (
            <View className="px-4 space-y-4 pb-10">
                {data.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => activeTab === "Points" ? navigation.navigate("PointDetail", { pointId: item.id }) : null}
                        className="bg-white dark:bg-slate-800 p-3 rounded-2xl border flex-row items-center gap-4"
                        style={{ borderColor: theme.border }}
                    >
                        <Image source={{ uri: item.image }} className="w-24 h-24 rounded-2xl object-cover" />
                        <View className="flex-1">
                            <Text className="font-bold text-lg" style={{ color: theme.foreground }}>{item.name || item.title}</Text>

                            {activeTab === "Areas" && (
                                <Text className="text-sm" style={{ color: theme.mutedForeground }}>{item.pointCount} points of interest</Text>
                            )}

                            {(activeTab === "Points" || activeTab === "Workshops") && (
                                <View className="flex-row items-center gap-2 mt-1">
                                    <View className="flex-row items-center gap-1">
                                        <Ionicons name="star" size={14} color="#facc15" />
                                        <Text className="text-sm font-bold" style={{ color: theme.foreground }}>{item.rating}</Text>
                                    </View>
                                    <Text className="text-sm" style={{ color: theme.mutedForeground }}>• {item.time || item.distance}</Text>
                                </View>
                            )}

                            {activeTab === "Events" && (
                                <View className="gap-1 mt-1">
                                    <Text className="text-sm font-semibold" style={{ color: theme.primary }}>{item.date}</Text>
                                    <Text className="text-xs" style={{ color: theme.mutedForeground }}>{item.location}</Text>
                                </View>
                            )}

                            {activeTab === "Blogs" && (
                                <View className="flex-row items-center gap-2 mt-1">
                                    <Text className="text-xs font-semibold" style={{ color: theme.primary }}>{item.author}</Text>
                                    <Text className="text-xs" style={{ color: theme.mutedForeground }}>• {item.date}</Text>
                                </View>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.muted} />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={["top"]}>
            {renderHeader()}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Search & Filter */}
                <View className="px-4 pt-4 flex-row gap-3">
                    <View className="relative flex-1 bg-muted/20 rounded-xl px-4 py-3 flex-row items-center gap-3">
                        <Ionicons name="search" size={20} color={theme.mutedForeground} />
                        <TextInput
                            placeholder={`Search ${activeTab.toLowerCase()}...`}
                            placeholderTextColor={theme.mutedForeground}
                            className="flex-1 text-sm pt-0 pb-0"
                            style={{ color: theme.foreground }}
                        />
                    </View>
                    <TouchableOpacity className="p-3 bg-muted/20 rounded-xl">
                        <Ionicons name="filter" size={20} color={theme.foreground} />
                    </TouchableOpacity>
                </View>

                {renderTabs()}
                {renderList()}

                {/* Loading Indicator Simulator */}
                <View className="py-10 items-center">
                    <View className="flex-row items-center gap-2 bg-muted/20 px-6 py-2.5 rounded-full">
                        <Ionicons name="refresh" size={16} color={theme.primary} className="animate-spin" />
                        <Text className="text-sm font-medium" style={{ color: theme.mutedForeground }}>Loading more...</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
