import React from 'react';
import { StyleSheet, View } from 'react-native';

import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';

type Props = StackScreenProps<MainStackParamList, 'Panorama'>;

export default function PanoramaScreen({ route }: Props) {
  return <View style={styles.container}></View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
});
