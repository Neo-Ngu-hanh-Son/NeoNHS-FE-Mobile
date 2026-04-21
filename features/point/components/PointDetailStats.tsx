import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MapPoint } from '../../map/types';
import { useTranslation } from 'react-i18next';

type StatItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: string;
};

function StatItem({ icon, iconColor, iconBgColor, label, value }: StatItemProps) {
  return (
    <View className="flex-1 items-center gap-1.5">
      <View
        className="mb-0.5 h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBgColor }}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </Text>
      <Text className="text-sm font-bold">{value}</Text>
    </View>
  );
}

type PointDetailStatsProps = {
  point: MapPoint;
};

export function PointDetailStats({ point }: PointDetailStatsProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { t } = useTranslation();

  return (
    <Card className="rounded-3xl py-5">
      <CardContent className="flex-row items-center justify-between px-4">
        <StatItem
          icon="time-outline"
          iconColor={theme.primary}
          iconBgColor={`${theme.primary}18`}
          label={t('point.duration')}
          value={`${point.estTimeSpent || 30} ${t('point.mins')}`}
        />
        <Separator orientation="vertical" className="mx-1 h-12" />
        <StatItem
          icon="flash-outline"
          iconColor="#f97316"
          iconBgColor="#f9731615"
          label={t('point.difficulty')}
          value={t('point.moderate')}
        />
        <Separator orientation="vertical" className="mx-1 h-12" />
        <StatItem
          icon="cloud-outline"
          iconColor="#14b8a6"
          iconBgColor="#14b8a615"
          label={t('point.vibe')}
          value={t('point.spiritual')}
        />
      </CardContent>
    </Card>
  );
}
