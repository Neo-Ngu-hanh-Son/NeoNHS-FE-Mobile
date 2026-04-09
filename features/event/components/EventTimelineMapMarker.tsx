import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Marker } from 'react-native-maps';
import { StrokeText } from '@charmy.tech/react-native-stroke-text';
import type { EventMapPoint } from '../types';

type EventTimelineMapMarkerProps = {
  point: EventMapPoint;
  showName: boolean;
  disabled?: boolean;
  onPress?: (point: EventMapPoint) => void;
};

const LABEL_WIDTH = 150;
const LABEL_HEIGHT = 18;
const LABEL_GAP = 6;

export default function EventTimelineMapMarker({
  point,
  showName,
  disabled = false,
  onPress,
}: EventTimelineMapMarkerProps) {
  const iconUri = point.eventPointTag?.iconUrl ?? point.thumbnailUrl ?? null;

  return (
    <Marker
      key={point.id}
      tracksViewChanges={true}
      coordinate={{
        latitude: point.latitude,
        longitude: point.longitude,
      }}
      onPress={() => {
        if (disabled) {
          return;
        }
        onPress?.(point);
      }}
      zIndex={0}>
      <View style={styles.container}>
        <View style={styles.markerContainer}>
          <View style={styles.bubble}>
            {iconUri ? (
              <Image source={{ uri: iconUri }} style={styles.iconImage} contentFit="cover" />
            ) : (
              <View style={styles.fallbackDot} />
            )}
          </View>
        </View>

        {showName && (
          <View style={styles.labelContainer}>
            <StrokeText
              text={point.name}
              fontSize={13}
              color="#FFFFFF"
              strokeColor="#000000"
              strokeWidth={2}
              numberOfLines={1}
              ellipsis={true}
              width={LABEL_WIDTH}
              align="center"
            />
          </View>
        )}
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    width: LABEL_WIDTH,
    paddingTop: LABEL_HEIGHT + LABEL_GAP,
    justifyContent: 'flex-end',
  },
  markerContainer: {
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: LABEL_WIDTH,
    height: LABEL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#ffffff',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  fallbackDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
});
