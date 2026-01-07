import React, { createContext, useContext, useCallback, useReducer, useEffect, ReactNode } from "react";
import type { AuthContextValue, AuthState, LoginCredentials, RegisterData, User } from "../types";
import { authService } from "../services/authService";
import { storage } from "@/utils/storage";
import type { ApiError } from "@/services/api/types";
import { logger } from "@/utils/logger";

const initialState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
};

// Action types will be used in the reducer to update the state
type AuthAction =
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_INITIALIZED"; payload: boolean }
    | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string; refreshToken?: string } }
    | { type: "LOGOUT" }
    | { type: "UPDATE_USER"; payload: Partial<User> }
    | { type: "SET_TOKEN"; payload: { token: string; refreshToken?: string } };

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, isLoading: action.payload };
        case "SET_INITIALIZED":
            return { ...state, isInitialized: action.payload };
        case "LOGIN_SUCCESS":
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                refreshToken: action.payload.refreshToken || null,
                isAuthenticated: true,
                isLoading: false,
            };
        case "LOGOUT":
            return {
                ...state,
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case "UPDATE_USER":
            return {
                ...state,
                user: state.user ? { ...state.user, ...action.payload } : null,
            };
        case "SET_TOKEN":
            return {
                ...state,
                token: action.payload.token,
                refreshToken: action.payload.refreshToken || state.refreshToken,
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
            dispatch({ type: "SET_LOADING", payload: true });

            const [token, refreshToken, userData] = await Promise.all([
                storage.getAuthToken(),
                storage.getRefreshToken(),
                storage.getUserData<User>(),
            ]);

            if (token && userData) {
                dispatch({
                    type: "LOGIN_SUCCESS",
                    payload: {
                        user: userData,
                        token,
                        refreshToken: refreshToken || undefined,
                    },
                });
            } else {
                dispatch({ type: "LOGOUT" });
            }
        } catch (error) {
            logger.error("Failed to initialize auth:", error);
            dispatch({ type: "LOGOUT" });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
            dispatch({ type: "SET_INITIALIZED", payload: true });
        }
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            dispatch({ type: "SET_LOADING", payload: true });

            const response = await authService.login(credentials);

            if (response.data) {
                const { user, token, refreshToken } = response.data;

                await Promise.all([
                    storage.setAuthToken(token),
                    refreshToken ? storage.setRefreshToken(refreshToken) : Promise.resolve(),
                    storage.setUserData(user),
                ]);

                dispatch({
                    type: "LOGIN_SUCCESS",
                    payload: { user, token, refreshToken },
                });
            } else {
                throw new Error("Login failed: No data received");
            }
        } catch (error) {
            dispatch({ type: "SET_LOADING", payload: false });
            const apiError = error as ApiError;
            throw new Error(apiError.message || "Login failed");
        }
    }, []);


    const register = useCallback(async (data: RegisterData) => {
        try {
            dispatch({ type: "SET_LOADING", payload: true });

            const response = await authService.register(data);

            if (response.data) {
                const { user, token, refreshToken } = response.data;

                await Promise.all([
                    storage.setAuthToken(token),
                    refreshToken ? storage.setRefreshToken(refreshToken) : Promise.resolve(),
                    storage.setUserData(user),
                ]);

                dispatch({
                    type: "LOGIN_SUCCESS",
                    payload: { user, token, refreshToken },
                });
            } else {
                throw new Error("Registration failed: No data received");
            }
        } catch (error) {
            dispatch({ type: "SET_LOADING", payload: false });
            const apiError = error as ApiError;
            throw new Error(apiError.message || "Registration failed");
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            try {
                await authService.logout();
            } catch (error) {
                logger.warn("Logout API call failed:", error);
            }

            await storage.clearAuthData();

            dispatch({ type: "LOGOUT" });
        } catch (error) {
            logger.error("Logout error:", error);
            dispatch({ type: "LOGOUT" });
        }
    }, []);

    /**
     * Refresh authentication token
     */
    const refreshAuth = useCallback(async () => {
        try {
            const refreshToken = await storage.getRefreshToken();
            if (!refreshToken) {
                throw new Error("No refresh token available");
            }

            const response = await authService.refreshToken(refreshToken);

            if (response.data) {
                const { token: newToken, refreshToken: newRefreshToken } = response.data;

                await Promise.all([
                    storage.setAuthToken(newToken),
                    newRefreshToken ? storage.setRefreshToken(newRefreshToken) : Promise.resolve(),
                ]);

                dispatch({
                    type: "SET_TOKEN",
                    payload: { token: newToken, refreshToken: newRefreshToken },
                });
            }
        } catch (error) {
            logger.error("Token refresh failed:", error);
            await logout();
        }
    }, [logout]);


    const updateUser = useCallback((userData: Partial<User>) => {
        dispatch({ type: "UPDATE_USER", payload: userData });
        // Also update storage
        if (state.user) {
            storage.setUserData({ ...state.user, ...userData });
        }
    }, [state.user]);

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
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}