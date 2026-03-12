import React, { createContext, useContext, useState, ReactNode } from 'react';
import DynamicPanorama from '@/features/panorama/components/DynamicPanorama';

type PanoramaContextType = {
  openPanorama: (pointId: string) => void;
  closePanorama: () => void;
  seedPointId: (pointId: string) => void;
};

const PanoramaContext = createContext<PanoramaContextType | null>(null);

export function PanoramaProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPointId, setCurrentPointId] = useState<string | null>(null);

  const openPanorama = (pointId: string) => {
    setIsVisible(true);
    setCurrentPointId(pointId);
  };

  const closePanorama = () => {
    setIsVisible(false);
  };

  const seedPointId = (pointId: string) => {
    setCurrentPointId(pointId);
  };

  return (
    <PanoramaContext.Provider value={{ openPanorama, closePanorama, seedPointId }}>
      {children}

      <DynamicPanorama pointId={currentPointId ?? ''} isOpen={isVisible} onBack={closePanorama} />
    </PanoramaContext.Provider>
  );
}

export const usePanorama = () => {
  const ctx = useContext(PanoramaContext);
  if (!ctx) throw new Error('PanoramaProvider missing');
  return ctx;
};
