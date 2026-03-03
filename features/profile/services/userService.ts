/**
 * User Service
 * Handles API calls for user profile operations
 */

import type { ApiResponse } from "@/services/api/types";
import { endpoints } from "../../../services/api/endpoints/endpoints";
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

/**
 * KYC Request - 3 base64-encoded images
 */
export interface KycRequest {
    frontImageBase64: string;
    backImageBase64: string;
    selfieImageBase64: string;
}

/**
 * KYC Response from backend
 */
export interface KycResponse {
    success: boolean;
    message: string;
    fullName?: string;
    idNumber?: string;
    dateOfBirth?: string;
    address?: string;
    faceMatchScore?: number;
    isFake?: boolean;
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
    },

    async changePassword(data: any): Promise<ApiResponse<any>> {
        return apiClient.post<any>(endpoints.users.changePassword(), data);
    },

    /**
     * Perform KYC verification via VNPT eKYC API
     * @param userId - User UUID
     * @param data - KycRequest with 3 base64 images
     */
    async performKyc(userId: string, data: KycRequest): Promise<ApiResponse<KycResponse>> {
        return apiClient.post<KycResponse>(endpoints.users.performKyc(userId), data);
    },
};

