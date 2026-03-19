import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { WorkshopImageGallery, WorkshopInfoSection, WorkshopSessionList, WorkshopDetailReviews } from '../components';
import { useWorkshopDetail } from '../hooks/useWorkshopDetail';
import { useWorkshopSessions } from '../hooks/useWorkshopSessions';

type Props = StackScreenProps<MainStackParamList, 'WorkshopDetail'>;

export default function WorkshopDetailScreen({ navigation, route }: Props) {
  const { workshopId } = route.params;
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'sessions'>('info');

  const {
    data: workshop,
    isLoading: loading,
    refetch: refetchWorkshop,
  } = useWorkshopDetail(workshopId);

  const {
    data: sessions,
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useWorkshopSessions(workshopId, activeTab === 'sessions');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.allSettled([
      refetchWorkshop(),
      ...(activeTab === 'sessions' ? [refetchSessions()] : []),
    ]).finally(() => setRefreshing(false));
  }, [refetchWorkshop, refetchSessions, activeTab]);

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
        edges={['top']}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text className="mt-3 text-sm" style={{ color: theme.mutedForeground }}>
          Loading workshop...
        </Text>
      </SafeAreaView>
    );
  }

  if (!workshop || workshop.isPublished === false) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
        edges={['top']}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.mutedForeground} />
        <Text className="mt-3 text-lg font-bold" style={{ color: theme.foreground }}>
          {!workshop ? 'Workshop not found' : 'Workshop unavailable'}
        </Text>
        <Text className="mt-1 px-10 text-center text-sm" style={{ color: theme.mutedForeground }}>
          {!workshop
            ? 'This workshop may no longer be available.'
            : 'This workshop is currently not published and cannot be booked.'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 rounded-full px-6 py-2.5"
          style={{ backgroundColor: theme.primary }}>
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={['top']}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between border-b px-4 py-3"
        style={{ borderColor: theme.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="-ml-2 p-2">
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text
          className="ml-2 flex-1 text-lg font-bold"
          style={{ color: theme.foreground }}
          numberOfLines={1}>
          {workshop.name}
        </Text>
        <TouchableOpacity className="-mr-2 p-2">
          <Ionicons name="share-outline" size={22} color={theme.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }>
        {/* Image Gallery */}
        <WorkshopImageGallery
          images={workshop.images}
          primaryColor={theme.primary}
          mutedColor={theme.muted}
        />

        {/* Info Section */}
        <WorkshopInfoSection workshop={workshop} theme={theme} />

        {/* Tabs */}
        <View className="mt-6 flex-row gap-2 px-5">
          <TouchableOpacity
            onPress={() => setActiveTab('info')}
            className={`flex-1 items-center rounded-xl py-3 ${
              activeTab === 'info' ? 'bg-primary' : ''
            }`}
            style={activeTab !== 'info' ? { backgroundColor: theme.muted } : undefined}>
            <Text
              className={`text-sm font-bold ${activeTab === 'info' ? 'text-white' : ''}`}
              style={activeTab !== 'info' ? { color: theme.mutedForeground } : undefined}>
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('sessions')}
            className={`flex-1 items-center rounded-xl py-3 ${
              activeTab === 'sessions' ? 'bg-primary' : ''
            }`}
            style={activeTab !== 'sessions' ? { backgroundColor: theme.muted } : undefined}>
            <Text
              className={`text-sm font-bold ${activeTab === 'sessions' ? 'text-white' : ''}`}
              style={activeTab !== 'sessions' ? { color: theme.mutedForeground } : undefined}>
              Book Sessions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View className="mt-4 px-5">
          {activeTab === 'info' ? (
            <View>
              <Text
                className="mb-3 text-xs font-bold uppercase tracking-wider"
                style={{ color: theme.mutedForeground }}>
                About this workshop
              </Text>
              {workshop.fullDescription ? (
                <Text className="text-sm leading-6" style={{ color: theme.foreground }}>
                  {workshop.fullDescription}
                </Text>
              ) : (
                <Text className="text-sm italic" style={{ color: theme.mutedForeground }}>
                  No detailed description available.
                </Text>
              )}

              {/* Reviews */}
              <View className="mt-6">
                <WorkshopDetailReviews
                  workshopId={workshopId}
                  workshopName={workshop.name}
                  averageRating={workshop.averageRating}
                  totalRatings={workshop.totalRatings}
                  onViewAll={() =>
                    navigation.navigate('WorkshopAllReviews', {
                      workshopId,
                      workshopName: workshop.name,
                      averageRating: workshop.averageRating,
                      totalRatings: workshop.totalRatings,
                    })
                  }
                />
              </View>
            </View>
          ) : (
            <WorkshopSessionList
              sessions={sessions ?? []}
              loading={sessionsLoading}
              theme={theme}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
