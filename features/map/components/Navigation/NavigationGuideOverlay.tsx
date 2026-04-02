import React from 'react';
import ArrivalOverlay from './ArrivalOverlay';
import ActiveNavigationOverlay from './ActiveNavigationOverlay';
import type { NavigationGuideOverlayProps } from './types';

export default function NavigationGuideOverlay({
  visible,
  isLoading,
  isReady,
  errorMessage,
  currentNavigationStepData,
  onExit,
  isUserArrived,
}: NavigationGuideOverlayProps) {
  if (!visible) {
    return null;
  }

  if (isUserArrived) {
    return <ArrivalOverlay onExit={onExit} />;
  }

  return (
    <ActiveNavigationOverlay
      isLoading={isLoading}
      isReady={isReady}
      errorMessage={errorMessage}
      currentNavigationStepData={currentNavigationStepData}
      onExit={onExit}
    />
  );
}
