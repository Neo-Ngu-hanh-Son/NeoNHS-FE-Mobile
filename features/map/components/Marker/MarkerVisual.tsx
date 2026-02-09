import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MapPoint } from '../../types';
import { markerStyles } from './MarkerStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { StrokeText } from '@charmy.tech/react-native-stroke-text';

interface MarkerVisualProps {
  point: MapPoint;
  showName?: boolean;
}

export default function MarkerVisual({ point, showName }: MarkerVisualProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const pointType = point.type !== null ? point.type : 'default';
  const style = markerStyles[pointType];

  return (
    <View style={styles.container}>
      <View style={styles.markerContainer}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: style.bg,
              borderColor: style.border,
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
      </View>
      {showName && (
        <View style={styles.labelContainer}>
          {/*<Text style={styles.markerText}>{point.name}</Text>*/}
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

    borderWidth: 2,

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

  markerText: {
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
