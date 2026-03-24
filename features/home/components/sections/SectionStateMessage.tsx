import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

type SectionStateMessageProps = {
  message: string;
  tone?: 'muted' | 'error';
};

export default function SectionStateMessage({
  message,
  tone = 'muted',
}: SectionStateMessageProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <View className="px-4">
      <Text
        className="text-sm"
        style={{ color: tone === 'error' ? '#ef4444' : theme.mutedForeground }}>
        {message}
      </Text>
    </View>
  );
}