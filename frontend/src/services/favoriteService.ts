import api from './api';
import { Favorite } from '../types';

export const FavoriteService = {
    async addFavorite(listingId: number, listingType: string): Promise<Favorite> {
        const response = await api.post('/favorites', null, {
            params: { listingId, listingType }
        });
        return response.data;
    },

    async removeFavorite(listingId: number): Promise<void> {
        await api.delete(`/favorites/${listingId}`);
    },

    async getUserFavorites(): Promise<Favorite[]> {
        const response = await api.get('/favorites');
        return response.data;
    },

    async checkFavorite(listingId: number): Promise<boolean> {
        const response = await api.get(`/favorites/check/${listingId}`);
        return response.data.isFavorite;
    }
};
