import React, { useState, useMemo, useCallback } from "react";
import { View, FlatList, TextInput, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

import { ChatRoomItem } from "../components/ChatRoomItem";
import { useChatContext } from "../context/ChatProvider";

type TabKey = "all" | "support" | "artist";
const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "support", label: "Support" },
  { key: "artist", label: "Vendor" },
];

export default function ChatRoomListScreen({ navigation }: any) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const { rooms, hideRoom, resetUnreadCount, refetchRooms } = useChatContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [refreshingRooms, setRefreshingRooms] = useState(false);

  const handleRefreshRooms = useCallback(async () => {
    setRefreshingRooms(true);
    try {
      await refetchRooms();
    } finally {
      setRefreshingRooms(false);
    }
  }, [refetchRooms]);

  // ── Filtering logic ──────────────────────────────────
  const filteredRooms = useMemo(() => {
    let list = rooms.filter(r => !r.isHidden); // hide archived rooms

    // Tab filter
    if (activeTab === "support") list = list.filter(r => r.roomType === "SYSTEM_SUPPORT" || r.roomType === "AI_CHAT");
    else if (activeTab === "artist") list = list.filter(r => r.roomType === "VENDOR_CHAT");

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => {
        const name = r.otherParticipant?.fullname || r.name || "";
        return name.toLowerCase().includes(q);
      });
    }

    return list;
  }, [rooms, searchQuery, activeTab]);

  const renderHeader = () => (
    <View className="px-4 py-3">
      {/* Page Title */}
      <View className="flex-row items-center mb-4 mt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold flex-1 ml-2" style={{ color: theme.foreground }}>
          Chats
        </Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="create-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="flex-row items-center rounded-xl px-4 py-2.5 gap-2" style={{ backgroundColor: theme.muted }}>
        <Ionicons name="search" size={20} color={theme.mutedForeground} />
        <TextInput
          placeholder="Search chats..."
          placeholderTextColor={theme.mutedForeground}
          className="flex-1 text-base leading-5"
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

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`mr-2 rounded-full px-5 py-2`}
              style={{
                backgroundColor: isActive ? theme.primary : theme.muted,
              }}
              activeOpacity={0.7}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: isActive ? "#FFFFFF" : theme.mutedForeground }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={["top"]}>
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshingRooms}
            onRefresh={handleRefreshRooms}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        renderItem={({ item }) => (
          <ChatRoomItem
            room={item}
            onPress={() => navigation.navigate("ChatRoom", { roomId: item.id })}
            onHide={() => hideRoom(item.id)}
            onMarkAsRead={() => {
              resetUnreadCount(item.id);
            }}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View className="py-20 items-center">
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={theme.mutedForeground} />
            <Text className="mt-4 text-base" style={{ color: theme.mutedForeground }}>
              {activeTab === "all" ? "No chats found." : `No ${activeTab === "support" ? "support" : "artist"} chats found.`}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
