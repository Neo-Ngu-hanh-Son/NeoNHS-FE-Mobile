import { Maneuver } from '../../types';

export type NavigationStepData = {
  tripDurationText?: string;
  tripDistanceText?: string;
  currentManeuver?: Maneuver | null;
  currentInstructionText?: string;
  currentStepDurationText?: string;
  currentStepDistanceText?: string;
  currentStepProgressText?: string;
};

export type NavigationGuideOverlayProps = {
  visible: boolean;
  isLoading: boolean;
  isReady: boolean;
  errorMessage?: string | null;
  onExit: () => void;
  currentNavigationStepData?: NavigationStepData;
  isUserArrived?: boolean;
};
