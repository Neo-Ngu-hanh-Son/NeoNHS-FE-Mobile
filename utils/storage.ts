/**
 * Storage Utility
 * Handles local storage operations for tokens and user data
 * Uses AsyncStorage for React Native
 */

import { logger } from "./logger";

let AsyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
    clear: () => Promise<void>;
};

try {
    AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {
    // Fallback to in-memory storage (data will be lost on app restart)
    const memoryStorage: Record<string, string> = {};
    AsyncStorage = {
        getItem: async (key: string) => memoryStorage[key] || null,
        setItem: async (key: string, value: string) => {
            memoryStorage[key] = value;
        },
        removeItem: async (key: string) => {
            delete memoryStorage[key];
        },
        clear: async () => {
            Object.keys(memoryStorage).forEach((key) => delete memoryStorage[key]);
        },
    };
    logger.warn(
        "@react-native-async-storage/async-storage not found. Using in-memory storage. Install it with: npx expo install @react-native-async-storage/async-storage"
    );
}
import { STORAGE_KEYS } from "./constants";

/**
 * Storage service for managing app data
 */
export const storage = {
    /**
     * Get item from storage
     */
    async getItem<T>(key: string): Promise<T | null> {
        try {
            const value = await AsyncStorage.getItem(key);
            return value ? (JSON.parse(value) as T) : null;
        } catch (error) {
            logger.error(`Error getting item ${key}:`, error);
            return null;
        }
    },

    /**
     * Set item in storage
     */
    async setItem<T>(key: string, value: T): Promise<boolean> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            logger.error(`Error setting item ${key}:`, error);
            return false;
        }
    },

    /**
     * Remove item from storage
     */
    async removeItem(key: string): Promise<boolean> {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (error) {
            logger.error(`Error removing item ${key}:`, error);
            return false;
        }
    },

    /**
     * Clear all storage
     */
    async clear(): Promise<boolean> {
        try {
            await AsyncStorage.clear();
            return true;
        } catch (error) {
            logger.error("Error clearing storage:", error);
            return false;
        }
    },

    /**
     * Get auth token
     */
    async getAuthToken(): Promise<string | null> {
        return this.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    },

    /**
     * Set auth token
     */
    async setAuthToken(token: string): Promise<boolean> {
        return this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    },

    /**
     * Remove auth token
     */
    async removeAuthToken(): Promise<boolean> {
        return this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    },

    /**
     * Get refresh token
     */
    async getRefreshToken(): Promise<string | null> {
        return this.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
    },

    /**
     * Set refresh token
     */
    async setRefreshToken(token: string): Promise<boolean> {
        return this.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    },

    /**
     * Get user data
     */
    async getUserData<T>(): Promise<T | null> {
        return this.getItem<T>(STORAGE_KEYS.USER_DATA);
    },

    /**
     * Set user data
     */
    async setUserData<T>(data: T): Promise<boolean> {
        return this.setItem(STORAGE_KEYS.USER_DATA, data);
    },

    /**
     * Clear all auth data
     */
    async clearAuthData(): Promise<boolean> {
        try {
            await Promise.all([
                this.removeAuthToken(),
                this.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
                this.removeItem(STORAGE_KEYS.USER_DATA),
            ]);
            return true;
        } catch (error) {
            logger.error("Error clearing auth data:", error);
            return false;
        }
    },
};

