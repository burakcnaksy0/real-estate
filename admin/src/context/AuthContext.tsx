import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import type { User, LoginRequest, AuthResponse } from '../types/auth';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
    user: User | null;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem('vesta_admin_token');
            const savedUser = localStorage.getItem('vesta_admin_user');

            if (token && savedUser) {
                try {
                    // Check if token is expired
                    const decoded: any = jwtDecode(token);
                    if (decoded.exp * 1000 < Date.now()) {
                        logout();
                    } else {
                        const parsed = JSON.parse(savedUser);
                        if (!parsed || !parsed.roles) throw new Error("Invalid user");
                        setUser(parsed);
                    }
                } catch (e) {
                    console.error('Auth check failed', e);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (data: LoginRequest) => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', data);
            const { token, roles } = response.data;

            if (!roles?.some(role => role === 'ADMIN' || role === 'ROLE_ADMIN')) {
                throw new Error('Access denied. Admin privileges required.');
            }

            localStorage.setItem('vesta_admin_token', token);
            // Construct user object from response since it has details
            const userObj: User = {
                id: response.data.id,
                username: response.data.username,
                email: response.data.email,
                roles: response.data.roles,
                name: response.data.name,
                surname: response.data.surname,
                profilePicture: response.data.profilePicture
            };

            localStorage.setItem('vesta_admin_user', JSON.stringify(userObj));
            setUser(userObj);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('vesta_admin_token');
        localStorage.removeItem('vesta_admin_user');
        setUser(null);
    };

    const isAdmin = user?.roles?.some(role => role === 'ADMIN' || role === 'ROLE_ADMIN') ?? false;

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
