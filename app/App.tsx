import 'react-native-gesture-handler';
import RootNavigator from './navigations/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { Providers } from './providers/Providers';
import '../global.css';
import { PortalHost } from '@rn-primitives/portal';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { useTheme } from './providers/ThemeProvider';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { BackgroundGeoFencingData } from '@/features/map';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

function ThemedStatusBar() {
  const { isDarkColorScheme } = useTheme();
  return <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />;
}

// Define background tasks here
const GEOFENCING_TASK = 'CHECKIN_GEOFENCE_TASK';

TaskManager.defineTask<BackgroundGeoFencingData>(
  GEOFENCING_TASK,
  async ({ data, error }) => {
    if (error) {
      throw error;
    }

    if (!data) return;

    const { eventType, region } = data;

    if (eventType === Location.GeofencingEventType.Enter) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📍 Nearby Check-in!",
          body: "You are close to a point. Open the app to check in!",
          data: { pointId: region.identifier },
        },
        trigger: null,
      });
    }
  }
);

export default function App() {
  return (
    <Providers>
      <ThemedStatusBar />
      <RootNavigator />
      <PortalHost />
    </Providers>
  );
}
