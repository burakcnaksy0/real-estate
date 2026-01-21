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
  Video
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
        <span>/</span>
        <Link to="/real-estates" className="hover:text-primary-600">Emlak İlanları</Link>
        <span>/</span>
        <span className="text-gray-900">{currentRealEstate.title}</span>
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
              <Eye className="w-4 h-4" />
              <span>Fotoğraflar</span>
            </div>
          </button>

          {currentRealEstate.videoUrl && (
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'video'
                ? 'border-b-2 border-primary-600 text-primary-600 bg-gray-50'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span>Video Turu</span>
              </div>
            </button>
          )}
        </div>

        <div className="p-4 bg-gray-50">
          <div className={activeTab === 'photos' ? 'block' : 'hidden'}>
            <ImageGallery
              images={images}
              fallbackIcon={<Home className="w-24 h-24 text-gray-300" />}
            />
          </div>

          {activeTab === 'video' && currentRealEstate.videoUrl && (
            <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-lg">
              <video
                src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${currentRealEstate.videoUrl}`}
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
                {currentRealEstate.title}
              </h1>
              <div className="flex items-center text-gray-600 space-x-4">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {currentRealEstate.city}, {currentRealEstate.district}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(currentRealEstate.createdAt).toLocaleDateString('tr-TR')}
                </span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {currentRealEstate.viewCount} görüntülenme
                </span>
                <span className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {currentRealEstate.favoriteCount || 0} favori
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
                <FavoriteButton listingId={currentRealEstate.id} listingType="REAL_ESTATE" />
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
              <FavoriteButton listingId={currentRealEstate.id} listingType="REAL_ESTATE" />
            )}
          </div>

          {/* Price */}
          <div className="bg-primary-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-primary-600">
              {formatPrice(currentRealEstate.price, currentRealEstate.currency)}
            </div>
            <div className="text-gray-600 mt-1">
              {getRealEstateTypeLabel(currentRealEstate.realEstateType)} • {currentRealEstate.categorySlug}
            </div>
          </div>

          {/* Property Details */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Emlak Detayları</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">İlan No</span>
                <span className="font-semibold text-red-500">{currentRealEstate.id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Emlak Tipi</span>
                <span className="font-medium">{getRealEstateTypeLabel(currentRealEstate.realEstateType)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">m² (Brüt)</span>
                <span className="font-medium">{currentRealEstate.grossSquareMeter}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">m² (Net)</span>
                <span className="font-medium">{currentRealEstate.netSquareMeter}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Oda Sayısı</span>
                <span className="font-medium">{currentRealEstate.roomCount}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Bina Yaşı</span>
                <span className="font-medium">{currentRealEstate.buildingAge}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Bulunduğu Kat</span>
                <span className="font-medium">{currentRealEstate.floor}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Kat Sayısı</span>
                <span className="font-medium">{currentRealEstate.totalFloors}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Isıtma</span>
                <span className="font-medium">{currentRealEstate.heatingType ? getHeatingTypeLabel(currentRealEstate.heatingType) : '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Banyo Sayısı</span>
                <span className="font-medium">{currentRealEstate.bathroomCount}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Mutfak</span>
                <span className="font-medium">{currentRealEstate.kitchen === KitchenType.OPEN_AMERICAN ? 'Amerikan (Açık)' : 'Kapalı'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Balkon</span>
                <span className="font-medium">{currentRealEstate.balcony ? 'Var' : 'Yok'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Asansör</span>
                <span className="font-medium">{currentRealEstate.elevator ? 'Var' : 'Yok'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Otopark</span>
                <span className="font-medium">{currentRealEstate.parking ? 'Var' : 'Yok'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Eşyalı</span>
                <span className="font-medium">{currentRealEstate.furnished ? 'Evet' : 'Hayır'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Kullanım Durumu</span>
                <span className="font-medium">{currentRealEstate.usingStatus === 'EMPTY' ? 'Boş' : currentRealEstate.usingStatus === 'TENANT' ? 'Kiracılı' : 'Mülk Sahibi'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Site İçerisinde</span>
                <span className="font-medium">{currentRealEstate.inComplex ? 'Evet' : 'Hayır'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Site Adı</span>
                <span className="font-medium">{currentRealEstate.complexName || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Aidat (TL)</span>
                <span className="font-medium">{currentRealEstate.dues || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Depozito (TL)</span>
                <span className="font-medium">{currentRealEstate.deposit || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Tapu Durumu</span>
                <span className="font-medium">{currentRealEstate.tittleStatus ? getTittleStatusLabel(currentRealEstate.tittleStatus) : '-'}</span>
              </div>
            </div>
          </div>


          {/* Description */}
          {currentRealEstate.description && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Açıklama</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {currentRealEstate.description}
              </p>
            </div>
          )}

          {/* Map */}
          {currentRealEstate.latitude && currentRealEstate.longitude && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Konum</h2>
              <MapView
                latitude={currentRealEstate.latitude}
                longitude={currentRealEstate.longitude}
                title={currentRealEstate.title}
                height="300px"
              />
            </div>
          )}

          {/* Nearby Places */}
          {currentRealEstate.latitude && currentRealEstate.longitude && (
            <div className="card p-6">
              <NearbyPlaces
                latitude={currentRealEstate.latitude}
                longitude={currentRealEstate.longitude}
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
                <span className="text-gray-900">{currentRealEstate.ownerUsername}</span>
              </div>

              {isAuthenticated ? (
                <>
                  <button className="w-full btn-primary flex items-center justify-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Telefonu Göster</span>
                  </button>

                  {user?.id !== currentRealEstate.ownerId && (
                    <button
                      onClick={() => navigate(`/messages/${currentRealEstate.ownerId}`)}
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
                <span className="font-medium">#{currentRealEstate.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">İlan Tarihi:</span>
                <span className="font-medium">
                  {new Date(currentRealEstate.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durum:</span>
                <span className="font-medium capitalize">{currentRealEstate.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kimden:</span>
                <span className="font-medium">{currentRealEstate.fromWho === 'OWNER' ? 'Sahibinden' : currentRealEstate.fromWho === 'GALLERY' ? 'Emlakçıdan' : currentRealEstate.fromWho === 'AUTHORIZED_DEALER' ? 'Bankadan' : '-'}</span>
              </div>
              {currentRealEstate.ownerLastSeen && (
                <div className="flex justify-between items-center text-sm pt-2 border-t mt-2">
                  <span className="text-gray-600">Son Görülme:</span>
                  <span className="font-medium text-green-600">
                    {formatLastSeen(currentRealEstate.ownerLastSeen)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Similar Listings */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Benzer İlanlar</h3>
            <div className="space-y-4">
              {similarListings.length === 0 ? (
                <p className="text-gray-500 text-sm">Benzer ilan bulunamadı.</p>
              ) : (
                similarListings.map((listing) => (
                  <Link key={listing.id} to={`/real-estates/${listing.id}`} className="flex space-x-3 group">
                    {listing.imageUrl ? (
                      <img
                        src={`${process.env.REACT_APP_API_BASE_URL}${listing.imageUrl}`}
                        alt={listing.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Home className="h-6 w-6 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">
                        {listing.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {getRealEstateTypeLabel(listing.realEstateType)} • {listing.roomCount} Oda • {listing.grossSquareMeter} m²
                      </p>
                      <p className="text-sm font-semibold text-primary-600">
                        {formatPrice(listing.price, listing.currency)}
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
      {
        currentRealEstate && (
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
        )
      }

      {/* Share Modal */}
      {
        currentRealEstate && (
          <ShareListingModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            listingId={currentRealEstate.id}
            listingType="REAL_ESTATE"
            listingTitle={currentRealEstate.title}
          />
        )
      }
    </div >
  );
};