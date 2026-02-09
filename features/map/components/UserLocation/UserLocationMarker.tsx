import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { UserLocation } from '../../hooks/useUserLocation';

interface UserLocationMarkerProps {
  /** User's current location */
  location: UserLocation;
  /** Whether to show the accuracy circle */
  showAccuracyCircle?: boolean;
  /** Whether to show the heading indicator */
  showHeading?: boolean;
  /** Custom color for the marker */
  color?: string;
}

/**
 * Marker component displaying user's current location on the map
 * Features:
 * - Smooth animation when location changes
 * - Pulsing blue dot animation
 * - Accuracy circle (optional)
 * - Heading indicator (optional)
 *
 * Note: We use a regular Marker with animateMarkerToCoordinate for Android
 * and coordinate updates for iOS, as AnimatedRegion has compatibility issues
 * with the latest react-native-maps versions.
 */
export default function UserLocationMarker({
  location,
  showAccuracyCircle = true,
  showHeading = true,
  color = '#4285F4', // Google Maps blue
}: UserLocationMarkerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;
  const markerRef = useRef<any>(null);

  // Store previous coordinates for animation
  const prevCoords = useRef({
    latitude: location.latitude,
    longitude: location.longitude,
  });

  // Animate marker when location changes (Android only - iOS handles this smoothly)
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
          // Fallback: marker will just jump to new position
          console.warn('Failed to animate marker:', error);
        }
      }
      // iOS: Marker updates smoothly by default when coordinate prop changes

      prevCoords.current = newCoords;
    }
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [pulseAnim, opacityAnim]);

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
        {/* Pulsing outer ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              backgroundColor: color,
              transform: [{ scale: pulseAnim }],
              opacity: opacityAnim,
            },
          ]}
        />

        {/* Accuracy circle */}
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

        {/* Heading indicator */}
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

        {/* Main dot */}
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
    width: PULSE_SIZE,
    height: PULSE_SIZE,
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
