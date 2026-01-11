import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { FavoriteService } from '../../services/favoriteService';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface FavoriteButtonProps {
    listingId: number;
    listingType: string;
    className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ listingId, listingType, className = '' }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkStatus = async () => {
            if (isAuthenticated) {
                try {
                    const status = await FavoriteService.checkFavorite(listingId);
                    setIsFavorite(status);
                } catch (error) {
                    console.error('Error checking favorite status:', error);
                }
            }
        };

        checkStatus();
    }, [listingId, isAuthenticated]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setIsLoading(true);
        try {
            if (isFavorite) {
                await FavoriteService.removeFavorite(listingId);
                setIsFavorite(false);
            } else {
                await FavoriteService.addFavorite(listingId, listingType);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`p-2 rounded-full transition-all duration-200 ${isFavorite
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-600'
                } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
        >
            <Heart
                className={`h-5 w-5 transition-all ${isFavorite ? 'fill-current' : ''}`}
            />
        </button>
    );
};
