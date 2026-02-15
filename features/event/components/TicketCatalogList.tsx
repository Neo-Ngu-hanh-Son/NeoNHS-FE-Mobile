import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { TicketCatalogResponse } from "../types";
import TicketCatalogCard from "./TicketCatalogCard";

interface ThemeColors {
  foreground: string;
  mutedForeground: string;
  primary: string;
  border: string;
  card: string;
}

interface TicketCatalogListProps {
  tickets: TicketCatalogResponse[];
  loading: boolean;
  theme: ThemeColors;
  onBuyPress?: (ticket: TicketCatalogResponse) => void;
}

export default function TicketCatalogList({
  tickets,
  loading,
  theme,
  onBuyPress,
}: TicketCatalogListProps) {
  if (loading) {
    return (
      <View className="py-10 items-center">
        <ActivityIndicator size="small" color={theme.primary} />
        <Text
          className="mt-2 text-sm"
          style={{ color: theme.mutedForeground }}
        >
          Loading tickets...
        </Text>
      </View>
    );
  }

  if (tickets.length === 0) {
    return (
      <View className="py-10 items-center">
        <Ionicons
          name="ticket-outline"
          size={40}
          color={theme.mutedForeground}
        />
        <Text
          className="mt-3 text-sm"
          style={{ color: theme.mutedForeground }}
        >
          No tickets available yet.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      {tickets.map((ticket) => (
        <TicketCatalogCard
          key={ticket.id}
          ticket={ticket}
          theme={theme}
          onBuyPress={onBuyPress}
        />
      ))}
    </View>
  );
}
