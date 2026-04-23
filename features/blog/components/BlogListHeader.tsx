import { useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BlogListHeaderProps {
  search: string;
  onSearchSubmit: (value: string) => void;
  onOpenFilters: () => void;
}

export default function BlogListHeader({
  search,
  onSearchSubmit,
  onOpenFilters,
}: BlogListHeaderProps) {
  const [inputValue, setInputValue] = useState(search);

  useEffect(() => {
    setInputValue(search);
  }, [search]);

  const handleSubmitSearch = () => {
    Keyboard.dismiss();
    onSearchSubmit(inputValue);
  };

  return (
    <View className="flex-row items-center gap-2 px-4 pb-2 pt-3">
      <View className="flex-1">
        <Input
          placeholder="Search blogs..."
          value={inputValue}
          onChangeText={setInputValue}
          returnKeyType="search"
          onSubmitEditing={handleSubmitSearch}
        />
      </View>
      <Button
        variant="outline"
        size="icon"
        onPress={handleSubmitSearch}
        accessibilityLabel="Search blogs">
        <Ionicons name="search" size={18} color="currentColor" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onPress={() => {
          Keyboard.dismiss();
          onOpenFilters();
        }}
        accessibilityLabel="Open blog filters">
        <Ionicons name="options-outline" size={18} color="currentColor" />
      </Button>
    </View>
  );
}
