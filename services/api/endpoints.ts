
/**
 * Authentication Endpoints
 */
export const authEndpoints = {
    login: () => `auth/login`,
    register: () => `auth/register`,
    logout: () => `auth/logout`,
    refreshToken: () => `auth/refresh-token`,
    forgotPassword: () => `auth/forgot-password`,
    resetPassword: () => `auth/reset-password`,
    verifyEmail: () => `auth/verify-email`,
    resendVerifyEmail: (email: string) => `auth/resend-verify-email?email=${encodeURIComponent(email)}`,
    verify: () => `auth/verify`,
    loginWithGoogle: (tokenId: string) => `auth/google-login?idToken=${encodeURIComponent(tokenId)}`,
} as const;

/**
 * User Endpoints
 */
export const userEndpoints = {
    getProfile: () => `users/profile`,
    updateProfile: (id: string | number) => `users/update-profile/${id}`,
    changePassword: () => `users/change-password`,
    getUserById: (id: string | number) => `users/${id}`,
    getUsers: () => `users`,
    deleteUser: (id: string | number) => `users/${id}`,
} as const;

/**
 * Home/Dashboard Endpoints
 */
export const homeEndpoints = {
    getDashboard: () => `home/dashboard`,
    getNotifications: () => `home/notifications`,
    markNotificationRead: (id: string | number) => `home/notifications/${id}/read`,
} as const;

/**
 * Profile Endpoints
 */
export const profileEndpoints = {
    getProfile: () => `profile`,
    updateProfile: (id: string | number) => `update-profile/${id}`,
    // uploadAvatar: () => `profile/avatar`,
} as const;

/**
 * All Endpoints (for easy access)
 */
export const endpoints = {
    auth: authEndpoints,
    users: userEndpoints,
    home: homeEndpoints,
    profile: profileEndpoints,
} as const;

