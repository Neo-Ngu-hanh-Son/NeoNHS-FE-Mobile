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
    fullName?: string;
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
                userId: "dummy-id",
                fullName: data.fullName || "Updated User",
                email: data.email || "updated@example.com",
                phoneNumber: data.phoneNumber || "",
                avatarUrl: data.avatarUrl || "",
                roles: ["user"],
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
