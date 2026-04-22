import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';

type ScreenProps = StackScreenProps<MainStackParamList, 'AttractionDestinationScreen'>;

export default function AttractionDestinationScreen({ navigation, route }: ScreenProps) {
  const { attractionId } = route.params;

  return <div>AttractionDestination: {attractionId}</div>;
}
