import { TokenRefreshResult } from "@/services/api";

export type UserRole = 'ADMIN' | 'VENDOR' | 'GUEST' | 'TOURIST' | string;

/**
 * User information response from API
 * Maps to backend UserInfoResponse
 */
export interface UserInfo {
    id: string; // UUID
    fullname: string;
    email: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    role: UserRole;
    isActive: boolean;
    isVerified: boolean;
    isBanned: boolean;
    createdAt: string; // ISO timestamp (LocalDateTime)
    updatedAt: string; // ISO timestamp (LocalDateTime)
}

/**
 * User type for app state (alias for UserInfo)
 */
export type User = UserInfo;

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
    fullname: string;
    phoneNumber: string | null;
}

/**
 * Authentication response from API
 * Maps to backend AuthResponse
 */
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string; // defaults to "Bearer"
    userInfo: UserInfo;
}

/**
 * Authentication state
 */
export interface AuthState {
    user: User | null;
    accessToken: string | null;
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
    refreshAuth: (result: TokenRefreshResult) => Promise<void>;
    updateUser: (user: Partial<User>) => void;
    loginWithGoogle: (idToken: string) => Promise<void>;
}
