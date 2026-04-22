import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { CompositeScreenProps, useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import type { StackScreenProps } from '@react-navigation/stack';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SmartImage } from '@/components/ui/smart-image';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { logger } from '@/utils/logger';
import type { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { userService } from '../services/userService';
import ActionCard from '../components/ActionCard';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { useTranslation } from 'react-i18next';
import { useModal } from '@/app/providers/ModalProvider';

type ProfileNavigationProp = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Profile'>,
  StackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({ navigation }: ProfileNavigationProp) {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { isDarkColorScheme, toggleColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const isFocused = useIsFocused();
  const isFetchingProfileRef = useRef(false);
  const lastFetchAtRef = useRef(0);
  
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const { alert } = useModal();

  // Minimum interval between profile fetches to prevent excessive re-renders
  const PROFILE_FETCH_COOLDOWN_MS = 30_000;

  const handleLogin = () => {
    navigation.replace('Auth', { screen: 'Login' });
  };

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    if (isFetchingProfileRef.current) {
      return;
    }
    // Throttle: skip if already fetched recently
    if (Date.now() - lastFetchAtRef.current < PROFILE_FETCH_COOLDOWN_MS) {
      return;
    }

    try {
      isFetchingProfileRef.current = true;
      const response = await userService.getProfile();
      if (response.success && response.data) {
        updateUser(response.data);
      }
      lastFetchAtRef.current = Date.now();
    } catch (error) {
      logger.error('Fetch profile error:', error);
    } finally {
      isFetchingProfileRef.current = false;
    }
  }, [isAuthenticated, updateUser]);

  // Fetch profile when screen comes into focus (throttled)
  useEffect(() => {
    if (isAuthenticated && isFocused) {
      fetchProfile();
    }
  }, [fetchProfile, isAuthenticated, isFocused]);

  const handleLogout = () => {
    Alert.alert(t('profile.sign_out_confirm_title'), t('profile.sign_out_confirm_message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.sign_out'),
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            handleLogin();
          } catch (error) {
            logger.error('Logout failed', error);
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate('Main', { screen: 'UpdateAccount' });
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.contentGuest}>
          <Text className="mb-6 text-2xl font-bold" style={{ color: theme.foreground }}>
            {t('profile.title')}
          </Text>
          <View style={[styles.guestCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="person-outline" size={48} color={theme.mutedForeground} />
            <Text className="mt-4 text-xl font-semibold" style={{ color: theme.foreground }}>
              {t('profile.guest_welcome')}
            </Text>
            <Button className="mt-6 w-full" onPress={handleLogin}>
              <Text style={{ color: '#fff' }}>{t('common.sign_in')}</Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkColorScheme ? theme.background : THEME.light.primary }]}>
      {/* Header Area */}
      <SafeAreaView
        edges={['top']}
        style={[styles.blueHeader, { backgroundColor: isDarkColorScheme ? theme.background : THEME.light.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="chevron-left" size={28} color="white" />
          <Text className="text-lg font-medium text-white">{t('common.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Main Content Area (Ô trắng) */}
      <View style={[styles.mainSheet, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Card - Đã đưa vào trong ô trắng, không còn nổi */}
          <View
            style={[
              styles.profileInfoCard,
              { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 20 },
            ]}>
            <View style={styles.userInfoRow}>
              <View style={styles.avatarBorder}>
                <SmartImage uri={user.avatarUrl || 'https://via.placeholder.com/150'} style={styles.avatarImage} />
              </View>
              <View>
                <Text style={[styles.userName, { color: theme.foreground }]} numberOfLines={1}>
                  {user.fullname || 'User'}
                </Text>
                <TouchableOpacity onPress={handleEditProfile}>
                  <Text className="text-xs font-medium text-primary">{t('profile.edit_profile')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Points Badge */}
            <View style={[styles.pointsBadge, { backgroundColor: THEME.light.primary }]}>
              <View style={styles.starCircle}>
                <MaterialIcons name="stars" size={16} color="white" />
              </View>
              <View>
                <Text style={styles.pointsLabel}>{t('profile.your_points')}</Text>
                <Text style={styles.pointsValue}>{(user.userPoint ?? 0).toLocaleString('en-US')}</Text>
              </View>
            </View>
          </View>

          {/* KYC Verification */}
          {!user.kycVerified ? (
            <TouchableOpacity
              style={[styles.kycCard, { backgroundColor: theme.card, borderColor: theme.primary }]}
              onPress={() => navigation.navigate('Main', { screen: 'KycVerification' })}
              activeOpacity={0.7}>
              <View style={styles.kycCardLeft}>
                <View style={[styles.kycIconCircle, { backgroundColor: THEME.light.primary + '15' }]}>
                  <MaterialIcons name="verified-user" size={24} color={THEME.light.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: theme.foreground }]}>{t('profile.kyc.verify_account')}</Text>
                  <Text style={[styles.cardDesc, { color: theme.mutedForeground }]}>
                    {t('profile.kyc.verify_desc')}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={theme.primary} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.kycCard, { backgroundColor: '#22C55E10', borderColor: '#22C55E' }]}>
              <View style={styles.kycCardLeft}>
                <View style={[styles.kycIconCircle, { backgroundColor: '#22C55E20' }]}>
                  <MaterialIcons name="check-circle" size={24} color="#22C55E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: theme.foreground }]}>{t('profile.kyc.verified')}</Text>
                  <Text style={[styles.cardDesc, { color: '#22C55E' }]}>{t('profile.kyc.verified_desc')}</Text>
                </View>
              </View>
              <MaterialIcons name="verified" size={22} color="#22C55E" />
            </View>
          )}

          {/* TODO: Test checkin completed screen */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>MANAGEMENT</Text>
            <ActionCard
              title="View checkin completed screen"
              desc="Scan QR code to verify customer tickets"
              rightIcon={<MaterialIcons name="qr-code-scanner" size={20} color={theme.primary} />}
              themeCard={theme.card}
              themeBorder={theme.border}
              themeForeground={theme.foreground}
              themeMutedForeground={theme.mutedForeground}
              onPress={() =>
                navigation.navigate('Main', {
                  screen: 'CheckinComplete',
                  params: {
                    imageUrl: undefined,
                    rewardPoints: 0,
                    userTotalPoints: 0,
                  },
                })
              }
            />
          </View>

          {/* Admin/Vendor Actions */}
          {(user.role === 'ADMIN' || user.role === 'VENDOR') && (
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>
                {t('profile.sections.management').toUpperCase()}
              </Text>
              <ActionCard
                title={t('profile.actions.verify_ticket')}
                desc={t('profile.actions.verify_ticket_desc')}
                rightIcon={<MaterialIcons name="qr-code-scanner" size={20} color={theme.primary} />}
                themeCard={theme.card}
                themeBorder={theme.border}
                themeForeground={theme.foreground}
                themeMutedForeground={theme.mutedForeground}
                onPress={() => navigation.navigate('Main', { screen: 'TicketVerification' })}
              />
            </View>
          )}

          {/* Wallet Section */}
          <View style={{ marginBottom: 8 }}>
            <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>
              {t('profile.sections.wallet').toUpperCase()}
            </Text>
            <ActionCard
              title={t('profile.actions.withdraw')}
              desc={t('profile.actions.withdraw_desc')}
              rightIcon={<MaterialIcons name="account-balance-wallet" size={20} color={theme.primary} />}
              themeCard={theme.card}
              themeBorder={theme.border}
              themeForeground={theme.foreground}
              themeMutedForeground={theme.mutedForeground}
              onPress={() => navigation.navigate('Main', { screen: 'Withdraw' })}
            />
          </View>

          {/* Các mục chức năng */}
          <ActionCard
            title={t('profile.actions.your_order')}
            desc={t('profile.actions.your_order_desc')}
            themeCard={theme.card}
            themeBorder={theme.border}
            themeForeground={theme.foreground}
            themeMutedForeground={theme.mutedForeground}
            onPress={() => navigation.navigate('Main', { screen: 'TransactionHistory' })}
          />
          <ActionCard
            title={t('profile.actions.checkin_photos')}
            desc={t('profile.actions.checkin_photos_desc')}
            rightIcon={<Ionicons name="images-outline" size={20} color={theme.primary} />}
            themeCard={theme.card}
            themeBorder={theme.border}
            themeForeground={theme.foreground}
            themeMutedForeground={theme.mutedForeground}
            onPress={() => navigation.navigate('Main', { screen: 'CheckinGallery' })}
          />
          <ActionCard
            title={t('profile.actions.payment_method')}
            desc={t('profile.actions.payment_method_desc')}
            themeCard={theme.card}
            themeBorder={theme.border}
            themeForeground={theme.foreground}
            themeMutedForeground={theme.mutedForeground}
            onPress={() => {}}
          />
          <ActionCard
            title={t('profile.actions.coupon_voucher')}
            desc={t('profile.actions.coupon_voucher_desc')}
            themeCard={theme.card}
            themeBorder={theme.border}
            themeForeground={theme.foreground}
            themeMutedForeground={theme.mutedForeground}
            onPress={() => navigation.navigate('Main', { screen: 'MyVouchers' })}
          />
          <ActionCard
            title={t('profile.actions.support_center')}
            desc={t('profile.actions.support_center_desc')}
            themeCard={theme.card}
            themeBorder={theme.border}
            themeForeground={theme.foreground}
            themeMutedForeground={theme.mutedForeground}
            onPress={() => {}}
          />

          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>
              {t('profile.sections.security').toUpperCase()}
            </Text>
            <ActionCard
              title={t('profile.actions.change_password')}
              desc={t('profile.actions.change_password_desc')}
              rightIcon={<Ionicons name="chevron-forward" size={16} color={theme.mutedForeground} />}
              themeCard={theme.card}
              themeBorder={theme.border}
              themeForeground={theme.foreground}
              themeMutedForeground={theme.mutedForeground}
              onPress={() => navigation.navigate('Main', { screen: 'ChangePassword' })}
            />
          </View>

          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>
              {t('profile.sections.preferences').toUpperCase()}
            </Text>

            <ActionCard
              title={t('profile.actions.dark_mode')}
              desc={t('profile.actions.dark_mode_desc')}
              rightIcon={<Switch checked={isDarkColorScheme} onCheckedChange={toggleColorScheme} />}
              themeCard={theme.card}
              themeBorder={theme.border}
              themeForeground={theme.foreground}
              themeMutedForeground={theme.mutedForeground}
            />

            <View style={{ marginTop: 12 }}>
              <ActionCard
                title={t('profile.actions.language')}
                desc={t('profile.actions.language_desc')}
                rightIcon={
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: theme.mutedForeground, fontSize: 12, marginRight: 4 }}>
                      {t(`language.${language}`)}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.mutedForeground} />
                  </View>
                }
                themeCard={theme.card}
                themeBorder={theme.border}
                themeForeground={theme.foreground}
                themeMutedForeground={theme.mutedForeground}
                onPress={() => {
                  alert(
                    t('language.title'),
                    '',
                    [
                      { text: t('language.vi'), onPress: () => setLanguage('vi') },
                      { text: t('language.en'), onPress: () => setLanguage('en') },
                      { text: t('language.ja'), onPress: () => setLanguage('ja') },
                      { text: t('language.ko'), onPress: () => setLanguage('ko') },
                      { text: t('common.cancel'), style: 'cancel' }
                    ],
                    { cancelable: true }
                  );
                }}
              />
            </View>
          </View>

          <Button variant="destructive" className="mb-10 mt-6" onPress={handleLogout}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('profile.sign_out')}</Text>
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
    shadowColor: '#000',
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
    width: 160,
    overflow: 'hidden',
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
  },
  kycCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  kycCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  kycIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
