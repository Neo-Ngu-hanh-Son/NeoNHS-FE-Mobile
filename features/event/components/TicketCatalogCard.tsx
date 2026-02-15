import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { TicketCatalogResponse, TicketCatalogStatus } from "../types";
import {
  getTicketStatusColor,
  getTicketStatusLabel,
  formatPrice,
  calcDiscount,
  formatDaysOfWeek,
  formatDate,
} from "../utils/helpers";

interface ThemeColors {
  foreground: string;
  mutedForeground: string;
  primary: string;
  border: string;
  card: string;
}

interface TicketCatalogCardProps {
  ticket: TicketCatalogResponse;
  theme: ThemeColors;
  onBuyPress?: (ticket: TicketCatalogResponse) => void;
}

export default function TicketCatalogCard({
  ticket,
  theme,
  onBuyPress,
}: TicketCatalogCardProps) {
  const discount = calcDiscount(ticket.price, ticket.originalPrice);
  const isSoldOut = ticket.status === TicketCatalogStatus.SOLD_OUT;
  const isUnavailable = ticket.status === TicketCatalogStatus.INACTIVE;
  const canBuy = !isSoldOut && !isUnavailable;

  return (
    <View
      className="rounded-2xl border p-4"
      style={{
        borderColor: isSoldOut ? "#ef444440" : theme.border,
        backgroundColor: theme.card,
        opacity: isSoldOut ? 0.7 : 1,
      }}
    >
      {/* Header row */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text
            className="text-base font-bold"
            style={{ color: theme.foreground }}
          >
            {ticket.name}
          </Text>
          {ticket.customerType && (
            <View className="self-start mt-1 px-2 py-0.5 rounded bg-primary/10">
              <Text className="text-[10px] font-bold text-primary uppercase">
                {ticket.customerType}
              </Text>
            </View>
          )}
        </View>
        <View
          className="px-2 py-1 rounded-lg"
          style={{
            backgroundColor: getTicketStatusColor(ticket.status),
          }}
        >
          <Text className="text-white text-[10px] font-bold uppercase">
            {getTicketStatusLabel(ticket.status)}
          </Text>
        </View>
      </View>

      {/* Description */}
      {ticket.description && (
        <Text
          className="text-xs mt-2 leading-relaxed"
          style={{ color: theme.mutedForeground }}
        >
          {ticket.description}
        </Text>
      )}

      {/* Price */}
      <View className="flex-row items-center gap-2 mt-3">
        <Text
          className="text-lg font-bold"
          style={{ color: theme.primary }}
        >
          {formatPrice(ticket.price)}
        </Text>
        {ticket.originalPrice != null &&
          ticket.originalPrice > ticket.price && (
            <Text
              className="text-sm line-through"
              style={{ color: theme.mutedForeground }}
            >
              {formatPrice(ticket.originalPrice)}
            </Text>
          )}
        {discount != null && (
          <View className="bg-red-500/10 px-1.5 py-0.5 rounded">
            <Text className="text-[10px] font-bold text-red-500">
              -{discount}%
            </Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View className="mt-3 gap-2">
        {/* Remaining */}
        {ticket.remainingQuantity != null && (
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="ticket-outline"
              size={14}
              color={theme.mutedForeground}
            />
            <Text
              className="text-xs"
              style={{ color: theme.mutedForeground }}
            >
              <Text className="font-bold" style={{ color: theme.foreground }}>
                {ticket.remainingQuantity}
              </Text>
              {" "}/ {ticket.totalQuota} remaining
            </Text>
          </View>
        )}

        {/* Apply on days */}
        <View className="flex-row items-center gap-2">
          <Ionicons
            name="calendar-outline"
            size={14}
            color={theme.mutedForeground}
          />
          <Text
            className="text-xs"
            style={{ color: theme.mutedForeground }}
          >
            Available: {formatDaysOfWeek(ticket.applyOnDays)}
          </Text>
        </View>

        {/* Valid period */}
        {(ticket.validFromDate || ticket.validToDate) && (
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.mutedForeground}
            />
            <Text
              className="text-xs"
              style={{ color: theme.mutedForeground }}
            >
              {formatDate(ticket.validFromDate)} — {formatDate(ticket.validToDate)}
            </Text>
          </View>
        )}
      </View>

      {/* Buy / Add to Cart Button */}
      <TouchableOpacity
        className="mt-4 py-3 rounded-xl items-center flex-row justify-center gap-2"
        style={{
          backgroundColor: canBuy ? theme.primary : theme.mutedForeground + "30",
        }}
        disabled={!canBuy}
        onPress={() => onBuyPress?.(ticket)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isSoldOut ? "close-circle-outline" : "cart-outline"}
          size={18}
          color={canBuy ? "#fff" : theme.mutedForeground}
        />
        <Text
          className="font-bold text-sm"
          style={{ color: canBuy ? "#fff" : theme.mutedForeground }}
        >
          {isSoldOut
            ? "Sold Out"
            : isUnavailable
            ? "Unavailable"
            : "Buy Ticket"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
