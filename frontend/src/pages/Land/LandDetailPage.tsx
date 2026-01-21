import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    MapPin, Calendar, User, Phone, Edit, Trash2, ArrowLeft,
    Home, Ruler, Map as MapIcon, FileText, Building, Share2, Eye, Heart,
    Video as VideoIcon, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Currency, LandType, Land, OfferType } from '../../types';
import { ImageResponse, ImageService } from '../../services/imageService';
import { ImageGallery } from '../../components/ImageGallery/ImageGallery';
import { formatLastSeen } from '../../utils/dateUtils';
import { LandService } from '../../services/landService';
import { FavoriteButton } from '../../components/FavoriteButton/FavoriteButton';
import { ShareListingModal } from '../../components/Modals/ShareListingModal';
import { MapView } from '../../components/MapView/MapView';
import { NearbyPlaces } from '../../components/MapView/NearbyPlaces';
import { websocketService } from '../../services/websocketService';

export const LandDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [land, setLand] = useState<Land | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [images, setImages] = useState<ImageResponse[]>([]);
    const [similarLands, setSimilarLands] = useState<Land[]>([]);
    const [activeTab, setActiveTab] = useState<'photos' | 'video'>('photos');

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const data = await LandService.getById(Number(id));
                setLand(data);

                // Fetch images
                try {
                    const imgs = await ImageService.getListingImages(Number(id), 'LAND');
                    setImages(imgs);
                } catch (imgError) {
                    console.error('Error fetching images:', imgError);
                }

                // Fetch similar lands
                try {
                    const similar = await LandService.getSimilar(Number(id));
                    setSimilarLands(similar);
                } catch (error) {
                    console.error('Error fetching similar lands:', error);
                }

            } catch (error) {
                console.error('Error fetching land:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        // Subscribe to real-time favoriteCount updates
        const subscription = websocketService.subscribe(
            `/topic/listing/${id}/favoriteCount`,
            (event: { listingId: number; listingType: string; favoriteCount: number }) => {
                console.log('WebSocket event received:', event);
                fetchData();
            }
        );

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [id]);

    const handleDelete = async () => {
        if (land && window.confirm('Bu arsa ilanını silmek istediğinizden emin misiniz?')) {
            try {
                await LandService.delete(land.id);
                navigate('/lands');
            } catch (error) {
                console.error('Error deleting land:', error);
            }
        }
    };

    const formatPrice = (price: number, currency: Currency) => {
        return `${price.toLocaleString('tr-TR')} ${currency}`;
    };

    const getLandTypeLabel = (type: LandType) => {
        const labels: Record<LandType, string> = {
            [LandType.LAND]: 'Arsa',
            [LandType.FIELD]: 'Tarla',
            [LandType.VINEYARD]: 'Bağ',
            [LandType.GARDEN]: 'Bahçe'
        };
        return labels[type] || type;
    };

    const getOfferTypeLabel = (type: OfferType) => {
        if (type === OfferType.FOR_SALE) return 'Satılık';
        if (type === OfferType.FOR_RENT) return 'Kiralık';
        return type;
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-6 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!land) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🌄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">İlan bulunamadı</h3>
                <Link to="/lands" className="btn-primary">İlanlara Geri Dön</Link>
            </div>
        );
    }

    const isOwner = isAuthenticated && user?.id === land.ownerId;

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
                <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
                <span>/</span>
                <Link to="/lands" className="hover:text-primary-600">Arsa İlanları</Link>
                <span>/</span>
                <span className="text-gray-900">{land.title}</span>
            </nav>

            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
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
                            <ImageIcon className="w-4 h-4" />
                            <span>Fotoğraflar</span>
                        </div>
                    </button>

                    {land.videoUrl && (
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
                        <ImageGallery images={images} fallbackIcon={<MapIcon className="w-24 h-24 text-gray-300" />} />
                    </div>

                    {activeTab === 'video' && land.videoUrl && (
                        <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-lg">
                            <video
                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${land.videoUrl}`}
                                controls
                                className="w-full h-full"
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
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{land.title}</h1>
                            <div className="flex items-center text-gray-600 space-x-4">
                                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{land.city}, {land.district}</span>
                                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{new Date(land.createdAt).toLocaleDateString('tr-TR')}</span>
                                <span className="flex items-center"><Eye className="h-4 w-4 mr-1" />{land.viewCount} görüntülenme</span>
                                <span className="flex items-center"><Heart className="h-4 w-4 mr-1" />{land.favoriteCount || 0} favori</span>
                            </div>
                        </div>
                        {isOwner && (
                            <div className="flex space-x-2">
                                <button onClick={handleDelete} className="btn-secondary text-red-600 hover:bg-red-50 flex items-center space-x-2">
                                    <Trash2 className="h-4 w-4" /> <span>Sil</span>
                                </button>
                            </div>
                        )}

                        {!isOwner && isAuthenticated && (
                            <div className="flex space-x-2">
                                <FavoriteButton listingId={land.id} listingType="LAND" />
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
                            <FavoriteButton listingId={land.id} listingType="LAND" />
                        )}
                    </div>

                    {/* Price Card */}
                    <div className="bg-primary-50 rounded-lg p-6">
                        <div className="text-3xl font-bold text-primary-600">{formatPrice(land.price, land.currency)}</div>
                        <div className="text-gray-600 mt-1">
                            {getLandTypeLabel(land.landType)} • {getOfferTypeLabel(land.offerType)}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Arsa Detayları</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <MapIcon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                                <div className="text-lg font-semibold">{getLandTypeLabel(land.landType)}</div>
                                <div className="text-sm text-gray-600">Tipi</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Ruler className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                                <div className="text-lg font-semibold">{land.squareMeter} m²</div>
                                <div className="text-sm text-gray-600">Alan</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <FileText className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                                <div className="text-lg font-semibold">{land.parcelNumber} / {land.islandNumber}</div>
                                <div className="text-sm text-gray-600">Parsel/Ada</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Building className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                                <div className="text-lg font-semibold">{land.zoningStatus || '-'}</div>
                                <div className="text-sm text-gray-600">İmar</div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {land.description && (
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Açıklama</h2>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{land.description}</p>
                        </div>
                    )}

                    {/* Map */}
                    {land.latitude && land.longitude && (
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Konum</h2>
                            <MapView
                                latitude={land.latitude}
                                longitude={land.longitude}
                                title={land.title}
                                height="300px"
                            />
                        </div>
                    )}
                    {/* Nearby Places */}
                    {land.latitude && land.longitude && (
                        <div className="card p-6">
                            <NearbyPlaces
                                latitude={land.latitude}
                                longitude={land.longitude}
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar (Contact, etc) */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim</h3>
                        <div className="flex items-center space-x-3 mb-4">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-900">{land.ownerUsername}</span>
                        </div>
                        {isAuthenticated ? (
                            <button className="w-full btn-primary flex items-center justify-center space-x-2">
                                <Phone className="h-4 w-4" /> <span>İletişime Geç</span>
                            </button>
                        ) : (
                            <Link to="/login" className="btn-primary w-full text-center">Giriş Yap</Link>
                        )}
                    </div>

                    {/* Quick Info */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Özet Bilgiler</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">İlan No:</span>
                                <span className="font-medium">#{land.id}</span>
                            </div>

                            {land.ownerLastSeen && (
                                <div className="flex justify-between text-green-600">
                                    <span className="text-gray-600">Son Görülme:</span>
                                    <span className="font-medium">{formatLastSeen(land.ownerLastSeen)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Durum:</span>
                                <span className="font-medium capitalize">{land.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Güncellenme:</span>
                                <span className="font-medium">
                                    {new Date(land.updatedAt).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Similar Listings */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Benzer İlanlar</h3>
                        <div className="space-y-4">
                            {similarLands.length === 0 ? (
                                <p className="text-gray-500 text-sm">Benzer ilan bulunamadı.</p>
                            ) : (
                                similarLands.map((listing) => (
                                    <Link key={listing.id} to={`/lands/${listing.id}`} className="flex space-x-3 group">
                                        {listing.imageUrl ? (
                                            <img
                                                src={`${process.env.REACT_APP_API_BASE_URL}${listing.imageUrl}`}
                                                alt={listing.title}
                                                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                <MapIcon className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">
                                                {listing.title}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {getLandTypeLabel(listing.landType)} • {listing.squareMeter} m²
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

            {/* Share Modal */}
            {land && (
                <ShareListingModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    listingId={land.id}
                    listingType="LAND"
                    listingTitle={land.title}
                />
            )}
        </div>
    );
};
