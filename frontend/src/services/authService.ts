import { api } from './api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  MessageResponse,
  Role
} from '../types';

interface ForgotPasswordRequest {
  email?: string;
  phoneNumber?: string;
  method: 'EMAIL' | 'SMS';
}

interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const AuthService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);

      const user: User = {
        id: response.id,
        username: response.username,
        email: response.email,
        name: response.name || '',
        surname: response.surname || '',
        phoneNumber: response.phoneNumber,
        profilePicture: response.profilePicture,
        roles: response.roles.map(r => r as Role), // Assuming roles match
        enabled: true,
        createdAt: response.createdAt || new Date().toISOString(),
        updatedAt: response.updatedAt || new Date().toISOString()
      };

      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    return response;
  },

  register: async (data: RegisterRequest & { profilePicture?: File }): Promise<MessageResponse> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('surname', data.surname);
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);

    if (data.phoneNumber) {
      formData.append('phoneNumber', data.phoneNumber);
    }

    if (data.profilePicture) {
      formData.append('file', data.profilePicture);
    }

    return await api.post<MessageResponse>('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  setUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    return await api.post<MessageResponse>('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<MessageResponse> => {
    return await api.post<MessageResponse>('/auth/reset-password', data);
  }
};