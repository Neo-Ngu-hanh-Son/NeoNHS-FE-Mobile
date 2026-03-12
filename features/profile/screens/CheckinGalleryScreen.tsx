import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { GestureViewer, useGestureViewerState } from 'react-native-gesture-image-viewer';

import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useUserCheckinGallery } from '@/features/profile/hooks/useUserCheckinGallery';
import type { CheckinGalleryImage } from '@/features/profile/types';
import FullScreenLoader from '@/components/Loader/FullScreenLoader';

type CheckinGalleryScreenProps = StackScreenProps<MainStackParamList, 'CheckinGallery'>;
type GalleryGroupingMode = 'destination' | 'date';

type GroupedGallerySection = {
  title: string;
  items: CheckinGalleryImage[];
};

const GRID_COLUMN_COUNT = 3;

function formatDateTitle(isoDate: string) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(isoDate: string) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

export default function CheckinGalleryScreen({ navigation }: CheckinGalleryScreenProps) {
  const { images, isLoading, isError, refetch } = useUserCheckinGallery();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [groupingMode, setGroupingMode] = useState<GalleryGroupingMode>('date');
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const groupedSections = useMemo(() => {
    const grouped = new Map<string, CheckinGalleryImage[]>();

    images.forEach((image) => {
      const sectionKey =
        groupingMode === 'date'
          ? formatDateTitle(image.takenAt)
          : image.parentPointName || image.destinationName || 'Unknown destination';

      const currentItems = grouped.get(sectionKey) ?? [];
      currentItems.push(image);
      grouped.set(sectionKey, currentItems);
    });

    return Array.from(grouped.entries()).map(([title, items]) => ({ title, items }));
  }, [groupingMode, images]);

  const currentViewerImage = images[selectedIndex] ?? null;
  const { currentIndex } = useGestureViewerState();
  const activeViewerImage = images[currentIndex] ?? currentViewerImage;

  const openViewer = (image: CheckinGalleryImage) => {
    const index = images.findIndex((item) => item.id === image.id);
    setSelectedIndex(index < 0 ? 0 : index);
    setViewerVisible(true);
  };

  if (isLoading) {
    return <FullScreenLoader message="Loading your check-in photos..." />;
  }

  const renderSection = (section: GroupedGallerySection) => {
    const rows = chunkArray(section.items, GRID_COLUMN_COUNT);

    return (
      <View key={section.title} style={styles.sectionContainer}>
        <Text className="mb-3 text-sm font-semibold text-muted-foreground">{section.title}</Text>
        {rows.map((row, rowIndex) => (
          <View key={`${section.title}-${rowIndex}`} style={styles.gridRow}>
            {row.map((image) => (
              <Pressable
                key={image.id}
                style={styles.gridItem}
                onPress={() => openViewer(image)}
              >
                <Image source={{ uri: image.imageUrl }} style={styles.gridImage} resizeMode="cover" />
              </Pressable>
            ))}
            {row.length < GRID_COLUMN_COUNT
              ? Array.from({ length: GRID_COLUMN_COUNT - row.length }).map((_, emptyIndex) => (
                <View key={`${section.title}-${rowIndex}-empty-${emptyIndex}`} style={styles.gridItem} />
              ))
              : null}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconButton}>
          <Ionicons name="chevron-back" size={22} color={theme.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold" style={{ color: theme.foreground }}>
          Check-in Photos
        </Text>
        <View style={styles.headerIconButton} />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: groupingMode === 'date' ? theme.primary : theme.card,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setGroupingMode('date')}
        >
          <Text style={{ color: groupingMode === 'date' ? 'white' : theme.foreground }}>Group by Date</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: groupingMode === 'destination' ? theme.primary : theme.card,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setGroupingMode('destination')}
        >
          <Text style={{ color: groupingMode === 'destination' ? 'white' : theme.foreground }}>
            Group by Destination
          </Text>
        </TouchableOpacity>
      </View>

      {!isLoading && isError ? (
        <View style={styles.centerState}>
          <Text className="mb-3 text-sm text-foreground">Failed to load check-in photos.</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={() => refetch()}
          >
            <Text style={{ color: 'white' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!isLoading && !isError ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {groupedSections.length ? (
            groupedSections.map((section) => renderSection(section))
          ) : (
            <View style={styles.centerState}>
              <Text className="text-sm text-muted-foreground">No check-in photos yet.</Text>
            </View>
          )}
        </ScrollView>
      ) : null}

      <Modal visible={viewerVisible} transparent animationType="fade" onRequestClose={() => setViewerVisible(false)}>
        <GestureViewer
          data={images}
          initialIndex={selectedIndex}
          ListComponent={ScrollView}
          renderItem={(item) => (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.viewerImage}
              resizeMode="contain"
            />
          )}
          onDismiss={() => setViewerVisible(false)}
          renderContainer={(children, helpers) => (
            <View style={styles.viewerContainer}>
              {children}

              <TouchableOpacity style={styles.viewerCloseButton} onPress={() => helpers.dismiss()}>
                <Ionicons name="close" size={22} color="white" />
              </TouchableOpacity>

              {activeViewerImage ? (
                <View style={styles.viewerMetadataContainer}>
                  <Text className="text-base font-semibold text-white">
                    {activeViewerImage.caption || 'No caption'}
                  </Text>
                  <Text className="mt-1 text-xs text-white/80">
                    {formatDateTime(activeViewerImage.takenAt)}
                  </Text>
                  <Text className="mt-1 text-xs text-white/80">
                    {activeViewerImage.parentPointName ||
                      activeViewerImage.destinationName ||
                      activeViewerImage.checkinPointName ||
                      'Unknown destination'}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        />
      </Modal>
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
  headerIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionContainer: {
    marginBottom: 18,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  gridItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  retryButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerCloseButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerMetadataContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
});
