import { AuthProvider } from '@/features/auth';
import ApiProvider from './ApiProvider';
import { ThemeProvider } from './ThemeProvider';
import { ModalProvider } from './ModalProvider';
import { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GoogleLoginProvider from './GoogleLoginProvider';
import LoadingProvider from './LoadingProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GoogleLoginProvider>
          <ModalProvider>
            <LoadingProvider>
              <AuthProvider>
                <ApiProvider>{children}</ApiProvider>
              </AuthProvider>
            </LoadingProvider>
          </ModalProvider>
        </GoogleLoginProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
