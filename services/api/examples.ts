/**
 * API Usage Examples
 * This file demonstrates how to use the API client (Axios-based) in your application
 * 
 * NOTE: This is for reference only. Delete or move examples to actual service files.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { ApiResponse } from "./types";

// ============================================
// Example: Authentication Service
// ============================================

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

const authService = {
    /**
     * Login user
     */
    async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        return apiClient.post<LoginResponse>(
            endpoints.auth.login(),
            credentials,
            { requiresAuth: false }
        );
    },

    /**
     * Register new user
     */
    async register(userData: {
        email: string;
        password: string;
        name: string;
    }): Promise<ApiResponse<LoginResponse>> {
        return apiClient.post<LoginResponse>(
            endpoints.auth.register(),
            userData,
            { requiresAuth: false }
        );
    },

    /**
     * Logout user
     */
    async logout(): Promise<ApiResponse<void>> {
        return apiClient.post<void>(endpoints.auth.logout());
    },
};

// ============================================
// Example: User Service
// ============================================

interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: string;
}

const userService = {
    /**
     * Get current user profile
     */
    async getProfile(): Promise<ApiResponse<User>> {
        return apiClient.get<User>(endpoints.users.getProfile());
    },

    /**
     * Update user profile
     */
    async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
        return apiClient.put<User>(endpoints.users.updateProfile(), data);
    },

    /**
     * Get user by ID
     */
    async getUserById(id: string): Promise<ApiResponse<User>> {
        return apiClient.get<User>(endpoints.users.getUserById(id));
    },

    /**
     * Get users with pagination
     */
    async getUsers(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<ApiResponse<{ users: User[]; total: number }>> {
        return apiClient.get<{ users: User[]; total: number }>(
            endpoints.users.getUsers(),
            { params }
        );
    },
};

// ============================================
// Example: Using in a React Component
// ============================================

/*
import { useState } from "react";
import { authService } from "@/services/api/examples";
import type { ApiError } from "@/services/api";

function LoginComponent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const handleLogin = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await authService.login({ email, password });
            
            if (response.success) {
                // Store token
                // Navigate to home
                console.log("Login successful:", response.data);
            }
        } catch (err) {
            setError(err as ApiError);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Your component JSX
    );
}
*/

// ============================================
// Example: Error Handling
// ============================================

/*
try {
    const response = await apiClient.get<User>("/users/123");
    console.log("User data:", response.data);
} catch (error) {
    const apiError = error as ApiError;
    
    switch (apiError.code) {
        case ApiErrorCode.UNAUTHORIZED:
            // Redirect to login
            break;
        case ApiErrorCode.NOT_FOUND:
            // Show not found message
            break;
        case ApiErrorCode.VALIDATION_ERROR:
            // Show validation errors
            console.log("Validation errors:", apiError.errors);
            break;
        default:
            // Show generic error
            console.error("Error:", apiError.message);
    }
}
*/

