import 'react-native-gesture-handler';
import RootNavigator from './navigations/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { Providers } from './providers/Providers';
import '../global.css';
import { PortalHost } from '@rn-primitives/portal';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

import { useTheme } from './providers/ThemeProvider';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

function ThemedStatusBar() {
  const { isDarkColorScheme } = useTheme();
  return <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <Providers>
      <ThemedStatusBar />
      <RootNavigator />
      <PortalHost />
    </Providers>
  );
}
