import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, View, Text, RefreshControl, SectionList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SmartImage } from '@/components/ui/smart-image';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { useAttractions } from '../../hooks/useAttractions';
import { Attraction, PointPreview } from '@/features/map/types';
import PointItem from './PointItem';
import DebouncedInput from '@/components/common/DebouncedInput';
import DestinationListHeader from './DestinationListHeader';
import DestinationHeader from './DestinationHeader';
import DestinationFilterChips from './DestinationFilterChips';
import { normalizeString } from '@/utils/normalizeUtils';
import FilterChips from '@/components/common/FilterChips';

type NavigationProp = StackNavigationProp<MainStackParamList, 'AllDestinations'>;

export default function DestinationsTab({ initialAttractionId }: { initialAttractionId?: string }) {
  const navigation = useNavigation<NavigationProp>();

  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(initialAttractionId || null);

  const { data: attractions, isLoading, refetch } = useAttractions(searchQuery);
  const sectionListRef = useRef<SectionList>(null);

  useEffect(() => {
    if (initialAttractionId) {
      setSelectedAttractionId(initialAttractionId);
    }
  }, [initialAttractionId]);

  const sections = useMemo(() => {
    if (!attractions) return [];
    let filtered = attractions;
    if (selectedAttractionId) {
      filtered = attractions.filter(attr => attr.id === selectedAttractionId);
    }
    return filtered.map((attr) => {
      const originalPoints = attr.points ?? [];

      if (!searchQuery.trim()) {
        return {
          attraction: attr,
          title: attr.name,
          data: originalPoints,
        };
      }

      // Handle bubble the result to the top
      const query = normalizeString(searchQuery);
      const matchingPoints = originalPoints.filter(p =>
        normalizeString(p.name).includes(query)
      );
      const nonMatchingPoints = originalPoints.filter(p =>
        !normalizeString(p.name).includes(query)
      );

      return {
        attraction: attr,
        title: attr.name,
        data: [...matchingPoints, ...nonMatchingPoints],
      };
    });
  }, [attractions, selectedAttractionId, searchQuery]);

  useEffect(() => {
    // Check if we have sections and at least one item in the first section
    if (sections.length > 0 && sections[0].data.length > 0) {
      sectionListRef.current?.scrollToLocation({
        sectionIndex: 0,
        itemIndex: 0,
        viewOffset: 0,   // Adjust this if your sticky header overlaps
        animated: true,
      });
    }
  }, [searchQuery, sections]);

  const renderEmpty = () => (
    <View className="items-center justify-center py-24 px-10">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-muted/20" style={{ backgroundColor: theme.muted + '20' }}>
        <Ionicons name="map-outline" size={40} color={theme.mutedForeground} />
      </View>
      <Text className="mt-5 text-lg font-bold" style={{ color: theme.foreground }}>
        No destinations yet
      </Text>
      <Text className="mt-2 text-center text-sm leading-5" style={{ color: theme.mutedForeground }}>
        We couldn&apos;t find any destinations, try change your attractions filter and try again
      </Text>
    </View>
  );

  return (
    <>
      <DebouncedInput
        onSearch={(value) => setSearchQuery(value)}
        placeholder={`Search destinations...`}
        delay={500}
      />
      <FilterChips<Attraction>
        data={attractions || []}
        selectedId={selectedAttractionId}
        onSelectedId={setSelectedAttractionId}
        getId={(item) => item.id}
        getLabel={(item) => item.name}
      />
      <SectionList
        ref={sectionListRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={true}
        // Increased bottom padding for better reachability
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }

        // ── SECTION HEADER (The District) ──
        renderSectionHeader={({ section }) => {
          const { attraction } = section;
          return <DestinationListHeader attraction={attraction} />;
        }}

        // ── SECTION ITEMS (The Points) ──
        renderItem={({ item }: { item: PointPreview }) => {
          return (
            <PointItem item={item} theme={theme} onPress={(id) => navigation.navigate('PointDetail', { pointId: id })} />
          )
        }}

        // ── SECTION FOOTER ──
        renderSectionFooter={({ section }) => {
          if (section.data.length > 0) return <View className="h-4" />; // Spacer between sections
          return (
            <View className="mx-4 mt-3 items-center rounded-2xl border border-dashed p-6" style={{ borderColor: theme.border }}>
              <Ionicons name="alert-circle-outline" size={20} color={theme.muted} />
              <Text className="text-xs mt-2 text-center" style={{ color: theme.mutedForeground }}>
                No spots registered in {section.title} yet.
              </Text>
            </View>
          );
        }}
      />
    </>
  );
}