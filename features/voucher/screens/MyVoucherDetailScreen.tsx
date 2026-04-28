import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { UserVoucherResponse } from '../types/voucher.types';
import { SmartImage } from '@/components/ui/smart-image';
import QRCode from 'react-native-qrcode-svg';

type MyVoucherDetailRouteParams = {
  MyVoucherDetail: { userVoucher: UserVoucherResponse };
};

const { width } = Dimensions.get('window');

export default function MyVoucherDetailScreen() {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MyVoucherDetailRouteParams, 'MyVoucherDetail'>>();
  const userVoucher = route.params.userVoucher;

  const [showQrModal, setShowQrModal] = useState(false);

  const isPlatform = userVoucher.vendorId === null;
  const accentColor = isPlatform ? '#ee4d2d' : '#f97316';
  const isExpired = !userVoucher.isAvailable;
  const isUsed = userVoucher.isUsed;

  const discountDisplay =
    userVoucher.voucherType === 'DISCOUNT'
      ? userVoucher.discountType === 'PERCENT'
        ? `${userVoucher.discountValue}%`
        : `${userVoucher.discountValue.toLocaleString()}đ`
      : t('voucher.gift');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon as any} size={18} color={theme.mutedForeground} />
      <View style={styles.infoTextGroup}>
        <Text style={[styles.infoLabel, { color: theme.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.foreground }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header bar */}
      <View style={[styles.headerBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.foreground }]}>{t('voucher.detail_title')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: isUsed || isExpired ? theme.muted : accentColor }]}>
          <Text style={styles.heroScope}>
            {isPlatform ? t('voucher.scope_platform') : userVoucher.vendorName || t('voucher.scope_vendor')}
          </Text>
          <Text style={styles.heroDiscount}>{discountDisplay}</Text>
          <Text style={styles.heroType}>
            {userVoucher.voucherType === 'DISCOUNT' ? t('voucher.discount') : t('voucher.gift')}
          </Text>
          <View style={styles.heroCodeContainer}>
            <Text style={styles.heroCode}>{userVoucher.code}</Text>
          </View>

          {/* Status Badge in Hero */}
          <View style={[styles.heroStatusBadge, { backgroundColor: isUsed ? '#64748b' : isExpired ? '#ef4444' : '#22c55e' }]}>
            <Text style={styles.heroStatusText}>
              {isUsed ? t('bookings.status.completed') : isExpired ? t('voucher.expired') : t('voucher.tabs.available')}
            </Text>
          </View>

          {/* Circular cutouts */}
          <View style={[styles.heroCutoutLeft, { backgroundColor: theme.background }]} />
          <View style={[styles.heroCutoutRight, { backgroundColor: theme.background }]} />
        </View>

        {/* Gift Section (If Gift Product) */}
        {userVoucher.voucherType === 'GIFT_PRODUCT' && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{t('voucher.gift_info')}</Text>
            {userVoucher.giftImageUrl && (
              <SmartImage uri={userVoucher.giftImageUrl} style={styles.giftImage} />
            )}
            {userVoucher.giftDescription && (
              <Text style={[styles.descText, { color: theme.foreground, marginTop: userVoucher.giftImageUrl ? 12 : 0 }]}>
                {userVoucher.giftDescription}
              </Text>
            )}
          </View>
        )}

        {/* Details section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{t('voucher.details')}</Text>

          {userVoucher.description ? (
            <Text style={[styles.descText, { color: theme.foreground }]}>{userVoucher.description}</Text>
          ) : null}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <InfoRow
            icon="local-offer"
            label={t('voucher.filter_type')}
            value={userVoucher.voucherType === 'DISCOUNT' ? t('voucher.discount') : t('voucher.gift')}
          />

          <InfoRow
            icon="category"
            label={t('voucher.filter_product')}
            value={
              userVoucher.applicableProduct === 'EVENT_TICKET'
                ? t('voucher.applicable.event')
                : userVoucher.applicableProduct === 'WORKSHOP'
                  ? t('voucher.applicable.workshop')
                  : t('voucher.applicable.all')
            }
          />

          {userVoucher.voucherType === 'DISCOUNT' ? (
            <InfoRow
              icon="percent"
              label={t('voucher.discount_value')}
              value={
                userVoucher.discountType === 'PERCENT'
                  ? `${userVoucher.discountValue}%${userVoucher.maxDiscountValue ? ` (${t('voucher.max_save')} ${userVoucher.maxDiscountValue.toLocaleString()}đ)` : ''}`
                  : `${userVoucher.discountValue.toLocaleString()}đ`
              }
            />
          ) : null}

          {userVoucher.minOrderValue > 0 ? (
            <InfoRow
              icon="receipt-long"
              label={t('voucher.min_order')}
              value={`${userVoucher.minOrderValue.toLocaleString()}đ`}
            />
          ) : null}

          {userVoucher.vendorName ? (
            <InfoRow
              icon="storefront"
              label={t('voucher.scope_vendor')}
              value={userVoucher.vendorName}
            />
          ) : null}
        </View>

        {/* Validity section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{t('voucher.validity')}</Text>

          {userVoucher.obtainedDate && (
            <InfoRow
              icon="add-circle-outline"
              label={t('voucher.collected')}
              value={formatDate(userVoucher.obtainedDate)}
            />
          )}

          {userVoucher.startDate ? (
            <InfoRow
              icon="event"
              label={t('voucher.start_date')}
              value={formatDate(userVoucher.startDate)}
            />
          ) : null}

          {userVoucher.endDate ? (
            <InfoRow
              icon="event-busy"
              label={t('voucher.end_date')}
              value={formatDate(userVoucher.endDate)}
            />
          ) : null}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCta, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        {!isUsed && !isExpired && userVoucher.voucherType === 'GIFT_PRODUCT' ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: accentColor }]}
            onPress={() => setShowQrModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="qr-code-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>{t('voucher.show_qr')}</Text>
          </TouchableOpacity>
        ) : !isUsed && !isExpired && userVoucher.voucherType === 'DISCOUNT' ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: accentColor }]}
            onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>{t('voucher.use_now')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.disabledButton, { backgroundColor: theme.border }]}>
            <Text style={[styles.disabledBtnText, { color: theme.mutedForeground }]}>
              {isUsed ? t('bookings.status.completed') : t('voucher.expired')}
            </Text>
          </View>
        )}
      </View>

      {/* QR Modal */}
      <Modal
        visible={showQrModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.foreground }]}>{t('voucher.gift')}</Text>
              <TouchableOpacity onPress={() => setShowQrModal(false)}>
                <Ionicons name="close" size={24} color={theme.foreground} />
              </TouchableOpacity>
            </View>

            <View style={styles.qrContainer}>
              <QRCode value={userVoucher.userVoucherId} size={width * 0.6} />
              {/* <Text style={[styles.qrCodeText, { color: theme.foreground }]}>{userVoucher.userVoucherId}</Text> */}
              <Text style={[styles.qrHint, { color: theme.mutedForeground }]}>
                {t('profile.actions.verify_ticket_desc')}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: accentColor }]}
              onPress={() => setShowQrModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>{t('common.back')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  // Hero
  heroCard: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 12,
  },
  heroScope: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroDiscount: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 56,
  },
  heroType: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  heroCodeContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  heroCode: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  heroStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroCutoutLeft: {
    position: 'absolute',
    bottom: -12,
    left: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  heroCutoutRight: {
    position: 'absolute',
    bottom: -12,
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  // Sections
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  giftImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  descText: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoTextGroup: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Bottom
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  qrCodeText: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '600',
  },
  qrHint: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  modalCloseBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
