import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListingService, GeneralFilterRequest } from '../services/listingService';
import { BaseListing, ListingStatus } from '../types';
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
    Home,
    Car,
    Trees,
    Briefcase
} from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

export const AllListingsPage: React.FC = () => {
    // State for all fetched listings
    const [allFetchedListings, setAllFetchedListings] = useState<BaseListing[]>([]);
    // State for displayed listings (current page)
    const [displayedListings, setDisplayedListings] = useState<BaseListing[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

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

    const fetchListings = async () => {
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

            // Fetch all listings (large size to simulate 'all' for client-side pagination)
            const response = await ListingService.search(cleanFilters, {
                page: 0,
                size: 1000,
                sort: 'createdAt,desc',
            });

            setAllFetchedListings(response.content);
            setCurrentPage(0); // Reset to first page on new search
        } catch (err: any) {
            setError(err.message || 'İlanlar yüklenirken bir hata oluştu');
            console.error('Error fetching listings:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate pagination derived from allFetchedListings and currentPage
    const totalElements = allFetchedListings.length;
    const totalPages = Math.ceil(totalElements / pageSize);

    useEffect(() => {
        const start = currentPage * pageSize;
        const end = start + pageSize;
        setDisplayedListings(allFetchedListings.slice(start, end));
    }, [currentPage, allFetchedListings]);

    useEffect(() => {
        fetchListings();
    }, []); // Initial load

    const handleFilterChange = (key: keyof GeneralFilterRequest, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        fetchListings();
        setShowMobileFilters(false);
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
        // Need to wait for state update in next render or use a ref, but simple setTimeout works for now
        // A better way is to call fetch with default filters directly
        setTimeout(() => {
            const defaultFilters: GeneralFilterRequest = {};
            ListingService.search(defaultFilters, {
                page: 0,
                size: 1000,
                sort: 'createdAt,desc',
            }).then(res => {
                setAllFetchedListings(res.content);
                setCurrentPage(0);
                setLoading(false);
            }).catch(err => {
                setError(err.message);
                setLoading(false);
            });
        }, 0);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getCategoryName = (slug: string): string => {
        const categoryMap: Record<string, string> = {
            'emlak': 'Emlak',
            'arsa': 'Arsa',
            'isyeri': 'İşyeri',
            'arac': 'Araç',
        };
        return categoryMap[slug] || slug;
    };

    const getCategoryIcon = (slug: string) => {
        switch (slug) {
            case 'emlak': return <Home className="w-4 h-4" />;
            case 'arac': return <Car className="w-4 h-4" />;
            case 'arsa': return <Trees className="w-4 h-4" />;
            case 'isyeri': return <Briefcase className="w-4 h-4" />;
            default: return <Tag className="w-4 h-4" />;
        }
    }

    const formatPrice = (price: number, currency: string): string => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency || 'TRY',
            maximumFractionDigits: 0
        }).format(price);
    };

    const getDetailUrl = (listing: BaseListing): string => {
        if (listing.listingType === 'REAL_ESTATE') return `/real-estates/${listing.id}`;
        if (listing.listingType === 'VEHICLE') return `/vehicles/${listing.id}`;
        if (listing.listingType === 'LAND') return `/lands/${listing.id}`;
        if (listing.listingType === 'WORKPLACE') return `/workplaces/${listing.id}`;

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
        <div className="min-h-screen bg-gray-50/50 py-8 font-sans">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tüm İlanlar</h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            {totalElements} ilan bulundu
                        </p>
                    </div>
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="md:hidden w-full flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-gray-700 shadow-sm"
                    >
                        <Filter className="w-4 h-4" /> Filtrele
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar - Filters */}
                    <div className={`lg:col-span-1 ${showMobileFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden lg:block'}`}>
                        <div className="bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:p-6 sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                                    Filtreler
                                </h3>
                                {showMobileFilters && (
                                    <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Category Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Kategori</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['emlak', 'arac', 'arsa', 'isyeri'].map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => handleFilterChange('categorySlug', filters.categorySlug === cat ? '' : cat)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filters.categorySlug === cat
                                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {getCategoryIcon(cat)}
                                                {getCategoryName(cat)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Location */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Konum</label>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Şehir (Örn: İstanbul)"
                                            value={filters.city || ''}
                                            onChange={(e) => handleFilterChange('city', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="İlçe (Örn: Kadıköy)"
                                            value={filters.district || ''}
                                            onChange={(e) => handleFilterChange('district', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                                        />
                                    </div>
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
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max TL"
                                            value={filters.maxPrice || ''}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Status */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Durum</label>
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilterChange('status', e.target.value as ListingStatus || undefined)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 outline-none text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Tümü</option>
                                        <option value="ACTIVE">Aktif</option>
                                        <option value="PASSIVE">Pasif</option>
                                        <option value="SOLD">Satıldı</option>
                                    </select>
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
                        ) : displayedListings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 dashed-border shadow-sm text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Sonuç Bulunamadı</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-8">
                                    Aradığınız kriterlere uygun ilan bulunamadı. Filtreleri temizleyerek veya farklı kriterler deneyerek tekrar arama yapabilirsiniz.
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-6 py-3 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-colors"
                                >
                                    Filtreleri Temizle
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {displayedListings.map((listing) => (
                                        <Link
                                            key={listing.id}
                                            to={getDetailUrl(listing)}
                                            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
                                        >
                                            <div className="relative h-64 overflow-hidden">
                                                <div className="absolute top-4 right-4 z-20">
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm text-white ${listing.status === 'ACTIVE' ? 'bg-green-500' :
                                                        listing.status === 'SOLD' ? 'bg-red-500' : 'bg-gray-500'
                                                        }`}>
                                                        {listing.status === 'ACTIVE' ? 'Aktif' : listing.status === 'SOLD' ? 'Satıldı' : 'Pasif'}
                                                    </span>
                                                </div>

                                                {listing.imageUrl ? (
                                                    <img
                                                        src={getImageUrl(listing.imageUrl) || ''}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement?.querySelector('.placeholder')?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`placeholder w-full h-full flex items-center justify-center bg-gray-50 ${listing.imageUrl ? 'hidden' : ''}`}>
                                                    <img
                                                        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
                                                        className="w-full h-full object-cover opacity-80 grayscale group-hover:grayscale-0 transition-all duration-500"
                                                        alt="Listing placeholder"
                                                    />
                                                </div>

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                <div className="absolute top-4 left-4 z-20">
                                                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm border border-white/50 flex items-center gap-1">
                                                        {getCategoryIcon(listing.categorySlug)}
                                                        {getCategoryName(listing.categorySlug)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="mb-3">
                                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1" title={listing.title}>
                                                        {listing.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{listing.description}</p>
                                                </div>

                                                <div className="flex items-center text-gray-500 text-sm mb-4">
                                                    <MapPin className="w-3.5 h-3.5 mr-1" />
                                                    {listing.city}, {listing.district}
                                                </div>

                                                <div className="flex items-center text-gray-500 text-sm mb-4">
                                                    <Calendar className="w-3.5 h-3.5 mr-1" />
                                                    {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">Fiyat</p>
                                                        <p className="text-xl font-bold text-blue-600">
                                                            {formatPrice(listing.price, listing.currency)}
                                                        </p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="flex justify-center items-center gap-2 mt-8 py-8">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-600 shadow-sm"
                                    >
                                        Önceki
                                    </button>
                                    <div className="flex gap-2">
                                        {Array.from({ length: Math.max(1, Math.min(5, totalPages)) }, (_, i) => {
                                            let pageNum = i;
                                            if (totalPages > 5) {
                                                if (currentPage < 3) pageNum = i;
                                                else if (currentPage > totalPages - 3) pageNum = totalPages - 5 + i;
                                                else pageNum = currentPage - 2 + i;
                                            }

                                            // Safety check for empty pagination
                                            if (totalPages === 0) return (
                                                <button
                                                    key={0}
                                                    disabled
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold bg-gray-900 text-white shadow-lg"
                                                >
                                                    1
                                                </button>
                                            );

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all shadow-sm ${currentPage === pageNum
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
                                        disabled={currentPage >= totalPages - 1}
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-600 shadow-sm"
                                    >
                                        Sonraki
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
