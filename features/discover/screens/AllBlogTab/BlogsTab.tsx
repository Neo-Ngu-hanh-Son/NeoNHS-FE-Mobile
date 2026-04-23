import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { useInfiniteBlogList } from '@/features/blog/hooks/useInfiniteBlogList';
import { useBlogCategory } from '@/features/blog/hooks/useBlogCategory';
import type { Blog, BlogCategoryResponse } from '@/features/blog/types';
import DebouncedInput from '@/components/common/DebouncedInput';
import FilterChips from '@/components/common/FilterChips';
import BlogItem from './BlogItem';

type NavigationProp = StackNavigationProp<MainStackParamList, 'AllDestinations'>;

export default function BlogsTab() {
  const navigation = useNavigation<NavigationProp>();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  // Fetch categories for filter chips
  const { data: categoriesPage } = useBlogCategory({ size: 50 });
  const categories = useMemo(() => categoriesPage?.content ?? [], [categoriesPage]);

  // Infinite blog list with server-side search + category filtering
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteBlogList({
    search: searchQuery,
    categorySlug: selectedCategorySlug ?? undefined,
    size: 6,
  });

  // Flatten pages into a single array
  const blogs = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.content);
  }, [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderEmpty = () => (
    <View className="items-center justify-center py-24 px-10">
      <View
        className="h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.muted + '20' }}
      >
        <Ionicons name="book-outline" size={40} color={theme.mutedForeground} />
      </View>
      <Text className="mt-5 text-lg font-bold" style={{ color: theme.foreground }}>
        No stories yet
      </Text>
      <Text className="mt-2 text-center text-sm leading-5" style={{ color: theme.mutedForeground }}>
        We couldn&apos;t find any blog posts. Try changing the category or pull down to refresh.
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return <View className="h-10" />;
    return (
      <View className="items-center py-6">
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  };

  return (
    <>
      <DebouncedInput
        onSearch={(value) => setSearchQuery(value)}
        placeholder="Search blogs..."
        delay={500}
      />
      <FilterChips<BlogCategoryResponse>
        data={categories}
        selectedId={selectedCategorySlug}
        onSelectedId={setSelectedCategorySlug}
        getId={(item) => item.slug}
        getLabel={(item) => item.name}
        allLabel="All Categories"
      />
      <FlatList
        data={blogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        ListEmptyComponent={isLoading ? null : renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        renderItem={({ item }: { item: Blog }) => (
          <BlogItem
            item={item}
            theme={theme}
            onPress={(id) => navigation.navigate('BlogDetails', { blogId: id })}
          />
        )}
      />
    </>
  );
}
