import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { SmartImage } from '@/components/ui/smart-image';

type HighlightCardProps = {
  title: string;
  description: string;
  imageUrl?: string | null;
  linkText?: string;
  onPress?: () => void;
};

export default function HighlightCard({
  title,
  description,
  imageUrl,
  linkText = 'Learn More',
  onPress,
}: HighlightCardProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.12)', foreground: true }}
      className="elevation-sm mx-4 overflow-hidden rounded-xl active:opacity-90">
      <Card className="flex-row gap-0 overflow-hidden p-0">
        <SmartImage uri={imageUrl} className="h-32 w-28" style={{ backgroundColor: theme.muted }} contentFit="cover" />
        <View className="flex-1 justify-center p-3">
          <Text className="mb-1 text-base font-bold" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="muted" className="mb-2 text-xs leading-4" numberOfLines={3}>
            {description}
          </Text>
          <Button variant="link" className="h-auto gap-1 self-start p-0" onPress={onPress}>
            <Text className="text-sm font-semibold text-primary">{linkText}</Text>
            <Ionicons name="arrow-forward" size={14} color={theme.primary} />
          </Button>
        </View>
      </Card>
    </Pressable>
  );
}
