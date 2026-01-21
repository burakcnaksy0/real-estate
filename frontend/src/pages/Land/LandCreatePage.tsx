import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Save } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { LandCreateRequest, Currency, LandType, OfferType } from '../../types';
import { ImageUpload } from '../../components/ImageUpload/ImageUpload';
import { ImageService } from '../../services/imageService';
import { LandService } from '../../services/landService';
import { LocationPicker } from '../../components/LocationPicker/LocationPicker';
import { VideoUpload, VideoFile } from '../../components/VideoUpload/VideoUpload';
import { VideoService } from '../../services/videoService';

const landSchema = yup.object({
    title: yup.string().required('Başlık gereklidir').max(150),
    description: yup.string().max(5000),
    price: yup.number().required('Fiyat gereklidir').min(1),
    currency: yup.mixed<Currency>().required('Para birimi gereklidir'),
    categorySlug: yup.string().required('Kategori gereklidir'),
    city: yup.string().required('Şehir gereklidir').max(50),
    district: yup.string().required('İlçe gereklidir').max(50),
    landType: yup.mixed<LandType>().required('Arsa tipi gereklidir'),
    squareMeter: yup.number().required('Metrekare gereklidir').min(1),
    parcelNumber: yup.number().required('Parsel No gereklidir').min(0),
    islandNumber: yup.number().required('Ada No gereklidir').min(0),
    zoningStatus: yup.string().max(100, 'Maksimum 100 karakter olabilir'),
    offerType: yup.mixed<OfferType>().required('İşlem tipi gereklidir'),
});

interface ImageFile {
    file: File;
    preview: string;
    isPrimary: boolean;
}

export const LandCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const { getActiveCategories } = useCategories();
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<ImageFile[]>([]);
    const [video, setVideo] = useState<VideoFile | null>(null);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [location, setLocation] = useState<{ latitude?: number; longitude?: number }>({});

    const activeCategories = getActiveCategories();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LandCreateRequest>({
        resolver: yupResolver(landSchema) as any,
        defaultValues: {
            currency: Currency.TRY,
            landType: LandType.LAND,
            categorySlug: 'arsa',
            offerType: OfferType.FOR_SALE,
        },
    });

    const onSubmit = async (data: LandCreateRequest) => {
        try {
            setIsLoading(true);
            const landData = {
                ...data,
                latitude: location.latitude,
                longitude: location.longitude,
            };
            const result = await LandService.create(landData);
            const listingId = result.id;

            // Upload images if any
            if (images.length > 0) {
                setUploadingImages(true);
                try {
                    for (const image of images) {
                        await ImageService.uploadImage(
                            image.file,
                            listingId,
                            'LAND',
                            image.isPrimary
                        );
                    }
                } catch (imageError) {
                    console.error('Error uploading images:', imageError);
                } finally {
                    setUploadingImages(false);
                }
            }

            // Upload video if any
            if (video) {
                setUploadingVideo(true);
                try {
                    await VideoService.uploadVideo(
                        video.file,
                        listingId,
                        'LAND'
                    );
                } catch (videoError: any) {
                    console.error('Error uploading video:', videoError);
                    toast.error(videoError?.response?.data?.message || 'Video yüklenirken bir hata oluştu');
                } finally {
                    setUploadingVideo(false);
                }
            }

            navigate(`/lands`);
            if (window.location.pathname.includes('/create')) {
                // If embedded in CreateListingPage, maybe refresh or redirect somewhere else?
                // For now, redirecting to list page is fine.
                navigate('/lands');
            }
        } catch (error) {
            console.error('Error creating land:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getLandTypeLabel = (type: LandType): string => {
        const labels: Record<LandType, string> = {
            [LandType.LAND]: 'Arsa',
            [LandType.FIELD]: 'Tarla',
            [LandType.VINEYARD]: 'Bağ',
            [LandType.GARDEN]: 'Bahçe'
        };
        return labels[type] || type;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">


            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Temel Bilgiler</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">İlan Başlığı *</label>
                            <input
                                {...register('title')}
                                type="text"
                                className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                                placeholder="Örn: Merkezi konumda satılık arsa"
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                        </div>



                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Arsa Tipi *</label>
                            <select
                                {...register('landType')}
                                className={`input-field ${errors.landType ? 'border-red-500' : ''}`}
                            >
                                {Object.values(LandType).map((type) => (
                                    <option key={type} value={type}>
                                        {getLandTypeLabel(type)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Şehir *</label>
                            <input
                                {...register('city')}
                                type="text"
                                className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                                placeholder="Örn: İstanbul"
                            />
                            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">İlçe *</label>
                            <input
                                {...register('district')}
                                type="text"
                                className={`input-field ${errors.district ? 'border-red-500' : ''}`}
                                placeholder="Örn: Kadıköy"
                            />
                            {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                                placeholder="Arsa hakkında detaylı bilgi verin..."
                            />
                        </div>
                    </div>
                </div>

                {/* Land Details */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Arsa Detayları</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Metrekare (m²) *</label>
                            <input
                                {...register('squareMeter', { valueAsNumber: true })}
                                type="number"
                                min="1"
                                className={`input-field ${errors.squareMeter ? 'border-red-500' : ''}`}
                                placeholder="Örn: 500"
                            />
                            {errors.squareMeter && <p className="mt-1 text-sm text-red-600">{errors.squareMeter.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ada No *</label>
                            <input
                                {...register('islandNumber', { valueAsNumber: true })}
                                type="number"
                                min="0"
                                className={`input-field ${errors.islandNumber ? 'border-red-500' : ''}`}
                                placeholder="Örn: 101"
                            />
                            {errors.islandNumber && <p className="mt-1 text-sm text-red-600">{errors.islandNumber.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Parsel No *</label>
                            <input
                                {...register('parcelNumber', { valueAsNumber: true })}
                                type="number"
                                min="0"
                                className={`input-field ${errors.parcelNumber ? 'border-red-500' : ''}`}
                                placeholder="Örn: 5"
                            />
                            {errors.parcelNumber && <p className="mt-1 text-sm text-red-600">{errors.parcelNumber.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">İmar Durumu</label>
                            <input
                                {...register('zoningStatus')}
                                type="text"
                                className={`input-field ${errors.zoningStatus ? 'border-red-500' : ''}`}
                                placeholder="Örn: Konut İmarlı"
                            />
                            {errors.zoningStatus && <p className="mt-1 text-sm text-red-600">{errors.zoningStatus.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Price Information */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Fiyat Bilgileri</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">İşlem Tipi *</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input {...register('offerType')} type="radio" value={OfferType.FOR_SALE} className="mr-2" />
                                    <span>Satılık</span>
                                </label>
                                <label className="flex items-center">
                                    <input {...register('offerType')} type="radio" value={OfferType.FOR_RENT} className="mr-2" />
                                    <span>Kiralık</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat *</label>
                            <input
                                {...register('price', { valueAsNumber: true })}
                                type="number"
                                min="1"
                                className={`input-field ${errors.price ? 'border-red-500' : ''}`}
                                placeholder="Örn: 500000"
                            />
                            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi *</label>
                            <select
                                {...register('currency')}
                                className={`input-field ${errors.currency ? 'border-red-500' : ''}`}
                            >
                                {Object.values(Currency).map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Konum</h2>
                    <LocationPicker
                        latitude={location.latitude}
                        longitude={location.longitude}
                        onLocationChange={(lat, lng) => setLocation({ latitude: lat, longitude: lng })}
                        height="350px"
                    />
                </div>

                {/* Images */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Görseller</h2>
                    <ImageUpload
                        images={images}
                        onImagesChange={setImages}
                        maxImages={10}
                        maxSizeMB={10}
                    />
                </div>

                {/* Video */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Video</h2>
                    <VideoUpload
                        video={video}
                        onVideoChange={setVideo}
                        maxSizeMB={100}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn-secondary"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || uploadingImages}
                        className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading || uploadingImages ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>{uploadingImages ? 'Görseller yükleniyor...' : uploadingVideo ? 'Video yükleniyor...' : 'Kaydediliyor...'}</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                <span>İlanı Yayınla</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
