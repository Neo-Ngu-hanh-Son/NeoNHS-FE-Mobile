import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { logger } from "@/utils/logger";
import type { RootStackParamList } from "@/app/navigations/NavigationParamTypes";

type ProfileNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkColorScheme, toggleColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const handleLogin = () => {
    navigation.dispatch(CommonActions.reset({
      index: 0,
      routes: [{ name: "Auth", params: { screen: "Login" } }],
    }));
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            handleLogin();
          } catch (error) {
            logger.error("Logout failed", error);
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate("UpdateAccount");
  };

  const ActionCard = ({ title, desc, onPress, rightIcon }: any) => (
    <TouchableOpacity 
      style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionCardHeader}>
        <Text style={[styles.cardTitle, { color: theme.foreground }]}>{title}</Text>
        {rightIcon || <Text className="text-xs font-medium text-primary">See all</Text>}
      </View>
      <Text style={[styles.cardDesc, { color: theme.mutedForeground }]} numberOfLines={2}>
        {desc}
      </Text>
    </TouchableOpacity>
  );

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top"]}>
        <View style={styles.contentGuest}>
          <Text className="text-2xl font-bold mb-6" style={{ color: theme.foreground }}>Profile</Text>
          <View style={[styles.guestCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
             <Ionicons name="person-outline" size={48} color={theme.mutedForeground} />
             <Text className="text-xl font-semibold mt-4" style={{ color: theme.foreground }}>Welcome, Guest!</Text>
             <Button className="w-full mt-6" onPress={handleLogin}><Text style={{color: '#fff'}}>Sign In</Text></Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkColorScheme ? theme.background : THEME.light.primary }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Area */}
      <SafeAreaView edges={["top"]} style={[styles.blueHeader, { backgroundColor: isDarkColorScheme ? theme.background : THEME.light.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="chevron-left" size={28} color="white" />
          <Text className="text-lg font-medium text-white">Back</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Main Content Area (Ô trắng) */}
      <View style={[styles.mainSheet, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Profile Card - Đã đưa vào trong ô trắng, không còn nổi */}
          <View style={[styles.profileInfoCard, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 20 }]}>
            <View style={styles.userInfoRow}>
              <View style={styles.avatarBorder}>
                <Image 
                  source={{ uri: user.avatarUrl || "https://via.placeholder.com/150" }} 
                  style={styles.avatarImage} 
                />
              </View>
              <View>
                <Text style={[styles.userName, { color: theme.foreground }]}>{user.fullname || "User"}</Text>
                <TouchableOpacity onPress={handleEditProfile}>
                  <Text className="text-xs text-primary font-medium">Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Points Badge */}
            <View style={[styles.pointsBadge, { backgroundColor: THEME.light.primary }]}>
               <View style={styles.starCircle}>
                  <MaterialIcons name="stars" size={16} color="white" />
               </View>
               <View>
                  <Text style={styles.pointsLabel}>Your Points</Text>
                  <Text style={styles.pointsValue}>6000</Text>
               </View>
            </View>
          </View>

          {/* Các mục chức năng */}
          <ActionCard 
            title="Your Order" 
            desc="View your order and transaction history here" 
            onPress={() => {}}
          />
          <ActionCard 
            title="Payment Method" 
            desc="Save your preferred payment method for smoother transactions" 
            onPress={() => {}}
          />
          <ActionCard 
            title="Coupon & Voucher" 
            desc="Claim vouchers and discounts for reduced prices or free shipping" 
            onPress={() => {}}
          />
          <ActionCard 
            title="Support Center" 
            desc="Find the best answer to your question" 
            onPress={() => {}}
          />

          <View style={styles.settingsSection}>
             <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>PREFERENCES</Text>
             
             <ActionCard 
                title="Dark Mode" 
                desc="Toggle between light and dark visual themes" 
                rightIcon={<Switch checked={isDarkColorScheme} onCheckedChange={toggleColorScheme} />}
              />

              <View style={{ marginTop: 12 }}>
                <ActionCard 
                    title="Language" 
                    desc="Choose your preferred language" 
                    rightIcon={
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: theme.mutedForeground, fontSize: 12, marginRight: 4 }}>English</Text>
                            <Ionicons name="chevron-forward" size={16} color={theme.mutedForeground} />
                        </View>
                    }
                    onPress={() => {}}
                />
              </View>
          </View>

          <Button variant="destructive" className="mt-6 mb-10" onPress={handleLogout}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>Sign Out</Text>
          </Button>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blueHeader: {
    height: 80, 
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainSheet: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden', // Đảm bảo nội dung không tràn khỏi bo góc
  },
  profileInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    // Đổ bóng nhẹ nhàng cho thẻ nằm trong
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  avatarBorder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(29, 161, 242, 0.2)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  starCircle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 4,
    borderRadius: 20,
  },
  pointsLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  pointsValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24, // Thêm khoảng cách ở đỉnh để đẹp hơn
    gap: 12,
  },
  actionCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 10,
    paddingLeft: 4,
  },
  settingsSection: {
    marginTop: 10,
  },
  contentGuest: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  guestCard: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
  }
});