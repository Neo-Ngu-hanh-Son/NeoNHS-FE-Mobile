import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { MapPoint } from '../../types';
import { markerStyles } from './MarkerStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { StrokeText } from '@charmy.tech/react-native-stroke-text';

interface MarkerVisualProps {
  point: MapPoint;
  showName?: boolean;
  isSelected?: boolean;
}

export default function MarkerVisual({ point, showName, isSelected = false }: MarkerVisualProps) {
  const pointType = point.type !== null ? point.type : 'default';
  const style = markerStyles[pointType];

  // Animation for selection
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSelected) {
      // Animate to larger size with a bounce effect
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -8,
            duration: 150,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 150,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Animate back to normal size
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSelected, scaleAnim, bounceAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.markerContainer,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: bounceAnim },
            ],
          },
        ]}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: style.bg,
              borderColor: isSelected ? '#FFFFFF' : style.border,
              borderWidth: isSelected ? 3 : 2,
            },
          ]}>
          <MaterialIcons name={style.icon} size={16} color="#fff" />
        </View>
        <View
          style={[
            styles.arrow,
            {
              borderTopColor: style.bg,
            },
          ]}
        />
      </Animated.View>
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
  );
}

const LABEL_WIDTH = 150;
const LABEL_HEIGHT = 18;
const LABEL_GAP = 6;

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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});
