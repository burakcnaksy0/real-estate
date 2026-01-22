import React, { useEffect, useState } from 'react';
import { X, Save, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useVehicles } from '../../hooks/useVehicles';
import { useCategories } from '../../hooks/useCategories';
import { Vehicle, VehicleCreateRequest, Currency, FuelType, Transmission } from '../../types';
import { VideoUpload, VideoFile } from '../../components/VideoUpload/VideoUpload';
import { VideoService } from '../../services/videoService';
import { ImageService, ImageResponse } from '../../services/imageService';

interface EditVehicleModalProps {
    vehicle: Vehicle;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const vehicleSchema = yup.object({
    title: yup.string().required('Başlık gereklidir').max(150),
    description: yup.string().max(5000),
    price: yup.number().required('Fiyat gereklidir').min(1),
    currency: yup.mixed<Currency>().required('Para birimi gereklidir'),
    categorySlug: yup.string().required('Kategori gereklidir'),
    city: yup.string().required('Şehir gereklidir').max(50),
    district: yup.string().required('İlçe gereklidir').max(50),
    brand: yup.string().required('Marka gereklidir').max(50),
    model: yup.string().required('Model gereklidir').max(50),
    year: yup.number().required('Yıl gereklidir').min(1900).max(new Date().getFullYear() + 1),
    fuelType: yup.mixed<FuelType>().required('Yakıt tipi gereklidir'),
    transmission: yup.mixed<Transmission>().required('Vites tipi gereklidir'),
    kilometer: yup.number().required('Kilometre gereklidir').min(0),
});

export const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
    vehicle,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { update, isLoading } = useVehicles();
    const { getActiveCategories } = useCategories();
    const activeCategories = getActiveCategories();
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
    } = useForm<VehicleCreateRequest>({
        resolver: yupResolver(vehicleSchema) as any,
    });

    useEffect(() => {
        if (isOpen && vehicle) {
            reset({
                title: vehicle.title,
                description: vehicle.description || '',
                price: vehicle.price,
                currency: vehicle.currency,
                categorySlug: vehicle.categorySlug,
                city: vehicle.city,
                district: vehicle.district,
                brand: vehicle.brand,
                model: vehicle.model,
                series: vehicle.series || '',
                year: vehicle.year,
                fuelType: vehicle.fuelType,
                transmission: vehicle.transmission,
                kilometer: vehicle.kilometer,
                engineVolume: vehicle.engineVolume || '',
                vehicleStatus: vehicle.vehicleStatus || '',
                bodyType: vehicle.bodyType || '',
                enginePower: vehicle.enginePower || '',
                tractionType: vehicle.tractionType || '',
                color: vehicle.color || '',
                plateNationality: vehicle.plateNationality || '',
                fromWho: vehicle.fromWho || '',
                warranty: vehicle.warranty || false,
                heavyDamage: vehicle.heavyDamage || false,
                exchange: vehicle.exchange || false,
            });
            fetchImages();
        }
    }, [isOpen, vehicle, reset]);

    const fetchImages = async () => {
        try {
            const imgs = await ImageService.getListingImages(vehicle.id, 'VEHICLE');
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

    const onSubmit = async (data: VehicleCreateRequest) => {
        try {
            await update(vehicle.id, data);

            // Upload images if selected
            if (selectedImages.length > 0) {
                setUploadingImages(true);
                try {
                    await ImageService.uploadImages(selectedImages, vehicle.id, 'VEHICLE');
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
                    await VideoService.uploadVideo(video.file, vehicle.id, 'VEHICLE');
                } catch (error) {
                    console.error('Error uploading video:', error);
                } finally {
                    setUploadingVideo(false);
                }
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating vehicle:', error);
        }
    };

    if (!isOpen) return null;

    const getFuelTypeLabel = (type: FuelType) => {
        const labels = {
            [FuelType.GASOLINE]: 'Benzin',
            [FuelType.DIESEL]: 'Dizel',
            [FuelType.ELECTRIC]: 'Elektrik',
            [FuelType.HYBRID]: 'Hibrit',
            [FuelType.LPG]: 'LPG'
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

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                ></div>

                <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Araç İlanını Düzenle</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Temel Bilgiler</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">İlan Başlığı *</label>
                                        <input
                                            {...register('title')}
                                            type="text"
                                            className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                                        />
                                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Marka *</label>
                                        <input
                                            {...register('brand')}
                                            type="text"
                                            className={`input-field ${errors.brand ? 'border-red-500' : ''}`}
                                        />
                                        {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                                        <input
                                            {...register('model')}
                                            type="text"
                                            className={`input-field ${errors.model ? 'border-red-500' : ''}`}
                                        />
                                        {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Seri</label>
                                        <input
                                            {...register('series')}
                                            type="text"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Şehir *</label>
                                        <input
                                            {...register('city')}
                                            type="text"
                                            className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                                        />
                                        {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">İlçe *</label>
                                        <input
                                            {...register('district')}
                                            type="text"
                                            className={`input-field ${errors.district ? 'border-red-500' : ''}`}
                                        />
                                        {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>}
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

                            {/* Vehicle Details */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Araç Detayları</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Yıl *</label>
                                        <input
                                            {...register('year', { valueAsNumber: true })}
                                            type="number"
                                            min="1900"
                                            max={new Date().getFullYear() + 1}
                                            className={`input-field ${errors.year ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kilometre *</label>
                                        <input
                                            {...register('kilometer', { valueAsNumber: true })}
                                            type="number"
                                            min="0"
                                            className={`input-field ${errors.kilometer ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Yakıt Tipi *</label>
                                        <select
                                            {...register('fuelType')}
                                            className={`input-field ${errors.fuelType ? 'border-red-500' : ''}`}
                                        >
                                            {Object.values(FuelType).map((type) => (
                                                <option key={type} value={type}>
                                                    {getFuelTypeLabel(type)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vites *</label>
                                        <select
                                            {...register('transmission')}
                                            className={`input-field ${errors.transmission ? 'border-red-500' : ''}`}
                                        >
                                            {Object.values(Transmission).map((type) => (
                                                <option key={type} value={type}>
                                                    {getTransmissionLabel(type)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Motor Hacmi</label>
                                        <input
                                            {...register('engineVolume')}
                                            type="text"
                                            placeholder="1.6 16V"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Motor Gücü</label>
                                        <input
                                            {...register('enginePower')}
                                            type="text"
                                            placeholder="110 HP"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Araç Durumu</label>
                                        <select {...register('vehicleStatus')} className="input-field">
                                            <option value="">Seçiniz</option>
                                            <option value="ZERO">Sıfır</option>
                                            <option value="SECOND_HAND">İkinci El</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kasa Tipi</label>
                                        <input
                                            {...register('bodyType')}
                                            type="text"
                                            placeholder="Sedan, Hatchback..."
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Çekiş</label>
                                        <input
                                            {...register('tractionType')}
                                            type="text"
                                            placeholder="Önden, 4x4..."
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
                                        <input
                                            {...register('color')}
                                            type="text"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Plaka/Uyruk</label>
                                        <input
                                            {...register('plateNationality')}
                                            type="text"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kimden</label>
                                        <select {...register('fromWho')} className="input-field">
                                            <option value="">Seçiniz</option>
                                            <option value="OWNER">Sahibinden</option>
                                            <option value="DEALER">Galeriden</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            {...register('warranty')}
                                            type="checkbox"
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">Garanti</span>
                                    </label>

                                    <label className="flex items-center space-x-2">
                                        <input
                                            {...register('heavyDamage')}
                                            type="checkbox"
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">Ağır Hasar Kayıtlı</span>
                                    </label>

                                    <label className="flex items-center space-x-2">
                                        <input
                                            {...register('exchange')}
                                            type="checkbox"
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">Takas</span>
                                    </label>
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
                                                                alt="Vehicle"
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
                                {vehicle.videoUrl && (
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
            </div>
        </div>
    );
};
