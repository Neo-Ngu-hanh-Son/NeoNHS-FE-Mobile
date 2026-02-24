import { View } from 'react-native';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { useWindowDimensions } from 'react-native';

type Props = {
  horizontal?: boolean;
};

export default function BlogCardSkeleton({ horizontal }: Props) {
  const SCREEN_WIDTH = useWindowDimensions().width;
  const CARD_WIDTH = SCREEN_WIDTH * 0.6;

  if (horizontal) {
    return (
      <Card className="elevation-md mx-3 gap-0 overflow-hidden py-0 shadow-md">
        <View className="flex-row items-center justify-center gap-3 px-2 py-4">
          {/* Image placeholder */}
          <Skeleton className="h-28 w-[120px]" />
          {/* Content placeholder*/}
          <View className="flex flex-1 flex-col gap-2">
            <Skeleton className="mb-2 h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card
      className="elevation-md mx-3 gap-0 overflow-hidden px-2 py-3 shadow-md"
      style={{
        width: CARD_WIDTH,
      }}>
      <View className="flex-col">
        <Skeleton className="mb-3 h-28 w-full" />
        <Skeleton className="mb-2 h-4 w-full" />
        <View className="flex flex-col gap-2">
          <Skeleton className="h-4 w-[180px]" />
          <Skeleton className="h-4 w-[180px]" />
        </View>
      </View>
    </Card>
  );
}
