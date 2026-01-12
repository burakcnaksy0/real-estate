import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../../services/authService';

export const OAuth2RedirectHandler: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');
            const error = params.get('error');

            if (token) {
                try {
                    // Store the token
                    localStorage.setItem('token', token);

                    // Fetch user info from backend
                    await AuthService.getCurrentUserInfo();

                    // Reload the page to trigger Redux state initialization
                    window.location.href = '/';
                } catch (err) {
                    console.error('Failed to fetch user info:', err);
                    navigate('/login', {
                        replace: true,
                        state: { error: 'Kullanıcı bilgileri alınamadı' }
                    });
                }
            } else if (error) {
                // Redirect to login with error message
                navigate('/login', {
                    replace: true,
                    state: { error: decodeURIComponent(error) }
                });
            } else {
                // No token or error, redirect to login
                navigate('/login', { replace: true });
            }
        };

        handleOAuthCallback();
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Giriş yapılıyor...</p>
            </div>
        </div>
    );
};
