import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListingService, GeneralFilterRequest } from '../services/listingService';
import { BaseListing, ListingStatus } from '../types';
import { MapPin, Calendar, Tag, TrendingUp, Image as ImageIcon } from 'lucide-react';

export const AllListingsPage: React.FC = () => {
    const [listings, setListings] = useState<BaseListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filter state
    const [filters, setFilters] = useState<GeneralFilterRequest>({
        city: '',
        district: '',
        categorySlug: '',
        status: undefined,
        minPrice: undefined,
        maxPrice: undefined,
    });

    const pageSize = 12;

    const fetchListings = async (page: number = 0) => {
        try {
            setLoading(true);
            setError(null);

            // Boş filtreleri temizle
            const cleanFilters: GeneralFilterRequest = {};
            if (filters.city && filters.city.trim()) cleanFilters.city = filters.city.trim();
            if (filters.district && filters.district.trim()) cleanFilters.district = filters.district.trim();
            if (filters.categorySlug && filters.categorySlug.trim()) cleanFilters.categorySlug = filters.categorySlug.trim();
            if (filters.status) cleanFilters.status = filters.status;
            if (filters.minPrice !== undefined && filters.minPrice > 0) cleanFilters.minPrice = filters.minPrice;
            if (filters.maxPrice !== undefined && filters.maxPrice > 0) cleanFilters.maxPrice = filters.maxPrice;

            const response = await ListingService.search(cleanFilters, {
                page,
                size: pageSize,
                sort: 'createdAt,desc',
            });

            setListings(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            setCurrentPage(page);
        } catch (err: any) {
            setError(err.message || 'İlanlar yüklenirken bir hata oluştu');
            console.error('Error fetching listings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings(0);
    }, []);

    const handleFilterChange = (key: keyof GeneralFilterRequest, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        fetchListings(0);
    };

    const handleClearFilters = () => {
        setFilters({
            city: '',
            district: '',
            categorySlug: '',
            status: undefined,
            minPrice: undefined,
            maxPrice: undefined,
        });
        setTimeout(() => fetchListings(0), 100);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchListings(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getCategoryName = (slug: string): string => {
        const categoryMap: Record<string, string> = {
            'konut': 'Konut',
            'arsa': 'Arsa',
            'isyeri': 'İşyeri',
            'vasita': 'Vasıta',
        };
        return categoryMap[slug] || slug;
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

    const getDetailUrl = (listing: BaseListing): string => {
        // listingType kontrolü (Backend'den gelen kesin tip)
        if (listing.listingType === 'REAL_ESTATE') return `/real-estates/${listing.id}`;
        if (listing.listingType === 'VEHICLE') return `/vehicles/${listing.id}`;
        if (listing.listingType === 'LAND') return `/lands/${listing.id}`;
        if (listing.listingType === 'WORKPLACE') return `/workplaces/${listing.id}`;

        // Fallback: Category slug kontrolü
        const slug = listing.categorySlug?.toLowerCase();
        switch (slug) {
            case 'konut':
            case 'emlak':
                return `/real-estates/${listing.id}`;
            case 'vasita':
            case 'arac':
            case 'vehicle':
                return `/vehicles/${listing.id}`;
            case 'arsa':
            case 'land':
                return `/lands/${listing.id}`;
            case 'isyeri':
            case 'workplace':
                return `/workplaces/${listing.id}`;
            default:
                return `/listings/${listing.id}`;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Tüm İlanlar</h1>
                <p className="text-blue-100">
                    {totalElements > 0 ? `${totalElements} ilan bulundu` : 'İlanları keşfedin'}
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Filtrele
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* City */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                        <input
                            type="text"
                            value={filters.city || ''}
                            onChange={(e) => handleFilterChange('city', e.target.value)}
                            placeholder="Örn: İstanbul"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* District */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                        <input
                            type="text"
                            value={filters.district || ''}
                            onChange={(e) => handleFilterChange('district', e.target.value)}
                            placeholder="Örn: Kadıköy"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <select
                            value={filters.categorySlug || ''}
                            onChange={(e) => handleFilterChange('categorySlug', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tümü</option>
                            <option value="konut">Konut</option>
                            <option value="arsa">Arsa</option>
                            <option value="isyeri">İşyeri</option>
                            <option value="vasita">Vasıta</option>
                        </select>
                    </div>

                    {/* Min Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Fiyat</label>
                        <input
                            type="number"
                            value={filters.minPrice || ''}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Max Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Fiyat</label>
                        <input
                            type="number"
                            value={filters.maxPrice || ''}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="999999999"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                        <select
                            value={filters.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value as ListingStatus || undefined)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tümü</option>
                            <option value="ACTIVE">Aktif</option>
                            <option value="PASSIVE">Pasif</option>
                            <option value="SOLD">Satıldı</option>
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSearch}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                        Ara
                    </button>
                    <button
                        onClick={handleClearFilters}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                        Temizle
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">İlanlar yükleniyor...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Listings Grid */}
            {!loading && !error && listings.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing) => (
                            <Link
                                key={listing.id}
                                to={getDetailUrl(listing)}
                                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
                            >
                                <div className="relative h-56 bg-gray-100 overflow-hidden">
                                    {listing.imageUrl ? (
                                        <img
                                            src={`http://localhost:8080${listing.imageUrl}?t=${Date.now()}`}
                                            onError={(e) => {
                                                console.error("Image load failed for:", listing.imageUrl);
                                                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Resim+Yok';
                                            }}
                                            alt={listing.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                            <ImageIcon className="w-16 h-16 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm text-white ${listing.status === 'ACTIVE' ? 'bg-green-500' :
                                            listing.status === 'SOLD' ? 'bg-red-500' : 'bg-gray-500'
                                            }`}>
                                            {listing.status === 'ACTIVE' ? 'Aktif' : listing.status === 'SOLD' ? 'Satıldı' : 'Pasif'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2" title={listing.title}>
                                            {listing.title}
                                        </h3>
                                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full whitespace-nowrap shrink-0">
                                            {getCategoryName(listing.categorySlug)}
                                        </span>
                                    </div>

                                    {listing.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
                                    )}

                                    <div className="mt-auto space-y-2 mb-4">
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <MapPin className="w-4 h-4 mr-2 shrink-0" />
                                            <span className="truncate">
                                                {listing.city}
                                                {listing.district && `, ${listing.district}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <Calendar className="w-4 h-4 mr-2 shrink-0" />
                                            <span>{formatDate(listing.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
                                        <div className="flex items-center">
                                            <Tag className="w-4 h-4 mr-2 text-green-600" />
                                            <span className="text-xl font-bold text-green-600">
                                                {formatPrice(listing.price, listing.currency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Önceki
                            </button>
                            <div className="flex gap-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i;
                                    if (totalPages > 5) {
                                        if (currentPage < 3) {
                                            pageNum = i;
                                        } else if (currentPage > totalPages - 3) {
                                            pageNum = totalPages - 5 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages - 1}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Sonraki
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!loading && !error && listings.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg">Henüz ilan bulunmuyor.</p>
                    <p className="text-gray-500 mt-2">Filtreleri değiştirerek tekrar deneyin.</p>
                </div>
            )}
        </div>
    );
};
