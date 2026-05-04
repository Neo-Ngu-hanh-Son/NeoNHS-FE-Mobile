import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { VoucherResponse } from '../types/voucher.types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

interface VoucherCardProps {
  voucher: VoucherResponse;
  userPoints: number;
  onCollect: (id: string) => void;
  onPress: (voucher: VoucherResponse) => void;
  isCollecting: boolean;
}

const withOpacity = (hex: string, opacity: number) => {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return hex + alpha;
};

export default function VoucherCard({ voucher, userPoints, onCollect, onPress, isCollecting }: VoucherCardProps) {
  const { t } = useTranslation();

  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  // ===== Business logic (UNCHANGED) =====
  const isSoldOut = voucher.usageCount >= voucher.usageLimit;
  const remaining = voucher.usageLimit - voucher.usageCount;
  const progress = voucher.usageLimit > 0 ? (voucher.usageCount / voucher.usageLimit) * 100 : 0;

  const isExpired = voucher.endDate ? new Date(voucher.endDate) < new Date() : false;

  const costPoints = voucher.pointCost ?? 0;
  const hasEnoughPoints = userPoints >= costPoints;

  const canCollect = !isSoldOut && !isExpired && hasEnoughPoints && !voucher.isCollected;

  const isPlatform = voucher.scope === 'PLATFORM';
  const accentColor = isPlatform ? '#ee4d2d' : '#f97316';

  const discountLabel =
    voucher.voucherType === 'DISCOUNT'
      ? voucher.discountType === 'PERCENT'
        ? `${voucher.discountValue}%`
        : `${Math.round(voucher.discountValue / 1000)}K`
      : '';

  const discountSub = voucher.voucherType === 'DISCOUNT' ? t('voucher.discount') : t('voucher.gift');

  // ===== Derived UI colors =====
  const subtleAccent = useMemo(() => withOpacity(accentColor, 0.12), [accentColor]);

  const progressBg = useMemo(() => withOpacity(accentColor, 0.2), [accentColor]);

  const disabledBg = theme.muted || theme.border;

  // ===== Render =====
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
      onPress={() => onPress(voucher)}
      activeOpacity={0.7}>
      {/* ===== LEFT ===== */}
      <View style={[styles.leftSection, { backgroundColor: accentColor }]}>
        <Text style={styles.scopeLabel}>
          {isPlatform ? t('voucher.scope_platform') : voucher.vendorName || t('voucher.scope_vendor')}
        </Text>

        {voucher.voucherType === 'DISCOUNT' ? (
          <>
            <Text style={styles.discountBig}>{discountLabel}</Text>
            <Text style={styles.discountSub}>{discountSub}</Text>
          </>
        ) : (
          <>
            <Ionicons name="gift-outline" size={28} color="#fff" />
            <Text style={styles.discountSub}>{discountSub}</Text>
          </>
        )}

        <View style={styles.pointCostBadge}>
          <Ionicons name="diamond" size={10} color="#fff" />
          <Text style={styles.pointCostText}>
            {costPoints > 0
              ? t('voucher.point_cost', {
                  points: costPoints,
                })
              : t('voucher.free')}
          </Text>
        </View>

        {/* cutout */}
        <View style={[styles.cutoutTop, { backgroundColor: theme.background }]} />
        <View style={[styles.cutoutBottom, { backgroundColor: theme.background }]} />
      </View>

      {/* ===== DIVIDER ===== */}
      <View style={styles.dashedDivider}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={[styles.dash, { backgroundColor: withOpacity(theme.border, 0.6) }]} />
        ))}
      </View>

      {/* ===== RIGHT ===== */}
      <View style={styles.rightSection}>
        {/* Top */}
        <View style={styles.topRow}>
          <Text style={[styles.code, { color: theme.foreground }]} numberOfLines={1}>
            {voucher.code}
          </Text>

          <View style={[styles.applicableBadge, { backgroundColor: subtleAccent }]}>
            <Text style={[styles.applicableText, { color: accentColor }]}>
              {voucher.applicableProduct === 'EVENT_TICKET'
                ? t('voucher.applicable.event')
                : voucher.applicableProduct === 'WORKSHOP'
                  ? t('voucher.applicable.workshop')
                  : t('voucher.applicable.all')}
            </Text>
          </View>
        </View>

        {/* Description */}
        {!!voucher.description && (
          <Text style={[styles.desc, { color: theme.mutedForeground }]} numberOfLines={2}>
            {voucher.description}
          </Text>
        )}

        {/* Condition */}
        {voucher.minOrderValue > 0 && (
          <Text style={[styles.condition, { color: theme.mutedForeground }]}>
            {t('voucher.min_order')} {voucher.minOrderValue.toLocaleString()}đ
          </Text>
        )}

        {/* Bottom */}
        <View style={styles.bottomArea}>
          <View style={styles.bottomLeft}>
            {/* Progress */}
            <View style={[styles.progressTrack, { backgroundColor: progressBg }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: accentColor,
                  },
                ]}
              />
              <Text
                style={[
                  styles.progressLabel,
                  {
                    color: progress > 60 ? '#fff' : theme.foreground,
                  },
                ]}>
                {isSoldOut
                  ? t('voucher.sold_out')
                  : t('voucher.remaining', {
                      count: remaining,
                    })}
              </Text>
            </View>

            {/* Expiry */}
            {!!voucher.endDate && (
              <Text
                style={[
                  styles.expiry,
                  {
                    color: isExpired ? theme.destructive || '#ef4444' : theme.mutedForeground,
                  },
                ]}>
                {isExpired
                  ? t('voucher.expired')
                  : `${t('voucher.expires')} ${new Date(voucher.endDate).toLocaleDateString('vi-VN')}`}
              </Text>
            )}
          </View>

          {/* Collect */}
          <TouchableOpacity
            style={[
              styles.collectBtn,
              {
                backgroundColor: canCollect ? accentColor : disabledBg,
                opacity: isCollecting ? 0.6 : 1,
              },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              if (canCollect && !isCollecting) {
                onCollect(voucher.id);
              }
            }}
            disabled={!canCollect || isCollecting}>
            <Text
              style={[
                styles.collectText,
                {
                  color: canCollect ? '#fff' : theme.mutedForeground,
                },
              ]}>
              {isCollecting
                ? '...'
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
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 0.5,
  },

  leftSection: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    position: 'relative',
  },

  scopeLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },

  discountBig: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
  },

  discountSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '600',
  },

  cutoutTop: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  cutoutBottom: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  dashedDivider: {
    width: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 8,
  },

  dash: {
    width: 1,
    height: 4,
    borderRadius: 1,
  },

  rightSection: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },

  code: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },

  applicableBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  applicableText: {
    fontSize: 9,
    fontWeight: '700',
  },

  desc: {
    fontSize: 12,
    marginTop: 4,
  },

  condition: {
    fontSize: 10,
    marginTop: 2,
  },

  bottomArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 10,
  },

  bottomLeft: {
    flex: 1,
  },

  progressTrack: {
    height: 18,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },

  progressLabel: {
    padding: 0,
    margin: 0,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    zIndex: 1,
    lineHeight: 18,
  },

  pointCostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
    justifyContent: 'center',
  },

  pointCostText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  expiry: {
    fontSize: 10,
    marginTop: 4,
  },

  collectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },

  collectText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
