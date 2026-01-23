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
  Home,
  Ruler,
  Thermometer,
  Building,
  Share2,
  Eye,
  Heart,
  Video,
  ShieldCheck,
  Tag,
  Info,
  Navigation,
  ChevronRight,
  Layers,
  Sofa,
  Utensils,
  Maximize
} from 'lucide-react';
import { useRealEstate } from '../../hooks/useRealEstate';
import { useAuth } from '../../hooks/useAuth';
import { Currency, RealEstateType, HeatingType, KitchenType, TittleStatus, UsingStatus, ListingFrom } from '../../types';
import { EditRealEstateModal } from '../../components/Modals/EditRealEstateModal';
import { ShareListingModal } from '../../components/Modals/ShareListingModal';
import { ImageResponse, ImageService } from '../../services/imageService';
import { ImageGallery } from '../../components/ImageGallery/ImageGallery';
import { FavoriteButton } from '../../components/FavoriteButton/FavoriteButton';
import { MapView } from '../../components/MapView/MapView';
import { NearbyPlaces } from '../../components/MapView/NearbyPlaces';
import { websocketService } from '../../services/websocketService';

export const RealEstateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRealEstate, isLoading, fetchById, remove } = useRealEstate();
  const { user, isAuthenticated } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [images, setImages] = React.useState<ImageResponse[]>([]);
  const [similarListings, setSimilarListings] = React.useState<import('../../types').RealEstate[]>([]);
  const [activeTab, setActiveTab] = React.useState<'photos' | 'video'>('photos');

  useEffect(() => {
    if (id) {
      fetchById(Number(id));
      ImageService.getListingImages(Number(id), 'REAL_ESTATE')
        .then(setImages)
        .catch(console.error);

      // Fetch similar listings
      import('../../services/realEstateService').then(({ RealEstateService }) => {
        RealEstateService.getSimilar(Number(id))
          .then(setSimilarListings)
          .catch(console.error);
      });

      // Subscribe to real-time favoriteCount updates
      const subscription = websocketService.subscribe(
        `/topic/listing/${id}/favoriteCount`,
        (event: { listingId: number; listingType: string; favoriteCount: number }) => {
          console.log('WebSocket event received:', event);
          fetchById(Number(id));
        }
      );

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [id, fetchById]);

  const handleDelete = async () => {
    if (currentRealEstate && window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      try {
        await remove(currentRealEstate.id);
        navigate('/real-estates');
      } catch (error) {
        console.error('Error deleting real estate:', error);
      }
    }
  };

  const formatPrice = (price: number, currency: Currency) => {
    return `${price.toLocaleString('tr-TR')} ${currency}`;
  };

  const getRealEstateTypeLabel = (type: RealEstateType) => {
    const labels = {
      [RealEstateType.APARTMENT]: 'Daire',
      [RealEstateType.HOUSE]: 'Ev',
      [RealEstateType.VILLA]: 'Villa',
      [RealEstateType.RESIDENCE]: 'Rezidans'
    };
    return labels[type] || type;
  };

  const getHeatingTypeLabel = (type: HeatingType) => {
    const labels = {
      [HeatingType.NATURAL_GAS]: 'Doğalgaz',
      [HeatingType.CENTRAL_HEATING]: 'Merkezi Isıtma',
      [HeatingType.STOVE_HEATING]: 'Soba',
      [HeatingType.AIR_CONDITIONING]: 'Klima'
    };
    return labels[type] || type;
  };

  const getTittleStatusLabel = (status: TittleStatus) => {
    const labels = {
      [TittleStatus.SHARE_DEED]: 'Hisseli Tapu',
      [TittleStatus.CONDOMINIUM]: 'Kat Mülkiyeti',
      [TittleStatus.NO_DEED]: 'Tapusuz',
      [TittleStatus.CONSTRUCTION_SERVITUDE]: 'Kat İrtifakı',
      [TittleStatus.FULL_DEED]: 'Müstakil Tapu'
    };
    return labels[status] || status;
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

  if (!currentRealEstate) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🏠</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          İlan bulunamadı
        </h3>
        <p className="text-gray-600 mb-4">
          Aradığınız ilan mevcut değil veya kaldırılmış olabilir.
        </p>
        <Link to="/real-estates" className="btn-primary">
          İlanlara Geri Dön
        </Link>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === currentRealEstate.ownerId;

  // Helper components
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

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <nav className="flex items-center text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-1 md:pb-0">
              <Link to="/" className="hover:text-primary-600 transition-colors">Ana Sayfa</Link>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <Link to="/real-estates" className="hover:text-primary-600 transition-colors">Emlak</Link>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <span className="font-medium text-gray-900 truncate max-w-[200px]">{currentRealEstate.title}</span>
            </nav>

            <div className="flex items-center gap-3">
              {!isOwner ? (
                <>
                  <FavoriteButton listingId={currentRealEstate.id} listingType="REAL_ESTATE" />
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
                {currentRealEstate.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                  <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                  {currentRealEstate.city}, {currentRealEstate.district}
                </span>
                <span className="flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                  <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                  {new Date(currentRealEstate.createdAt).toLocaleDateString('tr-TR')}
                </span>
                <span className="flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                  <Tag className="w-4 h-4 mr-2 text-primary-500" />
                  İlan No: {currentRealEstate.id}
                </span>
                <span className="flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                  <Eye className="w-4 h-4 mr-2 text-primary-500" />
                  {currentRealEstate.viewCount} Görüntülenme
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start lg:items-end">
              <div className="text-4xl font-bold text-primary-600">
                {formatPrice(currentRealEstate.price, currentRealEstate.currency)}
              </div>
              <span className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-sm font-semibold tracking-wide">
                {getRealEstateTypeLabel(currentRealEstate.realEstateType)}
              </span>
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
                  <Eye size={18} />
                  <span>Fotoğraflar</span>
                </button>
                {currentRealEstate.videoUrl && (
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-all ${activeTab === 'video'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    <Video size={18} />
                    <span>Video Turu</span>
                  </button>
                )}
              </div>

              <div className="p-1">
                {activeTab === 'photos' ? (
                  <ImageGallery
                    images={images}
                    fallbackIcon={<Home className="w-32 h-32 text-gray-200" />}
                  />
                ) : (
                  currentRealEstate.videoUrl && (
                    <div className="bg-black aspect-video flex items-center justify-center">
                      <video
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${currentRealEstate.videoUrl}`}
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
                icon={Maximize}
                label="Brüt m²"
                value={currentRealEstate.grossSquareMeter}
                subValue="m²"
              />
              <FeatureCard
                icon={Ruler}
                label="Net m²"
                value={currentRealEstate.netSquareMeter}
                subValue="m²"
              />
              <FeatureCard
                icon={Layers}
                label="Oda"
                value={currentRealEstate.roomCount}
              />
              <FeatureCard
                icon={Building}
                label="Bina Yaşı"
                value={currentRealEstate.buildingAge}
              />
            </div>

            {/* Comprehensive Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Info size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Emlak Özellikleri</h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-12">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider border-b pb-2">Temel Bilgiler</h3>
                    <DetailRow label="Emlak Tipi" value={getRealEstateTypeLabel(currentRealEstate.realEstateType)} />
                    <DetailRow label="Bulunduğu Kat" value={currentRealEstate.floor} />
                    <DetailRow label="Kat Sayısı" value={currentRealEstate.totalFloors} />
                    <DetailRow label="Isıtma" value={currentRealEstate.heatingType ? getHeatingTypeLabel(currentRealEstate.heatingType) : '-'} icon={Thermometer} />
                    <DetailRow label="Banyo Sayısı" value={currentRealEstate.bathroomCount} />
                    <DetailRow label="Balkon" value={currentRealEstate.balcony} />
                  </div>

                  <div className="space-y-1 mt-6 md:mt-0">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider border-b pb-2">Kullanım & Durum</h3>
                    <DetailRow label="Kullanım Durumu" value={currentRealEstate.usingStatus === 'EMPTY' ? 'Boş' : currentRealEstate.usingStatus === 'TENANT' ? 'Kiracılı' : 'Mülk Sahibi'} />
                    <DetailRow label="Eşyalı" value={currentRealEstate.furnished} icon={Sofa} />
                    <DetailRow label="Mutfak" value={currentRealEstate.kitchen === KitchenType.OPEN_AMERICAN ? 'Amerikan (Açık)' : 'Kapalı'} icon={Utensils} />
                    <DetailRow label="Site İçerisinde" value={currentRealEstate.inComplex} />
                    <DetailRow label="Site Adı" value={currentRealEstate.complexName} />
                    <DetailRow label="Aidat" value={currentRealEstate.dues ? `${currentRealEstate.dues} TL` : undefined} />
                  </div>

                  <div className="space-y-1 mt-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider border-b pb-2">Ekstralar & Yasal</h3>
                    <DetailRow label="Depozito" value={currentRealEstate.deposit ? `${currentRealEstate.deposit} TL` : undefined} />
                    <DetailRow label="Tapu Durumu" value={currentRealEstate.tittleStatus ? getTittleStatusLabel(currentRealEstate.tittleStatus) : '-'} />
                    <DetailRow label="Asansör" value={currentRealEstate.elevator} />
                    <DetailRow label="Otopark" value={currentRealEstate.parking} />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {currentRealEstate.description && (
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
                      {currentRealEstate.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            {currentRealEstate.latitude && currentRealEstate.longitude && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <Navigation size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Konum</h2>
                </div>
                <div className="h-[400px]">
                  <MapView
                    latitude={currentRealEstate.latitude}
                    longitude={currentRealEstate.longitude}
                    title={currentRealEstate.title}
                    height="100%"
                  />
                </div>
              </div>
            )}
            {/* Nearby Places */}
            {currentRealEstate.latitude && currentRealEstate.longitude && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                    <MapPin size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Yakın Çevre</h2>
                </div>
                <div className="p-4">
                  <NearbyPlaces
                    latitude={currentRealEstate.latitude}
                    longitude={currentRealEstate.longitude}
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
                <Link to={`/listings?ownerId=${currentRealEstate.ownerId}`} className="flex items-center gap-4 mb-6 group hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl border-4 border-white shadow-md group-hover:scale-105 transition-transform">
                    <User size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{currentRealEstate.ownerUsername}</h4>
                    {currentRealEstate.ownerLastSeen && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        {formatLastSeen(currentRealEstate.ownerLastSeen)}
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
                      {user?.id !== currentRealEstate.ownerId && (
                        <button
                          onClick={() => navigate(`/messages/${currentRealEstate.ownerId}`)}
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
                  <li>Tapu belgelerini kontrol edin.</li>
                  <li>Şüpheli durumları bildirin.</li>
                </ul>
              </div>

              {/* Similar Listings Shortcut */}
              {similarListings.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Benzer İlanlar</h3>
                  <div className="space-y-4">
                    {similarListings.slice(0, 3).map(listing => (
                      <Link key={listing.id} to={`/real-estates/${listing.id}`} className="flex gap-3 group">
                        <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {listing.imageUrl ? (
                            <img src={process.env.REACT_APP_API_BASE_URL + listing.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          ) : <div className="w-full h-full flex items-center justify-center text-gray-400"><Home size={20} /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate group-hover:text-primary-600 font-sm">{listing.title}</p>
                          <p className="text-xs text-gray-500">{listing.city}, {listing.district}</p>
                          <p className="text-primary-600 font-bold text-sm">{formatPrice(listing.price, listing.currency)}</p>
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
        {currentRealEstate && (
          <EditRealEstateModal
            realEstate={currentRealEstate}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => {
              if (id) {
                fetchById(Number(id));
              }
            }}
          />
        )}

        {currentRealEstate && (
          <ShareListingModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            listingId={currentRealEstate.id}
            listingType="REAL_ESTATE"
            listingTitle={currentRealEstate.title}
          />
        )}
      </div>
    </div>
  );
};