/**
 * User Service
 * Handles API calls for user profile operations
 */

import type { ApiResponse } from "@/services/api/types";
import { endpoints } from "../../../services/api/endpoints";
import { UserProfile, UpdateProfileRequest } from "../../../services/api/examples";
import { apiClient } from "@/services/api/client";
import { uploadImageToCloudinary } from "@/services/cloudinary";

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
    async getProfile(): Promise<ApiResponse<UserProfile>> {
        return apiClient.get<UserProfile>(endpoints.users.getProfile());
    },

    async updateProfile(id: string | number, data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
        return apiClient.put<UserProfile>(endpoints.users.updateProfile(id), data);
    },

    async uploadAvatar(fileUri: string) {
        const filename = fileUri.split('/').pop();
        const type = `image/${filename?.split('.').pop()}`;

        const fileToUpload = {
            uri: fileUri,
            type: type,
            name: filename || "avatar.jpg",
        } as any;

        return await uploadImageToCloudinary(fileToUpload);
    }
};
