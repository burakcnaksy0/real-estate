import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    MapPin, Calendar, User, Phone, Mail, Edit, Trash2, ArrowLeft,
    Home, Ruler, Layers, Briefcase
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Currency, WorkplaceType, Workplace, OfferType } from '../../types';
import { ImageResponse, ImageService } from '../../services/imageService';
import { ImageGallery } from '../../components/ImageGallery/ImageGallery';
import { WorkplaceService } from '../../services/workplaceService';
import { FavoriteButton } from '../../components/FavoriteButton/FavoriteButton';

export const WorkplaceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [workplace, setWorkplace] = useState<Workplace | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [images, setImages] = useState<ImageResponse[]>([]);

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
            } catch (error) {
                console.error('Error fetching workplace:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
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

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
                <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
                <span>/</span>
                <Link to="/workplaces" className="hover:text-primary-600">İşyeri İlanları</Link>
                <span>/</span>
                <span className="text-gray-900">{workplace.title}</span>
            </nav>

            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                <span>Geri Dön</span>
            </button>

            {/* Image Gallery */}
            <ImageGallery images={images} fallbackIcon={<Briefcase className="w-24 h-24 text-gray-300" />} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{workplace.title}</h1>
                            <div className="flex items-center text-gray-600 space-x-4">
                                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{workplace.city}, {workplace.district}</span>
                                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{new Date(workplace.createdAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </div>
                        {isOwner && (
                            <div className="flex space-x-2">
                                <button onClick={handleDelete} className="btn-secondary text-red-600 hover:bg-red-50 flex items-center space-x-2">
                                    <Trash2 className="h-4 w-4" /> <span>Sil</span>
                                </button>
                            </div>
                        )}

                        {!isOwner && (
                            <FavoriteButton listingId={workplace.id} listingType="WORKPLACE" />
                        )}
                    </div>

                    {/* Price Card */}
                    <div className="bg-primary-50 rounded-lg p-6">
                        <div className="text-3xl font-bold text-primary-600">{formatPrice(workplace.price, workplace.currency)}</div>
                        <div className="text-gray-600 mt-1">
                            {getWorkplaceTypeLabel(workplace.workplaceType)} • {getOfferTypeLabel(workplace.offerType)}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">İşyeri Detayları</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Briefcase className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                                <div className="text-lg font-semibold">{getWorkplaceTypeLabel(workplace.workplaceType)}</div>
                                <div className="text-sm text-gray-600">Tipi</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Ruler className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                                <div className="text-lg font-semibold">{workplace.squareMeter} m²</div>
                                <div className="text-sm text-gray-600">Alan</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Layers className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                                <div className="text-lg font-semibold">{workplace.floorCount}</div>
                                <div className="text-sm text-gray-600">Bölüm/Kat</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Home className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                                <div className="text-lg font-semibold">{workplace.furnished ? 'Evet' : 'Hayır'}</div>
                                <div className="text-sm text-gray-600">Eşyalı</div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {workplace.description && (
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Açıklama</h2>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{workplace.description}</p>
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

                {/* Sidebar (Contact, etc) */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim</h3>
                        <div className="flex items-center space-x-3 mb-4">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-900">{workplace.ownerUsername}</span>
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
                                <span className="font-medium">#{workplace.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Durum:</span>
                                <span className="font-medium capitalize">{workplace.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Güncellenme:</span>
                                <span className="font-medium">
                                    {new Date(workplace.updatedAt).toLocaleDateString('tr-TR')}
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
                                        <Briefcase className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            Benzer İşyeri {index + 1}
                                        </p>
                                        <p className="text-xs text-gray-600">Ofis • 100 m²</p>
                                        <p className="text-sm font-semibold text-primary-600">
                                            150.000 TL
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
