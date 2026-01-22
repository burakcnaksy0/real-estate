import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LandService } from '../../services/landService';
import { Land, LandFilterRequest } from '../../types';
import {
    MapPin,
    Calendar,
    Tag,
    Image as ImageIcon,
    Filter,
    Search,
    SlidersHorizontal,
    X,
    ArrowRight,
    Trees,
    Maximize,
    Map
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

export const LandListPage: React.FC = () => {
    const navigate = useNavigate();
    const [lands, setLands] = useState<Land[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

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
            Object.keys(filters).forEach(key => {
                const value = filters[key as keyof LandFilterRequest];
                if (value !== undefined && value !== '' && value !== null) {
                    // @ts-ignore
                    cleanFilters[key] = typeof value === 'string' ? value.trim() : value;
                }
            });

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
        setShowMobileFilters(false);
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
            maximumFractionDigits: 0
        }).format(price);
    };

    const getLandTypeLabel = (type: string) => {
        switch (type) {
            case 'FIELD': return 'Tarla';
            case 'GARDEN': return 'Bahçe';
            case 'ZONED': return 'İmarlı Arsa';
            default: return type;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 font-sans">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Satılık Arsa & Arazi İlanları</h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            {totalElements} arsa ilanı bulundu
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="md:hidden flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-gray-700 shadow-sm"
                        >
                            <Filter className="w-4 h-4" /> Filtrele
                        </button>
                        <button
                            onClick={() => navigate('/lands/create')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                        >
                            + İlan Ver
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar - Filters */}
                    <div className={`lg:col-span-1 ${showMobileFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden lg:block'}`}>
                        <div className="bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:p-6 sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                                    Filtreler
                                </h3>
                                {showMobileFilters && (
                                    <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Location */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Konum</label>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Şehir (Örn: İstanbul)"
                                            value={filters.city || ''}
                                            onChange={(e) => handleFilterChange('city', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="İlçe (Örn: Çatalca)"
                                            value={filters.district || ''}
                                            onChange={(e) => handleFilterChange('district', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Land Type */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Arsa Tipi</label>
                                    <select
                                        value={filters.landType || ''}
                                        onChange={(e) => handleFilterChange('landType', e.target.value || undefined)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Tümü</option>
                                        <option value="FIELD">Tarla</option>
                                        <option value="GARDEN">Bahçe</option>
                                        <option value="ZONED">İmarlı Arsa</option>
                                    </select>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Price Range */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Fiyat Aralığı</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min TL"
                                            value={filters.minPrice || ''}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max TL"
                                            value={filters.maxPrice || ''}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Area (m2) */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Metrekare (m²)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min m²"
                                            value={filters.minSquareMeter || ''}
                                            onChange={(e) => handleFilterChange('minSquareMeter', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max m²"
                                            value={filters.maxSquareMeter || ''}
                                            onChange={(e) => handleFilterChange('maxSquareMeter', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <button
                                        onClick={handleSearch}
                                        className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-gray-900/10"
                                    >
                                        Uygula
                                    </button>
                                    <button
                                        onClick={handleClearFilters}
                                        className="w-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-all"
                                    >
                                        Temizle
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Listing Grid */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse h-[400px]">
                                        <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center text-red-600">
                                <p className="font-medium mb-2">Bir hata oluştu</p>
                                <p className="text-sm opacity-80">{error}</p>
                                <button onClick={handleSearch} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-semibold transition-colors">
                                    Tekrar Dene
                                </button>
                            </div>
                        ) : lands.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 dashed-border shadow-sm text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Sonuç Bulunamadı</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-8">
                                    Aradığınız kriterlere uygun arsa ilanı bulunamadı. Filtreleri temizleyerek veya farklı kriterler deneyerek tekrar arama yapabilirsiniz.
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-6 py-3 bg-emerald-50 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-100 transition-colors"
                                >
                                    Filtreleri Temizle
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {lands.map((land) => (
                                        <Link
                                            key={land.id}
                                            to={`/lands/${land.id}`}
                                            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
                                        >
                                            <div className="relative h-64 overflow-hidden">
                                                <div className="absolute top-4 right-4 z-20">
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm text-white ${land.status === 'ACTIVE' ? 'bg-green-500' :
                                                        land.status === 'SOLD' ? 'bg-red-500' : 'bg-gray-500'
                                                        }`}>
                                                        {land.status === 'ACTIVE' ? 'Aktif' : land.status === 'SOLD' ? 'Satıldı' : 'Pasif'}
                                                    </span>
                                                </div>

                                                {land.imageUrl ? (
                                                    <img
                                                        src={getImageUrl(land.imageUrl) || ''}
                                                        alt={land.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement?.querySelector('.placeholder')?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`placeholder w-full h-full flex items-center justify-center bg-gray-50 ${land.imageUrl ? 'hidden' : ''}`}>
                                                    <img
                                                        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
                                                        className="w-full h-full object-cover opacity-80 grayscale group-hover:grayscale-0 transition-all duration-500"
                                                        alt="Land placeholder"
                                                    />
                                                </div>

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                <div className="absolute top-4 left-4 z-20">
                                                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm border border-white/50 flex items-center gap-1">
                                                        <Trees className="w-3 h-3 text-emerald-600" />
                                                        {getLandTypeLabel(land.landType || '')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="mb-3">
                                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                                                        {land.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{land.description}</p>
                                                </div>

                                                <div className="flex items-center text-gray-500 text-sm mb-4">
                                                    <MapPin className="w-3.5 h-3.5 mr-1" />
                                                    {land.city}, {land.district}
                                                </div>

                                                <div className="flex gap-4 mb-5 text-sm text-gray-700">
                                                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                        <Maximize className="w-4 h-4 text-emerald-500" />
                                                        <span className="font-bold">{land.squareMeter?.toLocaleString()} m²</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                        <Map className="w-4 h-4 text-emerald-500" />
                                                        <span className="font-medium text-gray-600">Ada/Parsel Bilgisi</span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">Satış Fiyatı</p>
                                                        <p className="text-xl font-bold text-emerald-600">
                                                            {formatPrice(land.price, land.currency)}
                                                        </p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-12">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-600"
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
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all ${currentPage === pageNum
                                                                ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-110'
                                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
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
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-600"
                                        >
                                            Sonraki
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
