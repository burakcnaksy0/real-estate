import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Calendar, Tag, Trash2, ArrowRight, Home, Car, Trees, Briefcase, Search } from 'lucide-react';
import { FavoriteService } from '../services/favoriteService';
import { Favorite } from '../types';
import { getImageUrl } from '../utils/imageUtils';

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
            maximumFractionDigits: 0
        }).format(price);
    };

    const getCategoryIcon = (type: string) => {
        switch (type) {
            case 'REAL_ESTATE': return <Home className="w-4 h-4" />;
            case 'VEHICLE': return <Car className="w-4 h-4" />;
            case 'LAND': return <Trees className="w-4 h-4" />;
            case 'WORKPLACE': return <Briefcase className="w-4 h-4" />;
            default: return <Tag className="w-4 h-4" />;
        }
    }

    const getCategoryLabel = (type: string) => {
        switch (type) {
            case 'REAL_ESTATE': return 'Emlak';
            case 'VEHICLE': return 'Vasıta';
            case 'LAND': return 'Arsa';
            case 'WORKPLACE': return 'İşyeri';
            default: return 'Genel';
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Favoriler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 font-sans">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-xl text-red-600">
                                <Heart className="w-8 h-8 fill-current" />
                            </div>
                            Favorilerim
                        </h1>
                        <p className="text-gray-500 mt-2 ml-14">
                            {favorites.length > 0
                                ? `${favorites.length} favori ilanınız listeleniyor`
                                : 'Henüz favori ilanınız bulunmuyor'
                            }
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center mb-8">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                )}

                {/* Favorites Grid */}
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((favorite) => (
                            <Link
                                key={favorite.id}
                                to={getDetailUrl(favorite)}
                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
                            >
                                <div className="relative h-60 overflow-hidden">
                                    <div className="absolute top-4 right-4 z-20">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleRemove(favorite.listingId);
                                            }}
                                            className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-red-50 active:scale-90 transition-all group/btn border border-white/50"
                                            title="Favorilerden Çıkar"
                                        >
                                            <Heart className="w-5 h-5 text-red-600 fill-red-600 group-hover/btn:scale-110 transition-transform" />
                                        </button>
                                    </div>

                                    {favorite.imageUrl ? (
                                        <img
                                            src={getImageUrl(favorite.imageUrl) || ''}
                                            alt={favorite.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.querySelector('.placeholder')?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <div className={`placeholder w-full h-full flex items-center justify-center bg-gray-50 ${favorite.imageUrl ? 'hidden' : ''}`}>
                                        <img
                                            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
                                            className="w-full h-full object-cover opacity-80 grayscale group-hover:grayscale-0 transition-all duration-500"
                                            alt="Listing placeholder"
                                        />
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>


                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm border border-white/50 flex items-center gap-1">
                                            {getCategoryIcon(favorite.listingType)}
                                            {getCategoryLabel(favorite.listingType)}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-3">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1" title={favorite.title}>
                                            {favorite.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[2.5em]">{favorite.description}</p>
                                    </div>

                                    <div className="flex items-center text-gray-500 text-sm mb-4">
                                        <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                        <span className="truncate">{favorite.city}, {favorite.district}</span>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">Fiyat</p>
                                            <p className="text-xl font-bold text-red-600">
                                                {formatPrice(favorite.price, favorite.currency)}
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 dashed-border shadow-sm text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz Favori İlanınız Yok</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Beğendiğiniz ilanları favorilere ekleyerek takip edebilir, fiyat değişikliklerinden haberdar olabilirsiniz.
                        </p>
                        <Link
                            to="/listings"
                            className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-gray-900/10 active:scale-[0.98] inline-flex items-center gap-2"
                        >
                            <Search className="w-4 h-4" />
                            İlanları Keşfet
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
