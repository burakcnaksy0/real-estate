import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  MessageResponse,
  User 
} from '../types';

// Mock users database
const mockUsers: Array<User & { password: string }> = [
  {
    id: 1,
    name: 'Burak',
    surname: 'Aksoy',
    username: 'burak',
    email: 'burak@example.com',
    password: '123456',
    phoneNumber: '0555 123 45 67',
    enabled: true,
    roles: ['ROLE_USER' as any],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Admin',
    surname: 'User',
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    phoneNumber: '0555 987 65 43',
    enabled: true,
    roles: ['ROLE_ADMIN' as any, 'ROLE_USER' as any],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export class MockAuthService {
  private static readonly TOKEN_KEY = 'token';
  private static readonly USER_KEY = 'user';

  // Mock JWT token generator
  private static generateMockToken(user: User): string {
    const payload = {
      sub: user.username,
      userId: user.id,
      roles: user.roles,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    // Simple base64 encoding for mock token
    return 'mock.' + btoa(JSON.stringify(payload)) + '.signature';
  }

  // Login işlemi
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('Mock login attempt:', credentials);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by username or email
    const user = mockUsers.find(u => 
      u.username === credentials.username || 
      u.email === credentials.username
    );
    
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }
    
    if (user.password !== credentials.password) {
      throw new Error('Şifre hatalı');
    }
    
    if (!user.enabled) {
      throw new Error('Hesabınız devre dışı bırakılmış');
    }
    
    const token = this.generateMockToken(user);
    
    const response: AuthResponse = {
      token,
      type: 'Bearer',
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      surname: user.surname,
      phoneNumber: user.phoneNumber,
      roles: user.roles.map(role => role as string),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
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
    
    console.log('Mock login success:', response);
    return response;
  }

  // Register işlemi
  static async register(userData: RegisterRequest): Promise<MessageResponse> {
    console.log('Mock register attempt:', userData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if username already exists
    const existingUsername = mockUsers.find(u => u.username === userData.username);
    if (existingUsername) {
      throw new Error('Bu kullanıcı adı zaten kullanılıyor');
    }
    
    // Check if email already exists
    const existingEmail = mockUsers.find(u => u.email === userData.email);
    if (existingEmail) {
      throw new Error('Bu e-posta adresi zaten kullanılıyor');
    }
    
    // Check if phone number already exists (if provided)
    if (userData.phoneNumber) {
      const existingPhone = mockUsers.find(u => u.phoneNumber === userData.phoneNumber);
      if (existingPhone) {
        throw new Error('Bu telefon numarası zaten kullanılıyor');
      }
    }
    
    // Create new user
    const newUser: User & { password: string } = {
      id: mockUsers.length + 1,
      name: userData.name,
      surname: userData.surname,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phoneNumber || '',
      enabled: true,
      roles: ['ROLE_USER' as any],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    console.log('Mock register success for:', userData.username);
    return { message: 'Kayıt başarıyla tamamlandı' };
  }

  // Token işlemleri
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // User işlemleri
  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Authentication durumu kontrolleri
  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Mock token validation
      if (!token.startsWith('mock.')) return false;
      
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

  static logout(): void {
    this.removeToken();
    this.removeUser();
  }

  static hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.roles?.includes(role as any) || false;
  }

  static isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  static isUser(): boolean {
    return this.hasRole('ROLE_USER');
  }

  static getCurrentUserId(): number | null {
    const user = this.getUser();
    return user?.id || null;
  }

  static getCurrentUsername(): string | null {
    const user = this.getUser();
    return user?.username || null;
  }
}