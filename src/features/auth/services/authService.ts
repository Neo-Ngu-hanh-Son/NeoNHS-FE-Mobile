/**
 * Authentication Service
 * Handles API calls for authentication
 */

import { apiClient } from "@/services/api";
import { endpoints } from "@/services/api";
import type { ApiResponse } from "@/services/api/types";
import type { AuthResponse, LoginCredentials, RegisterData } from "../types";
import { logger } from "@/utils/logger";

export const authService = {
    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
        // return apiClient.post<AuthResponse>(
        //     endpoints.auth.login(),
        //     credentials,
        //     { requiresAuth: false }
        // );
        // Return dummy data for now
        logger.warn("[authService] Using dummy data for login with timeout of 3 seconds");
        await new Promise(resolve => setTimeout(resolve, 3000));
        return {
            data: {
                token: "dummy-token",
                refreshToken: "dummy-refresh-token",
                user: {
                    id: "dummy-id",
                    name: "Dummy User",
                    email: "dummy-email@example.com",
                },
            },
            status: 200,
            message: "Login successful",
        };
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

