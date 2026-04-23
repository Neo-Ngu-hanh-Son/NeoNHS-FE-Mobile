import React from 'react';
import ArrivalOverlay from './ArrivalOverlay';
import ActiveNavigationOverlay from './ActiveNavigationOverlay';
import type { NavigationGuideOverlayProps } from './types';

export default function NavigationGuideOverlay({
  isLoading,
  errorMessage,
  travelModeLabel,
  onOpenSteps,
  currentNavigationStepData,
  onExit,
  isUserArrived,
}: NavigationGuideOverlayProps) {
  if (isUserArrived) {
    return <ArrivalOverlay onExit={onExit} />;
  }

  return (
    <>
      <ActiveNavigationOverlay
        isLoading={isLoading}
        errorMessage={errorMessage}
        travelModeLabel={travelModeLabel}
        onOpenSteps={onOpenSteps}
        currentNavigationStepData={currentNavigationStepData}
        onExit={onExit}
      />
    </>
  );
}
