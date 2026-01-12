            import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WorkplaceService } from '../../services/workplaceService';
import { Workplace, WorkplaceFilterRequest } from '../../types';
import { MapPin, Calendar, Tag, TrendingUp, Image as ImageIcon, Plus } from 'lucide-react';

export const WorkplaceListPage: React.FC = () => {
    const navigate = useNavigate();
    const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [filters, setFilters] = useState<WorkplaceFilterRequest>({
        city: '',
        district: '',
        categorySlug: '',
        minPrice: undefined,
        maxPrice: undefined,
        workplaceType: undefined,
        minSquareMeter: undefined,
        maxSquareMeter: undefined,
        minFloorCount: undefined,
        maxFloorCount: undefined,
        furnished: undefined,
    });

    const pageSize = 12;

    const fetchWorkplaces = async (page: number = 0) => {
        try {
            setLoading(true);
            setError(null);

            const cleanFilters: WorkplaceFilterRequest = {};
            if (filters.city?.trim()) cleanFilters.city = filters.city.trim();
            if (filters.district?.trim()) cleanFilters.district = filters.district.trim();
            if (filters.categorySlug?.trim()) cleanFilters.categorySlug = filters.categorySlug.trim();
            if (filters.minPrice !== undefined && filters.minPrice > 0) cleanFilters.minPrice = filters.minPrice;
            if (filters.maxPrice !== undefined && filters.maxPrice > 0) cleanFilters.maxPrice = filters.maxPrice;
            if (filters.workplaceType) cleanFilters.workplaceType = filters.workplaceType;
            if (filters.minSquareMeter !== undefined && filters.minSquareMeter > 0) cleanFilters.minSquareMeter = filters.minSquareMeter;
            if (filters.maxSquareMeter !== undefined && filters.maxSquareMeter > 0) cleanFilters.maxSquareMeter = filters.maxSquareMeter;
            if (filters.minFloorCount !== undefined && filters.minFloorCount > 0) cleanFilters.minFloorCount = filters.minFloorCount;
            if (filters.maxFloorCount !== undefined && filters.maxFloorCount > 0) cleanFilters.maxFloorCount = filters.maxFloorCount;
            if (filters.furnished !== undefined) cleanFilters.furnished = filters.furnished;

            const response = await WorkplaceService.search(cleanFilters, {
                page,
                size: pageSize,
                sort: 'createdAt,desc',
            });

            setWorkplaces(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            setCurrentPage(page);
        } catch (err: any) {
            setError(err.message || 'İşyerleri yüklenirken bir hata oluştu');
            console.error('Error fetching workplaces:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkplaces(0);
    }, []);

    const handleFilterChange = (key: keyof WorkplaceFilterRequest, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        fetchWorkplaces(0);
    };

    const handleClearFilters = () => {
        setFilters({
            city: '',
            district: '',
            categorySlug: '',
            minPrice: undefined,
            maxPrice: undefined,
            workplaceType: undefined,
            minSquareMeter: undefined,
            maxSquareMeter: undefined,
            minFloorCount: undefined,
            maxFloorCount: undefined,
            furnished: undefined,
        });
        setTimeout(() => fetchWorkplaces(0), 100);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchWorkplaces(newPage);
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
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">İşyeri İlanları</h1>
                        <p className="text-purple-100">
                            {totalElements > 0 ? `${totalElements} işyeri ilanı bulundu` : 'İşyeri ilanlarını keşfedin'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/workplaces/create')}
                        className="bg-white text-purple-600 hover:bg-purple-50 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-lg"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                        <input
                            type="text"
                            value={filters.district || ''}
                            onChange={(e) => handleFilterChange('district', e.target.value)}
                            placeholder="Örn: Kadıköy"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">İşyeri Tipi</label>
                        <select
                            value={filters.workplaceType || ''}
                            onChange={(e) => handleFilterChange('workplaceType', e.target.value || undefined)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Tümü</option>
                            <option value="OFFICE">Ofis</option>
                            <option value="SHOP">Dükkan</option>
                            <option value="WAREHOUSE">Depo</option>
                            <option value="FACTORY">Fabrika</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Fiyat</label>
                        <input
                            type="number"
                            value={filters.minPrice || ''}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Fiyat</label>
                        <input
                            type="number"
                            value={filters.maxPrice || ''}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="999999999"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Eşyalı</label>
                        <select
                            value={filters.furnished === undefined ? '' : filters.furnished.toString()}
                            onChange={(e) => handleFilterChange('furnished', e.target.value === '' ? undefined : e.target.value === 'true')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Tümü</option>
                            <option value="true">Evet</option>
                            <option value="false">Hayır</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min M²</label>
                        <input
                            type="number"
                            value={filters.minSquareMeter || ''}
                            onChange={(e) => handleFilterChange('minSquareMeter', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max M²</label>
                        <input
                            type="number"
                            value={filters.maxSquareMeter || ''}
                            onChange={(e) => handleFilterChange('maxSquareMeter', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="999999"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSearch}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
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
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
            {!loading && !error && workplaces.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workplaces.map((workplace) => (
                            <Link
                                key={workplace.id}
                                to={`/workplaces/${workplace.id}`}
                                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden group flex flex-col h-full"
                            >
                                <div className="relative h-56 bg-gray-100 overflow-hidden shrink-0">
                                    {workplace.imageUrl ? (
                                        <img
                                            src={`http://localhost:8080${workplace.imageUrl}?t=${Date.now()}`}
                                            alt={workplace.title}
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
                                    {workplace.status && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm text-white ${workplace.status === 'ACTIVE' ? 'bg-green-500' :
                                                workplace.status === 'SOLD' ? 'bg-red-500' : 'bg-gray-500'
                                                }`}>
                                                {workplace.status === 'ACTIVE' ? 'Aktif' : workplace.status === 'SOLD' ? 'Satıldı' : 'Pasif'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 mb-3 line-clamp-2">
                                        {workplace.title}
                                    </h3>

                                    {workplace.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{workplace.description}</p>
                                    )}

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span>{workplace.city}{workplace.district && `, ${workplace.district}`}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>{formatDate(workplace.createdAt)}</span>
                                        </div>
                                        {workplace.squareMeter && (
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <span className="font-medium">{workplace.squareMeter} m²</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="flex items-center">
                                            <Tag className="w-4 h-4 mr-2 text-purple-600" />
                                            <span className="text-xl font-bold text-purple-600">
                                                {formatPrice(workplace.price, workplace.currency)}
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
                                                ? 'bg-purple-600 text-white'
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
            {!loading && !error && workplaces.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg">Henüz işyeri ilanı bulunmuyor.</p>
                    <p className="text-gray-500 mt-2">Filtreleri değiştirerek tekrar deneyin.</p>
                </div>
            )}
        </div>
    );
};
