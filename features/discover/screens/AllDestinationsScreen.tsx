import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { MainStackParamList } from "@/app/navigations/NavigationParamTypes";
import { discoverService } from "../services/discoverServices";
import { Attraction, MapPoint } from "../../map/types";
import { eventService } from "../../event/services/eventService";
import { EventResponse } from "../../event/types";

type Props = StackScreenProps<MainStackParamList, "AllDestinations">;

type CategoryType = "Points" | "Workshops" | "Events" | "Blogs";


const WORKSHOPS = [
    { id: "w1", name: "Stone Carving Workshop", rating: 4.7, distance: "0.2 km", image: "https://images.unsplash.com/photo-1590424753825-3dd234185897?w=500&auto=format&fit=crop" },
    { id: "w2", name: "Lantern Making", rating: 4.8, distance: "1.5 km", image: "https://images.unsplash.com/photo-1549462980-6a013627d729?w=500&auto=format&fit=crop" },
];

// Events are now loaded from API

const BLOGS = [
    { id: "b1", title: "Top 5 Views in Marble Mountains", author: "Alex J.", date: "Jan 15", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop" },
    { id: "b2", title: "A Spiritual Journey to Linh Ung", author: "Maria K.", date: "Feb 2", image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=500&auto=format&fit=crop" },
];

export default function AllDestinationsScreen({ navigation, route }: Props) {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const [activeTab, setActiveTab] = useState<CategoryType>(route.params?.initialTab || "Points");

    const [selectedAttractionId, setSelectedAttractionId] = useState<string | undefined>(route.params?.selectedAttractionId);
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [points, setPoints] = useState<MapPoint[]>([]);
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === "Points") {
                    // Always fetch attractions to get names for the header title
                    const response = await discoverService.getAllAttractions();
                    if (response.success && response.data) {
                        setAttractions(response.data);
                    }

                    if (selectedAttractionId) {
                        const pointsResponse = await discoverService.getPointsByAttraction(selectedAttractionId);
                        if (pointsResponse.success && pointsResponse.data) {
                            setPoints(pointsResponse.data);
                        }
                    }
                } else if (activeTab === "Events") {
                    const response = await eventService.getAllEvents();
                    if (response.success && response.data) {
                        setEvents(response.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, selectedAttractionId]);

    useEffect(() => {
        if (route.params?.selectedAttractionId) {
            setSelectedAttractionId(route.params.selectedAttractionId);
        }
    }, [route.params?.selectedAttractionId]);

    useEffect(() => {
        if (route.params?.initialTab) {
            setActiveTab(route.params.initialTab);
        }
    }, [route.params?.initialTab]);

    const renderHeader = () => {
        let title = "Discover";
        let showBackToAttractions = false;
        switch (activeTab) {
            case "Points":
                if (selectedAttractionId) {
                    const attr = attractions.find(a => a.id === selectedAttractionId);
                    title = attr ? attr.name : "Points";
                    showBackToAttractions = true;
                } else {
                    title = "Popular Destinations";
                }
                break;
            case "Workshops": title = "Craft Workshops"; break;
            case "Events": title = "Upcoming Events"; break;
            case "Blogs": title = "Travel Stories"; break;
        }
        return (
            <View className="px-4 py-3 flex-row items-center justify-between border-b" style={{ borderColor: theme.border }}>
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => {
                            if (showBackToAttractions) {
                                setSelectedAttractionId(undefined);
                            } else {
                                navigation.goBack();
                            }
                        }}
                        className="p-2 -ml-2"
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.foreground} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold" style={{ color: theme.foreground }}>{title}</Text>
                </View>
                <View className="w-10" />
            </View>
        );
    };

    const renderTabs = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} className="py-4">
            {(["Points", "Workshops", "Events", "Blogs"] as CategoryType[]).map((tab) => (
                <TouchableOpacity
                    key={tab}
                    onPress={() => {
                        setActiveTab(tab);
                        if (tab !== "Points") {
                            setSelectedAttractionId(undefined);
                        }
                    }}
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
            case "Points": data = selectedAttractionId ? points : attractions; break;
            case "Workshops": data = WORKSHOPS; break;
            case "Events": data = events; break;
            case "Blogs": data = BLOGS; break;
        }

        if (loading) {
            return (
                <View className="py-10 items-center">
                    <Ionicons name="refresh" size={24} color={theme.primary} className="animate-spin" />
                    <Text className="mt-2 text-sm" style={{ color: theme.mutedForeground }}>Loading...</Text>
                </View>
            );
        }

        return (
            <View className="px-4 space-y-4 pb-10">
                {data.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                            if (activeTab === "Points") {
                                if (!selectedAttractionId) {
                                    setSelectedAttractionId(item.id);
                                } else {
                                    navigation.navigate("PointDetail", { pointId: item.id });
                                }
                            } else if (activeTab === "Events") {
                                navigation.navigate("EventDetail", { eventId: item.id });
                            }
                        }}
                        className="bg-white dark:bg-slate-800 p-3 rounded-2xl border flex-row items-center gap-4"
                        style={{ borderColor: theme.border }}
                    >
                        <Image source={{ uri: item.thumbnailUrl || item.image || undefined }} className="w-24 h-24 rounded-2xl object-cover" />
                        <View className="flex-1">
                            <Text className="font-bold text-lg" style={{ color: theme.foreground }}>{item.name || item.title}</Text>

                            {activeTab === "Points" && !selectedAttractionId && (
                                <View className="gap-1 mt-1">
                                    <Text className="text-sm" style={{ color: theme.mutedForeground }}>{item.address}</Text>
                                    <View className="flex-row items-center gap-1.5">
                                        <View className={`w-2 h-2 rounded-full ${item.status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <Text className="text-xs font-medium uppercase tracking-wider" style={{ color: item.status === 'OPEN' ? '#10b981' : '#ef4444' }}>
                                            {item.status || 'CLOSED'}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {(activeTab === "Points" && selectedAttractionId) && (
                                <View className="flex-row items-center gap-2 mt-1">
                                    <View className="bg-primary/10 px-2 py-0.5 rounded-lg flex-row items-center gap-1">
                                        <Text className="text-[10px] font-bold text-primary uppercase">{item.type}</Text>
                                    </View>
                                    {item.estTimeSpent && (
                                        <Text className="text-sm" style={{ color: theme.mutedForeground }}>• {item.estTimeSpent} mins</Text>
                                    )}
                                </View>
                            )}

                            {activeTab === "Workshops" && (
                                <View className="flex-row items-center gap-2 mt-1">
                                    <View className="flex-row items-center gap-1">
                                        <Ionicons name="star" size={14} color="#facc15" />
                                        <Text className="text-sm font-bold" style={{ color: theme.foreground }}>{item.rating}</Text>
                                    </View>
                                    <Text className="text-sm" style={{ color: theme.mutedForeground }}>• {item.distance}</Text>
                                </View>
                            )}

                            {activeTab === "Events" && (
                                <View className="gap-1 mt-1">
                                    {item.startTime && (
                                        <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
                                            {new Date(item.startTime).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </Text>
                                    )}
                                    <Text className="text-xs" style={{ color: theme.mutedForeground }}>{item.locationName || "TBD"}</Text>
                                    <View className="flex-row items-center gap-1">
                                        <View className="w-2 h-2 rounded-full" style={{ backgroundColor: item.status === 'UPCOMING' ? '#3b82f6' : item.status === 'ONGOING' ? '#10b981' : item.status === 'CANCELLED' ? '#ef4444' : '#6b7280' }} />
                                        <Text className="text-[10px] font-bold uppercase" style={{ color: item.status === 'UPCOMING' ? '#3b82f6' : item.status === 'ONGOING' ? '#10b981' : item.status === 'CANCELLED' ? '#ef4444' : '#6b7280' }}>{item.status}</Text>
                                    </View>
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

            </ScrollView>
        </SafeAreaView>
    );
}
