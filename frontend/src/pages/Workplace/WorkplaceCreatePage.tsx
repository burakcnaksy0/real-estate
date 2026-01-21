import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Save } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { WorkplaceCreateRequest, Currency, WorkplaceType, OfferType } from '../../types';
import { ImageUpload } from '../../components/ImageUpload/ImageUpload';
import { ImageService } from '../../services/imageService';
import { WorkplaceService } from '../../services/workplaceService';
import { LocationPicker } from '../../components/LocationPicker/LocationPicker';
import { VideoUpload, VideoFile } from '../../components/VideoUpload/VideoUpload';
import { VideoService } from '../../services/videoService';

// Schema
const workplaceSchema = yup.object({
    title: yup.string().required('Başlık gereklidir').max(150),
    description: yup.string().max(5000),
    price: yup.number().required('Fiyat gereklidir').min(1),
    currency: yup.mixed<Currency>().required('Para birimi gereklidir'),
    categorySlug: yup.string().required('Kategori gereklidir'),
    city: yup.string().required('Şehir gereklidir').max(50),
    district: yup.string().required('İlçe gereklidir').max(50),
    workplaceType: yup.mixed<WorkplaceType>().required('İşyeri tipi gereklidir'),
    squareMeter: yup.number().required('Metrekare gereklidir').min(1),
    floorCount: yup.number().required('Kat sayısı gereklidir').min(0),
    furnished: yup.boolean().required('Eşyalı bilgisi gereklidir'),
    offerType: yup.mixed<OfferType>().required('İşlem tipi gereklidir'),
});

interface ImageFile {
    file: File;
    preview: string;
    isPrimary: boolean;
}

export const WorkplaceCreatePage: React.FC = () => {
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
    } = useForm<WorkplaceCreateRequest>({
        resolver: yupResolver(workplaceSchema) as any,
        defaultValues: {
            currency: Currency.TRY,
            workplaceType: WorkplaceType.OFFICE,
            categorySlug: 'isyeri',
            furnished: false,
            offerType: OfferType.FOR_SALE,
        },
    });

    const onSubmit = async (data: WorkplaceCreateRequest) => {
        try {
            setIsLoading(true);
            const workplaceData = {
                ...data,
                latitude: location.latitude,
                longitude: location.longitude,
            };
            const result = await WorkplaceService.create(workplaceData);
            const listingId = result.id;

            // Upload images
            if (images.length > 0) {
                setUploadingImages(true);
                try {
                    for (const image of images) {
                        await ImageService.uploadImage(
                            image.file,
                            listingId,
                            'WORKPLACE',
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
                        'WORKPLACE'
                    );
                } catch (videoError: any) {
                    console.error('Error uploading video:', videoError);
                    toast.error(videoError?.response?.data?.message || 'Video yüklenirken bir hata oluştu');
                } finally {
                    setUploadingVideo(false);
                }
            }

            navigate(`/workplaces/${listingId}`);
            if (window.location.pathname.includes('/create')) {
                navigate(`/workplaces/${listingId}`);
            }
        } catch (error) {
            console.error('Error creating workplace:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getWorkplaceTypeLabel = (type: WorkplaceType): string => {
        const labels: Record<WorkplaceType, string> = {
            [WorkplaceType.OFFICE]: 'Ofis',
            [WorkplaceType.SHOP]: 'Dükkan',
            [WorkplaceType.WAREHOUSE]: 'Depo',
            [WorkplaceType.FACTORY]: 'Fabrika'
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
                                placeholder="Örn: Merkezi konumda kiralık ofis"
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                        </div>

                        {/* Kategori Select removed, default is 'isyeri' */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">İşyeri Tipi *</label>
                            <select
                                {...register('workplaceType')}
                                className={`input-field ${errors.workplaceType ? 'border-red-500' : ''}`}
                            >
                                {Object.values(WorkplaceType).map((type) => (
                                    <option key={type} value={type}>
                                        {getWorkplaceTypeLabel(type)}
                                    </option>
                                ))}
                            </select>
                            {errors.workplaceType && <p className="mt-1 text-sm text-red-600">{errors.workplaceType.message}</p>}
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
                                placeholder="Örn: Levent"
                            />
                            {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                                placeholder="İşyeri hakkında detaylı bilgi verin..."
                            />
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">İşyeri Detayları</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Metrekare (m²) *</label>
                            <input
                                {...register('squareMeter', { valueAsNumber: true })}
                                type="number"
                                min="1"
                                className={`input-field ${errors.squareMeter ? 'border-red-500' : ''}`}
                                placeholder="Örn: 150"
                            />
                            {errors.squareMeter && <p className="mt-1 text-sm text-red-600">{errors.squareMeter.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bolum/Oda/Kat Sayısı ? *</label>
                            {/* Assuming floorCount maps to floor or section count */}
                            <input
                                {...register('floorCount', { valueAsNumber: true })}
                                type="number"
                                min="0"
                                className={`input-field ${errors.floorCount ? 'border-red-500' : ''}`}
                                placeholder="Örn: 1"
                            />
                            {errors.floorCount && <p className="mt-1 text-sm text-red-600">{errors.floorCount.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Eşyalı *</label>
                            <div className="flex items-center space-x-4 mt-2">
                                <label className="flex items-center">
                                    <input
                                        {...register('furnished')}
                                        type="radio"
                                        value="true"
                                        className="h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Evet</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        {...register('furnished')}
                                        type="radio"
                                        value="false"
                                        className="h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Hayır</span>
                                </label>
                            </div>
                            {errors.furnished && <p className="mt-1 text-sm text-red-600">{errors.furnished.message}</p>}
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
                                placeholder="Örn: 15000"
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
