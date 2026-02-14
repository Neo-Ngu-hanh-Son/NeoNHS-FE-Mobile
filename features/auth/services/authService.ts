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
    async logout(refreshToken: string): Promise<ApiResponse<void>> {
        return apiClient.post<void>(endpoints.auth.logout(), { refreshToken }, { requiresAuth: false });
    },

    /**
     * Refresh authentication token
     */
    async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
        return apiClient.post<AuthResponse>(
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
            endpoints.auth.verify(),
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
    },

    /**
     * Resend verification email with OTP
     */
    async resendVerifyEmail(email: string): Promise<ApiResponse<string>> {
        return apiClient.get<string>(
            endpoints.auth.resendVerifyEmail(email),
            { requiresAuth: false }
        );
    },

    /**
     * Verify email with OTP
     */
    async verifyEmail(email: string, otp: string): Promise<ApiResponse<string>> {
        return apiClient.post<string>(
            endpoints.auth.verify(),
            { email, otp },
            { requiresAuth: false }
        );
    }
};

