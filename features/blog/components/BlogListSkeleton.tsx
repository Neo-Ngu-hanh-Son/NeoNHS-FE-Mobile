import { View } from 'react-native';

export default function BlogListSkeleton() {
  return (
    <View className="px-4 pt-4">
      {[0, 1, 2, 3, 4].map((item) => (
        <View
          key={item}
          className="mb-3 h-28 flex-row overflow-hidden rounded-xl border border-border bg-card">
          <View className="h-full w-28 bg-muted" />
          <View className="flex-1 px-3 py-2">
            <View className="h-4 w-3/4 rounded bg-muted" />
            <View className="mt-2 h-3 w-full rounded bg-muted" />
            <View className="mt-1 h-3 w-2/3 rounded bg-muted" />
            <View className="mt-4 h-3 w-1/3 rounded bg-muted" />
          </View>
        </View>
      ))}
    </View>
  );
}
