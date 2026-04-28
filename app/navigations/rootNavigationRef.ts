import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './NavigationParamTypes';

export const rootNavigationRef = createNavigationContainerRef<RootStackParamList>();
