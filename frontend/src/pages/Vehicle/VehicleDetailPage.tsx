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
  Image as ImageIcon,
  ShieldCheck,
  Tag,
  Clock,
  Navigation,
  ChevronRight,
  CircleDollarSign,
  Info
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

  // Helper component for feature display
  // Helper component for feature display
  const FeatureCard = ({ icon: Icon, label, value, subValue }: { icon: any, label: string, value: string | number | undefined, subValue?: string }) => {
    if (!value) return null;
    return (
      <div className="flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-3 bg-primary-50 rounded-lg text-primary-600 mr-4">
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
          <p className="text-base font-bold text-gray-900">{value}</p>
          {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
      </div>
    );
  };

  const DetailRow = ({ label, value, icon: Icon }: { label: string, value: string | number | boolean | undefined, icon?: any }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
        <span className="text-gray-500 font-medium flex items-center gap-2">
          {Icon && <Icon size={16} className="text-gray-400" />}
          {label}
        </span>
        <span className="text-gray-900 font-semibold text-right">{value === true ? 'Evet' : value === false ? 'Hayır' : value}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[500px] bg-gray-200 rounded-2xl"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentVehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <Car className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">İlan Bulunamadı</h3>
        <p className="text-gray-500 mb-8 max-w-md">
          Aradığınız araç ilanı yayından kaldırılmış veya bağlantı hatalı olabilir.
        </p>
        <Link to="/vehicles" className="btn-primary flex items-center gap-2">
          <ArrowLeft size={20} />
          İlanlara Geri Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <nav className="flex items-center text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-1 md:pb-0">
              <Link to="/" className="hover:text-primary-600 transition-colors">Ana Sayfa</Link>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <Link to="/vehicles" className="hover:text-primary-600 transition-colors">Vasıta</Link>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <span className="font-medium text-gray-900 truncate max-w-[200px]">{currentVehicle.brand} {currentVehicle.model}</span>
            </nav>

            <div className="flex items-center gap-3">
              {!isOwner ? (
                <>
                  <FavoriteButton listingId={currentVehicle.id} listingType="VEHICLE" />
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all"
                    title="Paylaş"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Düzenle</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Sil</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
                {currentVehicle.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                  <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                  {currentVehicle.city}, {currentVehicle.district}
                </span>
                <span className="flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                  <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                  {new Date(currentVehicle.createdAt).toLocaleDateString('tr-TR')}
                </span>
                <span className="flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                  <Tag className="w-4 h-4 mr-2 text-primary-500" />
                  İlan No: {currentVehicle.id}
                </span>
                <span className="flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                  <Eye className="w-4 h-4 mr-2 text-primary-500" />
                  {currentVehicle.viewCount} Görüntülenme
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start lg:items-end">
              <div className="text-4xl font-bold text-primary-600">
                {formatPrice(currentVehicle.price, currentVehicle.currency)}
              </div>
              {currentVehicle.vehicleStatus && (
                <span className={`mt-2 px-4 py-1 rounded-full text-sm font-semibold tracking-wide ${currentVehicle.vehicleStatus === 'ZERO'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                  {currentVehicle.vehicleStatus === 'ZERO' ? 'SIFIR ARAÇ' : 'İKİNCİ EL'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN (Content) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Gallery */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b bg-gray-50 flex items-center px-4">
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-all ${activeTab === 'photos'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                >
                  <ImageIcon size={18} />
                  <span>Fotoğraflar</span>
                </button>
                {currentVehicle.videoUrl && (
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-all ${activeTab === 'video'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    <VideoIcon size={18} />
                    <span>Video Turu</span>
                  </button>
                )}
              </div>

              <div className="p-1">
                {activeTab === 'photos' ? (
                  <ImageGallery
                    images={images}
                    fallbackIcon={<Car className="w-32 h-32 text-gray-200" />}
                  />
                ) : (
                  currentVehicle.videoUrl && (
                    <div className="bg-black aspect-video flex items-center justify-center">
                      <video
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${currentVehicle.videoUrl}`}
                        controls
                        className="w-full h-full"
                        crossOrigin="anonymous"
                        autoPlay
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FeatureCard
                icon={Calendar}
                label="Yıl"
                value={currentVehicle.year}
              />
              <FeatureCard
                icon={Gauge}
                label="Kilometre"
                value={currentVehicle.kilometer.toLocaleString()}
                subValue="km"
              />
              <FeatureCard
                icon={Fuel}
                label="Yakıt"
                value={getFuelTypeLabel(currentVehicle.fuelType)}
              />
              <FeatureCard
                icon={Settings}
                label="Vites"
                value={getTransmissionLabel(currentVehicle.transmission)}
              />
            </div>

            {/* Comprehensive Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Info size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Araç Özellikleri</h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-12">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider border-b pb-2">Temel Bilgiler</h3>
                    <DetailRow label="Marka" value={currentVehicle.brand} />
                    <DetailRow label="Model" value={currentVehicle.model} />
                    <DetailRow label="Seri" value={currentVehicle.series} />
                    <DetailRow label="Model Yılı" value={currentVehicle.year} />
                    <DetailRow label="Kasa Tipi" value={currentVehicle.bodyType} />
                    <DetailRow label="Renk" value={currentVehicle.color} />
                    <DetailRow label="Plaka / Uyruk" value={currentVehicle.plateNationality} />
                  </div>

                  <div className="space-y-1 mt-6 md:mt-0">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider border-b pb-2">Motor & Performans</h3>
                    <DetailRow label="Motor Hacmi" value={currentVehicle.engineVolume} />
                    <DetailRow label="Motor Gücü" value={currentVehicle.enginePower} />
                    <DetailRow label="Çekiş" value={currentVehicle.tractionType} />
                    <DetailRow label="Yakıt Tipi" value={getFuelTypeLabel(currentVehicle.fuelType)} />
                    <DetailRow label="Vites Tipi" value={getTransmissionLabel(currentVehicle.transmission)} />
                  </div>

                  <div className="space-y-1 mt-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider border-b pb-2">Durum & Satış</h3>
                    <DetailRow label="Kimden" value={currentVehicle.fromWho} />
                    <DetailRow label="Garanti Durumu" value={currentVehicle.warranty ? 'Devam Ediyor' : 'Yok'} icon={ShieldCheck} />
                    <DetailRow label="Ağır Hasar Kaydı" value={currentVehicle.heavyDamage} icon={ShieldCheck} />
                    <DetailRow label="Takas" value={currentVehicle.exchange} />
                    <DetailRow label="Durum" value={currentVehicle.vehicleStatus === 'ZERO' ? 'Sıfır' : 'İkinci El'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {currentVehicle.description && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Tag size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Açıklama</h2>
                </div>
                <div className="p-8">
                  <div className="prose prose-blue max-w-none">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
                      {currentVehicle.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            {currentVehicle.latitude && currentVehicle.longitude && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <Navigation size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Konum</h2>
                </div>
                <div className="h-[400px]">
                  <MapView
                    latitude={currentVehicle.latitude}
                    longitude={currentVehicle.longitude}
                    title={currentVehicle.title}
                    height="100%"
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (Sidebar) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Sticky Sidebar Container */}
            <div className="sticky top-24 space-y-6">

              {/* Seller Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">İlan Sahibi</h3>
                <Link to={`/listings?ownerId=${currentVehicle.ownerId}`} className="flex items-center gap-4 mb-6 group hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl border-4 border-white shadow-md group-hover:scale-105 transition-transform">
                    <User size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{currentVehicle.ownerUsername}</h4>
                    {currentVehicle.ownerLastSeen && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        {formatLastSeen(currentVehicle.ownerLastSeen)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Tüm ilanlarını gör &rarr;</p>
                  </div>
                </Link>

                <div className="space-y-3">
                  {isAuthenticated ? (
                    <>
                      <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-primary-200 shadow-lg">
                        <Phone size={20} />
                        <span>Telefonu Göster</span>
                      </button>
                      {user?.id !== currentVehicle.ownerId && (
                        <button
                          onClick={() => navigate(`/messages/${currentVehicle.ownerId}`)}
                          className="w-full bg-white border-2 border-primary-100 text-primary-700 hover:bg-primary-50 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all"
                        >
                          <Mail size={20} />
                          <span>Mesaj Gönder</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-gray-600 mb-3 text-sm">İletişim bilgilerini görmek için giriş yapın.</p>
                      <Link to="/login" className="text-primary-600 font-bold hover:underline">Giriş Yap</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Safety Tips (Static) */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-2 mb-3 text-blue-800 font-bold">
                  <ShieldCheck size={20} />
                  <h3>Güvenlik İpuçları</h3>
                </div>
                <ul className="text-sm text-blue-900 space-y-2 list-disc list-inside opacity-80">
                  <li>Kapora göndermeyin.</li>
                  <li>Araç başında ödeme yapın.</li>
                  <li>Şüpheli durumları bildirin.</li>
                </ul>
              </div>

              {/* Similar Vehicles Shortcut */}
              {similarVehicles.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Benzer İlanlar</h3>
                  <div className="space-y-4">
                    {similarVehicles.slice(0, 3).map(vehicle => (
                      <Link key={vehicle.id} to={`/vehicles/${vehicle.id}`} className="flex gap-3 group">
                        <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {vehicle.imageUrl ? (
                            <img src={process.env.REACT_APP_API_BASE_URL + vehicle.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          ) : <div className="w-full h-full flex items-center justify-center text-gray-400"><Car size={20} /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate group-hover:text-primary-600 font-sm">{vehicle.title}</p>
                          <p className="text-primary-600 font-bold text-sm">{formatPrice(vehicle.price, vehicle.currency)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Modals */}
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
    </div>
  );
};