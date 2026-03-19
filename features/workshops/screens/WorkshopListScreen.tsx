import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { MainStackParamList } from "@/app/navigations/NavigationParamTypes";
import { WorkshopTemplateResponse, WorkshopSearchParams } from "../types";
import { useWorkshopSearch } from "../hooks/useWorkshopSearch";
import { useWorkshopTags } from "../hooks/useWorkshopTags";
import { formatPrice, formatDuration } from "../utils/helpers";

type SortOption = {
  label: string;
  value: WorkshopSearchParams["sortBy"];
  dir: "asc" | "desc";
};

const SORT_OPTIONS: SortOption[] = [
  { label: "Newest", value: "createdAt", dir: "desc" },
  { label: "Top Rated", value: "averageRating", dir: "desc" },
  { label: "Price: Low", value: "defaultPrice", dir: "asc" },
  { label: "Price: High", value: "defaultPrice", dir: "desc" },
  { label: "Duration", value: "estimatedDuration", dir: "asc" },
];

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 400;

export interface WorkshopListContentProps {
  onNavigateToDetail: (workshopId: string) => void;
}

/**
 * Workshop list UI: search, filter (tags + sort), and list.
 * Fetches data from backend with server-side search/filter/sort + infinite scroll.
 * Can be embedded in AllDestinationsScreen or used standalone.
 */
export function WorkshopListContent({ onNavigateToDetail }: WorkshopListContentProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  // ── Local filter/sort state ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>(SORT_OPTIONS[0]);

  // Debounce keyword input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchQuery.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Build search params (everything except page — handled by useInfiniteQuery) ──
  const searchParams = useMemo<Omit<WorkshopSearchParams, "page">>(() => {
    const params: Omit<WorkshopSearchParams, "page"> = {
      size: PAGE_SIZE,
      sortBy: selectedSort.value,
      sortDir: selectedSort.dir,
    };
    if (debouncedKeyword) params.keyword = debouncedKeyword;
    if (selectedTag) params.tagId = selectedTag;
    return params;
  }, [debouncedKeyword, selectedTag, selectedSort]);

  // ── Data hooks ───────────────────────────────────────────────────────
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
    isError,
  } = useWorkshopSearch(searchParams);

  const { data: tags, isLoading: isLoadingTags } = useWorkshopTags();

  // Flatten all pages into a single array and filter out unpublished workshops
  const workshops = useMemo(
    () => data?.pages.flatMap((page) => page.content).filter((w) => w.isPublished !== false) ?? [],
    [data],
  );

  const totalElements = data?.pages[0]?.totalElements ?? 0;

  const activeFiltersCount =
    (selectedTag ? 1 : 0) + (selectedSort.label !== "Newest" ? 1 : 0);

  const clearFilters = () => {
    setSelectedTag(null);
    setSelectedSort(SORT_OPTIONS[0]);
  };

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Header: search bar + filter panel ────────────────────────────────
  const renderHeader = () => (
    <View className="px-4 pt-3">
      {/* Search bar + filter toggle */}
      <View className="flex-row gap-3">
        <View
          className="flex-1 flex-row items-center rounded-xl px-4 py-3 gap-2"
          style={{ backgroundColor: theme.muted }}
        >
          <Ionicons name="search" size={20} color={theme.mutedForeground} />
          <TextInput
            placeholder="Search workshops..."
            placeholderTextColor={theme.mutedForeground}
            className="flex-1 text-sm"
            style={{ color: theme.foreground, paddingTop: 0, paddingBottom: 0 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={theme.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          className="p-3 rounded-xl items-center justify-center relative"
          style={{ backgroundColor: showFilters ? theme.primary : theme.muted }}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={showFilters ? "#fff" : theme.foreground}
          />
          {activeFiltersCount > 0 && !showFilters && (
            <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 items-center justify-center">
              <Text className="text-white text-[9px] font-bold">{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Expandable filter panel */}
      {showFilters && (
        <View
          className="mt-3 rounded-xl border p-3"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <Text
            className="text-xs font-bold uppercase tracking-wider mb-2"
            style={{ color: theme.mutedForeground }}
          >
            Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6 }}
          >
            <TouchableOpacity
              className="px-3 py-1.5 rounded-full flex-row items-center gap-1"
              style={{ backgroundColor: !selectedTag ? theme.primary : theme.muted }}
              onPress={() => setSelectedTag(null)}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: !selectedTag ? "#fff" : theme.mutedForeground }}
              >
                All
              </Text>
            </TouchableOpacity>
            {isLoadingTags ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              tags?.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  className="px-3 py-1.5 rounded-full flex-row items-center gap-1"
                  style={{
                    backgroundColor:
                      selectedTag === tag.id ? tag.tagColor : tag.tagColor + "15",
                  }}
                  onPress={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                >
                  {tag.iconUrl && (
                    <Image
                      source={{ uri: tag.iconUrl }}
                      className="w-3.5 h-3.5 rounded-full"
                    />
                  )}
                  <Text
                    className="text-xs font-bold"
                    style={{ color: selectedTag === tag.id ? "#fff" : tag.tagColor }}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <Text
            className="text-xs font-bold uppercase tracking-wider mt-3 mb-2"
            style={{ color: theme.mutedForeground }}
          >
            Sort by
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.label}
                className="px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor:
                    selectedSort.label === option.label ? theme.primary : theme.muted,
                }}
                onPress={() => setSelectedSort(option)}
              >
                <Text
                  className="text-xs font-bold"
                  style={{
                    color:
                      selectedSort.label === option.label ? "#fff" : theme.mutedForeground,
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {(selectedTag || selectedSort.label !== "Newest") && (
            <TouchableOpacity
              className="mt-3 flex-row items-center justify-center gap-1"
              onPress={clearFilters}
            >
              <Ionicons name="refresh-outline" size={14} color={theme.primary} />
              <Text className="text-xs font-semibold" style={{ color: theme.primary }}>
                Clear filters
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Result count + current sort indicator */}
      <View className="flex-row items-center justify-between mt-2 px-1 mb-1">
        {isLoading ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color={theme.primary} />
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              Searching…
            </Text>
          </View>
        ) : (
          <Text className="text-xs" style={{ color: theme.mutedForeground }}>
            {totalElements} workshop{totalElements !== 1 ? "s" : ""} found
          </Text>
        )}
        {selectedSort.label !== "Newest" && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="swap-vertical-outline" size={12} color={theme.mutedForeground} />
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              {selectedSort.label}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // ── Workshop card (horizontal layout) ────────────────────────────────
  const renderWorkshopItem = useCallback(
    ({ item: workshop }: { item: WorkshopTemplateResponse }) => {
      const thumbnail =
        workshop.images.find((img) => img.isThumbnail) || workshop.images[0];
      return (
        <TouchableOpacity
          onPress={() => onNavigateToDetail(workshop.id)}
          className="mx-4 p-3 rounded-2xl border flex-row items-center gap-4 mb-3"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <View className="relative">
            {thumbnail ? (
              <Image
                source={{ uri: thumbnail.imageUrl }}
                className="w-24 h-24 rounded-2xl"
                style={{ resizeMode: "cover" }}
              />
            ) : (
              <View
                className="w-24 h-24 rounded-2xl items-center justify-center"
                style={{ backgroundColor: theme.muted }}
              >
                <Ionicons name="image-outline" size={24} color={theme.mutedForeground} />
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text
              className="font-bold text-base"
              style={{ color: theme.foreground }}
              numberOfLines={1}
            >
              {workshop.name}
            </Text>

            {workshop.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-1 mt-1">
                {workshop.tags.map((tag) => (
                  <View
                    key={tag.id}
                    className="px-2 py-0.5 rounded"
                    style={{ backgroundColor: tag.tagColor + "18" }}
                  >
                    <Text className="text-[10px] font-bold" style={{ color: tag.tagColor }}>
                      {tag.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View className="flex-row items-center gap-3 mt-1.5">
              <View className="flex-row items-center gap-1">
                <Ionicons name="star" size={13} color="#eab308" />
                <Text className="text-xs font-bold" style={{ color: theme.foreground }}>
                  {workshop.averageRating.toFixed(1)}
                </Text>
                <Text className="text-[10px]" style={{ color: theme.mutedForeground }}>
                  ({workshop.totalRatings})
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="time-outline" size={13} color={theme.mutedForeground} />
                <Text className="text-xs" style={{ color: theme.mutedForeground }}>
                  {formatDuration(workshop.estimatedDuration)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <Text
                className="text-xs flex-shrink"
                style={{ color: theme.mutedForeground }}
                numberOfLines={1}
              >
                {workshop.vendorName}
              </Text>
              <Text className="text-sm font-bold" style={{ color: theme.primary }}>
                {formatPrice(workshop.defaultPrice)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.muted} />
        </TouchableOpacity>
      );
    },
    [theme, onNavigateToDetail],
  );

  // ── Empty / Error / Initial-loading states ───────────────────────────
  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="py-16 items-center">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text className="mt-3 text-sm" style={{ color: theme.mutedForeground }}>
            Loading workshops…
          </Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View className="py-16 items-center">
          <Ionicons name="cloud-offline-outline" size={40} color={theme.mutedForeground} />
          <Text className="mt-3 text-base font-bold" style={{ color: theme.foreground }}>
            Something went wrong
          </Text>
          <Text
            className="mt-1 text-sm text-center px-10"
            style={{ color: theme.mutedForeground }}
          >
            Could not load workshops. Please try again.
          </Text>
          <TouchableOpacity
            className="mt-4 px-6 py-2 rounded-full"
            style={{ backgroundColor: theme.primary }}
            onPress={() => refetch()}
          >
            <Text className="text-sm font-bold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="py-16 items-center">
        <Ionicons name="search-outline" size={40} color={theme.mutedForeground} />
        <Text className="mt-3 text-base font-bold" style={{ color: theme.foreground }}>
          No workshops found
        </Text>
        <Text
          className="mt-1 text-sm text-center px-10"
          style={{ color: theme.mutedForeground }}
        >
          Try adjusting your search or filters.
        </Text>
      </View>
    );
  };

  // ── Footer (load-more spinner) ───────────────────────────────────────
  const renderFooter = () => {
    if (!isFetchingNextPage) return <View style={{ height: 120 }} />;
    return (
      <View className="py-6 items-center" style={{ paddingBottom: 120 }}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  };

  // ── Main render ──────────────────────────────────────────────────────
  return (
    <FlatList
      data={workshops}
      keyExtractor={(item) => item.id}
      renderItem={renderWorkshopItem}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching && !isFetchingNextPage}
          onRefresh={() => refetch()}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    />
  );
}

// ── Full Screen (for direct navigation) ────────────────────────────────

type WorkshopListScreenProps = StackScreenProps<MainStackParamList, "WorkshopList">;

export default function WorkshopListScreen({ navigation }: WorkshopListScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={["top"]}>
      <View
        className="px-4 py-3 flex-row items-center justify-between border-b"
        style={{ borderColor: theme.border }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 ml-2" style={{ color: theme.foreground }}>
          Workshops
        </Text>
        <View className="w-10" />
      </View>
      <WorkshopListContent
        onNavigateToDetail={(id) => navigation.navigate("WorkshopDetail", { workshopId: id })}
      />
    </SafeAreaView>
  );
}
