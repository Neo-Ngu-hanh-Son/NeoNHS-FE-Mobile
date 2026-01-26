/**
 * Application Constants
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || "https://api.example.com",
    TIMEOUT: 60000,
    VERSION: "v1",
} as const;

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
    AUTH_TOKEN: "@NeoNHS/auth_token",
    REFRESH_TOKEN: "@NeoNHS/refresh_token",
    USER_DATA: "@NeoNHS/user_data",
} as const;

/**
 * App Configuration
 */
export const APP_CONFIG = {
    APP_NAME: "NeoNHS",
    VERSION: "1.0.0",
} as const;

