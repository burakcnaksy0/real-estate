import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '../../services/authService';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../../types';
import { toast } from 'react-toastify';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: AuthService.getUser(),
  token: AuthService.getToken(),
  isAuthenticated: AuthService.isAuthenticated(),
  isLoading: false,
  error: null,
};

// Async thunks
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      console.log('Auth slice - login attempt:', credentials);
      const response = await AuthService.login(credentials);
      console.log('Auth slice - login success:', response);
      toast.success('Başarıyla giriş yaptınız!');
      return response;
    } catch (error: any) {
      console.error('Auth slice - login error:', error);
      const message = error.response?.data?.message || 'Giriş yapılırken hata oluştu';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      console.log('Auth slice - register attempt:', userData);
      const response = await AuthService.register(userData);
      console.log('Auth slice - register success:', response);
      toast.success('Kayıt başarıyla tamamlandı! Giriş yapabilirsiniz.');
      return response;
    } catch (error: any) {
      console.error('Auth slice - register error:', error);
      const message = error.response?.data?.message || error.message || 'Kayıt olurken hata oluştu';
      console.error('Auth slice - register error message:', message);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      AuthService.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      toast.info('Çıkış yapıldı');
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      AuthService.setUser(action.payload);
    },
    checkAuthStatus: (state) => {
      state.isAuthenticated = AuthService.isAuthenticated();
      state.user = AuthService.getUser();
      state.token = AuthService.getToken();
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = {
          id: action.payload.id,
          username: action.payload.username,
          email: action.payload.email,
          roles: action.payload.roles.map(role => role as any),
          name: action.payload.name || '',
          surname: action.payload.surname || '',
          enabled: true,
          phoneNumber: action.payload.phoneNumber || '',
          profilePicture: action.payload.profilePicture, // Add profilePicture
          createdAt: action.payload.createdAt || '',
          updatedAt: action.payload.updatedAt || ''
        };
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setUser, checkAuthStatus } = authSlice.actions;
export default authSlice.reducer;