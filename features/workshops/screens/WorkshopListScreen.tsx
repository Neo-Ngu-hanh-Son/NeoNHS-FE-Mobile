import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { MainStackParamList } from "@/app/navigations/NavigationParamTypes";
import { WorkshopTemplateResponse } from "../types";
import { MOCK_WORKSHOP_TEMPLATES, MOCK_TAGS } from "../data/mockData";
import { formatPrice, formatDuration } from "../utils/helpers";

type SortOption = {
  label: string;
  value: string;
  dir: "asc" | "desc";
};

const SORT_OPTIONS: SortOption[] = [
  { label: "Newest", value: "createdAt", dir: "desc" },
  { label: "Top Rated", value: "averageRating", dir: "desc" },
  { label: "Price: Low", value: "defaultPrice", dir: "asc" },
  { label: "Price: High", value: "defaultPrice", dir: "desc" },
  { label: "Duration", value: "estimatedDuration", dir: "asc" },
];

export interface WorkshopListContentProps {
  onNavigateToDetail: (workshopId: string) => void;
}

/**
 * Workshop list UI: search, filter (tags + sort), and list.
 * Can be embedded in AllDestinationsScreen or used standalone.
 */
export function WorkshopListContent({ onNavigateToDetail }: WorkshopListContentProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>(SORT_OPTIONS[0]);
  const [refreshing, setRefreshing] = useState(false);

  const filteredWorkshops = useMemo(() => {
    let result = [...MOCK_WORKSHOP_TEMPLATES];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.shortDescription.toLowerCase().includes(q) ||
          w.vendorName.toLowerCase().includes(q)
      );
    }

    if (selectedTag) {
      result = result.filter((w) => w.tags.some((t) => t.id === selectedTag));
    }

    result.sort((a, b) => {
      const key = selectedSort.value as keyof WorkshopTemplateResponse;
      const aVal = a[key] as number | string;
      const bVal = b[key] as number | string;
      if (selectedSort.dir === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [searchQuery, selectedTag, selectedSort]);

  const activeFiltersCount = (selectedTag ? 1 : 0) + (selectedSort.label !== "Newest" ? 1 : 0);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const clearFilters = () => {
    setSelectedTag(null);
    setSelectedSort(SORT_OPTIONS[0]);
  };

  const renderSearchAndFilter = () => (
    <View className="px-4 pt-3">
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
          <Ionicons name="options-outline" size={20} color={showFilters ? "#fff" : theme.foreground} />
          {activeFiltersCount > 0 && !showFilters && (
            <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 items-center justify-center">
              <Text className="text-white text-[9px] font-bold">{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

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
            {MOCK_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                className="px-3 py-1.5 rounded-full flex-row items-center gap-1"
                style={{
                  backgroundColor: selectedTag === tag.id ? tag.tagColor : tag.tagColor + "15",
                }}
                onPress={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
              >
                {tag.iconUrl && (
                  <Image source={{ uri: tag.iconUrl }} className="w-3.5 h-3.5 rounded-full" />
                )}
                <Text
                  className="text-xs font-bold"
                  style={{ color: selectedTag === tag.id ? "#fff" : tag.tagColor }}
                >
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
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

      <View className="flex-row items-center justify-between mt-2 px-1">
        <Text className="text-xs" style={{ color: theme.mutedForeground }}>
          {filteredWorkshops.length} workshop{filteredWorkshops.length !== 1 ? "s" : ""} found
        </Text>
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

  const renderWorkshopItem = (workshop: WorkshopTemplateResponse) => {
    const thumbnail =
      workshop.images.find((img) => img.isThumbnail) || workshop.images[0];
    return (
      <TouchableOpacity
        key={workshop.id}
        onPress={() => onNavigateToDetail(workshop.id)}
        className="p-3 rounded-2xl border flex-row items-center gap-4 mb-3"
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
                  <Text
                    className="text-[10px] font-bold"
                    style={{ color: tag.tagColor }}
                  >
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
              <Text
                className="text-[10px]"
                style={{ color: theme.mutedForeground }}
              >
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

          <View className="flex-row items-center justify-between mt-1">
            <Text
              className="text-xs"
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
  };

  const renderList = () => {
    if (filteredWorkshops.length === 0) {
      return (
        <View className="py-16 items-center">
          <Ionicons name="search-outline" size={40} color={theme.mutedForeground} />
          <Text
            className="mt-3 text-base font-bold"
            style={{ color: theme.foreground }}
          >
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
    }
    return (
      <View className="px-4 pb-10">
        {filteredWorkshops.map(renderWorkshopItem)}
      </View>
    );
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >
      {renderSearchAndFilter()}
      {renderList()}
    </ScrollView>
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
