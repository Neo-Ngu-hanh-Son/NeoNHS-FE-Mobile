/**
 * API Types and Interfaces
 * Defines types for API requests, responses, and errors
 */

/**
 * Standard API Response wrapper
 */
export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    status: number;
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
 * API Client Configuration
 */
export interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
    getAuthToken?: () => string | null | Promise<string | null>;
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

