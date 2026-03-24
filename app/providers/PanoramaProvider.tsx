import React, { createContext, useContext, useState, ReactNode } from 'react';
import DynamicPanorama from '@/features/panorama/components/DynamicPanorama';

type PanoramaContextType = {
  openPanorama: (pointId: string) => void;
  closePanorama: () => void;
  seedPointId: (pointId: string) => void;
  resendPanoramaMessage: () => void;
};

const PanoramaContext = createContext<PanoramaContextType | null>(null);

export function PanoramaProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPointId, setCurrentPointId] = useState<string | null>(null);
  const [messageRetryToken, setMessageRetryToken] = useState(0);

  const openPanorama = (pointId: string) => {
    setIsVisible(true);
    setCurrentPointId(""); // Do this so that when we open the panorama with the same pointId again, it will trigger a change in DynamicPanorama and thus reload the WebView
    setCurrentPointId(pointId);
  };

  const closePanorama = () => {
    setIsVisible(false);
  };

  const seedPointId = (pointId: string) => {
    setCurrentPointId(pointId);
  };

  const resendPanoramaMessage = () => {
    setMessageRetryToken((prev) => prev + 1);
  };

  return (
    <PanoramaContext.Provider
      value={{ openPanorama, closePanorama, seedPointId, resendPanoramaMessage }}>
      {children}

      <DynamicPanorama
        pointId={currentPointId ?? ''}
        isOpen={isVisible}
        onBack={closePanorama}
        retryToken={messageRetryToken}
      />
    </PanoramaContext.Provider>
  );
}

export const usePanorama = () => {
  const ctx = useContext(PanoramaContext);
  if (!ctx) throw new Error('PanoramaProvider missing');
  return ctx;
};
