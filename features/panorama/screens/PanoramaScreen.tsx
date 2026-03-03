import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { useTheme } from '@/app/providers/ThemeProvider';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { logger } from '@/utils/logger';
import ScreenLayout from '@/components/common/ScreenLayout';
import { StatusBar } from 'expo-status-bar';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { panoramaService } from '../services/panoramaService';
import { PointPanoramaResponse } from '../types';

// const TEST_WEBVIEW_URL =
//   'https://fwbgft4w-5173.asse.devtunnels.ms/places/0690048e-12fb-11f1-863b-56fe45b15398/panorama/';

type Props = StackScreenProps<MainStackParamList, 'Panorama'>;

export default function PanoramaScreen({ route }: Props) {
  const { pointId } = route.params;
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [panoData, setPanoData] = useState<PointPanoramaResponse>({
    id: '',
    name: '',
    address: '',
    description: '',
    panoramaImageUrl: '',
    thumbnailUrl: '',
    defaultYaw: 0,
    defaultPitch: 0,
    hotSpots: [],
  });

  // Prefetch while the webview is warming up
  useEffect(() => {
    async function preFetch() {
      try {
        // Fetch the data here on the native side
        const data = await panoramaService.getPointPanorama(pointId);
        setPanoData(data);
      } catch (e) {
        console.error('Native fetch failed', e);
      }
    }
    preFetch();
  }, []);

  // This will be sent to the webview javascript, which will use it to pre-load the panorama data
  const runFirst = `
    window.preLoadedPanoramaData = ${JSON.stringify(panoData)};
    true; // note: this 'true;' is required for Android
  `;

  const FE_URL = panoramaService.getPanoramaFrontEndUrl();
  if (!FE_URL) {
    return (
      <ScreenLayout showBackButton={true}>
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: theme.destructive }}>
            FE URL is not configured, please re-check .env file
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout showBackButton={true} onBack={() => {}}>
      {/* Set the status bar to black */}
      <StatusBar style="auto" />
      <WebView
        source={{ uri: FE_URL }}
        injectedJavaScriptBeforeContentLoaded={runFirst}
        style={styles.webview}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
        onLoadStart={() => logger.debug('WebView loading started')}
        onLoadEnd={() => logger.debug('WebView loading ended')}
        onError={(error) => logger.error('Webview error: ' + error)}
        userAgent={'NeoNHS-Mobile'}
        setWebContentsDebuggingEnabled={true}
        renderLoading={() => (
          <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.mutedForeground }]}>
              Loading panorama...
            </Text>
          </View>
        )}
        androidLayerType="hardware"
        cacheEnabled={true}
        decelerationRate={0.998}
        allowsInlineMediaPlayback={true}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
});
