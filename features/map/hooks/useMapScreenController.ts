import { RefObject, useCallback, useState } from 'react';
import { MapPoint, MapPointCheckin } from '../types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useModal } from '@/app/providers/ModalProvider';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

type Props = {
  navigation: any;
  pointDetailSheetRef: RefObject<BottomSheetModal | null>;
};

export const useMapScreenController = ({ navigation, pointDetailSheetRef }: Props) => {
  const isFocused = useIsFocused();
  const { isAuthenticated } = useAuth();
  const { alert } = useModal();

  // This state tracks the currently selected point shown by the detail bottom sheet.
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  // This state is used to keep track of the currently active check-in point.
  const [activePoint, setActivePoint] = useState<MapPointCheckin | null>(null);

  const insets = useSafeAreaInsets();

  // ===== Marker =====
  const handleMarkerPress = useCallback((point: MapPoint) => {
    setSelectedPoint(point);
  }, []);

  const handlePointSheetClosed = useCallback(() => {
    setSelectedPoint(null);
  }, []);

  const dismissPointDetailSheet = useCallback(() => {
    pointDetailSheetRef.current?.dismiss();
  }, [pointDetailSheetRef]);

  // ===== Navigation =====
  const handleNavigate = useCallback(
    (point: MapPoint) => {
      if (!point.id || point.id === 'offline') {
        alert('Navigation Unavailable', 'Please connect to the internet.');
        return;
      }

      setSelectedPoint(null);
      dismissPointDetailSheet();

      switch (point.type) {
        case 'EVENT':
          navigation.navigate('EventDetail', { eventId: point.id });
          break;
        case 'WORKSHOP':
          navigation.navigate('WorkshopDetail', { workshopId: point.id });
          break;
        case 'CHECKIN':
          navigation.navigate('PointDetail', { pointId: point.id });
          break;
        default:
          navigation.navigate('PointDetail', { pointId: point.id });
      }
    },
    [alert, dismissPointDetailSheet, navigation]
  );

  // ===== Check-in =====
  const handleOpenCheckinCamera = useCallback(() => {
    setSelectedPoint(null);
    dismissPointDetailSheet();

    if (!isAuthenticated) {
      navigation.getParent()?.getParent()?.navigate('Auth', {
        screen: 'Login',
      });
      return;
    }

    if (!activePoint?.id) {
      alert('No check-in point nearby', 'Move closer to a check-in location, then try opening the camera again.');
      return;
    }

    navigation.navigate('CheckinCamera', {
      checkinPointId: activePoint?.id,
      pointName: activePoint?.name ?? '',
      pointRewardPoints: activePoint?.rewardPoints ?? 0,
    });
  }, [activePoint, alert, dismissPointDetailSheet, isAuthenticated, navigation]);

  return {
    // state
    selectedPoint,
    activePoint,
    insets,
    isFocused,

    // setters (only expose if needed)
    setActivePoint,
    setSelectedPoint,

    // handlers
    handleMarkerPress,
    handlePointSheetClosed,
    handleNavigate,
    handleOpenCheckinCamera,
  };
};
