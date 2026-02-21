import { View, ImageBackground, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { LinearGradient } from 'expo-linear-gradient';

type FeaturedEventCardProps = {
  tag?: string;
  title: string;
  description: string;
  imageUrl: string;
  onPress?: () => void;
};

export default function FeaturedEventCard({
  tag = 'EVENT',
  title,
  description,
  imageUrl,
  onPress,
}: FeaturedEventCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="mx-4 h-80 overflow-hidden rounded-2xl">
      <ImageBackground
        source={{ uri: imageUrl }}
        className="flex-1"
        imageStyle={{ borderRadius: 16 }}>
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} className="flex-1 justify-end">
          <View className="p-4">
            {/* Tag */}
            {/* <View className="bg-primary self-start px-3 py-1 rounded-md mb-2">
              <Text className="text-white text-xs font-semibold tracking-wide">
                {tag}
              </Text>
            </View> */}

            {/* Title */}
            <Text className="mb-1 text-2xl font-bold text-white">{title}</Text>

            {/* Description */}
            <Text className="mb-3 text-sm leading-5 text-white/85" numberOfLines={2}>
              {description}
            </Text>

            {/* CTA Button */}
            <Button
              onPress={onPress}
              className="h-auto self-start rounded-full px-4 py-2"
              size="sm">
              <Text className="text-sm font-semibold text-white">Start Exploring</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </Button>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}
