import axios from "axios";

export const CLOUDINARY_CONFIG = {
    CLOUD_NAME: "dsrxsfr0q",
    PRESET_NAME: "demo-upload",
    FOLDER_NAME: "NeoNHS",
    API_URL: `https://api.cloudinary.com/v1_1/dsrxsfr0q/image/upload`,
    VIDEO_API_URL: `https://api.cloudinary.com/v1_1/dsrxsfr0q/video/upload`, 
};

export const uploadImageToCloudinary = async (file: string | Blob) => {
    const {
        CLOUD_NAME,
        PRESET_NAME,
        FOLDER_NAME,
        API_URL
    } = CLOUDINARY_CONFIG;

    const formData = new FormData();
    formData.append("upload_preset", PRESET_NAME);
    formData.append("folder", FOLDER_NAME);
    formData.append("file", file);

    try {
        const response = await axios.post(API_URL, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
        });
        console.log("Uploaded image to Cloudinary:", response.data.secure_url);
        return response.data.secure_url;
    } catch (error) {
        console.error("Upload image failed:", error);
        return null;
    }
};

export const uploadVideoToCloudinary = async (file: string | Blob) => {
    const {
        CLOUD_NAME,
        PRESET_NAME,
        FOLDER_NAME,
        VIDEO_API_URL
    } = CLOUDINARY_CONFIG;

    const formData = new FormData();
    formData.append("upload_preset", PRESET_NAME);
    formData.append("folder", FOLDER_NAME);
    formData.append("file", file);

    try {
        const response = await axios.post(VIDEO_API_URL, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
        });
        console.log("Uploaded video to Cloudinary:", response.data.secure_url);
        return response.data.secure_url;
    } catch (error) {
        console.error("Upload video failed:", error);
        return null;
    }
};