import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useCollectVoucher } from '../hooks/useAvailableVouchers';
import { VoucherResponse } from '../types/voucher.types';
import { useAuth } from '@/features/auth';

type VoucherDetailRouteParams = {
  VoucherDetail: { voucher: VoucherResponse };
};

export default function VoucherDetailScreen() {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<VoucherDetailRouteParams, 'VoucherDetail'>>();
  const voucher = route.params.voucher;

  const collectMutation = useCollectVoucher();
  const { user, updateUser } = useAuth();
  const userPoints = user?.userPoint ?? 0;

  const isPlatform = voucher.scope === 'PLATFORM';
  const accentColor = isPlatform ? '#ee4d2d' : '#f97316';
  const isSoldOut = voucher.usageCount >= voucher.usageLimit;
  const remaining = voucher.usageLimit - voucher.usageCount;
  const progress = voucher.usageLimit > 0 ? (voucher.usageCount / voucher.usageLimit) * 100 : 0;
  const isExpired = voucher.endDate ? new Date(voucher.endDate) < new Date() : false;
  const costPoints = voucher.pointCost ?? 0;
  const hasEnoughPoints = userPoints >= costPoints;
  const canCollect = !isSoldOut && !isExpired && hasEnoughPoints && !voucher.isCollected;

  const discountDisplay =
    voucher.voucherType === 'DISCOUNT'
      ? voucher.discountType === 'PERCENT'
        ? `${voucher.discountValue}%`
        : `${voucher.discountValue.toLocaleString()}đ`
      : t('voucher.gift');

  const handleCollect = () => {
    collectMutation.mutate(voucher.id, {
      onSuccess: (response) => {
        if (response.success) {
          // Deduct points locally
          if (costPoints > 0) {
            updateUser({ userPoint: Math.max(0, userPoints - costPoints) });
          }
          Alert.alert(t('voucher.collect_success_title'), t('voucher.collect_success_message'));
        } else {
          Alert.alert(t('common.error'), response.message || t('voucher.collect_failed'));
        }
      },
      onError: (error: any) => {
        Alert.alert(t('common.error'), error?.message || t('voucher.collect_failed'));
      },
    });
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
        <View style={[styles.heroCard, { backgroundColor: accentColor }]}>
          <Text style={styles.heroScope}>
            {isPlatform ? t('voucher.scope_platform') : voucher.vendorName || t('voucher.scope_vendor')}
          </Text>
          <Text style={styles.heroDiscount}>{discountDisplay}</Text>
          <Text style={styles.heroType}>
            {voucher.voucherType === 'DISCOUNT' ? t('voucher.discount') : t('voucher.gift')}
          </Text>
          <View style={styles.heroCodeContainer}>
            <Text style={styles.heroCode}>{voucher.code}</Text>
          </View>

          {/* Point cost in hero */}
          <View style={styles.heroPointBadge}>
            <Ionicons name="diamond" size={12} color="#fff" />
            <Text style={styles.heroPointText}>
              {costPoints > 0 ? t('voucher.point_cost', { points: costPoints }) : t('voucher.free')}
            </Text>
          </View>

          {/* Circular cutouts */}
          <View style={[styles.heroCutoutLeft, { backgroundColor: theme.background }]} />
          <View style={[styles.heroCutoutRight, { backgroundColor: theme.background }]} />
        </View>

        {/* Progress section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{t('voucher.availability')}</Text>
          <View style={[styles.progressTrack, { backgroundColor: `${accentColor}20` }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progress, 100)}%`, backgroundColor: accentColor },
              ]}
            />
            <Text style={styles.progressText}>
              {isSoldOut
                ? t('voucher.sold_out')
                : t('voucher.remaining', { count: remaining })}
            </Text>
          </View>
          <Text style={[styles.progressSub, { color: theme.mutedForeground }]}>
            {voucher.usageCount}/{voucher.usageLimit} {t('voucher.collected')}
          </Text>
        </View>

        {/* Details section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{t('voucher.details')}</Text>

          {voucher.description ? (
            <Text style={[styles.descText, { color: theme.foreground }]}>{voucher.description}</Text>
          ) : null}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <InfoRow
            icon="local-offer"
            label={t('voucher.filter_type')}
            value={voucher.voucherType === 'DISCOUNT' ? t('voucher.discount') : t('voucher.gift')}
          />

          <InfoRow
            icon="category"
            label={t('voucher.filter_product')}
            value={
              voucher.applicableProduct === 'EVENT_TICKET'
                ? t('voucher.applicable.event')
                : voucher.applicableProduct === 'WORKSHOP'
                  ? t('voucher.applicable.workshop')
                  : t('voucher.applicable.all')
            }
          />

          {voucher.voucherType === 'DISCOUNT' ? (
            <InfoRow
              icon="percent"
              label={t('voucher.discount_value')}
              value={
                voucher.discountType === 'PERCENT'
                  ? `${voucher.discountValue}%${voucher.maxDiscountValue ? ` (${t('voucher.max_save')} ${voucher.maxDiscountValue.toLocaleString()}đ)` : ''}`
                  : `${voucher.discountValue.toLocaleString()}đ`
              }
            />
          ) : null}

          {voucher.minOrderValue > 0 ? (
            <InfoRow
              icon="receipt-long"
              label={t('voucher.min_order')}
              value={`${voucher.minOrderValue.toLocaleString()}đ`}
            />
          ) : null}

          {voucher.scope === 'VENDOR' && voucher.vendorName ? (
            <InfoRow
              icon="storefront"
              label={t('voucher.scope_vendor')}
              value={voucher.vendorName}
            />
          ) : null}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Points info */}
          <InfoRow
            icon="toll"
            label={t('voucher.points_required')}
            value={costPoints > 0 ? t('voucher.point_cost', { points: costPoints }) : t('voucher.free')}
          />
          <InfoRow
            icon="account-balance-wallet"
            label={t('voucher.your_points')}
            value={userPoints.toLocaleString()}
          />
        </View>

        {/* Validity section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{t('voucher.validity')}</Text>

          {voucher.startDate ? (
            <InfoRow
              icon="event"
              label={t('voucher.start_date')}
              value={new Date(voucher.startDate).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            />
          ) : null}

          {voucher.endDate ? (
            <InfoRow
              icon="event-busy"
              label={t('voucher.end_date')}
              value={new Date(voucher.endDate).toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            />
          ) : null}

          {isExpired ? (
            <View style={[styles.statusBadge, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="close-circle" size={16} color="#ef4444" />
              <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 12 }}>
                {t('voucher.expired')}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Gift info */}
        {voucher.voucherType === 'GIFT_PRODUCT' && voucher.giftDescription ? (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{t('voucher.gift_info')}</Text>
            <Text style={[styles.descText, { color: theme.foreground }]}>{voucher.giftDescription}</Text>
          </View>
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCta, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.collectButton,
            {
              backgroundColor: canCollect ? accentColor : theme.border,
              opacity: collectMutation.isPending ? 0.6 : 1,
            },
          ]}
          onPress={handleCollect}
          disabled={!canCollect || collectMutation.isPending}
          activeOpacity={0.7}
        >
          <Ionicons
            name={canCollect ? 'download-outline' : 'close-circle-outline'}
            size={20}
            color={canCollect ? '#fff' : theme.mutedForeground}
          />
          <Text style={[styles.collectBtnText, { color: canCollect ? '#fff' : theme.mutedForeground }]}>
            {collectMutation.isPending
              ? t('common.loading')
              : canCollect
                ? t('voucher.collect')
                : voucher.isCollected
                  ? t('voucher.already_collected')
                  : isSoldOut
                    ? t('voucher.sold_out')
                    : isExpired
                      ? t('voucher.expired')
                      : t('voucher.insufficient_points')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header
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
    includeFontPadding: false,
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
  heroPointBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 10,
  },
  heroPointText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
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
  // Progress
  progressTrack: {
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 10,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    zIndex: 1,
  },
  progressSub: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  // Status
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
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
  collectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  collectBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
