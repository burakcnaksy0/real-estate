import React, { useEffect, useState } from 'react';
import { X, Save, Upload, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { useCategories } from '../../hooks/useCategories';
import { Workplace, WorkplaceCreateRequest, Currency, WorkplaceType, OfferType, HeatingType, YesNo, TittleStatus, ListingFrom } from '../../types';
import { VideoUpload, VideoFile } from '../../components/VideoUpload/VideoUpload';
import { VideoService } from '../../services/videoService';
import { ImageService, ImageResponse } from '../../services/imageService';
import { WorkplaceService } from '../../services/workplaceService';

interface EditWorkplaceModalProps {
    workplace: Workplace;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const workplaceSchema = yup.object({
    title: yup.string().required('Başlık gereklidir').max(150),
    description: yup.string().max(5000),
    price: yup.number().required('Fiyat gereklidir').min(1),
    currency: yup.mixed<Currency>().required('Para birimi gereklidir'),
    categorySlug: yup.string().required('Kategori gereklidir'),
    city: yup.string().required('Şehir gereklidir').max(50),
    district: yup.string().required('İlçe gereklidir').max(50),
    workplaceType: yup.mixed<WorkplaceType>().required('İş Yeri tipi gereklidir'),
    squareMeter: yup.number().required('Metrekare gereklidir').min(1),
    floorCount: yup.number().required('Bölüm/Oda sayısı gereklidir').min(0),
    furnished: yup.boolean().required('Eşyalı bilgisi gereklidir'),
    offerType: yup.mixed<OfferType>().required('İşlem tipi gereklidir'),
    heatingType: yup.mixed<HeatingType>().nullable(),
    buildingAge: yup.string().nullable(),
    dues: yup.number().nullable().transform((value, originalValue) => originalValue === '' ? null : value),
});

export const EditWorkplaceModal: React.FC<EditWorkplaceModalProps> = ({
    workplace,
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
    } = useForm<WorkplaceCreateRequest>({
        resolver: yupResolver(workplaceSchema) as any,
    });

    useEffect(() => {
        if (isOpen && workplace) {
            reset({
                title: workplace.title,
                description: workplace.description || '',
                price: workplace.price,
                currency: workplace.currency,
                categorySlug: workplace.categorySlug,
                city: workplace.city,
                district: workplace.district,
                workplaceType: workplace.workplaceType,
                squareMeter: workplace.squareMeter,
                floorCount: workplace.floorCount,
                furnished: workplace.furnished,
                offerType: workplace.offerType,
                heatingType: workplace.heatingType,
                buildingAge: workplace.buildingAge || '',
                dues: workplace.dues,
                creditEligibility: workplace.creditEligibility,
                deedStatus: workplace.deedStatus,
                listingFrom: workplace.listingFrom,
                exchange: workplace.exchange
            });
            setVideo(null);
            setSelectedImages([]);
            setImagePreviews([]);
            fetchImages();
        }
    }, [isOpen, workplace, reset]);

    const fetchImages = async () => {
        try {
            const imgs = await ImageService.getListingImages(workplace.id, 'WORKPLACE');
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

    const onSubmit = async (data: WorkplaceCreateRequest) => {
        try {
            setIsLoading(true);
            await WorkplaceService.update(workplace.id, data);

            // Upload images if selected
            if (selectedImages.length > 0) {
                setUploadingImages(true);
                try {
                    await ImageService.uploadImages(selectedImages, workplace.id, 'WORKPLACE');
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
                    await VideoService.uploadVideo(video.file, workplace.id, 'WORKPLACE');
                } catch (error) {
                    console.error('Error uploading video:', error);
                } finally {
                    setUploadingVideo(false);
                }
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating workplace:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const getWorkplaceTypeLabel = (type: WorkplaceType) => {
        const labels = {
            [WorkplaceType.OFFICE]: 'Ofis',
            [WorkplaceType.SHOP]: 'Dükkan',
            [WorkplaceType.WAREHOUSE]: 'Depo',
            [WorkplaceType.FACTORY]: 'Fabrika'
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
                        <h3 className="text-lg font-semibold text-gray-900">İş Yeri İlanını Düzenle</h3>
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
                                            İş Yeri Tipi *
                                        </label>
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

                            {/* Workplace Details */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-4">İş Yeri Detayları</h4>
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
                                            Bölüm/Oda Sayısı *
                                        </label>
                                        <input
                                            {...register('floorCount', { valueAsNumber: true })}
                                            type="number"
                                            min="0"
                                            className={`input-field ${errors.floorCount ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bina Yaşı
                                        </label>
                                        <input
                                            {...register('buildingAge')}
                                            type="text"
                                            className={`input-field ${errors.buildingAge ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Isıtma Tipi
                                        </label>
                                        <select
                                            {...register('heatingType')}
                                            className="input-field"
                                        >
                                            <option value="">Seçiniz</option>
                                            {Object.values(HeatingType).map((type) => (
                                                <option key={type} value={type}>
                                                    {getHeatingTypeLabel(type)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Eşyalı *</label>
                                        <select
                                            {...register('furnished')}
                                            className={`input-field ${errors.furnished ? 'border-red-500' : ''}`}
                                        >
                                            <option value="true">Evet</option>
                                            <option value="false">Hayır</option>
                                        </select>
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Aidat</label>
                                        <input
                                            {...register('dues', { valueAsNumber: true })}
                                            type="number"
                                            className="input-field"
                                        />
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
                                                                alt="Workplace"
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
                                {workplace.videoUrl && (
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
