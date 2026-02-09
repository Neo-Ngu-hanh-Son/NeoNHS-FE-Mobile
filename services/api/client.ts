/**
 * API Client
 * Reusable HTTP client using Axios with interceptors, error handling, and type safety
 */

import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type AxiosError,
} from "axios";
import type {
    ApiResponse,
    ApiError,
    RequestConfig,
    ApiClientConfig,
} from "./types";
import {
    ApiErrorCode,
} from "./types";
import { API_CONFIG } from "@/utils/constants";
import { logger } from "@/utils/logger";

class ApiClient {
    private axiosInstance: AxiosInstance;
    private getAuthToken?: () => string | null | Promise<string | null>;
    private onUnauthorized?: () => void;
    private onError?: (error: ApiError) => void;

    constructor(config?: Partial<ApiClientConfig>) {
        // Create axios instance with default config
        this.axiosInstance = axios.create({
            baseURL: config?.baseURL || API_CONFIG.BASE_URL,
            timeout: config?.timeout || API_CONFIG.TIMEOUT,
            headers: {
                "Content-Type": "application/json",
                ...config?.headers,
            },
        });

        // Store callbacks
        this.getAuthToken = config?.getAuthToken;
        this.onUnauthorized = config?.onUnauthorized;
        this.onError = config?.onError;

        // Setup interceptors
        this.setupInterceptors();
    }

    /**
     * Setup request and response interceptors
     */
    private setupInterceptors(): void {
        // Request interceptor - Add auth token
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                // Log the request config
                logger.debug(`[ApiClient] ${config.method?.toUpperCase()} ${config.baseURL}/${config.url}`);

                // Add authentication token if required
                const requiresAuth = (config as RequestConfig).requiresAuth !== false;

                if (requiresAuth && this.getAuthToken) {
                    const token = await this.getAuthToken();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    } else {
                        logger.error("[ApiClient] Authentication token not found in store for this request");
                    }
                }

                // Remove custom requiresAuth property before sending
                if ((config as RequestConfig).requiresAuth !== undefined) {
                    delete (config as RequestConfig).requiresAuth;
                }

                return config;
            },
            (error) => {
                return Promise.reject(this.handleError(error));
            }
        );

        // Response interceptor - Handle errors only
        // Note: We don't transform here because interceptors must return AxiosResponse
        this.axiosInstance.interceptors.response.use(
            (response) => {
                return response;
            },
            (error: AxiosError) => {
                return Promise.reject(this.handleError(error));
            }
        );
    }

    /**
     * Transform Axios response to ApiResponse format
     * 
     * Backend format: { status, success, message, data, timestamp }
     */
    private transformResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
        const responseData = response.data as Record<string, unknown>;

        // Check if response is an object
        if (responseData && typeof responseData === "object") {
            // Case 1: Standard wrapper format from backend
            // Backend returns: { status, success, message, data, timestamp }
            if ("data" in responseData && "success" in responseData) {
                return {
                    data: responseData.data as T,
                    success: responseData.success as boolean,
                    message: responseData.message as string | undefined,
                    timestamp: responseData.timestamp as string | undefined,
                    status: response.status, // Use HTTP status, not backend status
                };
            }

            // Case 2: Wrapper with just data field (legacy/other endpoints)
            // Backend returns: { data: {...} } or { data: {...}, message: "..." }
            if ("data" in responseData) {
                return {
                    data: responseData.data as T,
                    message: responseData.message as string | undefined,
                    status: response.status,
                };
            }
        }

        // Case 3: Raw data without wrapper
        // Backend returns the data directly: { accessToken: "...", userInfo: {...} }
        return {
            data: responseData as T,
            status: response.status,
        };
    }

    /**
     * Handle API errors
     */
    private handleError(error: unknown): ApiError {
        let apiError: ApiError;

        // Handle Axios errors
        if (axios.isAxiosError(error)) {
            const axiosError = error;

            // Network error (no response received)
            if (!axiosError.response) {
                if (axiosError.code === "ECONNABORTED" || axiosError.message?.includes("timeout")) {
                    apiError = {
                        message: "Request timeout. Please try again.",
                        status: 0,
                        code: ApiErrorCode.TIMEOUT,
                    };
                } else {
                    apiError = {
                        message: axiosError.message || "Network error. Please check your connection.",
                        status: 0,
                        code: ApiErrorCode.NETWORK_ERROR,
                    };
                }
            } else {
                // Server responded with error status
                const response = axiosError.response;
                const responseData = response.data;

                // Extract error message from various possible response formats
                let errorMessage = "An error occurred";
                let errorDetails: Record<string, string[]> | undefined;
                let errorCode: string | undefined;

                if (responseData) {
                    if (typeof responseData === "string") {
                        // Server returned plain text error
                        errorMessage = responseData;
                    } else if (typeof responseData === "object") {
                        // Server returned JSON error object
                        // Try common error message fields in order of preference
                        errorMessage =
                            responseData.message ||
                            responseData.error ||
                            responseData.detail ||
                            responseData.errorMessage ||
                            (responseData.errors && typeof responseData.errors === "string"
                                ? responseData.errors
                                : null) ||
                            response.statusText ||
                            "An error occurred";

                        // Extract validation errors if present
                        if (responseData.errors && typeof responseData.errors === "object") {
                            errorDetails = responseData.errors;
                        }

                        // Extract error code if present
                        errorCode = responseData.code || responseData.errorCode;
                    }
                } else {
                    // No response data, use status text
                    errorMessage = response.statusText || "An error occurred";
                }

                apiError = {
                    message: errorMessage,
                    status: response.status,
                    errors: errorDetails,
                    code: this.getErrorCode(response.status, errorCode),
                };
            }
        } else if (error instanceof Error) {
            // Generic error
            apiError = {
                message: error.message,
                status: 500,
                code: ApiErrorCode.SERVER_ERROR,
            };
        } else {
            // Unknown error
            apiError = {
                message: "An unexpected error occurred",
                status: 500,
                code: ApiErrorCode.SERVER_ERROR,
            };
        }

        // Handle unauthorized errors
        if (apiError.status === 401 || apiError.code === ApiErrorCode.UNAUTHORIZED) {
            this.onUnauthorized?.();
        }

        // Call error callback
        this.onError?.(apiError);

        return apiError;
    }

    /**
     * Get error code from HTTP status
     */
    private getErrorCode(status: number, customCode?: string): string {
        if (customCode) return customCode;

        switch (status) {
            case 401:
                return ApiErrorCode.UNAUTHORIZED;
            case 403:
                return ApiErrorCode.FORBIDDEN;
            case 404:
                return ApiErrorCode.NOT_FOUND;
            case 422:
            case 400:
                return ApiErrorCode.VALIDATION_ERROR;
            case 500:
            case 502:
            case 503:
                return ApiErrorCode.SERVER_ERROR;
            default:
                return ApiErrorCode.SERVER_ERROR;
        }
    }

    /**
     * GET request
     */
    async get<T>(
        endpoint: string,
        config?: RequestConfig,
    ): Promise<ApiResponse<T>> {
        const { transformData = true, ...restConfig } = config ?? {};

        const response = await this.axiosInstance.get<T>(endpoint, restConfig as AxiosRequestConfig);
        return transformData ? this.transformResponse(response) : response;
    }

    /**
     * POST request
     */
    async post<T>(
        endpoint: string,
        data?: unknown,
        config?: RequestConfig,
    ): Promise<ApiResponse<T>> {
        const { transformData = true, ...restConfig } = config ?? {};
        const response = await this.axiosInstance.post<T>(endpoint, data, restConfig as AxiosRequestConfig);
        return transformData ? this.transformResponse(response) : response;
    }

    /**
     * PUT request
     */
    async put<T>(
        endpoint: string,
        data?: unknown,
        config?: RequestConfig,
    ): Promise<ApiResponse<T>> {
        const { transformData = true, ...restConfig } = config ?? {};
        const response = await this.axiosInstance.put<T>(endpoint, data, restConfig as AxiosRequestConfig);
        return transformData ? this.transformResponse(response) : response;
    }

    /**
     * PATCH request
     */
    async patch<T>(
        endpoint: string,
        data?: unknown,
        config?: RequestConfig,
    ): Promise<ApiResponse<T>> {
        const { transformData = true, ...restConfig } = config ?? {};
        const response = await this.axiosInstance.patch<T>(endpoint, data, restConfig as AxiosRequestConfig);
        return transformData ? this.transformResponse(response) : response;
    }

    /**
     * DELETE request
     */
    async delete<T>(
        endpoint: string,
        config?: RequestConfig,
    ): Promise<ApiResponse<T>> {
        const { transformData = true, ...restConfig } = config ?? {};
        const response = await this.axiosInstance.delete<T>(endpoint, restConfig as AxiosRequestConfig);
        return transformData ? this.transformResponse(response) : response;
    }

    /**
     * Get the underlying axios instance (for advanced usage)
     */
    getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<ApiClientConfig>): void {
        if (config.baseURL) {
            this.axiosInstance.defaults.baseURL = config.baseURL;
        }
        if (config.timeout) {
            this.axiosInstance.defaults.timeout = config.timeout;
        }
        if (config.headers) {
            this.axiosInstance.defaults.headers = {
                ...this.axiosInstance.defaults.headers,
                ...config.headers,
            };
        }
        if (config.getAuthToken) {
            this.getAuthToken = config.getAuthToken;
        }
        if (config.onUnauthorized) {
            this.onUnauthorized = config.onUnauthorized;
        }
        if (config.onError) {
            this.onError = config.onError;
        }
    }
}

// Create and export default API client instance
export const apiClient = new ApiClient();

// Export class for custom instances
export default ApiClient;
