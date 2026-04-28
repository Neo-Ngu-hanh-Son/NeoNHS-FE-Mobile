import React from "react";
import { View, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cartService } from "../../cart/services/cartService";

import { Text } from "@/components/ui/text";
import { WorkshopSessionResponse } from "../types";
import {
  formatPrice,
  formatShortDate,
  formatTime,
  getAvailabilityColor,
} from "../utils/helpers";

interface ThemeColors {
  foreground: string;
  mutedForeground: string;
  primary: string;
  border: string;
  card: string;
  muted: string;
}

interface WorkshopSessionCardProps {
  session: WorkshopSessionResponse;
  theme: ThemeColors;
}

export default function WorkshopSessionCard({ session, theme }: WorkshopSessionCardProps) {
  const slotsColor = getAvailabilityColor(session.availableSlots, session.maxParticipants);
  const isFull = session.availableSlots <= 0;
  const isFree = session.price === 0 || session.price == null;
  const fillPercent = Math.min(
    (session.currentEnrolled / session.maxParticipants) * 100,
    100
  );

  const [modalVisible, setModalVisible] = React.useState(false);
  const [quantity, setQuantity] = React.useState("1");
  const [isAdding, setIsAdding] = React.useState(false);

  const handleOpenModal = () => {
    setQuantity("1");
    setModalVisible(true);
  };

  const handleAddToCart = async () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity greater than 0.");
      return;
    }

    if (qty > session.availableSlots) {
      Alert.alert("Quantity Exceeded", `Only ${session.availableSlots} spots left.`);
      return;
    }

    setIsAdding(true);
    try {
      const response = await cartService.addWorkshopSessionToCart(session.id, qty);
      if (response && response.success) {
        Alert.alert("Success", "Session added to cart successfully", [
          { text: "OK", onPress: () => setModalVisible(false) }
        ]);
      } else {
        // Fallback for custom backend wrappers
        Alert.alert("Error", response?.message || "Failed to add to cart");
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
        borderColor: isFull ? "#ef444440" : theme.border,
        backgroundColor: theme.card,
        opacity: isFull ? 0.7 : 1,
      }}
    >
      {/* Date & time header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: theme.primary + "12" }}
          >
            <Ionicons name="calendar" size={22} color={theme.primary} />
          </View>
          <View>
            <Text className="text-sm font-bold" style={{ color: theme.foreground }}>
              {formatShortDate(session.startTime)}
            </Text>
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              {formatTime(session.startTime)} — {formatTime(session.endTime)}
            </Text>
          </View>
        </View>
        {/* Price / Free badge */}
        <View className="items-end">
          {isFree ? (
            <View
              className="rounded-lg px-2 py-1"
              style={{ backgroundColor: '#dcfce7' }}
            >
              <Text className="text-sm font-extrabold" style={{ color: '#16a34a' }}>FREE</Text>
            </View>
          ) : (
            <Text className="text-lg font-bold" style={{ color: theme.primary }}>
              {formatPrice(session.price)}
            </Text>
          )}
        </View>
      </View>

      {/* Availability bar */}
      <View className="mb-3">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={14} color={theme.mutedForeground} />
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              {session.currentEnrolled} / {session.maxParticipants} enrolled
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: slotsColor }}
            />
            <Text className="text-xs font-bold" style={{ color: slotsColor }}>
              {isFull ? "Full" : `${session.availableSlots} spots left`}
            </Text>
          </View>
        </View>
        <View
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: theme.muted }}
        >
          <View
            className="h-full rounded-full"
            style={{
              backgroundColor: slotsColor,
              width: `${fillPercent}%`,
            }}
          />
        </View>
      </View>

      {/* Book button — hidden when free */}
      {!isFree && (
        <TouchableOpacity
          className="py-3 rounded-xl items-center flex-row justify-center gap-2"
          style={{
            backgroundColor: isFull ? theme.muted : theme.primary,
          }}
          disabled={isFull}
          activeOpacity={0.7}
          onPress={handleOpenModal}
        >
          <Ionicons
            name={isFull ? "close-circle-outline" : "bookmark-outline"}
            size={18}
            color={isFull ? theme.mutedForeground : "#fff"}
          />
          <Text
            className="font-bold text-sm"
            style={{ color: isFull ? theme.mutedForeground : "#fff" }}
          >
            {isFull ? "Fully Booked" : "Book This Session"}
          </Text>
        </TouchableOpacity>
      )}

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
              Book Session
            </Text>
            
            <Text style={{ fontSize: 14, color: theme.mutedForeground, marginBottom: 15, textAlign: 'center' }}>
              {formatShortDate(session.startTime)} at {formatTime(session.startTime)}
            </Text>

            {isFree ? (
              /* Free session — no quantity picker needed, just 1 slot */
              <Text style={{ fontSize: 14, color: '#16a34a', fontWeight: '600', marginBottom: 20, textAlign: 'center' }}>
                🎉 This session is free! Register 1 spot.
              </Text>
            ) : (
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
            )}

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
                  {isAdding ? "Adding..." : isFree ? "Register Now" : "Add to Cart"}
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
