import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

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
      <Image
        source={
          point.thumbnailUrl
            ? { uri: point.thumbnailUrl }
            : require('@/assets/images/NeoNHSLogo.png')
        }
        resizeMode="cover"
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
