import axios from 'axios';
import { MessageCreateRequest, MessageDetailResponse, ConversationResponse } from '../types';

const API_URL = 'http://localhost:8080/api/messages';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const MessageService = {
    // Send a new message
    sendMessage: async (request: MessageCreateRequest): Promise<MessageDetailResponse> => {
        const response = await axios.post<MessageDetailResponse>(API_URL, request, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    // Get all conversations
    getConversations: async (): Promise<ConversationResponse[]> => {
        const response = await axios.get<ConversationResponse[]>(`${API_URL}/conversations`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    // Get conversation with a specific user
    getConversationWithUser: async (otherUserId: number): Promise<MessageDetailResponse[]> => {
        const response = await axios.get<MessageDetailResponse[]>(
            `${API_URL}/conversation/${otherUserId}`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    },

    // Mark message as read
    markAsRead: async (messageId: number): Promise<void> => {
        await axios.put(`${API_URL}/${messageId}/read`, null, {
            headers: getAuthHeader(),
        });
    },

    // Get unread message count
    getUnreadCount: async (): Promise<number> => {
        const response = await axios.get<{ unreadCount: number }>(`${API_URL}/unread-count`, {
            headers: getAuthHeader(),
        });
        return response.data.unreadCount;
    },
};
