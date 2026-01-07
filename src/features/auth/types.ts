/**
 * Authentication Types
 */

/**
 * User data structure
 */
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt?: string;
    [key: string]: unknown; // Allow additional user properties
}

/**
 * Login credentials
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

/**
 * Authentication response from API
 */
export interface AuthResponse {
    token: string;
    refreshToken?: string;
    user: User;
}

/**
 * Authentication state
 */
export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
}

/**
 * Authentication context value
 */
export interface AuthContextValue extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    updateUser: (user: Partial<User>) => void;
}

