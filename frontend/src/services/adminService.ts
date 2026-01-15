import axios from 'axios';
import { UserStats, ListingStats, ActivityLog, GrowthData, CityDistribution } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const AdminService = {
    getUserStats: async (): Promise<UserStats> => {
        const response = await axios.get(`${API_URL}/admin/stats/users`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getListingStats: async (): Promise<ListingStats> => {
        const response = await axios.get(`${API_URL}/admin/stats/listings`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getRecentActivities: async (limit: number = 20): Promise<ActivityLog[]> => {
        const response = await axios.get(`${API_URL}/admin/stats/activities`, {
            headers: getAuthHeader(),
            params: { limit },
        });
        return response.data;
    },

    getUserGrowth: async (months: number = 6): Promise<GrowthData[]> => {
        const response = await axios.get(`${API_URL}/admin/stats/growth/users`, {
            headers: getAuthHeader(),
            params: { months },
        });
        return response.data;
    },

    getListingGrowth: async (months: number = 6): Promise<GrowthData[]> => {
        const response = await axios.get(`${API_URL}/admin/stats/growth/listings`, {
            headers: getAuthHeader(),
            params: { months },
        });
        return response.data;
    },

    getCityDistribution: async (): Promise<CityDistribution[]> => {
        const response = await axios.get(`${API_URL}/admin/stats/distribution/cities`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    // User Management
    getUsers: async (page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'desc'): Promise<any> => {
        const response = await axios.get(`${API_URL}/admin/users`, {
            params: { page, size, sortBy, sortDirection },
            headers: getAuthHeader()
        });
        return response.data;
    },

    toggleUserStatus: async (userId: number): Promise<any> => {
        const response = await axios.put(`${API_URL}/admin/users/${userId}/status`, {}, { headers: getAuthHeader() });
        return response.data;
    },

    updateUserRoles: async (userId: number, roles: string[]): Promise<any> => {
        const response = await axios.put(`${API_URL}/admin/users/${userId}/roles`, roles, { headers: getAuthHeader() });
        return response.data;
    },

    deleteUser: async (userId: number): Promise<any> => {
        const response = await axios.delete(`${API_URL}/admin/users/${userId}`, { headers: getAuthHeader() });
        return response.data;
    }
};
