import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, View, Text, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SmartImage } from '@/components/ui/smart-image';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { Attraction } from '@/features/map';
import { useAttractions } from '../../hooks/useAttractions';
import { RefreshableScrollView } from '@/components/common/RefreshableScrollView';
import { FlatList } from 'react-native-gesture-handler';

type NavigationProp = StackNavigationProp<MainStackParamList, 'AllDestinations'>;

export default function AttractionsTab({ initialAttractionId }: { initialAttractionId?: string }) {
  const navigation = useNavigation<NavigationProp>();

  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const { data: attractions, isLoading, refetch } = useAttractions();

  useEffect(() => {
    // If initial attractions id is exist, we just direct user to the attraction destinations screen
    if (initialAttractionId) {
      navigation.navigate('AttractionDestinationScreen', {
        attractionId: initialAttractionId,
      });
    }
  }, [initialAttractionId, navigation]);

  // const filteredAttractions = useMemo(() => {
  //   const source = selectedAttractionId ? (points ?? []) : (attractions ?? []);
  //   if (!searchQuery.trim()) return source;
  //   const q = searchQuery.toLowerCase();
  //   return source.filter(
  //     (a) =>
  //       a.name.toLowerCase().includes(q) ||
  //       ((a as Attraction).address && (a as Attraction).address.toLowerCase().includes(q))
  //   );
  // }, [attractions, points, selectedAttractionId, searchQuery]);

  // const data = filteredAttractions;
  // if (data.length === 0) {
  //   return (
  //     <View className="items-center py-16">
  //       <Ionicons name="location-outline" size={40} color={theme.mutedForeground} />
  //       <Text className="mt-3 text-base font-bold" style={{ color: theme.foreground }}>
  //         No destinations found
  //       </Text>
  //     </View>
  //   );
  // }

  const renderEmpty = () => (
    <View className="items-center py-16">
      <Ionicons name="location-outline" size={40} color={theme.mutedForeground} />
      <Text className="mt-3 text-base font-bold" style={{ color: theme.foreground }}>
        No attractions found
      </Text>
      <Text className="text-sm mt-1" style={{ color: theme.mutedForeground }}>
        Pull down to refresh
      </Text>
    </View>
  );

  if (!attractions || attractions.length === 0) {
    return (
      <View className="items-center py-16">
        <Ionicons name="location-outline" size={40} color={theme.mutedForeground} />
        <Text className="mt-3 text-base font-bold" style={{ color: theme.foreground }}>
          No attractions found
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={attractions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ flexGrow: 1, padding: 16 }}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('AttractionDestinationScreen', {
              attractionId: item.id,
            });
          }}
          className="mb-3 flex-row items-center gap-4 rounded-2xl border p-3"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <SmartImage uri={item.thumbnailUrl} className="h-24 w-24 rounded-2xl object-cover" />
          <View className="flex-1">
            <Text className="text-lg font-bold" style={{ color: theme.foreground }}>
              {item.name}
            </Text>
            <View className="mt-1 gap-1">
              <Text className="text-sm" style={{ color: theme.mutedForeground }}>
                {(item as Attraction).address}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <View
                  className={`h-2 w-2 rounded-full ${(item as Attraction).status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <Text
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: (item as Attraction).status === 'OPEN' ? '#10b981' : '#ef4444',
                  }}>
                  {(item as Attraction).status || 'CLOSED'}
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.muted} />
        </TouchableOpacity>
      )}
    />
  );
}
