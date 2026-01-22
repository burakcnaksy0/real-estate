import React, { useEffect, useState } from 'react';
import { X, Save, Upload, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { useCategories } from '../../hooks/useCategories';
import { Land, LandCreateRequest, Currency, LandType, OfferType, YesNo, TittleStatus, ListingFrom } from '../../types';
import { VideoUpload, VideoFile } from '../../components/VideoUpload/VideoUpload';
import { VideoService } from '../../services/videoService';
import { ImageService, ImageResponse } from '../../services/imageService';
import { LandService } from '../../services/landService';

interface EditLandModalProps {
    land: Land;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

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
    zoningStatus: yup.string().nullable(),
    islandNumber: yup.number().required('Ada numarası gereklidir'),
    parcelNumber: yup.number().required('Parsel numarası gereklidir'),
    paftaNo: yup.string().nullable(),
    kaks: yup.number().nullable().transform((value, originalValue) => originalValue === '' ? null : value),
    gabari: yup.string().nullable(),
    offerType: yup.mixed<OfferType>().required('İşlem tipi gereklidir'),
});

export const EditLandModal: React.FC<EditLandModalProps> = ({
    land,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { getActiveCategories } = useCategories();
    const activeCategories = getActiveCategories();
    const [isLoading, setIsLoading] = useState(false);
    const [video, setVideo] = useState<VideoFile | null>(null);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<ImageResponse[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<LandCreateRequest>({
        resolver: yupResolver(landSchema) as any,
    });

    useEffect(() => {
        if (isOpen && land) {
            reset({
                title: land.title,
                description: land.description || '',
                price: land.price,
                currency: land.currency,
                categorySlug: land.categorySlug,
                city: land.city,
                district: land.district,
                landType: land.landType,
                squareMeter: land.squareMeter,
                zoningStatus: land.zoningStatus || '',
                islandNumber: land.islandNumber,
                parcelNumber: land.parcelNumber,
                offerType: land.offerType,
                paftaNo: land.paftaNo || '',
                kaks: land.kaks,
                gabari: land.gabari || '',
                creditEligibility: land.creditEligibility,
                deedStatus: land.deedStatus,
                listingFrom: land.listingFrom,
                exchange: land.exchange
            });
            setVideo(null);
            setSelectedImages([]);
            setImagePreviews([]);
            fetchImages();
        }
    }, [isOpen, land, reset]);

    const fetchImages = async () => {
        try {
            const imgs = await ImageService.getListingImages(land.id, 'LAND');
            setExistingImages(imgs);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const handleRemoveExistingImage = async (imageId: number) => {
        if (window.confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) {
            try {
                await ImageService.deleteImage(imageId);
                setExistingImages(prev => prev.filter(img => img.id !== imageId));
            } catch (error) {
                console.error('Error deleting image:', error);
            }
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages(files);

        // Create previews
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const onSubmit = async (data: LandCreateRequest) => {
        try {
            setIsLoading(true);
            await LandService.update(land.id, data);

            // Upload images if selected
            if (selectedImages.length > 0) {
                setUploadingImages(true);
                try {
                    await ImageService.uploadImages(selectedImages, land.id, 'LAND');
                } catch (error) {
                    console.error('Error uploading images:', error);
                } finally {
                    setUploadingImages(false);
                }
            }

            // Upload video if selected
            if (video) {
                setUploadingVideo(true);
                try {
                    await VideoService.uploadVideo(video.file, land.id, 'LAND');
                } catch (error) {
                    console.error('Error uploading video:', error);
                } finally {
                    setUploadingVideo(false);
                }
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating land:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const getLandTypeLabel = (type: LandType) => {
        const labels = {
            [LandType.LAND]: 'Arsa',
            [LandType.FIELD]: 'Tarla',
            [LandType.VINEYARD]: 'Bağ',
            [LandType.GARDEN]: 'Bahçe'
        };
        return labels[type] || type;
    };

    const getDeedStatusLabel = (type: TittleStatus) => {
        const labels = {
            [TittleStatus.FULL_DEED]: 'Tam Tapulu',
            [TittleStatus.SHARE_DEED]: 'Hisseli Tapu',
            [TittleStatus.CONDOMINIUM]: 'Kat İrtifaklı',
            [TittleStatus.CONSTRUCTION_SERVITUDE]: 'İnşaat Ruhsatlı',
            [TittleStatus.NO_DEED]: 'Tapusuz'
        };
        return labels[type] || type;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Arsa İlanını Düzenle</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Temel Bilgiler</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            İlan Başlığı *
                                        </label>
                                        <input
                                            {...register('title')}
                                            type="text"
                                            className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Kategori *
                                        </label>
                                        <select
                                            {...register('categorySlug')}
                                            className={`input-field ${errors.categorySlug ? 'border-red-500' : ''}`}
                                        >
                                            {activeCategories.map((category) => (
                                                <option key={category.id} value={category.slug}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Arsa Tipi *
                                        </label>
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
                                        />
                                        {errors.city && (
                                            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">İlçe *</label>
                                        <input
                                            {...register('district')}
                                            type="text"
                                            className={`input-field ${errors.district ? 'border-red-500' : ''}`}
                                        />
                                        {errors.district && (
                                            <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">İşlem Tipi</label>
                                        <select
                                            {...register('offerType')}
                                            className={`input-field ${errors.offerType ? 'border-red-500' : ''}`}
                                        >
                                            <option value={OfferType.FOR_SALE}>Satılık</option>
                                            <option value={OfferType.FOR_RENT}>Kiralık</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kimden</label>
                                        <select
                                            {...register('listingFrom')}
                                            className={`input-field ${errors.listingFrom ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Seçiniz</option>
                                            {Object.values(ListingFrom).map((type) => (
                                                <option key={type} value={type}>
                                                    {type === ListingFrom.OWNER ? 'Sahibinden' : type === ListingFrom.GALLERY ? 'Emlakçıdan' : 'Yetkili Satıcıdan'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                        <textarea
                                            {...register('description')}
                                            rows={3}
                                            className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Land Details */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Arsa Detayları</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Metrekare *
                                        </label>
                                        <input
                                            {...register('squareMeter', { valueAsNumber: true })}
                                            type="number"
                                            min="1"
                                            className={`input-field ${errors.squareMeter ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            İmar Durumu
                                        </label>
                                        <input
                                            {...register('zoningStatus')}
                                            type="text"
                                            className={`input-field ${errors.zoningStatus ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ada No *
                                        </label>
                                        <input
                                            {...register('islandNumber', { valueAsNumber: true })}
                                            type="number"
                                            className={`input-field ${errors.islandNumber ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Parsel No *
                                        </label>
                                        <input
                                            {...register('parcelNumber', { valueAsNumber: true })}
                                            type="number"
                                            className={`input-field ${errors.parcelNumber ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pafta No
                                        </label>
                                        <input
                                            {...register('paftaNo')}
                                            type="text"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Kaks (Emsal)
                                        </label>
                                        <input
                                            {...register('kaks', { valueAsNumber: true })}
                                            type="number"
                                            step="0.01"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gabari
                                        </label>
                                        <input
                                            {...register('gabari')}
                                            type="text"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tapu Durumu</label>
                                        <select
                                            {...register('deedStatus')}
                                            className="input-field"
                                        >
                                            <option value="">Seçiniz</option>
                                            {Object.values(TittleStatus).map((type) => (
                                                <option key={type} value={type}>
                                                    {getDeedStatusLabel(type)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Krediye Uygunluk</label>
                                        <select
                                            {...register('creditEligibility')}
                                            className="input-field"
                                        >
                                            <option value="">Seçiniz</option>
                                            <option value={YesNo.YES}>Evet</option>
                                            <option value={YesNo.NO}>Hayır</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Takas</label>
                                        <select
                                            {...register('exchange')}
                                            className="input-field"
                                        >
                                            <option value="">Seçiniz</option>
                                            <option value={YesNo.YES}>Evet</option>
                                            <option value={YesNo.NO}>Hayır</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Price Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Fiyat Bilgileri</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat *</label>
                                        <input
                                            {...register('price', { valueAsNumber: true })}
                                            type="number"
                                            min="1"
                                            className={`input-field ${errors.price ? 'border-red-500' : ''}`}
                                        />
                                        {errors.price && (
                                            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Para Birimi *
                                        </label>
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

                            {/* Images */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Fotoğraflar</h4>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <label className="cursor-pointer flex flex-col items-center">
                                        <Upload className="h-12 w-12 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">Fotoğraf eklemek için tıklayın</span>
                                        <span className="text-xs text-gray-500 mt-1">Birden fazla fotoğraf seçebilirsiniz</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                    </label>
                                    <div className="mt-4 space-y-4">
                                        {/* Existing Images */}
                                        {existingImages.length > 0 && (
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Mevcut Fotoğraflar</h5>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {existingImages.map((img) => (
                                                        <div key={img.id} className="relative group">
                                                            <img
                                                                src={ImageService.getImageUrl(img.id)}
                                                                alt="Land"
                                                                className="w-full h-24 object-cover rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveExistingImage(img.id)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Fotoğrafı Sil"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* New Image Previews */}
                                        {imagePreviews.length > 0 && (
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Yeni Eklenecek Fotoğraflar</h5>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {imagePreviews.map((preview, index) => (
                                                        <div key={index} className="relative">
                                                            <img
                                                                src={preview}
                                                                alt={`New Preview ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Video */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Video</h4>
                                {land.videoUrl && (
                                    <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
                                        <p className="text-sm">
                                            Bu ilanda zaten bir video mevcut. Yeni bir video yüklerseniz, eski video silinecektir.
                                        </p>
                                    </div>
                                )}
                                <VideoUpload
                                    video={video}
                                    onVideoChange={setVideo}
                                />
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={isLoading || uploadingVideo || uploadingImages}
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isLoading || uploadingVideo || uploadingImages}
                            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                        >
                            {isLoading || uploadingVideo || uploadingImages ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>
                                        {uploadingImages ? 'Fotoğraflar Yükleniyor...' : uploadingVideo ? 'Video Yükleniyor...' : 'Kaydediliyor...'}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    <span>Kaydet</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
};
