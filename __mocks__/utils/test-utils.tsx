import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import type { ReactElement } from 'react';
import { storage } from '@/utils/storage';
import { NavigationContainer } from '@react-navigation/native';

export function renderWithProviders(ui: ReactElement) {
  return render(
    <NavigationContainer>
      <ThemeProvider>{ui}</ThemeProvider>
    </NavigationContainer>
  );
}
