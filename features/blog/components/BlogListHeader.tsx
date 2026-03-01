import { useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BlogListHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
}

const SEARCH_DEBOUNCE_MS = 400;

export default function BlogListHeader({
  search,
  onSearchChange,
  onOpenFilters,
}: BlogListHeaderProps) {
  const [inputValue, setInputValue] = useState(search);

  useEffect(() => {
    setInputValue(search);
  }, [search]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(inputValue);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [inputValue, onSearchChange]);

  return (
    <View className="flex-row items-center gap-2 px-4 pb-2 pt-3">
      <View className="flex-1">
        <Input
          placeholder="Search blogs..."
          value={inputValue}
          onChangeText={setInputValue}
          returnKeyType="search"
          onSubmitEditing={() => {
            Keyboard.dismiss();
            onSearchChange(inputValue);
          }}
        />
      </View>
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
