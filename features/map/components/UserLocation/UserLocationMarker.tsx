import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Platform } from 'react-native';
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
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.4)).current;
  const markerRef = useRef<any>(null);

  const prevCoords = useRef({
    latitude: location.latitude,
    longitude: location.longitude,
  });

  // Animate marker position when location changes (Android)
  useEffect(() => {
    const newCoords = {
      latitude: location.latitude,
      longitude: location.longitude,
    };

    if (
      prevCoords.current.latitude !== newCoords.latitude ||
      prevCoords.current.longitude !== newCoords.longitude
    ) {
      if (Platform.OS === 'android' && markerRef.current) {
        try {
          markerRef.current.animateMarkerToCoordinate(newCoords, 500);
        } catch (error) {
          console.warn('Failed to animate marker:', error);
        }
      }
      prevCoords.current = newCoords;
    }
  }, [location.latitude, location.longitude]);

  // Pulsing animation loop
  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 2,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])).start(() => {
          // Reset values and restart
          pulseScale.setValue(1);
          pulseOpacity.setValue(0.4);
          animate();
        });
    };

    animate();

    return () => {
      pulseScale.stopAnimation();
      pulseOpacity.stopAnimation();
    };
  }, []);

  return (
    <Marker
      ref={markerRef}
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      flat
      tracksViewChanges={true}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              backgroundColor: color,
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />

        {showAccuracyCircle && location.accuracy && (
          <View
            style={[
              styles.accuracyCircle,
              {
                backgroundColor: `${color}15`,
                borderColor: `${color}30`,
              },
            ]}
          />
        )}

        {showHeading && location.heading !== null && (
          <View
            style={[
              styles.headingContainer,
              {
                transform: [{ rotate: `${location.heading}deg` }],
              },
            ]}>
            <View style={[styles.headingArrow, { borderBottomColor: color }]} />
          </View>
        )}

        <View style={[styles.outerCircle, { backgroundColor: 'white' }]}>
          <View style={[styles.innerCircle, { backgroundColor: color }]} />
        </View>
      </View>
    </Marker>
  );
}

const DOT_SIZE = 24;
const INNER_DOT_SIZE = 16;
const PULSE_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    width: PULSE_SIZE * 2,
    height: PULSE_SIZE * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: PULSE_SIZE,
    height: PULSE_SIZE,
    borderRadius: PULSE_SIZE / 2,
  },
  accuracyCircle: {
    position: 'absolute',
    width: PULSE_SIZE * 1.5,
    height: PULSE_SIZE * 1.5,
    borderRadius: (PULSE_SIZE * 1.5) / 2,
    borderWidth: 1,
  },
  headingContainer: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE * 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headingArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -4,
  },
  outerCircle: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  innerCircle: {
    width: INNER_DOT_SIZE,
    height: INNER_DOT_SIZE,
    borderRadius: INNER_DOT_SIZE / 2,
  },
});
