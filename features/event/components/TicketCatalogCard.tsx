import React, { useState } from "react";
import { View, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { TicketCatalogResponse, TicketCatalogStatus, EventStatus } from "../types";
import {
  getTicketStatusColor,
  getTicketStatusLabel,
  formatPrice,
  calcDiscount,
  formatDaysOfWeek,
  formatDate,
} from "../utils/helpers";
import { cartService } from "../../cart/services/cartService";

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
  eventStatus?: EventStatus;
}

export default function TicketCatalogCard({
  ticket,
  theme,
  onBuyPress,
  eventStatus,
}: TicketCatalogCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [isAdding, setIsAdding] = useState(false);

  const now = new Date();
  const validFrom = ticket.validFromDate ? new Date(ticket.validFromDate) : null;
  const validTo = ticket.validToDate ? new Date(ticket.validToDate) : null;

  const isComingSoon = validFrom ? now < validFrom : false;
  const isExpired = validTo ? now > validTo : false;
  const isEventEnded = eventStatus === EventStatus.COMPLETED || eventStatus === EventStatus.CANCELLED;

  const isSoldOut = ticket.status === TicketCatalogStatus.SOLD_OUT;
  const isUnavailable = ticket.status === TicketCatalogStatus.INACTIVE || isEventEnded || isExpired || isComingSoon;

  const canBuy = !isSoldOut && !isUnavailable && !isEventEnded && !isExpired && !isComingSoon;

  const getBuyButtonText = () => {
    if (isEventEnded) return "Sự kiện đã kết thúc";
    if (isExpired) return "Hết hạn mua";
    if (isComingSoon) return `Bán từ ${formatDate(ticket.validFromDate)}`;
    if (isSoldOut) return "Sold Out";
    if (isUnavailable) return "Unavailable";
    return "Add to Cart";
  };

  const discount = calcDiscount(ticket.price, ticket.originalPrice);
  const handleOpenModal = () => {
    if (onBuyPress) {
      onBuyPress(ticket);
    } else {
      setQuantity("1");
      setModalVisible(true);
    }
  };

  const handleAddToCart = async () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity greater than 0.");
      return;
    }

    if (ticket.totalQuota != null && ticket.remainingQuantity != null && qty > ticket.remainingQuantity) {
      Alert.alert("Quantity Exceeded", `Only ${ticket.remainingQuantity} tickets remaining.`);
      return;
    }

    setIsAdding(true);
    try {
      const response = await cartService.addToCart(ticket.id, qty);
      if (response.success) {
        Alert.alert("Success", "Ticket added to cart successfully", [
          { text: "OK", onPress: () => setModalVisible(false) }
        ]);
      } else {
        Alert.alert("Error", response.message || "Failed to add to cart");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View
      className="rounded-2xl border p-4"
      style={{
        borderColor: isSoldOut ? "#ef444440" : theme.border,
        backgroundColor: theme.card,
        opacity: isSoldOut || isUnavailable ? 0.7 : 1,
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
              color={isExpired ? "#ef4444" : theme.mutedForeground}
            />
            <Text
              className="text-xs"
              style={{ color: isExpired ? "#ef4444" : theme.mutedForeground, fontWeight: isExpired ? 'bold' : 'normal' }}
            >
              {formatDate(ticket.validFromDate)} — {formatDate(ticket.validToDate)}
              {isExpired && " (Expired)"}
              {isComingSoon && " (Coming Soon)"}
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
        onPress={handleOpenModal}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isSoldOut || isExpired || isEventEnded ? "close-circle-outline" : "cart-outline"}
          size={18}
          color={canBuy ? "#fff" : theme.mutedForeground}
        />
        <Text
          className="font-bold text-sm"
          style={{ color: canBuy ? "#fff" : theme.mutedForeground }}
        >
          {getBuyButtonText()}
        </Text>
      </TouchableOpacity>

      {/* Add to Cart Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ width: "85%", backgroundColor: theme.card, borderRadius: 20, padding: 20, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15, color: theme.foreground, textAlign: 'center' }}>
              {ticket.name}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 16, color: theme.foreground, marginRight: 10 }}>Quantity:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: theme.border, borderWidth: 1, borderRadius: 8 }}>
                <TouchableOpacity
                  onPress={() => setQuantity(prev => Math.max(1, parseInt(prev || "0") - 1).toString())}
                  style={{ padding: 10 }}
                >
                  <Ionicons name="remove" size={20} color={theme.foreground} />
                </TouchableOpacity>
                <TextInput
                  style={{ width: 50, textAlign: 'center', color: theme.foreground, fontSize: 16, padding: 5 }}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
                <TouchableOpacity
                  onPress={() => setQuantity(prev => (parseInt(prev || "0") + 1).toString())}
                  style={{ padding: 10 }}
                >
                  <Ionicons name="add" size={20} color={theme.foreground} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ width: '100%', gap: 10 }}>
              <TouchableOpacity
                style={{ backgroundColor: theme.primary, padding: 12, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                onPress={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? (
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
                )}
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                  {isAdding ? "Adding..." : "Add to Cart"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: 'transparent', padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}
                onPress={() => setModalVisible(false)}
                disabled={isAdding}
              >
                <Text style={{ color: theme.foreground, fontWeight: "bold" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
