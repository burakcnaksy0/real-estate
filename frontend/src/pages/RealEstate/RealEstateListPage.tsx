import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RealEstateService } from '../../services/realEstateService';
import { RealEstate, RealEstateFilterRequest } from '../../types';
import { MapPin, Calendar, Tag, TrendingUp, Image as ImageIcon } from 'lucide-react';

export const RealEstateListPage: React.FC = () => {
  const [realEstates, setRealEstates] = useState<RealEstate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState<RealEstateFilterRequest>({
    city: '',
    district: '',
    categorySlug: '',
    minPrice: undefined,
    maxPrice: undefined,
    realEstateType: undefined,
    roomCount: '',
    minGrossSquareMeter: undefined,
    maxGrossSquareMeter: undefined,
    buildingAge: '',
    minFloor: undefined,
    maxFloor: undefined,
    heatingType: undefined,
    furnished: undefined,
  });

  const pageSize = 12;

  const fetchRealEstates = async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);

      const cleanFilters: RealEstateFilterRequest = {};
      if (filters.city?.trim()) cleanFilters.city = filters.city.trim();
      if (filters.district?.trim()) cleanFilters.district = filters.district.trim();
      if (filters.categorySlug?.trim()) cleanFilters.categorySlug = filters.categorySlug.trim();
      if (filters.minPrice !== undefined && filters.minPrice > 0) cleanFilters.minPrice = filters.minPrice;
      if (filters.maxPrice !== undefined && filters.maxPrice > 0) cleanFilters.maxPrice = filters.maxPrice;
      if (filters.realEstateType) cleanFilters.realEstateType = filters.realEstateType;
      if (filters.roomCount?.trim()) cleanFilters.roomCount = filters.roomCount;
      if (filters.minGrossSquareMeter !== undefined && filters.minGrossSquareMeter > 0) cleanFilters.minGrossSquareMeter = filters.minGrossSquareMeter;
      if (filters.maxGrossSquareMeter !== undefined && filters.maxGrossSquareMeter > 0) cleanFilters.maxGrossSquareMeter = filters.maxGrossSquareMeter;
      if (filters.buildingAge?.trim()) cleanFilters.buildingAge = filters.buildingAge;
      if (filters.minFloor !== undefined) cleanFilters.minFloor = filters.minFloor;
      if (filters.maxFloor !== undefined) cleanFilters.maxFloor = filters.maxFloor;
      if (filters.heatingType) cleanFilters.heatingType = filters.heatingType;
      if (filters.furnished !== undefined) cleanFilters.furnished = filters.furnished;

      const response = await RealEstateService.search(cleanFilters, {
        page,
        size: pageSize,
        sort: 'createdAt,desc',
      });

      setRealEstates(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Emlaklar yüklenirken bir hata oluştu');
      console.error('Error fetching real estates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealEstates(0);
  }, []);

  const handleFilterChange = (key: keyof RealEstateFilterRequest, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchRealEstates(0);
  };

  const handleClearFilters = () => {
    setFilters({
      city: '',
      district: '',
      categorySlug: '',
      minPrice: undefined,
      maxPrice: undefined,
      realEstateType: undefined,
      roomCount: '',
      minGrossSquareMeter: undefined,
      maxGrossSquareMeter: undefined,
      buildingAge: '',
      minFloor: undefined,
      maxFloor: undefined,
      heatingType: undefined,
      furnished: undefined,
    });
    setTimeout(() => fetchRealEstates(0), 100);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchRealEstates(newPage);
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Emlak İlanları</h1>
            <p className="text-blue-100">
              {totalElements > 0 ? `${totalElements} emlak ilanı bulundu` : 'Emlak ilanlarını keşfedin'}
            </p>
          </div>
          <Link
            to="/real-estates/create"
            className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            İlan Ver
          </Link>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emlak Tipi</label>
            <select
              value={filters.realEstateType || ''}
              onChange={(e) => handleFilterChange('realEstateType', e.target.value || undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tümü</option>
              <option value="APARTMENT">Daire</option>
              <option value="HOUSE">Ev</option>
              <option value="VILLA">Villa</option>
              <option value="RESIDENCE">Rezidans</option>
            </select>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Oda Sayısı</label>
            <input
              type="text"
              value={filters.roomCount || ''}
              onChange={(e) => handleFilterChange('roomCount', e.target.value)}
              placeholder="Örn: 3+1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bina Yaşı</label>
            <input
              type="text"
              value={filters.buildingAge || ''}
              onChange={(e) => handleFilterChange('buildingAge', e.target.value)}
              placeholder="Örn: 5-10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min m² (Brüt)</label>
            <input
              type="number"
              value={filters.minGrossSquareMeter || ''}
              onChange={(e) => handleFilterChange('minGrossSquareMeter', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max m² (Brüt)</label>
            <input
              type="number"
              value={filters.maxGrossSquareMeter || ''}
              onChange={(e) => handleFilterChange('maxGrossSquareMeter', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="999999"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eşyalı</label>
            <select
              value={filters.furnished === undefined ? '' : filters.furnished.toString()}
              onChange={(e) => handleFilterChange('furnished', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tümü</option>
              <option value="true">Evet</option>
              <option value="false">Hayır</option>
            </select>
          </div>
        </div>

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

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      {!loading && !error && realEstates.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {realEstates.map((realEstate) => (
              <Link
                key={realEstate.id}
                to={`/real-estates/${realEstate.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden group flex flex-col h-full"
              >
                <div className="relative h-56 bg-gray-100 overflow-hidden shrink-0">
                  {realEstate.imageUrl ? (
                    <img
                      src={`http://localhost:8080${realEstate.imageUrl}?t=${Date.now()}`}
                      alt={realEstate.title}
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
                  {realEstate.status && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm text-white ${realEstate.status === 'ACTIVE' ? 'bg-green-500' :
                        realEstate.status === 'SOLD' ? 'bg-red-500' : 'bg-gray-500'
                        }`}>
                        {realEstate.status === 'ACTIVE' ? 'Aktif' : realEstate.status === 'SOLD' ? 'Satıldı' : 'Pasif'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-3 line-clamp-2">
                    {realEstate.title}
                  </h3>

                  {realEstate.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{realEstate.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{realEstate.city}{realEstate.district && `, ${realEstate.district}`}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(realEstate.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 text-sm">
                      {realEstate.roomCount && <span>{realEstate.roomCount} oda</span>}
                      {realEstate.grossSquareMeter && <span>{realEstate.grossSquareMeter} m²</span>}
                      {realEstate.buildingAge !== undefined && <span>{realEstate.buildingAge} yaş</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-xl font-bold text-blue-600">
                        {formatPrice(realEstate.price, realEstate.currency)}
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
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && realEstates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">Henüz emlak ilanı bulunmuyor.</p>
          <p className="text-gray-500 mt-2">Filtreleri değiştirerek tekrar deneyin.</p>
          <Link
            to="/real-estates/create"
            className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            İlk İlanı Siz Verin
          </Link>
        </div>
      )}
    </div>
  );
};