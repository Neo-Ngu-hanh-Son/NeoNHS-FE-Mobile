import { useTheme } from '@/app/providers/ThemeProvider';
import { SmartImage } from '@/components/ui/smart-image';
import { THEME } from '@/lib/theme';
import React from 'react';
import { View, StyleSheet } from 'react-native';

type PointDetailModalImageProps = {
  point: {
    thumbnailUrl?: string;
  };
};

export default function PointDetailModalImage({ point }: PointDetailModalImageProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <SmartImage
        uri={point.thumbnailUrl}
        fallbackSource={require('@/assets/images/NeoNHSLogo.png')}
        style={styles.image}
      />
    </View>
  );
}

const IMAGE_SIZE = 120;

const styles = StyleSheet.create({
  container: {
    height: IMAGE_SIZE,
    width: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
