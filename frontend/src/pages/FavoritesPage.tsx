import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Calendar, Tag, Trash2 } from 'lucide-react';
import { FavoriteService } from '../services/favoriteService';
import { Favorite } from '../types';

export const FavoritesPage: React.FC = () => {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const data = await FavoriteService.getUserFavorites();
            setFavorites(data);
        } catch (err: any) {
            setError(err.message || 'Favoriler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (listingId: number) => {
        if (window.confirm('Bu ilanı favorilerden kaldırmak istediğinizden emin misiniz?')) {
            try {
                await FavoriteService.removeFavorite(listingId);
                setFavorites(favorites.filter(f => f.listingId !== listingId));
            } catch (error) {
                console.error('Error removing favorite:', error);
            }
        }
    };

    const getDetailUrl = (favorite: Favorite): string => {
        const { listingType, listingId } = favorite;
        switch (listingType) {
            case 'REAL_ESTATE':
                return `/real-estates/${listingId}`;
            case 'VEHICLE':
                return `/vehicles/${listingId}`;
            case 'LAND':
                return `/lands/${listingId}`;
            case 'WORKPLACE':
                return `/workplaces/${listingId}`;
            default:
                return `/listings/${listingId}`;
        }
    };

    const formatPrice = (price: number, currency: string): string => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency || 'TRY',
        }).format(price);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Favoriler yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl p-8">
                <div className="flex items-center gap-3">
                    <Heart className="h-8 w-8" />
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Favorilerim</h1>
                        <p className="text-red-100">
                            {favorites.length > 0
                                ? `${favorites.length} favori ilanınız var`
                                : 'Henüz favori ilanınız yok'}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Favorites Grid */}
            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite) => (
                        <div
                            key={favorite.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
                        >
                            <Link to={getDetailUrl(favorite)} className="flex-1 flex flex-col">
                                <div className="relative h-56 bg-gray-100 overflow-hidden">
                                    {favorite.imageUrl ? (
                                        <img
                                            src={`http://localhost:8080${favorite.imageUrl}?t=${Date.now()}`}
                                            alt={favorite.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                console.error("Image load failed for:", favorite.imageUrl);
                                                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Resim+Yok';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                            <Heart className="w-16 h-16 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 z-10">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleRemove(favorite.listingId);
                                            }}
                                            className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                                            title="Favorilerden Çıkar"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2" title={favorite.title}>
                                            {favorite.title}
                                        </h3>
                                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full whitespace-nowrap shrink-0">
                                            Favori
                                        </span>
                                    </div>

                                    {favorite.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{favorite.description}</p>
                                    )}

                                    <div className="mt-auto space-y-2 mb-4">
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <MapPin className="w-4 h-4 mr-2 shrink-0" />
                                            <span className="truncate">
                                                {favorite.city}
                                                {favorite.district && `, ${favorite.district}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <Calendar className="w-4 h-4 mr-2 shrink-0" />
                                            <span>Eklendi: {formatDate(favorite.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
                                        <div className="flex items-center">
                                            <Tag className="w-4 h-4 mr-2 text-green-600" />
                                            <span className="text-xl font-bold text-green-600">
                                                {formatPrice(favorite.price, favorite.currency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 text-lg">Henüz favori ilanınız yok.</p>
                    <p className="text-gray-500 mt-2 mb-4">Beğendiğiniz ilanları favorilere ekleyerek buradan kolayca erişebilirsiniz.</p>
                    <Link
                        to="/listings"
                        className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                        İlanları Keşfet
                    </Link>
                </div>
            )}
        </div>
    );
};
