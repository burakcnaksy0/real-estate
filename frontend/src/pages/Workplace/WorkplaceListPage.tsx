import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WorkplaceService } from '../../services/workplaceService';
import { Workplace, WorkplaceFilterRequest } from '../../types';
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
    Building2,
    Briefcase,
    Layers,
    Maximize
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

export const WorkplaceListPage: React.FC = () => {
    const navigate = useNavigate();
    const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

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
            Object.keys(filters).forEach(key => {
                const value = filters[key as keyof WorkplaceFilterRequest];
                if (value !== undefined && value !== '' && value !== null) {
                    // @ts-ignore
                    cleanFilters[key] = typeof value === 'string' ? value.trim() : value;
                }
            });

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
        setShowMobileFilters(false);
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
            maximumFractionDigits: 0
        }).format(price);
    };

    const getWorkplaceTypeLabel = (type: string) => {
        switch (type) {
            case 'OFFICE': return 'Ofis';
            case 'SHOP': return 'Dükkan';
            case 'WAREHOUSE': return 'Depo';
            case 'FACTORY': return 'Fabrika';
            default: return type;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 font-sans">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Satılık & Kiralık İşyeri İlanları</h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            {totalElements} işyeri bulundu
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
                            onClick={() => navigate('/workplaces/create')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-amber-600/20 active:scale-[0.98]"
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
                                    <SlidersHorizontal className="w-5 h-5 text-amber-600" />
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
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="İlçe (Örn: Beşiktaş)"
                                            value={filters.district || ''}
                                            onChange={(e) => handleFilterChange('district', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Workplace Type */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">İşyeri Tipi</label>
                                    <select
                                        value={filters.workplaceType || ''}
                                        onChange={(e) => handleFilterChange('workplaceType', e.target.value || undefined)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 outline-none text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Tümü</option>
                                        <option value="OFFICE">Ofis</option>
                                        <option value="SHOP">Dükkan</option>
                                        <option value="WAREHOUSE">Depo</option>
                                        <option value="FACTORY">Fabrika</option>
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
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max TL"
                                            value={filters.maxPrice || ''}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Details */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Detaylar</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min m²"
                                            value={filters.minSquareMeter || ''}
                                            onChange={(e) => handleFilterChange('minSquareMeter', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-1/2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:border-amber-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max m²"
                                            value={filters.maxSquareMeter || ''}
                                            onChange={(e) => handleFilterChange('maxSquareMeter', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-1/2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:border-amber-500"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <select
                                            value={filters.furnished === undefined ? '' : filters.furnished.toString()}
                                            onChange={(e) => handleFilterChange('furnished', e.target.value === '' ? undefined : e.target.value === 'true')}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-500 outline-none text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="">Eşyalı mı?</option>
                                            <option value="true">Evet</option>
                                            <option value="false">Hayır</option>
                                        </select>
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
                        ) : workplaces.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 dashed-border shadow-sm text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Sonuç Bulunamadı</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-8">
                                    Aradığınız kriterlere uygun işyeri ilanı bulunamadı. Filtreleri temizleyerek veya farklı kriterler deneyerek tekrar arama yapabilirsiniz.
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-6 py-3 bg-amber-50 text-amber-600 font-semibold rounded-xl hover:bg-amber-100 transition-colors"
                                >
                                    Filtreleri Temizle
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {workplaces.map((workplace) => (
                                        <Link
                                            key={workplace.id}
                                            to={`/workplaces/${workplace.id}`}
                                            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
                                        >
                                            <div className="relative h-64 overflow-hidden">
                                                <div className="absolute top-4 right-4 z-20">
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm text-white ${workplace.status === 'ACTIVE' ? 'bg-green-500' :
                                                        workplace.status === 'SOLD' ? 'bg-red-500' : 'bg-gray-500'
                                                        }`}>
                                                        {workplace.status === 'ACTIVE' ? 'Aktif' : workplace.status === 'SOLD' ? 'Satıldı' : 'Pasif'}
                                                    </span>
                                                </div>

                                                {workplace.imageUrl ? (
                                                    <img
                                                        src={getImageUrl(workplace.imageUrl) || ''}
                                                        alt={workplace.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement?.querySelector('.placeholder')?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`placeholder w-full h-full flex items-center justify-center bg-gray-50 ${workplace.imageUrl ? 'hidden' : ''}`}>
                                                    <img
                                                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                                                        className="w-full h-full object-cover opacity-80 grayscale group-hover:grayscale-0 transition-all duration-500"
                                                        alt="Workplace placeholder"
                                                    />
                                                </div>

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                <div className="absolute top-4 left-4 z-20">
                                                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm border border-white/50 flex items-center gap-1">
                                                        <Building2 className="w-3 h-3 text-amber-600" />
                                                        {getWorkplaceTypeLabel(workplace.workplaceType || '')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="mb-3">
                                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                                                        {workplace.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{workplace.description}</p>
                                                </div>

                                                <div className="flex items-center text-gray-500 text-sm mb-4">
                                                    <MapPin className="w-3.5 h-3.5 mr-1" />
                                                    {workplace.city}, {workplace.district}
                                                </div>

                                                <div className="flex gap-4 mb-5 text-sm text-gray-700">
                                                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                        <Maximize className="w-4 h-4 text-amber-500" />
                                                        <span className="font-bold">{workplace.squareMeter?.toLocaleString()} m²</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                        <Briefcase className="w-4 h-4 text-amber-500" />
                                                        <span className="font-medium text-gray-600">{getWorkplaceTypeLabel(workplace.workplaceType || '')}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">Satış Fiyatı</p>
                                                        <p className="text-xl font-bold text-amber-600">
                                                            {formatPrice(workplace.price, workplace.currency)}
                                                        </p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-amber-600 group-hover:text-white transition-all">
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
