import { View, Dimensions, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { logger } from '@/utils/logger';
import { SmartImage } from '@/components/ui/smart-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_HEIGHT = 220;

type GuideCardProps = {
  title: string;
  description: string;
  imageUrl?: string | null;
  onPress?: () => void;
};

export default function GuideCard({ title, description, imageUrl, onPress }: GuideCardProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.12)', foreground: true }}
      className="overflow-hidden rounded-xl active:opacity-90">
      <View
        style={[
          styles.innerContainer,
          styles.shadowWrapper,
          {
            backgroundColor: theme.card,
          },
        ]}>
        <View style={styles.imageContainer}>
          <SmartImage
            uri={imageUrl}
            style={[styles.image, { backgroundColor: theme.muted }]}
            resizeMode="cover"
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            className="text-base font-bold leading-5"
            style={{ color: theme.foreground }}
            numberOfLines={2}>
            {title}
          </Text>
          <Text
            className="mt-1 text-sm leading-5"
            style={{ color: theme.mutedForeground }}
            numberOfLines={3}>
            {description}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  innerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  imageContainer: {
    width: '100%',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    padding: 8,
  },
});
