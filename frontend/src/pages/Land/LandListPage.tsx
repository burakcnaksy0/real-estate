                                                                                                                                                                                                                                import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LandService } from '../../services/landService';
import { Land, LandFilterRequest } from '../../types';
import { MapPin, Calendar, Tag, TrendingUp, Image as ImageIcon, Plus } from 'lucide-react';

export const LandListPage: React.FC = () => {
    const navigate = useNavigate();
    const [lands, setLands] = useState<Land[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [filters, setFilters] = useState<LandFilterRequest>({
        city: '',
        district: '',
        categorySlug: '',
        minPrice: undefined,
        maxPrice: undefined,
        landType: undefined,
        minSquareMeter: undefined,
        maxSquareMeter: undefined,
    });

    const pageSize = 12;

    const fetchLands = async (page: number = 0) => {
        try {
            setLoading(true);
            setError(null);

            const cleanFilters: LandFilterRequest = {};
            if (filters.city?.trim()) cleanFilters.city = filters.city.trim();
            if (filters.district?.trim()) cleanFilters.district = filters.district.trim();
            if (filters.categorySlug?.trim()) cleanFilters.categorySlug = filters.categorySlug.trim();
            if (filters.minPrice !== undefined && filters.minPrice > 0) cleanFilters.minPrice = filters.minPrice;
            if (filters.maxPrice !== undefined && filters.maxPrice > 0) cleanFilters.maxPrice = filters.maxPrice;
            if (filters.landType) cleanFilters.landType = filters.landType;
            if (filters.minSquareMeter !== undefined && filters.minSquareMeter > 0) cleanFilters.minSquareMeter = filters.minSquareMeter;
            if (filters.maxSquareMeter !== undefined && filters.maxSquareMeter > 0) cleanFilters.maxSquareMeter = filters.maxSquareMeter;

            const response = await LandService.search(cleanFilters, {
                page,
                size: pageSize,
                sort: 'createdAt,desc',
            });

            setLands(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            setCurrentPage(page);
        } catch (err: any) {
            setError(err.message || 'Arsalar yüklenirken bir hata oluştu');
            console.error('Error fetching lands:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLands(0);
    }, []);

    const handleFilterChange = (key: keyof LandFilterRequest, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        fetchLands(0);
    };

    const handleClearFilters = () => {
        setFilters({
            city: '',
            district: '',
            categorySlug: '',
            minPrice: undefined,
            maxPrice: undefined,
            landType: undefined,
            minSquareMeter: undefined,
            maxSquareMeter: undefined,
        });
        setTimeout(() => fetchLands(0), 100);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchLands(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Arsa İlanları</h1>
                        <p className="text-green-100">
                            {totalElements > 0 ? `${totalElements} arsa ilanı bulundu` : 'Arsa ilanlarını keşfedin'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/lands/create')}
                        className="bg-white text-green-600 hover:bg-green-50 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">İlan Ver</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Filtrele
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                        <input
                            type="text"
                            value={filters.city || ''}
                            onChange={(e) => handleFilterChange('city', e.target.value)}
                            placeholder="Örn: İstanbul"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                        <input
                            type="text"
                            value={filters.district || ''}
                            onChange={(e) => handleFilterChange('district', e.target.value)}
                            placeholder="Örn: Kadıköy"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arsa Tipi</label>
                        <select
                            value={filters.landType || ''}
                            onChange={(e) => handleFilterChange('landType', e.target.value || undefined)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Tümü</option>
                            <option value="FIELD">Tarla</option>
                            <option value="GARDEN">Bahçe</option>
                            <option value="ZONED">İmarlı Arsa</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Fiyat</label>
                        <input
                            type="number"
                            value={filters.minPrice || ''}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Fiyat</label>
                        <input
                            type="number"
                            value={filters.maxPrice || ''}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="999999999"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min M²</label>
                        <input
                            type="number"
                            value={filters.minSquareMeter || ''}
                            onChange={(e) => handleFilterChange('minSquareMeter', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max M²</label>
                        <input
                            type="number"
                            value={filters.maxSquareMeter || ''}
                            onChange={(e) => handleFilterChange('maxSquareMeter', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="999999"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSearch}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
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

            {/* Loading */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="mt-4 text-gray-600">Yükleniyor...</p>
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Listings Grid */}
            {!loading && !error && lands.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lands.map((land) => (
                            <Link
                                key={land.id}
                                to={`/lands/${land.id}`}
                                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden group flex flex-col h-full"
                            >
                                <div className="relative h-56 bg-gray-100 overflow-hidden shrink-0">
                                    {land.imageUrl ? (
                                        <img
                                            src={`http://localhost:8080${land.imageUrl}?t=${Date.now()}`}
                                            alt={land.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Resim+Yok';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ImageIcon className="w-16 h-16 opacity-50" />
                                        </div>
                                    )}
                                    {land.status && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm text-white ${land.status === 'ACTIVE' ? 'bg-green-500' :
                                                land.status === 'SOLD' ? 'bg-red-500' : 'bg-gray-500'
                                                }`}>
                                                {land.status === 'ACTIVE' ? 'Aktif' : land.status === 'SOLD' ? 'Satıldı' : 'Pasif'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200 mb-3 line-clamp-2">
                                        {land.title}
                                    </h3>

                                    {land.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{land.description}</p>
                                    )}

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span>{land.city}{land.district && `, ${land.district}`}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>{formatDate(land.createdAt)}</span>
                                        </div>
                                        {land.squareMeter && (
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <span className="font-medium">{land.squareMeter} m²</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="flex items-center">
                                            <Tag className="w-4 h-4 mr-2 text-green-600" />
                                            <span className="text-xl font-bold text-green-600">
                                                {formatPrice(land.price, land.currency)}
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
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Önceki
                            </button>
                            <div className="flex gap-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i;
                                    if (totalPages > 5) {
                                        if (currentPage < 3) pageNum = i;
                                        else if (currentPage > totalPages - 3) pageNum = totalPages - 5 + i;
                                        else pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-4 py-2 rounded-lg ${currentPage === pageNum
                                                ? 'bg-green-600 text-white'
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
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sonraki
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!loading && !error && lands.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg">Henüz arsa ilanı bulunmuyor.</p>
                    <p className="text-gray-500 mt-2">Filtreleri değiştirerek tekrar deneyin.</p>
                </div>
            )}
        </div>
    );
};
