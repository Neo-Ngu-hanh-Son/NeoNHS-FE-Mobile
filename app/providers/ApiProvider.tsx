import { ReactNode, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api';
import { useAuth } from '@/features/auth';
import { authService } from '@/features/auth/services/authService';
import { storage } from '@/utils/storage';
import { logger } from '@/utils/logger';
import type { TokenRefreshResult } from '@/services/api/types';

/**
 * API Provider
 * Configures the API client with authentication token from auth context
 * and automatic token refresh on 401 responses
 */
export default function ApiProvider({ children }: { children: ReactNode }) {
  const { accessToken, refreshToken, logout, refreshAuth } = useAuth();

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  /**
   * Handle token refresh request
   * Called by API client when a 401 is received
   */

  const handleTokenRefresh = useCallback(
    async (currentRefreshToken: string): Promise<TokenRefreshResult | null> => {
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
    },
    []
  );

  useEffect(() => {
    logger.info('[ApiProvider] Configuring API client...');
    logger.info(`[ApiProvider] Using API URL: ${API_URL}`);
    logger.info('[ApiProvider] Current access token:', accessToken);
    apiClient.updateConfig({
      baseURL: API_URL,
      getAuthToken: () => accessToken || null,
      getRefreshToken: () => refreshToken || null,
      onTokenRefresh: handleTokenRefresh,
      onTokenRefreshed: refreshAuth,
      onUnauthorized: () => {
        logger.warn('[ApiProvider] Unauthorized and token refresh failed, logging out');
        logout();
      },
      onError: (error) => {
        logger.error('[ApiProvider] API Error:', error);
      },
    });
  }, [accessToken, refreshToken, logout, handleTokenRefresh, refreshAuth]);

  return <>{children}</>;
}
