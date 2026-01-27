import { ReactNode, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { useAuth } from '@/features/auth';
import { logger } from '@/utils/logger';

/**
 * API Provider
 * Configures the API client with authentication token from auth context
 */
export default function ApiProvider({ children }: { children: ReactNode }) {
  const { token, logout } = useAuth();

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    logger.info('[ApiProvider] Using backend URL: ' + API_URL);
    apiClient.updateConfig({
      baseURL: API_URL,
      getAuthToken: () => token || null,
      onUnauthorized: () => {
        logger.warn('[ApiProvider] Unauthorized, running logout function of auth');
        logout();
      },
      onError: (error) => {
        logger.error('[ApiProvider] API Error:', error);
      },
    });
  }, [token, logout]);

  return <>{children}</>;
}
