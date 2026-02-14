import LoadingOverlay from '@/components/Loader/LoadingOverlay';
import { createContext, ReactNode, useContext, useState } from 'react';

interface LoadingModalContextValue {
  setLoading: (loading: boolean) => void;
  isLoading: () => boolean;
}

const LoadingModalContext = createContext<LoadingModalContextValue | undefined>(undefined);

export default function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  const value = {
    setLoading,
    isLoading: () => loading,
  };
  return (
    <LoadingModalContext.Provider value={value}>
      {children}
      <LoadingOverlay visible={loading} />
    </LoadingModalContext.Provider>
  );
}

export function useLoadingModal(): LoadingModalContextValue {
  const context = useContext(LoadingModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
