import React, { useState, useMemo } from "react";
import { View, FlatList, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

import { ChatRoomItem } from "../components/ChatRoomItem";
import { MOCK_ROOMS } from "../data/mockChatData";

export default function ChatRoomListScreen({ navigation }: any) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  
  const [searchQuery, setSearchQuery] = useState("");

  // Filter mock rooms by search query (name or fullname of the other participant)
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_ROOMS;
    
    return MOCK_ROOMS.filter(r => {
      const displayName = r.name || r.otherParticipant?.fullname || "";
      return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  const renderHeader = () => (
    <View className="px-4 py-3">
      {/* Page Title Header */}
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

      {/* Search Bar */}
      <View
        className="flex-row items-center rounded-xl px-4 py-2.5 gap-2"
        style={{ backgroundColor: theme.muted }}
      >
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
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={["top"]}>
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatRoomItem 
            room={item} 
            onPress={() => navigation.navigate("ChatRoom", { roomId: item.id })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View className="py-20 items-center">
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={theme.mutedForeground} />
            <Text className="mt-4 text-base" style={{ color: theme.mutedForeground }}>
              No chats found.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
