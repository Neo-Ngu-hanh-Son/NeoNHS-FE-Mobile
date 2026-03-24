import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { UserLocation } from '../../hooks/useUserLocation';

interface UserLocationMarkerProps {
  location: UserLocation;
  showAccuracyCircle?: boolean;
  showHeading?: boolean;
  color?: string;
}

export default function UserLocationMarker({
  location,
  showAccuracyCircle = true,
  showHeading = true,
  color = '#4285F4',
}: UserLocationMarkerProps) {
  void showHeading;

  return (
    <Marker
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      flat
      tracksViewChanges={true}>
      <View style={styles.container}>
        {showAccuracyCircle ? (
          <View
            style={[
              styles.outerGlow,
              {
                backgroundColor: `${color}33`,
              },
            ]}
          />
        ) : null}

        <View style={styles.dotShell}>
          <View style={[styles.dotCore, { backgroundColor: color }]} />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  dotShell: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  dotCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
