import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { useMyVouchers } from '../hooks/useMyVouchers';
import UserVoucherCard from '../components/UserVoucherCard';
import { UserVoucherResponse } from '../types/voucher.types';

type TabType = 'available' | 'history';

export default function MyVouchersScreen() {
  const { t } = useTranslation();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const [activeTab, setActiveTab] = useState<TabType>('available');

  const {
    data,
    isLoading,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useMyVouchers(activeTab === 'history', 10);

  const vouchers = data?.pages.flatMap((page) => page.content) ?? [];

  const handleVoucherPress = (userVoucher: UserVoucherResponse) => {
    navigation.navigate('MyVoucherDetail', { userVoucher });
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="ticket-outline" size={64} color={theme.muted} />
      <Text style={[styles.emptyTitle, { color: theme.foreground }]}>
        {t('voucher.empty_title')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.mutedForeground }]}>
        {t('voucher.empty_subtitle')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.foreground }]}>
          {t('profile.actions.coupon_voucher')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'available' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'available' ? theme.primary : theme.mutedForeground }
          ]}>
            {t('voucher.tabs.available')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'history' ? theme.primary : theme.mutedForeground }
          ]}>
            {t('voucher.tabs.history')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={vouchers}
        keyExtractor={(item) => item.userVoucherId}
        renderItem={({ item }) => (
          <UserVoucherCard 
            userVoucher={item} 
            theme={theme} 
            onPress={handleVoucherPress}
          />
        )}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isLoading || (isRefetching && !isFetchingNextPage)}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!isLoading ? renderEmpty() : null}
        ListFooterComponent={isFetchingNextPage ? (
          <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 16 }} />
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
