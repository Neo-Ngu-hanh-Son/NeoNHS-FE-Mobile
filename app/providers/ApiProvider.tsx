import { ReactNode, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { apiClient } from '@/services/api';
import { useAuth } from '@/features/auth';
import { authService } from '@/features/auth/services/authService';
import { logger } from '@/utils/logger';
import type { ApiError, TokenRefreshResult } from '@/services/api/types';
import { rootNavigationRef } from '@/app/navigations/rootNavigationRef';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * API Provider
 * Configures the API client with authentication token from auth context
 * and automatic token refresh on 401 responses.
 *
 * Uses refs for callback-type config values so that the useEffect only
 * re-runs when the actual token strings change — not when callback
 * references are recreated by the auth context.
 */
export default function ApiProvider({ children }: { children: ReactNode }) {
  const { accessToken, refreshToken, logout, refreshAuth } = useAuth();

  // Store functions in refs so the config effect doesn't depend on their identity
  const logoutRef = useRef(logout);
  const refreshAuthRef = useRef(refreshAuth);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  useEffect(() => {
    refreshAuthRef.current = refreshAuth;
  }, [refreshAuth]);

  const handleTokenRefresh = useCallback(async (currentRefreshToken: string): Promise<TokenRefreshResult | null> => {
    try {
      logger.info('[ApiProvider] Attempting to refresh token...');
      const response = await authService.refreshToken(currentRefreshToken);

      if (response.data) {
        return {
          ...response.data,
        };
      }
      return null;
    } catch (error) {
      logger.error('[ApiProvider] Token refresh failed:', error);
      return null;
    }
  }, []);

  const forbiddenAlertOpenRef = useRef(false);

  const handleForbidden = useCallback((_error: ApiError) => {
    if (forbiddenAlertOpenRef.current) {
      return;
    }
    forbiddenAlertOpenRef.current = true;

    const resetAlertFlag = () => {
      forbiddenAlertOpenRef.current = false;
    };

    const goToLogin = () => {
      resetAlertFlag();
      if (rootNavigationRef.isReady()) {
        rootNavigationRef.navigate('Auth', { screen: 'Login' });
      }
    };

    Alert.alert(
      'Must login',
      'You need to sign in to use this feature.',
      [
        { text: 'Cancel', style: 'cancel', onPress: resetAlertFlag },
        { text: 'Log in', onPress: goToLogin },
      ],
      { cancelable: true, onDismiss: resetAlertFlag }
    );
  }, []);

  useEffect(() => {
    logger.info(`[ApiProvider] Using API URL: ${API_URL}`);
    apiClient.updateConfig({
      baseURL: API_URL,
      getAuthToken: () => accessToken || null,
      getRefreshToken: () => refreshToken || null,
      onTokenRefresh: handleTokenRefresh,
      onTokenRefreshed: (...args) => refreshAuthRef.current(...args),
      onUnauthorized: () => {
        logoutRef.current();
      },
      onForbidden: handleForbidden,
      onError: (error) => {
        logger.error('[ApiProvider] API error:', error);
      },
      timeout: 30000,
    });
    // Only re-run when the actual token *values* change
  }, [accessToken, refreshToken, handleTokenRefresh, handleForbidden]);

  return <>{children}</>;
}
