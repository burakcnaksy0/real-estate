import React from 'react';
import { Link } from 'react-router-dom';

export const VehicleListPage: React.FC = () => {
  // Mock data
  const mockVehicles = [
    {
      id: 1,
      title: "2020 Model Toyota Corolla",
      price: 250000,
      currency: "TRY",
      city: "İstanbul",
      district: "Beşiktaş",
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      fuelType: "Benzin",
      transmission: "Otomatik",
      kilometer: 45000,
      image: "🚗"
    },
    {
      id: 2,
      title: "2019 BMW 3.20i",
      price: 380000,
      currency: "TRY",
      city: "Ankara",
      district: "Çankaya",
      brand: "BMW",
      model: "3.20i",
      year: 2019,
      fuelType: "Benzin",
      transmission: "Otomatik",
      kilometer: 62000,
      image: "🚙"
    },
    {
      id: 3,
      title: "2021 Volkswagen Golf",
      price: 320000,
      currency: "TRY",
      city: "İzmir",
      district: "Konak",
      brand: "Volkswagen",
      model: "Golf",
      year: 2021,
      fuelType: "Dizel",
      transmission: "Manuel",
      kilometer: 28000,
      image: "🚗"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <span>🚗</span>
            <span>Araç İlanları</span>
          </h1>
          <p className="text-gray-600 mt-1">
            {mockVehicles.length} ilan bulundu
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/vehicles/create" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            İlan Ver
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Tüm Markalar</option>
              <option value="toyota">Toyota</option>
              <option value="bmw">BMW</option>
              <option value="volkswagen">Volkswagen</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yakıt Tipi</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Tüm Yakıt Tipleri</option>
              <option value="benzin">Benzin</option>
              <option value="dizel">Dizel</option>
              <option value="elektrik">Elektrik</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Fiyat</label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Fiyat</label>
            <input
              type="number"
              placeholder="999999999"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Filtrele
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockVehicles.map((vehicle) => (
          <Link
            key={vehicle.id}
            to={`/vehicles/${vehicle.id}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            <div className="h-48 bg-gray-200 flex items-center justify-center text-6xl">
              {vehicle.image}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {vehicle.title}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center">
                  <span className="mr-1">📍</span>
                  {vehicle.city}, {vehicle.district}
                </p>
                
                <div className="flex items-center space-x-4">
                  <span>{vehicle.brand}</span>
                  <span>{vehicle.year}</span>
                  <span>{vehicle.kilometer.toLocaleString()} km</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span>{vehicle.fuelType}</span>
                  <span>{vehicle.transmission}</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <p className="text-lg font-bold text-green-600">
                  {vehicle.price.toLocaleString('tr-TR')} {vehicle.currency}
                </p>
                <p className="text-xs text-gray-500">
                  3 gün önce
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {mockVehicles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🚗</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            İlan bulunamadı
          </h3>
          <p className="text-gray-600 mb-4">
            Arama kriterlerinizi değiştirerek tekrar deneyin.
          </p>
          <Link to="/vehicles/create" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            İlk İlanı Siz Verin
          </Link>
        </div>
      )}
    </div>
  );
};