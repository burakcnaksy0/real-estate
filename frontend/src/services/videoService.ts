import { api } from './api';

export interface VideoResponse {
    id: number;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    displayOrder: number;
    createdAt: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

export const VideoService = {
    uploadVideo: async (
        file: File,
        listingId: number,
        listingType: string
    ): Promise<VideoResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('listingType', listingType);

        return await api.post<VideoResponse>(`/listings/${listingId}/videos`, formData, {
        });
    },

    getListingVideos: async (listingId: number, listingType: string): Promise<VideoResponse[]> => {
        return await api.get<VideoResponse[]>(`/listings/${listingId}/videos?listingType=${listingType}`);
    },

    deleteVideo: async (videoId: number): Promise<void> => {
        await api.delete(`/listings/videos/${videoId}`);
    },

    getVideoUrl: (videoId: number): string => {
        return `${API_BASE_URL}/listings/videos/${videoId}`;
    },
};
