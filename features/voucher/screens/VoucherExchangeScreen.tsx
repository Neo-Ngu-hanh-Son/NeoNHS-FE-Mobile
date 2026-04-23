import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAvailableVouchers, useCollectVoucher, VoucherScopeTab } from '../hooks/useAvailableVouchers';
import VoucherCard from '../components/VoucherCard';
import { ApplicableProduct, VoucherFilterParams, VoucherResponse, VoucherType } from '../types/voucher.types';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { useAuth } from '@/features/auth';

// --- Scope Tabs ---
const SCOPE_TABS: { key: VoucherScopeTab; icon: string; iconFocused: string }[] = [
  { key: 'PLATFORM', icon: 'globe-outline', iconFocused: 'globe' },
  { key: 'VENDOR', icon: 'storefront-outline', iconFocused: 'storefront' },
];

// --- Filter options ---
const VOUCHER_TYPE_OPTIONS: { key: VoucherType | undefined; labelKey: string }[] = [
  { key: undefined, labelKey: 'voucher.type_all' },
  { key: 'DISCOUNT', labelKey: 'voucher.discount' },
  { key: 'GIFT_PRODUCT', labelKey: 'voucher.gift' },
];

const PRODUCT_OPTIONS: { key: ApplicableProduct | undefined; labelKey: string }[] = [
  { key: undefined, labelKey: 'voucher.type_all' },
  { key: 'EVENT_TICKET', labelKey: 'voucher.applicable.event' },
  { key: 'WORKSHOP', labelKey: 'voucher.applicable.workshop' },
];

export default function VoucherExchangeScreen() {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { user, updateUser } = useAuth();
  const userPoints = user?.userPoint ?? 0;

  // --- State ---
  const [scopeTab, setScopeTab] = useState<VoucherScopeTab>('PLATFORM');
  const [searchText, setSearchText] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<VoucherType | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<ApplicableProduct | undefined>(undefined);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const filters: VoucherFilterParams = useMemo(
    () => ({
      voucherType: selectedType,
      applicableProduct: selectedProduct,
      code: appliedSearch || undefined,
    }),
    [selectedType, selectedProduct, appliedSearch]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useAvailableVouchers(scopeTab, filters, 10);

  const collectMutation = useCollectVoucher();

  const vouchers = useMemo(() => {
    return data?.pages.flatMap((page) => page.content) ?? [];
  }, [data]);

  // --- Handlers ---
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setAppliedSearch(text.trim());
    }, 800);
  };

  const handleSearchSubmit = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setAppliedSearch(searchText.trim());
  };

  const handleCollect = useCallback(
    (voucherId: string) => {
      const voucher = vouchers.find((v) => v.id === voucherId);
      collectMutation.mutate(voucherId, {
        onSuccess: (response) => {
          if (response.success) {
            // Deduct points locally
            const cost = voucher?.pointCost ?? 0;
            if (cost > 0) {
              updateUser({ userPoint: Math.max(0, userPoints - cost) });
            }
            Alert.alert(t('voucher.collect_success_title'), t('voucher.collect_success_message'));
          } else {
            Alert.alert(t('common.error'), response.message || t('voucher.collect_failed'));
          }
        },
        onError: (error: any) => {
          Alert.alert(t('common.error'), error?.message || t('voucher.collect_failed'));
        },
      });
    },
    [collectMutation, t, vouchers, updateUser, userPoints]
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleVoucherPress = useCallback(
    (voucher: VoucherResponse) => {
      navigation.navigate('VoucherDetail', { voucher });
    },
    [navigation]
  );

  // --- Renderers ---
  const renderVoucher = ({ item }: { item: VoucherResponse }) => (
    <VoucherCard
      voucher={item}
      theme={theme}
      userPoints={userPoints}
      onCollect={handleCollect}
      onPress={handleVoucherPress}
      isCollecting={collectMutation.isPending && collectMutation.variables === item.id}
    />
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="pricetag-outline" size={64} color={theme.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: theme.foreground }]}>
          {t('voucher.empty_title')}
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.mutedForeground }]}>
          {t('voucher.empty_subtitle')}
        </Text>
      </View>
    );
  };

  const renderFilterChip = (
    label: string,
    isActive: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={label}
      style={[
        styles.filterChip,
        {
          backgroundColor: isActive ? theme.primary : theme.card,
          borderColor: isActive ? theme.primary : theme.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: isActive ? '#fff' : theme.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderListHeader = () => (
    <View style={{ gap: 10, marginBottom: 14 }}>
      {/* Voucher Type filter */}
      <View>
        <Text style={[styles.filterLabel, { color: theme.mutedForeground }]}>
          {t('voucher.filter_type')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {VOUCHER_TYPE_OPTIONS.map((opt) =>
            renderFilterChip(
              t(opt.labelKey),
              selectedType === opt.key,
              () => setSelectedType(opt.key)
            )
          )}
        </ScrollView>
      </View>

      {/* Applicable Product filter */}
      <View>
        <Text style={[styles.filterLabel, { color: theme.mutedForeground }]}>
          {t('voucher.filter_product')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {PRODUCT_OPTIONS.map((opt) =>
            renderFilterChip(
              t(opt.labelKey),
              selectedProduct === opt.key,
              () => setSelectedProduct(opt.key)
            )
          )}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.foreground }]}>{t('voucher.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              {t('voucher.subtitle')}
            </Text>
          </View>
          <View style={[styles.pointsBadge, { backgroundColor: `${theme.primary}15` }]}>
            <Ionicons name="diamond" size={16} color={theme.primary} />
            <Text style={[styles.pointsText, { color: theme.primary }]}>
              {userPoints.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Scope Tabs */}
      <View style={[styles.scopeTabsContainer, { borderBottomColor: theme.border }]}>
        {SCOPE_TABS.map((tab) => {
          const isActive = scopeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.scopeTab,
                isActive && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setScopeTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isActive ? tab.iconFocused : tab.icon) as any}
                size={18}
                color={isActive ? theme.primary : theme.mutedForeground}
              />
              <Text
                style={[
                  styles.scopeTabText,
                  { color: isActive ? theme.primary : theme.mutedForeground },
                  isActive && { fontWeight: '700' },
                ]}
              >
                {t(tab.key === 'PLATFORM' ? 'voucher.scope_platform' : 'voucher.scope_vendor')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: theme.foreground }]}
            placeholder={t('voucher.search_placeholder')}
            placeholderTextColor={theme.mutedForeground}
            value={searchText}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchText.length > 0 ? (
            <TouchableOpacity onPress={() => { setSearchText(''); setAppliedSearch(''); }}>
              <Ionicons name="close-circle" size={18} color={theme.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.mutedForeground, marginTop: 12 }}>
            {t('common.loading')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={vouchers}
          renderItem={renderVoucher}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={refetch}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 15,
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  // Scope Tabs
  scopeTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: 16,
  },
  scopeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  scopeTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  // Filters
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
