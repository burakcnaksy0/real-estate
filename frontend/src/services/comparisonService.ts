import { api } from './api';
import { CompareRequest, ComparisonResponse } from '../types';

export const comparisonService = {
    compareListings: async (listingIds: number[]): Promise<ComparisonResponse> => {
        const request: CompareRequest = { listingIds };
        return api.post<ComparisonResponse>('/compare', request);
    },
};

export default comparisonService;
