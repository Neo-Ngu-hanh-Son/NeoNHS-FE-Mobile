import { AuthProvider } from '@/features/auth';
import ApiProvider from './ApiProvider';
import { ThemeProvider } from './ThemeProvider';
import { ModalProvider } from './ModalProvider';
import { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GoogleLoginProvider from './GoogleLoginProvider';
import LoadingProvider from './LoadingProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/api/tanstack/queryClient';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ChatProvider } from '@/features/chat/context/ChatProvider';

/**
 * NOTE: Any providers that use navigation should be nested inside NavigationContainer in RootNavigator.tsx, otherwise you will have issues with useNavigation() hook
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <GoogleLoginProvider>
            <ModalProvider>
              <LoadingProvider>
                <AuthProvider>
                  <ApiProvider>
                    <BottomSheetModalProvider>
                      <ChatProvider>{children}</ChatProvider>
                    </BottomSheetModalProvider>
                  </ApiProvider>
                </AuthProvider>
              </LoadingProvider>
            </ModalProvider>
          </GoogleLoginProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
