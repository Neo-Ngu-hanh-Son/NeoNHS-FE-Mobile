export interface User {
    userId: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    roles: string[];
    isActive?: boolean;
    isVerified?: boolean;
    isBanned?: boolean;
    [key: string]: any; // For additional custom fields
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
