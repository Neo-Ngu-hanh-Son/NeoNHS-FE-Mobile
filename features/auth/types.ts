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
    name: string;
}

/**
 * Authentication response from API
 * Maps to backend AuthResponse
 */
export interface AuthResponse {
    accessToken: string;
    tokenType: string; // defaults to "Bearer"
    userInfo: UserInfo;
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
    loginWithGoogle: (idToken: string) => Promise<void>;
}
