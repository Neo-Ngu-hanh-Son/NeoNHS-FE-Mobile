import { useState, useCallback } from "react";
import type { ApiResponse, ApiError } from "@/services/api";

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
    execute: (...args: unknown[]) => Promise<T | null>;
    reset: () => void;
}

/**
 * Custom hook for API calls
 * 
 * @param apiFunction - The API function to call
 * @returns Object with data, loading, error, execute function, and reset function
 * 
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useApi(authService.login);
 * 
 * const handleLogin = async () => {
 *   const result = await execute({ email, password });
 *   if (result) {
 *     // Handle success
 *   }
 * };
 * ```
 */
export function useApi<T>(
    apiFunction: (...args: unknown[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(
        async (...args: unknown[]): Promise<T | null> => {
            setState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                const response = await apiFunction(...args);
                
                if (response.status >= 200 && response.status < 300) {
                    setState({
                        data: response.data,
                        loading: false,
                        error: null,
                    });
                    return response.data;
                } else {
                    const error: ApiError = {
                        message: response.message || "Request failed",
                        status: response.status,
                    };
                    setState({
                        data: null,
                        loading: false,
                        error,
                    });
                    return null;
                }
            } catch (err) {
                const error = err as ApiError;
                setState({
                    data: null,
                    loading: false,
                    error,
                });
                return null;
            }
        },
        [apiFunction]
    );

    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
        });
    }, []);

    return {
        ...state,
        execute,
        reset,
    };
}

