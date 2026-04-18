import React, {
  createContext,
  useContext,
  useCallback,
  useReducer,
  useEffect,
  useMemo,
  useState,
  useRef,
  ReactNode,
} from 'react';
import type { AuthContextValue, AuthState, LoginCredentials, RegisterData, User } from '../types';
import { authService } from '../services/authService';
import { storage } from '@/utils/storage';
import type { ApiError, TokenRefreshResult } from '@/services/api/types';
import { logger } from '@/utils/logger';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';
import { apiClient } from '@/services/api/client';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
};

// Action types will be used in the reducer to update the state
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string; refreshToken?: string } }
  | { type: 'REGISTER_SUCCESS'; payload: {} }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_TOKEN'; payload: { accessToken: string; refreshToken?: string; user?: User } };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken || null,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SET_TOKEN':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken || state.refreshToken,
        user: action.payload.user || state.user,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider Component
 * Provides authentication state and methods to children
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const userRef = useRef<User | null>(null);
  const refreshTokenRef = useRef<string | null>(null);
  const logoutRef = useRef<(() => Promise<void>) | undefined>(undefined);

  // Keep refs in sync with state so stable callbacks can read latest values
  useEffect(() => {
    userRef.current = state.user;
    refreshTokenRef.current = state.refreshToken;
  }, [state.user, state.refreshToken]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const previousUnreadCountRef = useRef(0);
  const { expoPushToken } = usePushNotifications();

  // Gửi push token lên server bất cứ khi nào user được xác thực và có token
  useEffect(() => {
    if (state.isAuthenticated && expoPushToken) {
      apiClient.post('notifications/push-token', { token: expoPushToken })
        .then(() => logger.info('[AuthContext] Successfully uploaded Expo Push Token to Backend'))
        .catch(err => logger.error('[AuthContext] Error sending Push Token', err));
    }
  }, [state.isAuthenticated, expoPushToken]);

  // Polling fetching unread notifications count context
  useEffect(() => {
    if (!state.isAuthenticated || !state.user?.email) return;

    let isFirstFetch = true;

    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get<any>('notifications', {
          params: { email: state.user!.email, page: 0, size: 20 }
        });
        const unreadItems = response.data.content.filter((n: any) => !n.isRead);

        if (!isFirstFetch && unreadItems.length > previousUnreadCountRef.current) {
          // Send a local push notification for the newest one
          const newest = unreadItems[0];
          import('expo-notifications').then(Notifications => {
            Notifications.scheduleNotificationAsync({
              content: {
                title: newest.title,
                body: newest.message,
                data: { url: 'Notifications' },
              },
              trigger: null, // Send immediately
            });
          });
        }

        isFirstFetch = false;
        previousUnreadCountRef.current = unreadItems.length;
        setUnreadNotificationCount(unreadItems.length);
      } catch (err) {
        logger.error('Error fetching unread notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.user?.email]);

  /**
   * Initialize auth state from storage
   */
  const initializeAuth = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const [accessToken, refreshToken, userData] = await Promise.all([
        storage.getAuthToken(),
        storage.getRefreshToken(),
        storage.getUserData<User>(),
      ]);

      if (accessToken && userData) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: userData,
            accessToken,
            refreshToken: refreshToken || undefined,
          },
        });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      logger.error('Failed to initialize auth:', error);
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await authService.login(credentials);

      if (response.data) {
        const { accessToken, userInfo, refreshToken } = response.data;

        logger.info('[AuthContext] Login successful:', response.data);

        await Promise.all([
          storage.setAuthToken(accessToken),
          refreshToken ? storage.setRefreshToken(refreshToken) : Promise.resolve(),
          storage.setUserData(userInfo),
        ]);

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: userInfo,
            accessToken: accessToken,
            refreshToken: refreshToken || undefined,
          },
        });
      } else {
        throw new Error('Login failed: No data received');
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Login failed');
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await authService.loginWithGoogle(idToken);

      if (response.data) {
        const { accessToken, refreshToken, userInfo } = response.data;

        logger.info('[AuthContext] Google login successful:', response.data);

        await Promise.all([
          storage.setAuthToken(accessToken),
          refreshToken ? storage.setRefreshToken(refreshToken) : Promise.resolve(),
          storage.setUserData(userInfo),
        ]);

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: userInfo,
            accessToken: accessToken,
            refreshToken: refreshToken || undefined,
          },
        });
      } else {
        throw new Error('Google login failed: No data received');
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Google login failed');
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await authService.register(data);

      if (response.data) {
        const { accessToken, userInfo, refreshToken } = response.data;

        await Promise.all([
          storage.setAuthToken(accessToken),
          refreshToken ? storage.setRefreshToken(refreshToken) : Promise.resolve(),
          storage.setUserData(userInfo),
        ]);

        dispatch({
          type: 'REGISTER_SUCCESS',
          payload: {},
        });
      } else {
        throw new Error('Registration failed: No data received');
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Registration failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      try {
        // Read from ref so this callback has zero reactive deps (stable reference)
        authService.logout((await storage.getRefreshToken()) || refreshTokenRef.current || '');
      } catch (error) {
        logger.warn('Logout API call failed:', error);
      }

      await storage.clearAuthData();

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      logger.error('Logout error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Keep the ref current so refreshAuth can call logout without depending on it
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  /**
   * Refresh authentication tokens
   * DO NOT USE THIS MANUALLY, it is called automatically by the API client
   */
  const refreshAuth = useCallback(async (result: TokenRefreshResult): Promise<void> => {
    try {
      const { accessToken, refreshToken, userInfo } = result;
      await Promise.all([
        storage.setAuthToken(accessToken),
        refreshToken ? storage.setRefreshToken(refreshToken) : Promise.resolve(),
        storage.setUserData(userInfo),
      ]);

      dispatch({
        type: 'SET_TOKEN',
        payload: { ...result },
      });
    } catch (error) {
      logger.error('Token refresh failed:', error);
      // Use ref to avoid depending on `logout` (keeps this callback stable)
      await logoutRef.current?.();
    }
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });

    const currentUser = userRef.current;
    if (currentUser) {
      storage.setUserData({ ...currentUser, ...userData });
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Memoize with individual primitive deps so the context value only changes
  // when actual data changes — not on every `isLoading` toggle during init.
  const value: AuthContextValue = useMemo(
    () => ({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      isInitialized: state.isInitialized,
      login,
      register,
      logout,
      refreshAuth,
      updateUser,
      loginWithGoogle,
      unreadNotificationCount,
      setUnreadNotificationCount,
    }),
    [
      state.user,
      state.accessToken,
      state.refreshToken,
      state.isAuthenticated,
      state.isLoading,
      state.isInitialized,
      login,
      register,
      logout,
      refreshAuth,
      updateUser,
      loginWithGoogle,
      unreadNotificationCount,
      setUnreadNotificationCount,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoadingOverlay visible={state.isLoading} message="Loading..." />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
