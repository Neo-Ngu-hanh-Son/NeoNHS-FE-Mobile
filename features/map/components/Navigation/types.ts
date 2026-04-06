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
  isLoading: boolean;
  errorMessage?: string | null;
  travelModeLabel?: string | null;
  onExit: () => void;
  onOpenSteps: () => void;
  currentNavigationStepData?: NavigationStepData;
  isUserArrived?: boolean;
  isGuidanceMode?: boolean;
  navigationSteps?: NavigationStepData[];
  currentUserStepIndex?: number;
};
