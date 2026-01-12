import { api } from './api';
import { User, UpdateProfileRequest, ChangePasswordRequest, MessageResponse } from '../types';

export const UserService = {
    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
        return await api.put<User>('/users/profile', data);
    },

    changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
        return await api.post<MessageResponse>('/users/change-password', data);
    },

    updateProfilePicture: async (file: File): Promise<User> => {
        const formData = new FormData();
        formData.append('file', file);
        return await api.put<User>('/users/profile-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
};
