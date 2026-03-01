import React from 'react';
import { View } from 'react-native';
import { Button } from '../ui/button';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  goBack: () => void;
};

export default function RoundedBackButton({ goBack }: Props) {
  return (
    <View className="absolute left-4 top-4 rounded-full bg-white/20 backdrop-blur-md">
      <Button
        variant="ghost"
        size="icon"
        onPress={goBack}
        accessibilityLabel="Go back"
        className="rounded-full bg-black/30">
        <Ionicons name="arrow-back" size={22} color="white" />
      </Button>
    </View>
  );
}
