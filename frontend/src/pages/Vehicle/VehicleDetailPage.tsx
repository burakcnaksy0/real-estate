import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatLastSeen } from '../../utils/dateUtils';
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
  Gauge,
  Share2,
  Eye,
  Heart,
  Video as VideoIcon,
  Image as ImageIcon
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchVehicleByIdAsync, deleteVehicleAsync } from '../../store/slices/vehicleSlice';
import { useAuth } from '../../hooks/useAuth';
import { Currency, FuelType, Transmission } from '../../types';
import { EditVehicleModal } from '../../components/Modals/EditVehicleModal';
import { ShareListingModal } from '../../components/Modals/ShareListingModal';
import { ImageResponse, ImageService } from '../../services/imageService';
import { VehicleService } from '../../services/vehicleService';
import { Vehicle } from '../../types';
import { ImageGallery } from '../../components/ImageGallery/ImageGallery';
import { FavoriteButton } from '../../components/FavoriteButton/FavoriteButton';
import { MapView } from '../../components/MapView/MapView';
import { websocketService } from '../../services/websocketService';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentVehicle, isLoading } = useSelector((state: RootState) => state.vehicles);
  const { user, isAuthenticated } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [images, setImages] = React.useState<ImageResponse[]>([]);
  const [similarVehicles, setSimilarVehicles] = React.useState<Vehicle[]>([]);
  const [activeTab, setActiveTab] = React.useState<'photos' | 'video'>('photos');

  useEffect(() => {
    if (id) {
      dispatch(fetchVehicleByIdAsync(Number(id)));
      ImageService.getListingImages(Number(id), 'VEHICLE')
        .then(setImages)
        .catch(console.error);

      VehicleService.getSimilar(Number(id))
        .then(setSimilarVehicles)
        .catch(console.error);

      // Subscribe to real-time favoriteCount updates
      const subscription = websocketService.subscribe(
        `/topic/listing/${id}/favoriteCount`,
        (event: { listingId: number; listingType: string; favoriteCount: number }) => {
          console.log('WebSocket event received:', event);
          // Refresh the vehicle data to get updated favoriteCount
          dispatch(fetchVehicleByIdAsync(Number(id)));
        }
      );

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
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

      {/* Media Tabs */}
      {/* Media Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'photos'
              ? 'border-b-2 border-primary-600 text-primary-600 bg-gray-50'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span>Fotoğraflar</span>
            </div>
          </button>

          {currentVehicle.videoUrl && (
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'video'
                ? 'border-b-2 border-primary-600 text-primary-600 bg-gray-50'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center gap-2">
                <VideoIcon className="w-4 h-4" />
                <span>Video Turu</span>
              </div>
            </button>
          )}
        </div>

        <div className="p-4 bg-gray-50">
          <div className={activeTab === 'photos' ? 'block' : 'hidden'}>
            <ImageGallery
              images={images}
              fallbackIcon={<Car className="w-24 h-24 text-gray-300" />}
            />
          </div>

          {activeTab === 'video' && currentVehicle.videoUrl && (
            <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-lg">
              <video
                src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${currentVehicle.videoUrl}`}
                controls
                className="w-full h-full"
                crossOrigin="anonymous"
                autoPlay
              >
                Tarayıcınız video oynatmayı desteklemiyor.
              </video>
            </div>
          )}
        </div>
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
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {currentVehicle.viewCount} görüntülenme
                </span>
                <span className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {currentVehicle.favoriteCount || 0} favori
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Düzenle</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-secondary text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Sil</span>
                </button>
              </div>
            )}

            {!isOwner && isAuthenticated && (
              <div className="flex space-x-2">
                <FavoriteButton listingId={currentVehicle.id} listingType="VEHICLE" />
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="btn-secondary flex items-center space-x-2"
                  title="İlanı Paylaş"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Paylaş</span>
                </button>
              </div>
            )}

            {!isAuthenticated && (
              <FavoriteButton listingId={currentVehicle.id} listingType="VEHICLE" />
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
              {currentVehicle.series && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Seri:</span>
                  <span className="ml-2 text-gray-900">{currentVehicle.series}</span>
                </div>
              )}
              {currentVehicle.vehicleStatus && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Durum:</span>
                  <span className="ml-2 text-gray-900">{currentVehicle.vehicleStatus === 'ZERO' ? 'Sıfır' : 'İkinci El'}</span>
                </div>
              )}
              {currentVehicle.bodyType && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Kasa Tipi:</span>
                  <span className="ml-2 text-gray-900">{currentVehicle.bodyType}</span>
                </div>
              )}
              {currentVehicle.enginePower && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Motor Gücü:</span>
                  <span className="ml-2 text-gray-900">{currentVehicle.enginePower}</span>
                </div>
              )}
              {currentVehicle.tractionType && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Çekiş:</span>
                  <span className="ml-2 text-gray-900">{currentVehicle.tractionType}</span>
                </div>
              )}
              {currentVehicle.color && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Renk:</span>
                  <span className="ml-2 text-gray-900">{currentVehicle.color}</span>
                </div>
              )}
              {currentVehicle.plateNationality && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Plaka / Uyruk:</span>
                  <span className="ml-2 text-gray-900">{currentVehicle.plateNationality}</span>
                </div>
              )}
              {currentVehicle.fromWho && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Kimden:</span>
                  <span className="ml-2 text-gray-900">{currentVehicle.fromWho}</span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-700">Garanti:</span>
                <span className="ml-2 text-gray-900">{currentVehicle.warranty ? 'Evet' : 'Hayır'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Ağır Hasar Kayıtlı:</span>
                <span className="ml-2 text-gray-900">{currentVehicle.heavyDamage ? 'Evet' : 'Hayır'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Takas:</span>
                <span className="ml-2 text-gray-900">{currentVehicle.exchange ? 'Evet' : 'Hayır'}</span>
              </div>
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
          {currentVehicle.latitude && currentVehicle.longitude && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Konum</h2>
              <MapView
                latitude={currentVehicle.latitude}
                longitude={currentVehicle.longitude}
                title={currentVehicle.title}
                height="300px"
              />
            </div>
          )}
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

                  {user?.id !== currentVehicle.ownerId && (
                    <button
                      onClick={() => navigate(`/messages/${currentVehicle.ownerId}`)}
                      className="w-full btn-secondary flex items-center justify-center space-x-2"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Mesaj Gönder</span>
                    </button>
                  )}
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

              {currentVehicle.ownerLastSeen && (
                <div className="flex justify-between items-center text-sm pt-2 border-t mt-2">
                  <span className="text-gray-600">Son Görülme:</span>
                  <span className="font-medium text-green-600">
                    {formatLastSeen(currentVehicle.ownerLastSeen)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Similar Listings */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Benzer İlanlar</h3>
            <div className="space-y-4">
              {similarVehicles.length === 0 ? (
                <p className="text-gray-500 text-sm">Benzer ilan bulunamadı.</p>
              ) : (
                similarVehicles.map((vehicle: Vehicle) => (
                  <Link
                    key={vehicle.id}
                    to={`/vehicles/${vehicle.id}`}
                    className="flex space-x-3 group cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden">
                      {vehicle.imageUrl ? (
                        <img
                          src={process.env.REACT_APP_API_BASE_URL + vehicle.imageUrl}
                          alt={vehicle.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Car className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {vehicle.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {vehicle.year} • {vehicle.kilometer?.toLocaleString()} km
                      </p>
                      <p className="text-sm font-semibold text-primary-600">
                        {formatPrice(vehicle.price, vehicle.currency)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {currentVehicle && (
        <EditVehicleModal
          vehicle={currentVehicle}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            if (id) {
              dispatch(fetchVehicleByIdAsync(Number(id)));
            }
          }}
        />
      )}

      {/* Share Modal */}
      {currentVehicle && (
        <ShareListingModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          listingId={currentVehicle.id}
          listingType="VEHICLE"
          listingTitle={currentVehicle.title}
        />
      )}
    </div>
  );
};