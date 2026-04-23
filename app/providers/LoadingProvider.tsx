import LoadingOverlay from '@/components/Loader/LoadingOverlay';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface LoadingModalContextValue {
  setLoading: (loading: boolean) => void;
  isLoading: () => boolean;
}

const LoadingModalContext = createContext<LoadingModalContextValue | undefined>(undefined);

export default function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  const isLoadingCb = useCallback(() => loading, [loading]);

  const value = useMemo(
    () => ({
      setLoading,
      isLoading: isLoadingCb,
    }),
    [isLoadingCb]
  );
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
