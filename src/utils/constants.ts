/**
 * Application Constants
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || "https://api.example.com",
    TIMEOUT: 30000, // 30 seconds
    VERSION: "v1",
} as const;

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
    AUTH_TOKEN: "@mynhs/auth_token",
    REFRESH_TOKEN: "@mynhs/refresh_token",
    USER_DATA: "@mynhs/user_data",
} as const;

/**
 * App Configuration
 */
export const APP_CONFIG = {
    APP_NAME: "MyNHS",
    VERSION: "1.0.0",
} as const;

