import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    MapPin, Calendar, User, Phone, Mail, Edit, Trash2, ArrowLeft,
    Home, Ruler, Layers, Briefcase, Share2, Eye, Heart,
    Video as VideoIcon, Image as ImageIcon, ShieldCheck, Tag, Info, Navigation,
    ChevronRight, Thermometer, Building, Warehouse, Maximize, FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Currency, WorkplaceType, Workplace, OfferType, HeatingType, YesNo, TittleStatus, ListingFrom } from '../../types';
import { ImageResponse, ImageService } from '../../services/imageService';
import { ImageGallery } from '../../components/ImageGallery/ImageGallery';
import { formatLastSeen } from '../../utils/dateUtils';
import { WorkplaceService } from '../../services/workplaceService';
import { FavoriteButton } from '../../components/FavoriteButton/FavoriteButton';
import { ShareListingModal } from '../../components/Modals/ShareListingModal';
import { EditWorkplaceModal } from '../../components/Modals/EditWorkplaceModal';
import { MapView } from '../../components/MapView/MapView';
import { NearbyPlaces } from '../../components/MapView/NearbyPlaces';
import { websocketService } from '../../services/websocketService';

export const WorkplaceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [workplace, setWorkplace] = useState<Workplace | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [images, setImages] = useState<ImageResponse[]>([]);
    const [similarWorkplaces, setSimilarWorkplaces] = useState<Workplace[]>([]);
    const [activeTab, setActiveTab] = useState<'photos' | 'video'>('photos');

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const data = await WorkplaceService.getById(Number(id));
                setWorkplace(data);

                // Fetch images
                try {
                    const imgs = await ImageService.getListingImages(Number(id), 'WORKPLACE');
                    setImages(imgs);
                } catch (imgError) {
                    console.error('Error fetching images:', imgError);
                }

                // Fetch similar workplaces
                try {
                    const similar = await WorkplaceService.getSimilar(Number(id));
                    setSimilarWorkplaces(similar);
                } catch (error) {
                    console.error('Error fetching similar workplaces:', error);
                }

            } catch (error) {
                console.error('Error fetching workplace:', error);
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
        if (workplace && window.confirm('Bu işyeri ilanını silmek istediğinizden emin misiniz?')) {
            try {
                await WorkplaceService.delete(workplace.id);
                navigate('/workplaces');
            } catch (error) {
                console.error('Error deleting workplace:', error);
            }
        }
    };

    const formatPrice = (price: number, currency: Currency) => {
        return `${price.toLocaleString('tr-TR')} ${currency}`;
    };

    const getWorkplaceTypeLabel = (type: WorkplaceType) => {
        const labels: Record<WorkplaceType, string> = {
            [WorkplaceType.OFFICE]: 'Ofis',
            [WorkplaceType.SHOP]: 'Dükkan',
            [WorkplaceType.WAREHOUSE]: 'Depo',
            [WorkplaceType.FACTORY]: 'Fabrika'
        };
        return labels[type] || type;
    };

    const getOfferTypeLabel = (type: OfferType) => {
        if (type === OfferType.FOR_SALE) return 'Satılık';
        if (type === OfferType.FOR_RENT) return 'Kiralık';
        return type;
    };

    const getHeatingTypeLabel = (type?: HeatingType) => {
        if (!type) return '-';
        const labels: Record<HeatingType, string> = {
            [HeatingType.NATURAL_GAS]: 'Doğalgaz',
            [HeatingType.CENTRAL_HEATING]: 'Merkezi Isıtma',
            [HeatingType.STOVE_HEATING]: 'Soba',
            [HeatingType.AIR_CONDITIONING]: 'Klima'
        };
        return labels[type] || type;
    };

    const getYesNoLabel = (value?: YesNo) => {
        if (!value) return '-';
        return value === YesNo.YES ? 'Evet' : 'Hayır';
    };

    const getDeedStatusLabel = (status?: TittleStatus) => {
        if (!status) return '-';
        const labels: Record<TittleStatus, string> = {
            [TittleStatus.FULL_DEED]: 'Tam Tapulu',
            [TittleStatus.SHARE_DEED]: 'Hisseli Tapu',
            [TittleStatus.CONDOMINIUM]: 'Kat İrtifaklı',
            [TittleStatus.CONSTRUCTION_SERVITUDE]: 'İnşaat Ruhsatlı',
            [TittleStatus.NO_DEED]: 'Tapusuz'
        };
        return labels[status] || status;
    };

    const getListingFromLabel = (from?: ListingFrom) => {
        if (!from) return '-';
        const labels: Record<ListingFrom, string> = {
            [ListingFrom.OWNER]: 'Sahibinden',
            [ListingFrom.GALLERY]: 'Emlakçıdan',
            [ListingFrom.AUTHORIZED_DEALER]: 'Yetkili Satıcıdan'
        };
        return labels[from] || from;
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

    if (!workplace) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">İlan bulunamadı</h3>
                <Link to="/workplaces" className="btn-primary">İlanlara Geri Dön</Link>
            </div>
        );
    }

    const isOwner = isAuthenticated && user?.id === workplace.ownerId;

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
                            <Link to="/workplaces" className="hover:text-primary-600 transition-colors">İşyeri</Link>
                            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                            <span className="font-medium text-gray-900 truncate max-w-[200px]">{workplace.title}</span>
                        </nav>

                        <div className="flex items-center gap-3">
                            {!isOwner ? (
                                <>
                                    <FavoriteButton listingId={workplace.id} listingType="WORKPLACE" />
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
                                {workplace.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                                    <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                                    {workplace.city}, {workplace.district}
                                </span>
                                <span className="flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                                    <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                                    {new Date(workplace.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                                <span className="flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                                    <Tag className="w-4 h-4 mr-2 text-primary-500" />
                                    İlan No: {workplace.id}
                                </span>
                                <span className="flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">
                                    <Eye className="w-4 h-4 mr-2 text-primary-500" />
                                    {workplace.viewCount} Görüntülenme
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-start lg:items-end">
                            <div className="text-4xl font-bold text-primary-600">
                                {formatPrice(workplace.price, workplace.currency)}
                            </div>
                            <div className="flex gap-2 mt-2">
                                <span className="px-4 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-sm font-semibold tracking-wide">
                                    {getWorkplaceTypeLabel(workplace.workplaceType)}
                                </span>
                                <span className="px-4 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-sm font-semibold tracking-wide">
                                    {getOfferTypeLabel(workplace.offerType)}
                                </span>
                            </div>
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
                                {workplace.videoUrl && (
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
                                    <ImageGallery images={images} fallbackIcon={<Briefcase className="w-32 h-32 text-gray-200" />} />
                                ) : (
                                    workplace.videoUrl && (
                                        <div className="bg-black aspect-video flex items-center justify-center">
                                            <video
                                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${workplace.videoUrl}`}
                                                controls
                                                className="w-full h-full"
                                                autoPlay
                                            >
                                                Tarayıcınız video oynatmayı desteklemiyor.
                                            </video>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Quick Specs Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FeatureCard
                                icon={Maximize}
                                label="Büyüklük"
                                value={workplace.squareMeter + " m²"}
                            />
                            <FeatureCard
                                icon={Layers}
                                label="Bölüm/Oda"
                                value={workplace.floorCount}
                            />
                            <FeatureCard
                                icon={Thermometer}
                                label="Isıtma"
                                value={workplace.heatingType ? getHeatingTypeLabel(workplace.heatingType) : '-'}
                            />
                            <FeatureCard
                                icon={Building}
                                label="Bina Yaşı"
                                value={workplace.buildingAge}
                            />
                        </div>

                        {/* Comprehensive Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Info size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">İşyeri Özellikleri</h2>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-12">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider border-b pb-2">Temel Bilgiler</h3>
                                        <DetailRow label="İlan No" value={`#${workplace.id}`} />
                                        <DetailRow label="Kategori" value="İş Yeri" />
                                        <DetailRow label="Türü" value={getWorkplaceTypeLabel(workplace.workplaceType)} />
                                        <DetailRow label="Durum" value={getOfferTypeLabel(workplace.offerType)} />
                                        <DetailRow label="Bölüm Sayısı" value={workplace.floorCount} />
                                        <DetailRow label="m² Fiyatı" value={`${(workplace.price / workplace.squareMeter).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ${workplace.currency}`} />
                                    </div>

                                    <div className="space-y-1 mt-6 md:mt-0">
                                        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider border-b pb-2">Detaylar & Tapu</h3>
                                        <DetailRow label="Aidat" value={workplace.dues ? `${workplace.dues} TL` : undefined} />
                                        <DetailRow label="Tapu Durumu" value={getDeedStatusLabel(workplace.deedStatus)} icon={FileText} />
                                        <DetailRow label="Krediye Uygun" value={getYesNoLabel(workplace.creditEligibility)} />
                                        <DetailRow label="Takas" value={getYesNoLabel(workplace.exchange)} />
                                        <DetailRow label="Kimden" value={getListingFromLabel(workplace.listingFrom)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {workplace.description && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <Tag size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Açıklama</h2>
                                </div>
                                <div className="p-8">
                                    <div className="prose prose-blue max-w-none">
                                        <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">{workplace.description}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Map */}
                        {workplace.latitude && workplace.longitude && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                        <Navigation size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Konum</h2>
                                </div>
                                <div className="h-[400px]">
                                    <MapView
                                        latitude={workplace.latitude}
                                        longitude={workplace.longitude}
                                        title={workplace.title}
                                        height="100%"
                                    />
                                </div>
                            </div>
                        )}
                        {/* Nearby Places */}
                        {workplace.latitude && workplace.longitude && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                                    <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                                        <MapPin size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Yakın Çevre</h2>
                                </div>
                                <div className="p-4">
                                    <NearbyPlaces
                                        latitude={workplace.latitude}
                                        longitude={workplace.longitude}
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
                                <Link to={`/listings?ownerId=${workplace.ownerId}`} className="flex items-center gap-4 mb-6 group hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl border-4 border-white shadow-md group-hover:scale-105 transition-transform">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{workplace.ownerUsername}</h4>
                                        {workplace.ownerLastSeen && (
                                            <p className="text-sm text-green-600 flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                {formatLastSeen(workplace.ownerLastSeen)}
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
                                            {user?.id !== workplace.ownerId && (
                                                <button
                                                    onClick={() => navigate(`/messages/${workplace.ownerId}`)}
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
                                    <li>İşyeri ruhsatı ve tapuyu kontrol edin.</li>
                                    <li>Sözleşme şartlarını dikkatle okuyun.</li>
                                </ul>
                            </div>

                            {/* Similar Listings Shortcut */}
                            {similarWorkplaces.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Benzer İlanlar</h3>
                                    <div className="space-y-4">
                                        {similarWorkplaces.slice(0, 3).map(listing => (
                                            <Link key={listing.id} to={`/workplaces/${listing.id}`} className="flex gap-3 group">
                                                <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    {listing.imageUrl ? (
                                                        <img src={process.env.REACT_APP_API_BASE_URL + listing.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    ) : <div className="w-full h-full flex items-center justify-center text-gray-400"><Briefcase size={20} /></div>}
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

                {/* Share Modal */}
                {workplace && (
                    <ShareListingModal
                        isOpen={isShareModalOpen}
                        onClose={() => setIsShareModalOpen(false)}
                        listingId={workplace.id}
                        listingType="WORKPLACE"
                        listingTitle={workplace.title}
                    />
                )}

                {workplace && (
                    <EditWorkplaceModal
                        workplace={workplace}
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onSuccess={() => {
                            window.location.reload();
                        }}
                    />
                )}
            </div>
        </div>
    );
};
