/**
 * Authentication Service
 * Handles API calls for authentication
 */

import { apiClient } from "@/services/api";
import { endpoints } from "@/services/api";
import type { ApiResponse } from "@/services/api/types";
import type { AuthResponse, LoginCredentials, RegisterData } from "../types";

export const authService = {
    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
        return apiClient.post<AuthResponse>(
            endpoints.auth.login(),
            credentials,
            { requiresAuth: false }
        );
    },

    /**
     * Register new user
     */
    async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
        return apiClient.post<AuthResponse>(
            endpoints.auth.register(),
            data,
            { requiresAuth: false }
        );
    },

    /**
     * Logout user
     */
    async logout(): Promise<ApiResponse<void>> {
        return apiClient.post<void>(endpoints.auth.logout());
    },

    /**
     * Refresh authentication token
     */
    async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken?: string }>> {
        return apiClient.post<{ token: string; refreshToken?: string }>(
            endpoints.auth.refreshToken(),
            { refreshToken },
            { requiresAuth: false }
        );
    },
};

