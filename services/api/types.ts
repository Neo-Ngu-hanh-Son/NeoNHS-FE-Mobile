/**
 * API Types and Interfaces
 * Defines types for API requests, responses, and errors
 */

/**
 * Standard API Response wrapper
 *
 * @param status HTTP status code (e.g., 200, 201, 400, 404, 500)
 * @param success Indicates whether the request was successful
 * @param message Human-readable message describing the result
 * @param data Response payload data (null for error responses)
 * @param timestamp Timestamp when the response was generated
 */

export interface ApiResponse<T = unknown> {
    status: number;
    success?: boolean;
    data: T;
    message?: string;
    timestamp?: string;
}

/**
 * API Error Response
 */
export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
    code?: string;
}

/**
 * HTTP Methods
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

import { User } from "@/features/auth";
/**
 * Request Configuration
 * Extends AxiosRequestConfig with custom options
 */
import type { AxiosRequestConfig } from "axios";

export interface RequestConfig extends Omit<AxiosRequestConfig, "method" | "params"> {
    method?: HttpMethod;
    params?: Record<string, string | number | boolean>;
    requiresAuth?: boolean;
    transformData?: boolean;
}

/**
 * Token Refresh Result
 */
export interface TokenRefreshResult {
    accessToken: string;
    refreshToken?: string;
    userInfo: User;
}

/**
 * API Client Configuration
 */
export interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
    getAuthToken?: () => string | null | Promise<string | null>;
    getRefreshToken?: () => string | null | Promise<string | null>;
    onTokenRefresh?: (refreshToken: string) => Promise<TokenRefreshResult | null>;
    onTokenRefreshed?: (result: TokenRefreshResult) => void | Promise<void>;
    onUnauthorized?: () => void;
    onError?: (error: ApiError) => void;
}

/**
 * Pagination Response
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Common API Error Codes
 */
export enum ApiErrorCode {
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    SERVER_ERROR = "SERVER_ERROR",
    NETWORK_ERROR = "NETWORK_ERROR",
    TIMEOUT = "TIMEOUT",
}

