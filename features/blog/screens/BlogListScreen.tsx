import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { Text } from '@/components/ui/text';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { useBlogList } from '@/features/blog/hooks/useBlogList';
import { useBlogFilters } from '@/features/blog/hooks/useBlogFilters';
import BlogList from '@/features/blog/components/BlogList';
import BlogListHeader from '@/features/blog/components/BlogListHeader';
import BlogFilterModal from '@/features/blog/components/BlogFilterModal';
import { BLOG_DEFAULT_FILTERS } from '@/features/blog/types';
import type { Blog, BlogFilters } from '@/features/blog/types';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

type Props = StackScreenProps<MainStackParamList, 'BlogList'>;

export default function BlogListScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList<Blog>>(null);
  const { t } = useTranslation();

  const { currentFilters, setFilters } = useBlogFilters(BLOG_DEFAULT_FILTERS);

  const { blogs, loading, loadMore, refresh, fetchBlogs } = useBlogList({
    search,
    filters: currentFilters,
  });

  useEffect(() => {
    void fetchBlogs();
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [fetchBlogs, search, currentFilters]);

  const handleEndReached = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void refresh().finally(() => setRefreshing(false));
  }, [refresh]);

  const handlePressBlog = useCallback(
    (blog: Blog) => {
      navigation.navigate('BlogDetails', { blogId: blog.id });
    },
    [navigation]
  );

  const handleOpenFilters = useCallback(() => {
    Keyboard.dismiss();
    setFilterModalVisible(true);
  }, []);

  const handleSearchSubmit = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleApplyFilters = useCallback(
    (filters: BlogFilters) => {
      setFilters(filters);
    },
    [setFilters]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-start gap-4 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onPress={goBack}
          accessibilityLabel="Go back"
          className="rounded-full bg-black/30">
          <Ionicons name="arrow-back" size={22} color="white" />
        </Button>
        <Text className="px-4 pt-3 text-2xl font-bold text-foreground">{t('blog.title')}</Text>
      </View>
      <BlogListHeader
        search={search}
        onSearchSubmit={handleSearchSubmit}
        onOpenFilters={handleOpenFilters}
      />
      <BlogList
        listRef={listRef}
        data={blogs}
        loading={loading}
        refreshing={refreshing}
        onEndReached={handleEndReached}
        onRefresh={handleRefresh}
        onPressBlog={handlePressBlog}
      />
      <BlogFilterModal
        visible={isFilterModalVisible}
        initialFilters={currentFilters}
        onApply={handleApplyFilters}
        onClose={() => setFilterModalVisible(false)}
      />
    </SafeAreaView>
  );
}
