import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

interface DebouncedInputProps extends Omit<TextInputProps, 'onChangeText'> {
  onSearch: (value: string) => void;
  isDebounced?: boolean;
  delay?: number;
}

export default function DebouncedInput({
  onSearch,
  isDebounced = true,
  delay = 500,
  placeholder,
  ...props
}: DebouncedInputProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  // Local state for the text currently in the box
  const [text, setText] = useState(props.value || '');

  // Keep local text in sync if props.value changes externally (like clearing from parent)
  useEffect(() => {
    setText(props.value || '');
  }, [props.value]);

  // Debounce Effect
  useEffect(() => {
    if (!isDebounced) return;

    const handler = setTimeout(() => {
      onSearch(text);
    }, delay);

    return () => clearTimeout(handler);
  }, [text, delay, isDebounced, onSearch]);

  const handleChangeText = (val: string) => {
    setText(val);
    // If NOT debounced, fire the callback immediately
    if (!isDebounced) {
      onSearch(val);
    }
  };

  const handleClear = () => {
    setText('');
    onSearch('');
  };

  return (
    <View className="px-4 pt-3">
      <View
        className="flex-row items-center gap-2 rounded-xl px-4 py-3"
        style={{ backgroundColor: theme.muted }}>
        <Ionicons name="search" size={20} color={theme.mutedForeground} />

        <TextInput
          {...props}
          placeholder={placeholder}
          placeholderTextColor={theme.mutedForeground}
          className="flex-1 text-sm"
          style={{ color: theme.foreground, paddingTop: 0, paddingBottom: 0 }}
          value={text}
          onChangeText={handleChangeText}
        />

        {text.length > 0 && (
          <TouchableOpacity onPress={handleClear} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={theme.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}