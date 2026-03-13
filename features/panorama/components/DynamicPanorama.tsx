import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import React, { useEffect, useRef, useState } from 'react';
import { panoramaService } from '../services/panoramaService';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { logger } from '@/utils/logger';
import { StatusBar } from 'expo-status-bar';

type Props = { pointId: string; isOpen: boolean; onBack: () => void };

export default function DynamicPanorama({ pointId, isOpen, onBack }: Props) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [isWebViewReady, setIsWebViewReady] = useState(false);

  const webViewRef = useRef<WebView>(null);

  // If WebView encounters an error, we can try to reload it after a short delay
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    if (!hasError) return;

    const timeout = setTimeout(() => {
      webViewRef.current?.reload();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [hasError]);

  useEffect(() => {
    if (!isWebViewReady || !webViewRef.current) {
      logger.warn('[DynamicPanorama] WebView is not ready yet, skipping postMessage');
      return;
    }
    if (!pointId) {
      logger.warn('[DynamicPanorama] Webview ready, not point id present to send');
      return;
    }

    logger.info(`[DynamicPanorama] Sending pointId ${pointId} to WebView`);
    webViewRef.current.postMessage(
      JSON.stringify({
        type: 'SET_PLACE_ID',
        payload: pointId,
      })
    );
  }, [pointId, isWebViewReady]);

  function triggerWebViewNormally() {
    if (!webViewRef.current) {
      logger.warn('[DynamicPanorama] Cannot trigger WebView, ref is null');
      return;
    }
    logger.info('[DynamicPanorama] Triggering WebView with normal postMessage');
    webViewRef.current.postMessage(
      JSON.stringify({
        type: 'SET_PLACE_ID',
        payload: pointId,
      })
    );
  }

  const FE_URL = panoramaService.getPanoramaFrontEndUrl();
  if (!FE_URL && isOpen) {
    logger.error('[DynamicPanorama] Panorama front-end URL is not defined');
  }

  return (
    <ScreenLayout
      showBackButton={true}
      onBack={onBack}
      style={{
        zIndex: isOpen ? 999 : -1,
        opacity: isOpen ? 1 : 0,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}>
      {/* Set the status bar to black */}
      <StatusBar style="auto" />
      <WebView
        ref={webViewRef}
        source={{ uri: FE_URL ?? '' }}
        style={styles.webview}
        startInLoadingState
        onLoadStart={() => logger.debug('[DynamicPanorama] WebView loading started')}
        onLoadEnd={() => {
          logger.debug('[DynamicPanorama] WebView loading ended');
          setIsWebViewReady(true);
        }}
        onError={(error) => {
          logger.error('[DynamicPanorama] Webview error: ' + error);
          setHasError(true);
        }}
        bounces={false} // iOS bounce
        overScrollMode="never" // Android glow
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
        decelerationRate={0.998}
        webviewDebuggingEnabled={true}
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
