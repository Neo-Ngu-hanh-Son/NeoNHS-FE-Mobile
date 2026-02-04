import { AuthProvider } from '@/features/auth';
import ApiProvider from './ApiProvider';
import { ThemeProvider } from './ThemeProvider';
import { ModalProvider } from './ModalProvider';
import { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GoogleLoginProvider from './GoogleLoginProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GoogleLoginProvider>
      <ThemeProvider>
        <AuthProvider>
          <ApiProvider>
            <ModalProvider>
              <SafeAreaProvider>{children}</SafeAreaProvider>
            </ModalProvider>
          </ApiProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleLoginProvider>
  );
}
