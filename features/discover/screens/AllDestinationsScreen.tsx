import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, Image, RefreshControl } from "react-native";
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
import { WorkshopListContent } from "../../workshops/screens";

type Props = StackScreenProps<MainStackParamList, "AllDestinations">;

type CategoryType = "Points" | "Workshops" | "Events" | "Blogs";

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
    const [refreshing, setRefreshing] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
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

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === "Points") {
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
            setRefreshing(false);
        }
    }, [activeTab, selectedAttractionId]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setSearchQuery("");
    }, [activeTab]);

    const filteredEvents = useMemo(() => {
        if (!searchQuery.trim()) return events;
        const q = searchQuery.toLowerCase();
        return events.filter(
            (e) =>
                e.name.toLowerCase().includes(q) ||
                (e.locationName && e.locationName.toLowerCase().includes(q))
        );
    }, [events, searchQuery]);

    const filteredAttractions = useMemo(() => {
        const source = selectedAttractionId ? points : attractions;
        if (!searchQuery.trim()) return source;
        const q = searchQuery.toLowerCase();
        return source.filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                ((a as Attraction).address && (a as Attraction).address.toLowerCase().includes(q))
        );
    }, [attractions, points, selectedAttractionId, searchQuery]);

    const filteredBlogs = useMemo(() => {
        if (!searchQuery.trim()) return BLOGS;
        const q = searchQuery.toLowerCase();
        return BLOGS.filter(
            (b) =>
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q)
        );
    }, [searchQuery]);

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
            case "Workshops": title = "Workshops"; break;
            case "Events": title = "Upcoming Events"; break;
            case "Blogs": title = "Travel Stories"; break;
        }
        return (
            <View className="px-4 py-3 flex-row items-center justify-between border-b" style={{ borderColor: theme.border }}>
                <View className="flex-row items-center flex-1">
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
                    <Text className="text-lg font-bold ml-1" style={{ color: theme.foreground }}>{title}</Text>
                </View>
            </View>
        );
    };

    const renderTabs = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} className="py-3">
            {(["Points", "Workshops", "Events", "Blogs"] as CategoryType[]).map((tab) => (
                <TouchableOpacity
                    key={tab}
                    onPress={() => {
                        setActiveTab(tab);
                        if (tab !== "Points") setSelectedAttractionId(undefined);
                    }}
                    className={`px-5 py-2.5 rounded-2xl border ${activeTab === tab ? "bg-primary border-primary" : "bg-transparent"}`}
                    style={activeTab !== tab ? { borderColor: theme.border } : undefined}
                >
                    <Text className={`font-bold text-sm ${activeTab === tab ? "text-white" : ""}`}
                        style={activeTab !== tab ? { color: theme.mutedForeground } : undefined}
                    >
                        {tab}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderSearchAndFilter = () => {
        if (activeTab === "Workshops") return null;
        return (
            <View className="px-4 pt-3">
                <View className="flex-1 flex-row items-center rounded-xl px-4 py-3 gap-2" style={{ backgroundColor: theme.muted }}>
                    <Ionicons name="search" size={20} color={theme.mutedForeground} />
                    <TextInput
                        placeholder={`Search ${activeTab.toLowerCase()}...`}
                        placeholderTextColor={theme.mutedForeground}
                        className="flex-1 text-sm"
                        style={{ color: theme.foreground, paddingTop: 0, paddingBottom: 0 }}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={18} color={theme.mutedForeground} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const renderList = () => {
        if (loading) {
            return (
                <View className="py-10 items-center">
                    <Ionicons name="refresh" size={24} color={theme.primary} />
                    <Text className="mt-2 text-sm" style={{ color: theme.mutedForeground }}>Loading...</Text>
                </View>
            );
        }

        if (activeTab === "Workshops") {
            return (
                <WorkshopListContent
                    onNavigateToDetail={(id) => navigation.navigate("WorkshopDetail", { workshopId: id })}
                />
            );
        }

        if (activeTab === "Points") {
            const data = filteredAttractions;
            if (data.length === 0) {
                return (
                    <View className="py-16 items-center">
                        <Ionicons name="location-outline" size={40} color={theme.mutedForeground} />
                        <Text className="mt-3 text-base font-bold" style={{ color: theme.foreground }}>No destinations found</Text>
                    </View>
                );
            }
            return (
                <View className="px-4 space-y-4 pb-10">
                    {data.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => {
                                if (!selectedAttractionId) {
                                    setSelectedAttractionId(item.id);
                                } else {
                                    navigation.navigate("PointDetail", { pointId: item.id });
                                }
                            }}
                            className="p-3 rounded-2xl border flex-row items-center gap-4"
                            style={{ backgroundColor: theme.card, borderColor: theme.border }}
                        >
                            <Image source={{ uri: (item as any).thumbnailUrl || (item as any).image || undefined }} className="w-24 h-24 rounded-2xl object-cover" />
                            <View className="flex-1">
                                <Text className="font-bold text-lg" style={{ color: theme.foreground }}>{item.name}</Text>
                                {!selectedAttractionId && (
                                    <View className="gap-1 mt-1">
                                        <Text className="text-sm" style={{ color: theme.mutedForeground }}>{(item as Attraction).address}</Text>
                                        <View className="flex-row items-center gap-1.5">
                                            <View className={`w-2 h-2 rounded-full ${(item as Attraction).status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <Text className="text-[10px] font-bold uppercase tracking-wider"
                                                style={{ color: (item as Attraction).status === 'OPEN' ? '#10b981' : '#ef4444' }}>
                                                {(item as Attraction).status || 'CLOSED'}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                {selectedAttractionId && (
                                    <View className="flex-row items-center gap-2 mt-1">
                                        <View className="bg-primary/10 px-2 py-0.5 rounded-lg flex-row items-center gap-1">
                                            <Text className="text-[10px] font-bold text-primary uppercase">{(item as MapPoint).type}</Text>
                                        </View>
                                        {(item as MapPoint).estTimeSpent && (
                                            <Text className="text-sm" style={{ color: theme.mutedForeground }}>
                                                • {(item as MapPoint).estTimeSpent} mins
                                            </Text>
                                        )}
                                    </View>
                                )}
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.muted} />
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }

        if (activeTab === "Events") {
            const data = filteredEvents;
            if (data.length === 0) {
                return (
                    <View className="py-16 items-center">
                        <Ionicons name="calendar-outline" size={40} color={theme.mutedForeground} />
                        <Text className="mt-3 text-base font-bold" style={{ color: theme.foreground }}>No events found</Text>
                    </View>
                );
            }
            return (
                <View className="px-4 space-y-4 pb-10">
                    {data.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => navigation.navigate("EventDetail", { eventId: item.id })}
                            className="p-3 rounded-2xl border flex-row items-center gap-4"
                            style={{ backgroundColor: theme.card, borderColor: theme.border }}
                        >
                            <Image source={{ uri: item.thumbnailUrl || undefined }} className="w-24 h-24 rounded-2xl object-cover" />
                            <View className="flex-1">
                                <Text className="font-bold text-lg" style={{ color: theme.foreground }}>{item.name}</Text>
                                <View className="gap-1 mt-1">
                                    {item.startTime && (
                                        <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
                                            {new Date(item.startTime).toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </Text>
                                    )}
                                    <Text className="text-xs" style={{ color: theme.mutedForeground }}>{item.locationName || "TBD"}</Text>
                                    <View className="flex-row items-center gap-1">
                                        <View className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: item.status === 'UPCOMING' ? '#3b82f6' : item.status === 'ONGOING' ? '#10b981' : item.status === 'CANCELLED' ? '#ef4444' : '#6b7280' }} />
                                        <Text className="text-[10px] font-bold uppercase"
                                            style={{ color: item.status === 'UPCOMING' ? '#3b82f6' : item.status === 'ONGOING' ? '#10b981' : item.status === 'CANCELLED' ? '#ef4444' : '#6b7280' }}>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.muted} />
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }

        if (activeTab === "Blogs") {
            const data = filteredBlogs;
            if (data.length === 0) {
                return (
                    <View className="py-16 items-center">
                        <Ionicons name="book-outline" size={40} color={theme.mutedForeground} />
                        <Text className="mt-3 text-base font-bold" style={{ color: theme.foreground }}>No blogs found</Text>
                    </View>
                );
            }
            return (
                <View className="px-4 space-y-4 pb-10">
                    {data.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            className="p-3 rounded-2xl border flex-row items-center gap-4"
                            style={{ backgroundColor: theme.card, borderColor: theme.border }}
                        >
                            <Image source={{ uri: item.image }} className="w-24 h-24 rounded-2xl object-cover" />
                            <View className="flex-1">
                                <Text className="font-bold text-lg" style={{ color: theme.foreground }}>{item.title}</Text>
                                <View className="flex-row items-center gap-2 mt-1">
                                    <Text className="text-xs font-semibold" style={{ color: theme.primary }}>{item.author}</Text>
                                    <Text className="text-xs" style={{ color: theme.mutedForeground }}>• {item.date}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.muted} />
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }

        return null;
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={["top"]}>
            {renderHeader()}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                        colors={[theme.primary]}
                    />
                }
            >
                {renderTabs()}
                {renderSearchAndFilter()}
                {renderList()}
            </ScrollView>
        </SafeAreaView>
    );
}
