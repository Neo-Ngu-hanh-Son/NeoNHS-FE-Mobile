import { THEME } from '@/lib/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InfoRow({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  theme,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string | null;
  theme: typeof THEME.light;
}) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={16} color={iconColor} />
      </View>
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, { color: theme.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Info card
  infoCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  infoCardDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
});
