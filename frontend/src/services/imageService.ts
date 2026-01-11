import { api } from './api';

export interface ImageResponse {
    id: number;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    isPrimary: boolean;
    displayOrder: number;
    createdAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

export const ImageService = {
    uploadImage: async (
        file: File,
        listingId: number,
        listingType: string,
        isPrimary: boolean = false
    ): Promise<ImageResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('listingId', listingId.toString());
        formData.append('listingType', listingType);
        formData.append('isPrimary', isPrimary.toString());

        return await api.post<ImageResponse>('/images/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    getListingImages: async (listingId: number, listingType: string): Promise<ImageResponse[]> => {
        return await api.get<ImageResponse[]>(`/images/listing/${listingId}/${listingType}`);
    },

    deleteImage: async (imageId: number): Promise<void> => {
        await api.delete(`/images/${imageId}`);
    },

    getImageUrl: (imageId: number): string => {
        return `${API_BASE_URL}/images/view/${imageId}`;
    },
};
