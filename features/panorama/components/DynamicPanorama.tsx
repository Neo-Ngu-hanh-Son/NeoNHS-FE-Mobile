import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { panoramaService } from '../services/panoramaService';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { logger } from '@/utils/logger';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  pointId: string;
  isOpen: boolean;
  onBack: () => void;
  onOpen?: () => void;
  retryToken?: number;
};

export default function DynamicPanorama({
  pointId,
  isOpen,
  onBack,
  onOpen,
  retryToken = 0,
}: Props) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
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

  const trySendPointId = useCallback(() => {
    if (!isOpen) {
      return;
    }
    if (!isWebViewReady || !webViewRef.current) {
      logger.warn('[DynamicPanorama] WebView is not ready yet, skipping postMessage');
      return;
    }
    if (!pointId) {
      logger.warn('[DynamicPanorama] Webview ready, not point id present to send');
      return;
    }

    const currentWebView = webViewRef.current;

    // Delay for 1 second to ensure WebView is fully ready to receive messages, especially after reloads
    return setTimeout(() => {
      currentWebView.postMessage(
        JSON.stringify({
          type: 'SET_PLACE_ID',
          payload: pointId,
        })
      );
    }, 1000)
  }, [isOpen, isWebViewReady, pointId]);

  useEffect(() => {
    const timeoutId = trySendPointId();
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [retryToken, trySendPointId]);

  const FE_URL = panoramaService.getPanoramaFrontEndUrl();
  if (!FE_URL && isOpen) {
    logger.error('[DynamicPanorama] Panorama front-end URL is not defined');
  }

  const handleReloadWebView = useCallback(() => {
    setHasError(false);
    setIsWebViewReady(false);
    logger.info('[DynamicPanorama] Reloading WebView by user action');
    webViewRef.current?.reload();
  }, []);

  // On ready, try to send the postMessage immediately
  useEffect(() => {
    let timeoutId = null;
    if (isWebViewReady && pointId) {
      timeoutId = trySendPointId();
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isWebViewReady, trySendPointId, pointId]);

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
      <Button
        className="transition-all duration-200 active:scale-95 active:bg-secondary/80 dark:active:bg-secondary/30"
        variant="outline"
        size="icon"
        style={[
          styles.reloadButton,
          {
            top: insets.top + 12,
            borderColor: theme.border,
          },
        ]}
        onPress={handleReloadWebView}
        accessibilityLabel="Reload panorama"
        accessibilityRole="button">
        <Ionicons name="reload" size={20} color={theme.foreground} />
      </Button>

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
          logger.error('[DynamicPanorama] Webview error: ' + error.nativeEvent.description);
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
  reloadButton: {
    position: 'absolute',
    right: 16,
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});
