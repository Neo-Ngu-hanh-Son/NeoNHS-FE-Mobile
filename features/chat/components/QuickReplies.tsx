import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

export interface QuickRepliesProps {
    replies: string[];
    onSelect: (reply: string) => void;
}

export function QuickReplies({ replies, onSelect }: QuickRepliesProps) {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;

    if (!replies || replies.length === 0) return null;

    return (
        <View className="py-2 mb-1">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
                {replies.map((reply, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => onSelect(reply)}
                        className="rounded-full px-4 py-2 border flex-row items-center justify-center bg-transparent"
                        style={{ borderColor: theme.primary }}
                    >
                        <Text className="text-sm font-medium" style={{ color: theme.primary }}>
                            {reply}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
