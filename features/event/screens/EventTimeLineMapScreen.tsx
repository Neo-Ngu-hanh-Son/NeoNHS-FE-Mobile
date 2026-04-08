import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { NHSMap } from '@/features/map';
import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { useMapCameraController } from '@/features/map/hooks/MapCamera/useMapCameraController';

type EventTimeLineMapScreenProps = StackScreenProps<MainStackParamList, 'EventTimeLineMap'>;

export default function EventTimeLineMapScreen({ navigation, route }: EventTimeLineMapScreenProps) {
  const { eventId } = route.params;

  return (
    <ScreenLayout showBackButton={false}>
      <NHSMap navigationPolylineCoordinates={[]} viewMode={'EXPLORING'} />
    </ScreenLayout>
  );
}
