import { api } from './api';
import { MockAuthService } from './mockAuthService';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  MessageResponse,
  User 
} from '../types';

// Development mode için mock service kullan
const USE_MOCK = process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_BASE_URL;

export class AuthService {
  private static readonly TOKEN_KEY = 'token';
  private static readonly USER_KEY = 'user';

  // Login işlemi
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('Login attempt with credentials:', credentials);
    
    if (USE_MOCK) {
      return MockAuthService.login(credentials);
    }
    
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      console.log('Login response:', response);
      
      // Token ve user bilgilerini localStorage'a kaydet
      this.setToken(response.token);
      this.setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        roles: response.roles.map(role => role as any),
        name: response.name || '',
        surname: response.surname || '',
        enabled: true,
        phoneNumber: response.phoneNumber || '',
        createdAt: response.createdAt || '',
        updatedAt: response.updatedAt || ''
      });
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register işlemi
  static async register(userData: RegisterRequest): Promise<MessageResponse> {
    if (USE_MOCK) {
      return MockAuthService.register(userData);
    }
    
    return await api.post<MessageResponse>('/auth/register', userData);
  }

  // Logout işlemi
  static logout(): void {
    if (USE_MOCK) {
      MockAuthService.logout();
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  // Token işlemleri
  static setToken(token: string): void {
    if (USE_MOCK) {
      MockAuthService.setToken(token);
    } else {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getToken(): string | null {
    if (USE_MOCK) {
      return MockAuthService.getToken();
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    if (USE_MOCK) {
      MockAuthService.removeToken();
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  // User işlemleri
  static setUser(user: User): void {
    if (USE_MOCK) {
      MockAuthService.setUser(user);
    } else {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static getUser(): User | null {
    if (USE_MOCK) {
      return MockAuthService.getUser();
    }
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static removeUser(): void {
    if (USE_MOCK) {
      MockAuthService.removeUser();
    } else {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  // Authentication durumu kontrolleri
  static isAuthenticated(): boolean {
    if (USE_MOCK) {
      return MockAuthService.isAuthenticated();
    }
    
    const token = this.getToken();
    if (!token) return false;

    try {
      // JWT token'ın geçerliliğini kontrol et (basit expiry check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  static hasRole(role: string): boolean {
    if (USE_MOCK) {
      return MockAuthService.hasRole(role);
    }
    const user = this.getUser();
    return user?.roles?.includes(role as any) || false;
  }

  static isAdmin(): boolean {
    if (USE_MOCK) {
      return MockAuthService.isAdmin();
    }
    return this.hasRole('ROLE_ADMIN');
  }

  static isUser(): boolean {
    if (USE_MOCK) {
      return MockAuthService.isUser();
    }
    return this.hasRole('ROLE_USER');
  }

  // Token'dan user ID'sini al
  static getCurrentUserId(): number | null {
    if (USE_MOCK) {
      return MockAuthService.getCurrentUserId();
    }
    const user = this.getUser();
    return user?.id || null;
  }

  // Token'dan username'i al
  static getCurrentUsername(): string | null {
    if (USE_MOCK) {
      return MockAuthService.getCurrentUsername();
    }
    const user = this.getUser();
    return user?.username || null;
  }
}