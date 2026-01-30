import { View, StyleSheet, TouchableOpacity, Image, StatusBar, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useCallback, useState } from "react";
import { Text } from "@/components/ui/text";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import type { MainStackParamList } from "@/app/navigations/NavigationParamTypes";
import { userService } from "../services/userService";

type ProfileNavigationProp = StackNavigationProp<MainStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { user, updateUser } = useAuth();
  const { isDarkColorScheme, toggleColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [isFetching, setIsFetching] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        setIsFetching(true);
        try {
          const response = await userService.getProfile();
          if (response.success) {
            updateUser(response.data); // Cập nhật AuthContext toàn cục
          }
        } catch (error) {
          console.error("Fetch profile error:", error);
        } finally {
          setIsFetching(false);
        }
      };
      loadProfile();
    }, [])
  );

  const MenuItem = ({ title, desc, onPress, rightElement }: any) => (
    <TouchableOpacity 
      style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuContent}>
        <View style={styles.menuHeader}>
          <Text className="font-bold text-base" style={{ color: theme.foreground }}>{title}</Text>
          {rightElement || <Text className="text-xs" style={{ color: theme.primary }}>See all</Text>}
        </View>
        <Text className="text-xs mt-1" style={{ color: theme.mutedForeground, maxWidth: '85%' }}>
          {desc}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView edges={["top"]} style={styles.safeHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="text-lg font-medium text-white">Back</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
        <View style={styles.profileCardWrapper}>
          <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.userRow}>
              <View style={[styles.avatarContainer, { borderColor: `${theme.primary}33` }]}>
                {isFetching ? (
                  <ActivityIndicator size="small" color={theme.primary} style={styles.avatar} />
                ) : (
                  <Image 
                    source={{ uri: user?.avatarUrl || 'https://cdn-icons-png.freepik.com/512/3135/3135715.png' }} 
                    style={styles.avatar} 
                  />
                )}
              </View>
              <View>
                <Text className="text-xl font-bold" style={{ color: theme.foreground }}>
                  {user?.fullname || "Guest"}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("UpdateAccount")}>
                  <Text className="text-xs" style={{ color: theme.mutedForeground }}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.pointsBadge, { backgroundColor: theme.primary }]}>
              <View style={styles.starCircle}>
                <Ionicons name="star" size={10} color="white" />
              </View>
              <View>
                <Text style={styles.pointsLabel}>Your Points</Text>
                <Text style={styles.pointsValue}>6000</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
          <MenuItem title="Your Order" desc="View your order and transaction history here" />
          <MenuItem title="Payment Method" desc="Save your preferred payment method for smoother transactions" />
          <MenuItem title="Coupon & Voucher" desc="Claim vouchers and discounts" />
          <MenuItem title="Support Center" desc="Find the best answer to your question" />
          <MenuItem 
            title="Settings" 
            desc="View account preferences"
            rightElement={<Ionicons name="chevron-forward" size={16} color={theme.mutedForeground} />}
          />
          <MenuItem 
            title="Dark Mode" 
            desc="Toggle visual themes" 
            rightElement={
              <Switch checked={isDarkColorScheme} onCheckedChange={toggleColorScheme} />
            }
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeHeader: { height: 100, paddingHorizontal: 20, justifyContent: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  mainContent: { flex: 1, borderTopLeftRadius: 40, borderTopRightRadius: 40, marginTop: 10 },
  profileCardWrapper: { paddingHorizontal: 20, marginTop: -40, marginBottom: 20 },
  profileCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, padding: 2, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%', borderRadius: 25 },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, gap: 8 },
  starCircle: { backgroundColor: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 10 },
  pointsLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600' },
  pointsValue: { color: 'white', fontSize: 14, fontWeight: 'bold', lineHeight: 16 },
  scrollPadding: { paddingHorizontal: 20, paddingBottom: 40, gap: 14 },
  menuItem: { padding: 18, borderRadius: 18, borderWidth: 1 },
  menuContent: { width: '100%' },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});