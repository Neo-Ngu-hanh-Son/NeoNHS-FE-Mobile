import React from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type CheckinSocialShareButtonProps = {
  label: string;
  onPress: () => void;
  children?: React.ReactNode;
};

export function CheckinSocialShareButton({ label, onPress, children }: CheckinSocialShareButtonProps) {
  return (
    <Button onPress={onPress} variant="outline" className="h-12 flex-1 bg-transparent">
      {children}
      <Text className="text-sm font-semibold text-foreground">{label}</Text>
    </Button>
  );
}
