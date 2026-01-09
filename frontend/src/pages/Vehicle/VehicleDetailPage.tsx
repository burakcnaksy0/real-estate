import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Car,
  Fuel,
  Settings,
  Gauge
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchVehicleByIdAsync, deleteVehicleAsync } from '../../store/slices/vehicleSlice';
import { useAuth } from '../../hooks/useAuth';
import { Currency, FuelType, Transmission } from '../../types';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentVehicle, isLoading } = useSelector((state: RootState) => state.vehicles);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      dispatch(fetchVehicleByIdAsync(Number(id)));
    }
  }, [id, dispatch]);

  const handleDelete = async () => {
    if (currentVehicle && window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      try {
        await dispatch(deleteVehicleAsync(currentVehicle.id));
        navigate('/vehicles');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const formatPrice = (price: number, currency: Currency) => {
    return `${price.toLocaleString('tr-TR')} ${currency}`;
  };

  const getFuelTypeLabel = (type: FuelType) => {
    const labels = {
      [FuelType.GASOLINE]: 'Benzin',
      [FuelType.DIESEL]: 'Dizel',
      [FuelType.ELECTRIC]: 'Elektrik',
      [FuelType.LPG]: 'LPG',
      [FuelType.HYBRID]: 'Hibrit'
    };
    return labels[type] || type;
  };

  const getTransmissionLabel = (type: Transmission) => {
    const labels = {
      [Transmission.MANUAL]: 'Manuel',
      [Transmission.AUTOMATIC]: 'Otomatik'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentVehicle) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🚗</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          İlan bulunamadı
        </h3>
        <p className="text-gray-600 mb-4">
          Aradığınız ilan mevcut değil veya kaldırılmış olabilir.
        </p>
        <Link to="/vehicles" className="btn-primary">
          İlanlara Geri Dön
        </Link>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === currentVehicle.ownerId;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
        <span>/</span>
        <Link to="/vehicles" className="hover:text-primary-600">Araç İlanları</Link>
        <span>/</span>
        <span className="text-gray-900">{currentVehicle.title}</span>
      </nav>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Geri Dön</span>
      </button>

      {/* Image Gallery */}
      <div className="h-64 md:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <Car className="h-24 w-24 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Actions */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentVehicle.title}
              </h1>
              <div className="flex items-center text-gray-600 space-x-4">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {currentVehicle.city}, {currentVehicle.district}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(currentVehicle.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="flex space-x-2">
                <Link
                  to={`/vehicles/${currentVehicle.id}/edit`}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Düzenle</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn-secondary text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Sil</span>
                </button>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="bg-primary-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-primary-600">
              {formatPrice(currentVehicle.price, currentVehicle.currency)}
            </div>
            <div className="text-gray-600 mt-1">
              {currentVehicle.brand} {currentVehicle.model} • {currentVehicle.year}
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Araç Detayları</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Car className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <div className="text-lg font-semibold">{currentVehicle.brand}</div>
                <div className="text-sm text-gray-600">Marka</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Settings className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <div className="text-lg font-semibold">{currentVehicle.model}</div>
                <div className="text-sm text-gray-600">Model</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <div className="text-lg font-semibold">{currentVehicle.year}</div>
                <div className="text-sm text-gray-600">Model Yılı</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Gauge className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <div className="text-lg font-semibold">{currentVehicle.kilometer.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Kilometre</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Yakıt Tipi:</span>
                <span className="ml-2 text-gray-900">
                  {getFuelTypeLabel(currentVehicle.fuelType)}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Vites:</span>
                <span className="ml-2 text-gray-900">
                  {getTransmissionLabel(currentVehicle.transmission)}
                </span>
              </div>
              {currentVehicle.engineVolume && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Motor Hacmi:</span>
                  <span className="ml-2 text-gray-900">{currentVehicle.engineVolume}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {currentVehicle.description && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Açıklama</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {currentVehicle.description}
              </p>
            </div>
          )}

          {/* Map */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Konum</h2>
            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Harita (TODO)</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">{currentVehicle.ownerUsername}</span>
              </div>
              
              {isAuthenticated ? (
                <>
                  <button className="w-full btn-primary flex items-center justify-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Telefonu Göster</span>
                  </button>
                  
                  <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Mesaj Gönder</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-3">İletişim bilgilerini görmek için giriş yapın</p>
                  <Link to="/login" className="btn-primary">
                    Giriş Yap
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Özet Bilgiler</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">İlan No:</span>
                <span className="font-medium">#{currentVehicle.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durum:</span>
                <span className="font-medium capitalize">{currentVehicle.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Güncellenme:</span>
                <span className="font-medium">
                  {new Date(currentVehicle.updatedAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

          {/* Similar Listings */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Benzer İlanlar</h3>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <Car className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Benzer Araç {index + 1}
                    </p>
                    <p className="text-xs text-gray-600">2020 • 50.000 km</p>
                    <p className="text-sm font-semibold text-primary-600">
                      250.000 TL
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};