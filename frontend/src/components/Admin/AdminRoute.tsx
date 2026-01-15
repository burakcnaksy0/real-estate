import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Role } from '../../types';

interface AdminRouteProps {
    children: ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const hasAdminRole = user?.roles?.includes(Role.ROLE_ADMIN);

    if (!hasAdminRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};
