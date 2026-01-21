import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

// API Base Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Axios instance oluşturma
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    // Content-Type is handled automatically by Axios
  },
});

// Request interceptor - JWT token ekleme
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig): any => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    if (error.response) {
      const { status, data } = error.response;
      console.error('Error Response:', { status, data });

      // JWT signature hatası kontrolü - backend'den gelen hata mesajını kontrol et
      const isJwtSignatureError =
        data?.message?.includes('JWT signature does not match') ||
        data?.error?.includes('JWT signature does not match') ||
        (typeof data === 'string' && data.includes('JWT signature does not match'));

      if (isJwtSignatureError) {
        // JWT imzası geçersiz - token yanlış secret ile oluşturulmuş
        console.warn('Invalid JWT signature detected - clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Login sayfasında değilsek yönlendir
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
          toast.error('Oturum bilgileriniz geçersiz. Lütfen tekrar giriş yapın.');
        }
        return Promise.reject(error);
      }

      switch (status) {
        case 401:
          // Unauthorized - Token geçersiz
          // Login isteğinden geliyorsa redirect yapma (Kullanıcı adı/şifre hatasıdır)
          if (error.config && error.config.url && error.config.url.includes('/auth/login')) {
            // Let the error pass through to the catch block in authSlice
            // But we still want to reject it, which happens at the end.
            // We just don't want to redirect or show "Session expired" message.
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          }
          break;
        case 403:
          toast.error('Bu işlem için yetkiniz bulunmamaktadır.');
          break;
        case 404:
          toast.error('Aradığınız kaynak bulunamadı.');
          break;
        case 422:
          // Validation errors
          if (data.errors) {
            Object.values(data.errors).flat().forEach((error: any) => {
              toast.error(error);
            });
          } else {
            toast.error(data.message || 'Girilen bilgilerde hata var.');
          }
          break;
        case 500:
          toast.error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
          break;
        default:
          toast.error(data.message || 'Bir hata oluştu.');
      }
    } else if (error.request) {
      console.error('Network Error:', error.request);
      toast.error('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    } else {
      console.error('Request Error:', error.message);
      toast.error('Beklenmeyen bir hata oluştu.');
    }

    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get(url, config).then(response => response.data),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.post(url, data, config).then(response => response.data),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.put(url, data, config).then(response => response.data),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete(url, config).then(response => response.data),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.patch(url, data, config).then(response => response.data),
};

// Utility functions
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  return searchParams.toString();
};

export const buildPageParams = (page?: number, size?: number, sort?: string): Record<string, any> => {
  const params: Record<string, any> = {};

  if (page !== undefined) params.page = page;
  if (size !== undefined) params.size = size;
  if (sort) params.sort = sort;

  return params;
};

export default apiClient;