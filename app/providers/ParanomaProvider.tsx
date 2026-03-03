import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet } from 'react-native';
import { panoramaService } from '@/features/panorama/services/panoramaService';
import DynamicPanorama from '@/features/panorama/components/DynamicPanorama';

type PanoramaContextType = {
  openPanorama: (pointId: string) => void;
  closePanorama: () => void;
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

  return (
    <PanoramaContext.Provider value={{ openPanorama, closePanorama }}>
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
