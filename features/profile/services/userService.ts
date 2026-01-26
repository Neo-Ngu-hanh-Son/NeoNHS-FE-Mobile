/**
 * User Service
 * Handles API calls for user profile operations
 */

import type { ApiResponse } from "@/services/api/types";
import type { User } from "@/features/auth/types";
import { logger } from "@/utils/logger";

/**
 * Data for updating user account
 */
export interface UpdateAccountData {
    fullname?: string;
    email?: string;
    phoneNumber?: string;
    avatarUrl?: string;
}

export const userService = {
    /**
     * Update user account information
     */
    async updateAccount(data: UpdateAccountData): Promise<ApiResponse<User>> {
        logger.warn("[userService] Using dummy data for updateAccount with timeout of 2 seconds");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
            data: {
                id: "dummy-uuid-1234-5678",
                fullname: data.fullname || "Updated User",
                email: data.email || "updated@example.com",
                phoneNumber: data.phoneNumber || null,
                avatarUrl: data.avatarUrl || null,
                role: "GUEST",
                isActive: true,
                isVerified: false,
                isBanned: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            status: 200,
            message: "Account updated successfully",
        };
        // Actual API call (commented for now)
        // return apiClient.put<User>(
        //     endpoints.user.update(),
        //     data
        // );
    },
};
