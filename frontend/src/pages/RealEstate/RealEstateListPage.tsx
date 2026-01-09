import React from 'react';
import { Link } from 'react-router-dom';

export const RealEstateListPage: React.FC = () => {
  // Mock data - gerçek uygulamada API'den gelecek
  const mockListings = [
    {
      id: 1,
      title: "Merkezi konumda 3+1 daire",
      price: 450000,
      currency: "TRY",
      city: "İstanbul",
      district: "Kadıköy",
      roomCount: 3,
      squareMeter: 120,
      buildingAge: 5,
      image: "🏠"
    },
    {
      id: 2,
      title: "Deniz manzaralı villa",
      price: 1200000,
      currency: "TRY",
      city: "Antalya",
      district: "Kemer",
      roomCount: 5,
      squareMeter: 250,
      buildingAge: 2,
      image: "🏡"
    },
    {
      id: 3,
      title: "Şehir merkezinde modern daire",
      price: 320000,
      currency: "TRY",
      city: "Ankara",
      district: "Çankaya",
      roomCount: 2,
      squareMeter: 85,
      buildingAge: 1,
      image: "🏠"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <span>🏠</span>
            <span>Emlak İlanları</span>
          </h1>
          <p className="text-gray-600 mt-1">
            {mockListings.length} ilan bulundu
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/real-estate/create" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            İlan Ver
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tüm Şehirler</option>
              <option value="istanbul">İstanbul</option>
              <option value="ankara">Ankara</option>
              <option value="antalya">Antalya</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Fiyat</label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Fiyat</label>
            <input
              type="number"
              placeholder="999999999"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Filtrele
            </button>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockListings.map((listing) => (
          <Link
            key={listing.id}
            to={`/real-estate/${listing.id}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            <div className="h-48 bg-gray-200 flex items-center justify-center text-6xl">
              {listing.image}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {listing.title}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center">
                  <span className="mr-1">📍</span>
                  {listing.city}, {listing.district}
                </p>
                
                <div className="flex items-center space-x-4">
                  <span>{listing.roomCount} oda</span>
                  <span>{listing.squareMeter} m²</span>
                  <span>{listing.buildingAge} yaş</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <p className="text-lg font-bold text-blue-600">
                  {listing.price.toLocaleString('tr-TR')} {listing.currency}
                </p>
                <p className="text-xs text-gray-500">
                  2 gün önce
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {mockListings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            İlan bulunamadı
          </h3>
          <p className="text-gray-600 mb-4">
            Arama kriterlerinizi değiştirerek tekrar deneyin.
          </p>
          <Link to="/real-estate/create" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            İlk İlanı Siz Verin
          </Link>
        </div>
      )}
    </div>
  );
};