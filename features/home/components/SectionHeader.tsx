import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

type SectionHeaderProps = {
  title: string;
  showSeeAll?: boolean;
  onSeeAllPress?: () => void;
};

export default function SectionHeader({
  title,
  showSeeAll = false,
  onSeeAllPress,
}: SectionHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-3 mt-6 flex-row items-center justify-between px-4">
      <Text className="text-xl font-bold text-primary">{title}</Text>
      {showSeeAll && (
        <Button variant="link" onPress={onSeeAllPress} className="h-auto p-0">
          <Text className="text-sm font-medium text-primary">{t('home.see_all')}</Text>
        </Button>
      )}
    </View>
  );
}
