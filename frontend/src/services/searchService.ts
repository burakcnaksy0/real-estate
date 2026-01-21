import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface AdvancedSearchCriteria {
    query?: string;
    city?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    categorySlug?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    minRooms?: number;
    maxRooms?: number;
    minArea?: number;
    maxArea?: number;
    minYear?: number;
    maxYear?: number;
    brand?: string;
    model?: string;
    fuelType?: string;
    transmission?: string;
    sortBy?: 'price' | 'date' | 'distance' | 'relevance';
    sortOrder?: 'asc' | 'desc';
}

export interface SearchSuggestion {
    text: string;
    type: 'city' | 'district' | 'category' | 'listing';
    count: number;
}

export interface SavedSearch {
    id: number;
    name: string;
    searchCriteria: Record<string, any>;
    notificationEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SavedSearchRequest {
    name: string;
    searchCriteria: Record<string, any>;
    notificationEnabled?: boolean;
}

const searchService = {
    /**
     * Advanced search with all filters
     */
    advancedSearch: async (criteria: AdvancedSearchCriteria, page: number = 0, size: number = 20) => {
        const params = new URLSearchParams();

        Object.entries(criteria).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });

        params.append('page', page.toString());
        params.append('size', size.toString());

        const response = await axios.get(`${API_URL}/search/advanced?${params.toString()}`);
        return response.data;
    },

    /**
     * Get autocomplete suggestions
     */
    getSuggestions: async (query: string): Promise<SearchSuggestion[]> => {
        if (!query || query.length < 2) {
            return [];
        }
        const response = await axios.get(`${API_URL}/search/suggestions`, {
            params: { q: query }
        });
        return response.data;
    },

    /**
     * Search for nearby listings
     */
    searchNearby: async (
        latitude: number,
        longitude: number,
        radiusKm: number = 5,
        page: number = 0,
        size: number = 20
    ) => {
        const response = await axios.get(`${API_URL}/search/nearby`, {
            params: {
                lat: latitude,
                lng: longitude,
                radius: radiusKm,
                page,
                size
            }
        });
        return response.data;
    },

    /**
     * Save a search
     */
    saveSearch: async (request: SavedSearchRequest): Promise<SavedSearch> => {
        const response = await axios.post(`${API_URL}/search/saved`, request);
        return response.data;
    },

    /**
     * Get all saved searches
     */
    getSavedSearches: async (): Promise<SavedSearch[]> => {
        const response = await axios.get(`${API_URL}/search/saved`);
        return response.data;
    },

    /**
     * Get a specific saved search
     */
    getSavedSearch: async (id: number): Promise<SavedSearch> => {
        const response = await axios.get(`${API_URL}/search/saved/${id}`);
        return response.data;
    },

    /**
     * Update a saved search
     */
    updateSavedSearch: async (id: number, request: SavedSearchRequest): Promise<SavedSearch> => {
        const response = await axios.put(`${API_URL}/search/saved/${id}`, request);
        return response.data;
    },

    /**
     * Delete a saved search
     */
    deleteSavedSearch: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/search/saved/${id}`);
    },

    /**
     * Execute a saved search
     */
    executeSavedSearch: async (id: number, page: number = 0, size: number = 20) => {
        const response = await axios.get(`${API_URL}/search/saved/${id}/execute`, {
            params: { page, size }
        });
        return response.data;
    }
};

export default searchService;
