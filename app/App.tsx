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
import { logger } from '@/utils/logger';
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

// Define background tasks here (No longer used because of performance issues, but left here for reference and future use)
// const GEOFENCING_TASK = 'CHECKIN_GEOFENCE_TASK';

// TaskManager.defineTask<BackgroundGeoFencingData>(
//   GEOFENCING_TASK,
//   async ({ data, error }) => {
//     if (error) {
//       throw error;
//     }

//     if (!data) return;

//     const { eventType, region } = data;
//     if (eventType === Location.GeofencingEventType.Enter) {
//       logger.info(`[Background Task] Entered geofence for region ${region.identifier}`);
//       await Notifications.scheduleNotificationAsync({
//         content: {
//           title: "📍 Nearby Check-in!",
//           body: "You are close to a point. Open the app to check in!",
//           data: { pointId: region.identifier },
//         },
//         trigger: {
//           type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
//           seconds: 1,
//         },
//       });
//     }
//   }
// );

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
