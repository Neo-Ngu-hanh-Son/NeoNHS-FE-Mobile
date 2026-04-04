import { useCallback, useRef, useState } from 'react';
import { MapPoint, MapPointCheckin, TravelMode } from '../types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useModal } from '@/app/providers/ModalProvider';
import { useIsFocused } from '@react-navigation/native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MAP_CONSTANTS from '../constants';
import { useMapStore } from '../store/useMapStore';

type Props = {
  navigation: any;
};

export const useMapScreenController = ({ navigation }: Props) => {
  const isFocused = useIsFocused();
  const { isAuthenticated } = useAuth();
  const { alert } = useModal();

  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activePoint, setActivePoint] = useState<MapPointCheckin | null>(null);

  const insets = useSafeAreaInsets();

  const viewMode = useMapStore((state) => state.viewMode);
  const setViewMode = useMapStore((state) => state.setViewMode);

  // ===== Marker =====
  const handleMarkerPress = useCallback((point: MapPoint) => {
    setSelectedPoint(point);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  // ===== Navigation =====
  const handleNavigate = useCallback(
    (point: MapPoint) => {
      if (!point.id || point.id === 'offline') {
        alert('Navigation Unavailable', 'Please connect to the internet.');
        return;
      }

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

      setModalVisible(false);
    },
    [alert, navigation]
  );

  // ===== Check-in =====
  const handleOpenCheckinCamera = useCallback(() => {
    if (!isAuthenticated) {
      navigation.getParent()?.getParent()?.navigate('Auth', {
        screen: 'Login',
      });
      return;
    }

    navigation.navigate('CheckinCamera', {
      pointId: activePoint?.id,
      pointName: activePoint?.name ?? '',
    });
  }, [activePoint, isAuthenticated, navigation]);

  return {
    // state
    selectedPoint,
    modalVisible,
    activePoint,
    insets,
    isFocused,

    // setters (only expose if needed)
    setActivePoint,
    setSelectedPoint,
    setModalVisible,

    // handlers
    handleMarkerPress,
    handleCloseModal,
    handleNavigate,
    handleOpenCheckinCamera,
  };
};
