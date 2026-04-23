import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { useTranslation } from 'react-i18next';

type PointDetailCTAProps = {
  accentColor: string;
  theme: typeof THEME.light;
  onViewDetails: () => void;
  onNavigate: () => void;
};

export default function PointDetailCTA({ accentColor, theme, onViewDetails, onNavigate }: PointDetailCTAProps) {
  const { t } = useTranslation();
  return (
    <View style={[styles.ctaWrap, { borderTopColor: theme.border }]}>
      <TouchableOpacity
        onPress={onViewDetails}
        activeOpacity={0.85}
        style={[styles.cta, { backgroundColor: accentColor }]}
        accessibilityLabel="View point details">
        <Ionicons name="information-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.ctaText}>{t('map.view_details')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNavigate}
        activeOpacity={0.85}
        style={[styles.ctaSecondary, { borderColor: accentColor, backgroundColor: theme.background }]}
        accessibilityLabel="Navigate from current location">
        <Ionicons name="navigate-outline" size={18} color={accentColor} style={{ marginRight: 8 }} />
        <Text style={[styles.ctaSecondaryText, { color: accentColor }]}>{t('map.get_directions')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  ctaWrap: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
  },
  cta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  ctaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ctaSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 11,
  },
  ctaSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
