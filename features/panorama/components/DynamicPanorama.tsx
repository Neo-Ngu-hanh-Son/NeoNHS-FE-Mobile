import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import React, { useEffect, useRef, useState } from 'react';
import { panoramaService } from '../services/panoramaService';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { logger } from '@/utils/logger';
import { StatusBar } from 'expo-status-bar';

type Props = { pointId: string; isOpen: boolean };

export default function DynamicPanorama({ pointId, isOpen }: Props) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [isWebViewReady, setIsWebViewReady] = useState(false);

  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (!isWebViewReady || !webViewRef.current) return;

    webViewRef.current.postMessage(
      JSON.stringify({
        type: 'SET_PLACE_ID',
        payload: pointId,
      })
    );
  }, [pointId, isWebViewReady]);

  const FE_URL = panoramaService.getPanoramaFrontEndUrl();
  if (!FE_URL && isOpen) {
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
    <ScreenLayout
      showBackButton={true}
      style={{
        zIndex: isOpen ? 999 : -1,
        opacity: isOpen ? 1 : 0,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}>
      {/* Set the status bar to black */}
      <StatusBar style="auto" />
      <WebView
        ref={webViewRef}
        source={{ uri: FE_URL ?? '' }}
        style={styles.webview}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
        onLoadStart={() => logger.debug('WebView loading started')}
        onLoadEnd={() => {
          logger.debug('WebView loading ended');
          setIsWebViewReady(true);
        }}
        onError={(error) => logger.error('Webview error: ' + error)}
        userAgent={'NeoNHS-Mobile'}
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
