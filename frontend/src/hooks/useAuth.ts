import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store';
import { loginAsync, registerAsync, logout, checkAuthStatus } from '../store/slices/authSlice';
import { LoginRequest, RegisterRequest } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = useCallback(
    (credentials: LoginRequest) => {
      return dispatch(loginAsync(credentials)).unwrap();
    },
    [dispatch]
  );

  const register = useCallback(
    (userData: RegisterRequest) => {
      return dispatch(registerAsync(userData)).unwrap();
    },
    [dispatch]
  );

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const checkAuth = useCallback(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const isAdmin = useCallback(() => {
    return user?.roles?.includes('ROLE_ADMIN' as any) || false;
  }, [user]);

  const isUser = useCallback(() => {
    return user?.roles?.includes('ROLE_USER' as any) || false;
  }, [user]);

  const hasRole = useCallback(
    (role: string) => {
      return user?.roles?.includes(role as any) || false;
    },
    [user]
  );

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout: logoutUser,
    checkAuth,

    // Utilities
    isAdmin,
    isUser,
    hasRole,
  };
};