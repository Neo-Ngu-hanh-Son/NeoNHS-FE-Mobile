import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import { useCallback, useMemo } from 'react';
import { Text } from '@/components/ui/text';
import type { Blog } from '@/features/blog/types';
import BlogCard from '@/features/blog/components/BlogCard';
import BlogListSkeleton from '@/features/blog/components/BlogListSkeleton';

interface BlogListProps {
  data: Blog[];
  loading: boolean;
  refreshing: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
  onPressBlog?: (blog: Blog) => void;
  listRef?: React.RefObject<FlatList<Blog> | null>;
}

export default function BlogList({
  data,
  loading,
  refreshing,
  onEndReached,
  onRefresh,
  onPressBlog,
  listRef,
}: BlogListProps) {
  const keyExtractor = useCallback((item: Blog) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Blog }) => <BlogCard blog={item} onPress={onPressBlog} />,
    [onPressBlog]
  );

  const renderFooter = useMemo(() => {
    if (!loading || data.length === 0) {
      return null;
    }

    return (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    );
  }, [data.length, loading]);

  const renderEmpty = useMemo(() => {
    if (loading) {
      return null;
    }

    return (
      <View className="items-center px-6 py-16">
        <Text className="text-sm text-muted-foreground">No blogs found.</Text>
      </View>
    );
  }, [loading]);

  if (loading && data.length === 0) {
    return <BlogListSkeleton />;
  }

  return (
    <FlatList
      ref={listRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      removeClippedSubviews
      initialNumToRender={6}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
    />
  );
}
