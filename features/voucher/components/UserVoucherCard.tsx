import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { UserVoucherResponse } from '../types/voucher.types';

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

interface UserVoucherCardProps {
  userVoucher: UserVoucherResponse;
  theme: any;
  onPress: (userVoucher: UserVoucherResponse) => void;
}

export default function UserVoucherCard({ userVoucher, theme, onPress }: UserVoucherCardProps) {
  const { t } = useTranslation();

  const isExpired = !userVoucher.isAvailable;
  const isUsed = userVoucher.isUsed;
  const accentColor = userVoucher.vendorId ? '#f97316' : '#ee4d2d'; // Vendor vs Platform

  const discountLabel =
    userVoucher.voucherType === 'DISCOUNT'
      ? userVoucher.discountValue < 100
        ? `${userVoucher.discountValue}%`
        : `${(userVoucher.discountValue / 1000).toLocaleString()}k`
      : t('voucher.gift');

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => onPress(userVoucher)}
      activeOpacity={0.7}
    >
      {/* Left Section - Highlight Color */}
      <View style={[styles.leftSection, { backgroundColor: isUsed || isExpired ? theme.muted : accentColor }]}>
        <View style={styles.iconContainer}>
          {userVoucher.voucherType === 'DISCOUNT' ? (
            <MaterialIcons name="local-offer" size={24} color="#fff" />
          ) : (
            <Ionicons name="gift" size={24} color="#fff" />
          )}
        </View>
        <Text style={styles.typeLabel}>{discountLabel}</Text>
      </View>

      {/* Right Section - Details */}
      <View style={styles.rightSection}>
        <View style={styles.headerRow}>
          <Text style={[styles.code, { color: isUsed || isExpired ? theme.mutedForeground : theme.foreground }]} numberOfLines={1}>
            {userVoucher.code}
          </Text>
          {userVoucher.vendorName && (
            <View style={[styles.vendorBadge, { backgroundColor: `${accentColor}15` }]}>
              <Text style={[styles.vendorText, { color: accentColor }]}>{userVoucher.vendorName}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.description, { color: theme.mutedForeground }]} numberOfLines={2}>
          {userVoucher.description || '-'}
        </Text>

        <View style={styles.footer}>
          <View style={styles.expiryRow}>
            <Ionicons name="time-outline" size={12} color={theme.mutedForeground} />
            <Text style={[styles.expiryText, { color: theme.mutedForeground }]}>
              {userVoucher.endDate 
                ? `${t('voucher.expires')} ${formatDate(userVoucher.endDate)}`
                : t('voucher.validity')}
            </Text>
          </View>

          {/* Status Label */}
          <View style={styles.statusContainer}>
            {isUsed ? (
              <Text style={[styles.statusText, { color: theme.mutedForeground }]}>{t('bookings.status.completed')}</Text>
            ) : isExpired ? (
              <Text style={[styles.statusText, { color: '#ef4444' }]}>{t('voucher.expired')}</Text>
            ) : (
              <View style={styles.useBadge}>
                <Text style={styles.useText}>{t('common.continue')}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Decorative Circles */}
      <View style={[styles.cutoutTop, { backgroundColor: theme.background, borderColor: theme.border }]} />
      <View style={[styles.cutoutBottom, { backgroundColor: theme.background, borderColor: theme.border }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  leftSection: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  iconContainer: {
    marginBottom: 4,
  },
  typeLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  rightSection: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  code: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  vendorBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  vendorText: {
    fontSize: 9,
    fontWeight: '700',
  },
  description: {
    fontSize: 11,
    lineHeight: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiryText: {
    fontSize: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  useBadge: {
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  useText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  cutoutTop: {
    position: 'absolute',
    left: 72,
    top: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1,
  },
  cutoutBottom: {
    position: 'absolute',
    left: 72,
    bottom: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1,
  },
});
