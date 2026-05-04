import RootNavigator from './navigations/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { Providers } from './providers/Providers';
import '../global.css';
import { PortalHost } from '@rn-primitives/portal';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { useTheme } from './providers/ThemeProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

function ThemedStatusBar() {
  const { isDarkColorScheme } = useTheme();
  return <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />;
}

// function handleDeepLink(url: string) {
//   const match = url.match(/records\/(\d+)/);

//   if (match) {
//     const id = match[1];

//     Navigation.push('ROOT_STACK', {
//       component: {
//         name: 'RecordDetail',
//         passProps: { id },
//       },
//     });
//   }
// }

// export default function RootNavigator() {
//   useEffect(() => {
//     // Cold start
//     Linking.getInitialURL().then(url => {
//       if (url) handleDeepLink(url);
//     });

//     // App already open
//     const sub = Linking.addEventListener('url', ({ url }) => {
//       handleDeepLink(url);
//     });

//     return () => sub.remove();
//   }, []);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Providers>
        <ThemedStatusBar />
        <RootNavigator />
        <PortalHost />
      </Providers>
    </GestureHandlerRootView>
  );
}
