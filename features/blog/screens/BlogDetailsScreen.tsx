import { ScrollView, Share, TouchableOpacity, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import BlogHeader from '../components/BlogHeader';
import BlogContent from '../components/BlogContent';
import { useBlogDetail } from '../hooks/useBlogDetail';

import type { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FullScreenLoader from '@/components/Loader/FullScreenLoader';
import { useCallback, useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { blogService } from '../services/blogService';
import { BLOG_MINIMUM_READING_TIME_SECONDS } from '../constants';
import { useTheme } from '@/app/providers/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SmartMenu from '@/components/common/MenuTriggerBtn';
import { ReportTypes } from '@/features/report/type';
import { buildBlogLink } from '@/utils/deeplink';

type Props = StackScreenProps<MainStackParamList, 'BlogDetails'>;

export default function BlogDetailsScreen({ route, navigation }: Props) {
  const { blogId } = route.params;
  const { t } = useTranslation();
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const insets = useSafeAreaInsets();


  const { data: blog, isLoading, isError, error, refetch } = useBlogDetail(blogId);

  useEffect(() => {
    if (!blogId) return;
    const timer = setTimeout(() => {
      blogService.incrementBlogView(blogId);
      console.log(`[BlogDetailsPage] Incremented view count for blog ID: ${blogId}`);
    }, BLOG_MINIMUM_READING_TIME_SECONDS * 1000);

    return () => clearTimeout(timer);
  }, [blogId]);

  const handleShare = useCallback(() => {
    if (!blog) return;
    Share.share({
      title: blog.title,
      message: buildBlogLink(blogId),
    });
  }, [blogId, blog]);

  const handleReport = useCallback(() => {
    if (!blog) return;
    navigation.navigate('ReportScreen', {
      initialTargetId: blog.id,
      initialTargetType: ReportTypes.BLOG,
      reportTargetName: blog.title,
    });
  }, [blog, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View>
          <SmartMenu
            trigger={
              <View className="-mr-2 p-2">
                <Ionicons name="ellipsis-vertical-sharp" size={22} color={theme.foreground} />
              </View>
            }
            items={[
              {
                label: t('common.share'), onPress: handleShare,
                icon: <Ionicons name='share' size={16} color={theme.foreground} />
              },
              {
                label: t('common.report'), onPress: handleReport,
                icon: <Ionicons name='flag' size={16} color={theme.destructive} />, isDestructive: true
              },
            ]}
          />
        </View>

      ),
      headerTransparent: false,
      headerTitle: '',
      headerShown: true,
      headerStyle: {
        backgroundColor: theme.background,
        paddingTop: insets.top,
        borderBottomWidth: 0,
      },
    });
  }, [navigation, theme.foreground, insets.top, theme.background, theme.destructive, t, handleShare, handleReport])



  if (isLoading) {
    return <FullScreenLoader message={t('common.loading')} hideBack />;
  }

  if (isError || !blog) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <Text variant="muted">{error?.message ?? t('blog.not_found')}</Text>
        <Button variant="outline" onPress={() => refetch()}>
          <Text>{t('common.retry')}</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="bg-background pb-12"
        showsVerticalScrollIndicator={false}>
        <BlogHeader blog={blog} />
        <BlogContent html={blog.contentHTML ?? ''} />
      </ScrollView>
    </View>
  );
}
