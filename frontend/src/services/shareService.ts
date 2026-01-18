import { api } from './api';

export interface ShareListingRequest {
    recipientId: number;
    listingId: number;
    listingType: string;
    message?: string;
}

export interface ShareableContact {
    id: number;
    username: string;
    email: string;
}

export const ShareService = {
    shareListing: async (request: ShareListingRequest) => {
        return api.post('/messages/share-listing', request);
    },

    getShareableContacts: async (): Promise<ShareableContact[]> => {
        return api.get('/messages/shareable-contacts');
    },
};
