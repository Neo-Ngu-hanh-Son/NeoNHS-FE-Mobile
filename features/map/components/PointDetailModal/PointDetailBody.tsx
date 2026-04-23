import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import InfoRow from './InfoRow';
import { hexAlpha } from './helpers';
import { useTranslation } from 'react-i18next';

type PointDetailBodyProps = {
  description?: string;
  shortDescription?: string;
  isEventOrWorkshop: boolean;
  accentColor: string;
  startStr: string;
  endStr: string;
  participantsStr: string;
  workshopOrganizerName?: string;
  estTimeStr: string;
  panoramaImageUrl?: string;
  theme: typeof THEME.light;
};

function Divider({ theme }: { theme: typeof THEME.light }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

export default function PointDetailBody({
  description,
  shortDescription,
  isEventOrWorkshop,
  accentColor,
  startStr,
  endStr,
  participantsStr,
  workshopOrganizerName,
  estTimeStr,
  panoramaImageUrl,
  theme,
}: PointDetailBodyProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.body}>
      {/* ── Description ─────────────────────────── */}
      {description ? (
        <>
          <Text style={[styles.sectionLabel, { color: theme.mutedForeground }]}>{t('map.about', 'About')}</Text>
          <Text style={[styles.description, { color: theme.foreground }]}>{description}</Text>
          {shortDescription && shortDescription !== description ? (
            <Text style={[styles.shortDesc, { color: theme.mutedForeground }]}>{shortDescription}</Text>
          ) : null}
          <Divider theme={theme} />
        </>
      ) : shortDescription ? (
        <>
          <Text style={[styles.sectionLabel, { color: theme.mutedForeground }]}>{t('map.about', 'About')}</Text>
          <Text style={[styles.description, { color: theme.foreground }]}>{shortDescription}</Text>
          <Divider theme={theme} />
        </>
      ) : null}

      {/* ── Event / Workshop info card ────────────── */}
      {isEventOrWorkshop ? (
        <View style={[styles.infoCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <InfoRow
            icon="play-circle-outline"
            iconColor={accentColor}
            iconBg={hexAlpha(accentColor, '18')}
            label={t('map.starts', 'Starts')}
            value={startStr || null}
            theme={theme}
          />
          {startStr && endStr ? (
            <View style={[styles.infoCardDivider, { backgroundColor: theme.border }]} />
          ) : null}
          <InfoRow
            icon="stop-circle-outline"
            iconColor="#64748b"
            iconBg={hexAlpha('#64748b', '18')}
            label={t('map.ends', 'Ends')}
            value={endStr || null}
            theme={theme}
          />
          {participantsStr ? (
            <>
              <View style={[styles.infoCardDivider, { backgroundColor: theme.border }]} />
              <InfoRow
                icon="people-outline"
                iconColor="#0ea5e9"
                iconBg={hexAlpha('#0ea5e9', '18')}
                label={t('map.participants', 'Participants')}
                value={participantsStr}
                theme={theme}
              />
            </>
          ) : null}
          {workshopOrganizerName ? (
            <>
              <View style={[styles.infoCardDivider, { backgroundColor: theme.border }]} />
              <InfoRow
                icon="business-outline"
                iconColor="#8b5cf6"
                iconBg={hexAlpha('#8b5cf6', '18')}
                label={t('map.organizer', 'Organizer')}
                value={workshopOrganizerName}
                theme={theme}
              />
            </>
          ) : null}
        </View>
      ) : null}

      {/* ── Static POI info card ─────────────────── */}
      {!isEventOrWorkshop && (estTimeStr || panoramaImageUrl) ? (
        <View style={[styles.infoCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <InfoRow
            icon="walk-outline"
            iconColor={accentColor}
            iconBg={hexAlpha(accentColor, '18')}
            label={t('map.est_visit_time', 'Estimated visit time')}
            value={estTimeStr || null}
            theme={theme}
          />
          {panoramaImageUrl ? (
            <>
              {estTimeStr ? <View style={[styles.infoCardDivider, { backgroundColor: theme.border }]} /> : null}
              <InfoRow
                icon="images-outline"
                iconColor="#0284c7"
                iconBg={hexAlpha('#0284c7', '18')}
                label={t('map.experience', 'Experience')}
                value={t('map.panorama_available', '360° Panorama available')}
                theme={theme}
              />
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 16,
    paddingTop: 2,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
  shortDesc: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: -4,
  },
  divider: {
    height: 1,
    marginVertical: -4,
    borderRadius: 1,
  },
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
});
