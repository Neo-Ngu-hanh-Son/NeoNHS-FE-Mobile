import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { TicketCatalogResponse } from '../types';
import {
  EventImageGallery,
  EventInfoSection,
  TicketCatalogList,
  EventDetailReviews,
  EventContent,
} from '../components';
import { useEventDetail } from '../hooks/useEventDetail';
import { useTicketCatalogs } from '../hooks/useTicketCatalogs';

type Props = StackScreenProps<MainStackParamList, 'EventDetail'>;

export default function EventDetailScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'tickets'>('info');
  const [isReviewSheetVisible, setIsReviewSheetVisible] = useState(false);

  const { data: event, isLoading: loading, refetch: refetchEvent } = useEventDetail(eventId);

  const {
    data: tickets,
    isLoading: ticketsLoading,
    refetch: refetchTickets,
  } = useTicketCatalogs(eventId, activeTab === 'tickets');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.allSettled([refetchEvent(), ...(activeTab === 'tickets' ? [refetchTickets()] : [])]).finally(() =>
      setRefreshing(false)
    );
  }, [refetchEvent, refetchTickets, activeTab]);

  // ── Buy ticket handler (placeholder for future implementation) ──

  const handleBuyTicket = useCallback((ticket: TicketCatalogResponse) => {
    // TODO: Implement actual buy/add-to-cart logic
    Alert.alert(
      'Buy Ticket',
      `You selected "${ticket.name}" — ${ticket.price.toLocaleString('vi-VN')}đ.\n\nThis feature will be available soon!`,
      [{ text: 'OK' }]
    );
  }, []);

  const handleOpenTimelineMap = useCallback(() => {
    navigation.navigate('EventTimeLineMap', { eventId });
  }, [eventId, navigation]);

  // ── Loading state ──

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
        edges={['top']}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text className="mt-3 text-sm" style={{ color: theme.mutedForeground }}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
        edges={['top']}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.mutedForeground} />
        <Text className="mt-3 text-lg font-bold" style={{ color: theme.foreground }}>
          Event not found
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 rounded-full px-6 py-2"
          style={{ backgroundColor: theme.primary }}>
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Render ──

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b px-4 py-3" style={{ borderColor: theme.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="-ml-2 p-2">
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text className="ml-2 flex-1 text-lg font-bold" style={{ color: theme.foreground }} numberOfLines={1}>
          {event.name}
        </Text>
        <View className="w-10" />
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
        <EventImageGallery
          images={event.images ?? undefined}
          thumbnailUrl={event.thumbnailUrl}
          primaryColor={theme.primary}
          mutedColor={theme.muted}
        />

        {/* Event Info (title, status, date, location, participants, price, tags) */}
        <EventInfoSection event={event} theme={theme} onOpenTimelineMap={handleOpenTimelineMap} />

        {/* Tabs */}
        <View className="mt-6 flex-row gap-2 px-5">
          <TouchableOpacity
            onPress={() => setActiveTab('info')}
            className={`flex-1 items-center rounded-xl py-3 ${activeTab === 'info' ? 'bg-primary' : ''}`}
            style={activeTab !== 'info' ? { backgroundColor: theme.muted } : undefined}>
            <Text
              className={`text-sm font-bold ${activeTab === 'info' ? 'text-white' : ''}`}
              style={activeTab !== 'info' ? { color: theme.mutedForeground } : undefined}>
              Details
            </Text>
          </TouchableOpacity>
          {event.isTicketRequired && (
            <TouchableOpacity
              onPress={() => setActiveTab('tickets')}
              className={`flex-1 items-center rounded-xl py-3 ${activeTab === 'tickets' ? 'bg-primary' : ''}`}
              style={activeTab !== 'tickets' ? { backgroundColor: theme.muted } : undefined}>
              <Text
                className={`text-sm font-bold ${activeTab === 'tickets' ? 'text-white' : ''}`}
                style={activeTab !== 'tickets' ? { color: theme.mutedForeground } : undefined}>
                Buy Tickets
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Content */}
        <View className="mt-4 px-5">
          {activeTab === 'info' ? (
            <View>
              {event.fullDescription ? (
                <EventContent html={event.fullDescription} />
              ) : (
                <Text className="text-sm italic" style={{ color: theme.mutedForeground }}>
                  No detailed description available.
                </Text>
              )}

              {/* Reviews */}
              <View className="mt-6">
                <EventDetailReviews
                  eventId={eventId}
                  eventName={event.name}
                  onViewAll={() =>
                    navigation.navigate('EventAllReviews', {
                      eventId,
                      eventName: event.name,
                      averageRating: event.averageRating ?? 0,
                      totalRatings: event.totalRatings ?? 0,
                    })
                  }
                  onSheetVisibilityChange={setIsReviewSheetVisible}
                />
              </View>
            </View>
          ) : (
            <TicketCatalogList
              tickets={tickets ?? []}
              loading={ticketsLoading}
              theme={theme}
              eventStatus={event.status}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
