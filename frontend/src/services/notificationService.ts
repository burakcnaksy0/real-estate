import axios from 'axios';
import { Notification } from '../types';

const API_URL = 'http://localhost:8080/api/notifications';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const NotificationService = {
    getUserNotifications: async (): Promise<Notification[]> => {
        const response = await axios.get<Notification[]>(API_URL, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await axios.get<number>(`${API_URL}/unread-count`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    markAsRead: async (id: number): Promise<void> => {
        await axios.put(`${API_URL}/${id}/read`, null, {
            headers: getAuthHeader(),
        });
    },

    markAllAsRead: async (): Promise<void> => {
        await axios.put(`${API_URL}/read-all`, null, {
            headers: getAuthHeader(),
        });
    }
};
