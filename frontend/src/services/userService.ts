import { api } from './api';
import { User, UpdateProfileRequest, ChangePasswordRequest, MessageResponse } from '../types';

export const UserService = {
    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
        return await api.put<User>('/users/profile', data);
    },

    changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
        return await api.post<MessageResponse>('/users/change-password', data);
    }
};
