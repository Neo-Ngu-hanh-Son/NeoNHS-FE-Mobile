import React, {
  createContext,
  useContext,
  useCallback,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import type { AuthContextValue, AuthState, LoginCredentials, RegisterData, User } from '../types';
import { authService } from '../services/authService';
import { storage } from '@/utils/storage';
import type { ApiError, TokenRefreshResult } from '@/services/api/types';
import { logger } from '@/utils/logger';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';

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

  const loginWithGoogle = async (idToken: string) => {
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
  };

  const register = useCallback(async (data: RegisterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await authService.register(data);

      if (response.data) {
        const { accessToken, userInfo } = response.data;
        const refreshToken = null; // TODO: Adjust if refreshToken is provided

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
        authService.logout((await storage.getRefreshToken()) || state.refreshToken || '');
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

  /**
   * Refresh authentication tokens
   * DO NOT USE THIS MANUALLY, it is called automatically by the API client
   */
  const refreshAuth = useCallback(
    async (result: TokenRefreshResult): Promise<void> => {
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
        await logout();
      }
    },
    [logout]
  );

  const updateUser = useCallback(
    (userData: Partial<User>) => {
      dispatch({ type: 'UPDATE_USER', payload: userData });
      // Also update storage
      if (state.user) {
        storage.setUserData({ ...state.user, ...userData });
      }
    },
    [state.user]
  );

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    updateUser,
    loginWithGoogle,
  };

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
