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
                accessToken: "dummy-token",
                tokenType: "Bearer",
                userInfo: {
                    id: "dummy-uuid-1234-5678",
                    fullname: "Dummy User",
                    email: credentials.email || "dummy-email@example.com",
                    phoneNumber: null,
                    avatarUrl: null,
                    role: "GUEST",
                    isActive: true,
                    isVerified: false,
                    isBanned: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
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
                accessToken: "dummy-token",
                tokenType: "Bearer",
                userInfo: {
                    id: "dummy-uuid-1234-5678",
                    fullname: data.name,
                    email: data.email,
                    phoneNumber: null,
                    avatarUrl: null,
                    role: "GUEST",
                    isActive: true,
                    isVerified: false,
                    isBanned: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            },
            status: 200,
            message: "Register successful",
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
        return apiClient.post<void>(endpoints.auth.logout(), {}, { requiresAuth: false });
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
        return apiClient.post<void>(
            endpoints.auth.forgotPassword(),
            { email },
            { requiresAuth: false }
        );
    },

    async resetPassword(email: string, newPassword: string, confirmPassword: string): Promise<ApiResponse<void>> {
        return apiClient.post<void>(
            endpoints.auth.resetPassword(),
            { email, newPassword, confirmPassword },
            { requiresAuth: false }
        );
    },

    async verifyOtp(email: string, otp: string): Promise<ApiResponse<void>> {
        return apiClient.post<void>(
            'auth/verify',
            { email, otp },
            { requiresAuth: false }
        );
    },

    async loginWithGoogle(idToken: string): Promise<ApiResponse<AuthResponse>> {
        return apiClient.post<AuthResponse>(
            endpoints.auth.loginWithGoogle(idToken),
            { idToken },
            { requiresAuth: false }
        );
    }
};

