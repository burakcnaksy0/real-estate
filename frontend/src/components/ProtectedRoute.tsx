import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Eğer authentication gerekli ama kullanıcı giriş yapmamışsa
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Eğer admin yetkisi gerekli ama kullanıcı admin değilse
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Eğer kullanıcı giriş yapmış ve login/register sayfasına gitmeye çalışıyorsa
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};