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
                    email: credentials.email ? credentials.email : "dummy-email@example.com",
                },
            },
            status: 200,
            message: "Login successful",
        };
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
        logger.warn("[authService] Using dummy data for register with timeout of 3 seconds");
        await new Promise(resolve => setTimeout(resolve, 3000));
        return {
            data: {
                token: "dummy-token",
                refreshToken: "dummy-refresh-token",
                user: {
                    id: "dummy-id",
                    name: data.name ? data.name : "Dummy User",
                    email: data.email ? data.email : "dummy-email@example.com",
                },
            },
            status: 200,
            message: "Login successful",
        };
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

    async forgotPassword(email: string): Promise<ApiResponse<void>> {
        logger.warn("[authService] Using dummy data for forgotPassword with timeout of 1 second");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            data: undefined,
            status: 200,
            message: "Password reset email sent",
        };
        // return apiClient.post<void>(
        //     endpoints.auth.forgotPassword(),
        //     { email },
        //     { requiresAuth: false }
        // );
    },

    async resetPassword(otp: string, newPassword: string): Promise<ApiResponse<void>> {
        logger.warn("[authService] Using dummy data for resetPassword with timeout of 1 second");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            data: undefined,
            status: 200,
            message: "Password has been reset successfully",
        };
        // return apiClient.post<void>(
        //     endpoints.auth.resetPassword(),
        //     { otp, newPassword },
        //     { requiresAuth: false }
        // );
    },
};

