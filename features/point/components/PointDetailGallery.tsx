import React from 'react';
import { View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

const GALLERY_PHOTOS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCKm5L5M0j5L2QmffIZ0pnmgadfS9Cw9bXKb96m8HynEEq-90T5nXhkuENGaOC3-Ij8snTadpmTYieZZpifEVrEMdOhGIxTAOfDvxi1tfqkodtk1E2Ey-fU2pbdlKvgxgGk7TSIWNjZlEBTogUGYmiqoNNkZbe9jAsZpkHZxvMvBt-DHknqpkvLyUjpZPKS1UpCUWFlj34ijpaFbfz7OBDE39rfUkf9qPN1laOPKe6WRXKv1FYkxXYsL1R9COyGPeRk2565jgKH9tPB',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDsSVWdk4xdgOBN8Jt4LxtXEgN6_Y1TTlWaorIF0TZBFfMTJP53DaLgzm1SCz2uHVEJ2iQwmjof0HFQp7fwdAztWvmGs1crUR-LPyV7kfsvIMh00-xQjrNpoFPKtSpJ49feaad9bp3V0XVfBwsEkU30lgQVThaET83tV7e08lBTFpOQI7raFI0UM9XgB3iC54sjnGwb5bwVzROaZOouG1u76Ijsam0P4i6EBI8TSarKCtojQVXqUKvi6iZ9FEVxdVglC2qxmCShwq_3',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCjLJD_UcqL87_A5cxKEI9OItTiFnAm6qFpNlYguEHg3RvNRzNkEPrMZq_YCCy560V4iyAPieGxv1oJq5bjd9Cqx1iLF95JfxQSNGyLB24OIVnfQFYZ75UpyC-zi7q2zAafB4nsbVQ3cIduxcikNrPS4CkDbnDusH8tHWHFYYoAuXBxjJFW5rv2idB03vckyRdaJ8QrJwqCZqG5xBBW7HksTb_e1PmiHIfcq8P_52fzc4Szz096UO-85NJKbQnYxkxxmqYRckbSK-Pw',
];

export function PointDetailGallery() {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <View className="gap-4">
      {/* Header row */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-black tracking-tight">Check-in Gallery</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text className="text-sm font-bold" style={{ color: theme.primary }}>
            See All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}>
        {GALLERY_PHOTOS.map((uri, index) => (
          <TouchableOpacity key={index} activeOpacity={0.85}>
            <Image source={{ uri }} className="h-32 w-32 rounded-2xl" resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
