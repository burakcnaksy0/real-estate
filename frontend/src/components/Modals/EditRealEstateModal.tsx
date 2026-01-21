import React, { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRealEstate } from '../../hooks/useRealEstate';
import { useCategories } from '../../hooks/useCategories';
import { RealEstate, RealEstateCreateRequest, Currency, RealEstateType, HeatingType, KitchenType, TittleStatus, UsingStatus, ListingFrom, OfferType } from '../../types';
import { VideoUpload, VideoFile } from '../../components/VideoUpload/VideoUpload';
import { VideoService } from '../../services/videoService';

interface EditRealEstateModalProps {
    realEstate: RealEstate;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const realEstateSchema = yup.object({
    title: yup.string().required('Başlık gereklidir').max(150),
    description: yup.string().max(5000),
    price: yup.number().required('Fiyat gereklidir').min(1),
    currency: yup.mixed<Currency>().required('Para birimi gereklidir'),
    categorySlug: yup.string().required('Kategori gereklidir'),
    city: yup.string().required('Şehir gereklidir').max(50),
    district: yup.string().required('İlçe gereklidir').max(50),
    realEstateType: yup.mixed<RealEstateType>().required('Emlak tipi gereklidir'),
    roomCount: yup.string().required('Oda sayısı gereklidir'),
    grossSquareMeter: yup.number().required('Brüt metrekare gereklidir').min(1),
    netSquareMeter: yup.number().required('Net metrekare gereklidir').min(1),
    buildingAge: yup.string().required('Bina yaşı gereklidir'),
    floor: yup.number().required('Kat gereklidir').min(-5),
    heatingType: yup.mixed<HeatingType>().required('Isıtma tipi gereklidir'),
    furnished: yup.boolean().required('Eşyalı bilgisi gereklidir'),
});

export const EditRealEstateModal: React.FC<EditRealEstateModalProps> = ({
    realEstate,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { update, isLoading } = useRealEstate();
    const { getActiveCategories } = useCategories();
    const activeCategories = getActiveCategories();
    const [video, setVideo] = useState<VideoFile | null>(null);
    const [uploadingVideo, setUploadingVideo] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<RealEstateCreateRequest>({
        resolver: yupResolver(realEstateSchema) as any,
    });

    useEffect(() => {
        if (isOpen && realEstate) {
            reset({
                title: realEstate.title,
                description: realEstate.description || '',
                price: realEstate.price,
                currency: realEstate.currency,
                categorySlug: realEstate.categorySlug,
                city: realEstate.city,
                district: realEstate.district,
                realEstateType: realEstate.realEstateType,
                roomCount: realEstate.roomCount,
                grossSquareMeter: realEstate.grossSquareMeter,
                netSquareMeter: realEstate.netSquareMeter,
                buildingAge: realEstate.buildingAge,
                floor: realEstate.floor,
                heatingType: realEstate.heatingType,
                furnished: realEstate.furnished,
                totalFloors: realEstate.totalFloors,
                bathroomCount: realEstate.bathroomCount,
                balcony: realEstate.balcony,
                elevator: realEstate.elevator,
                parking: realEstate.parking,
                inComplex: realEstate.inComplex,
                complexName: realEstate.complexName,
                dues: realEstate.dues,
                deposit: realEstate.deposit,
                usingStatus: realEstate.usingStatus,
                kitchen: realEstate.kitchen,
                tittleStatus: realEstate.tittleStatus,
                fromWho: realEstate.fromWho,
                offerType: realEstate.offerType,
            });
        }
    }, [isOpen, realEstate, reset]);

    const onSubmit = async (data: RealEstateCreateRequest) => {
        try {
            await update(realEstate.id, data);

            // Upload video if selected
            if (video) {
                setUploadingVideo(true);
                try {
                    await VideoService.uploadVideo(video.file, realEstate.id, 'REAL_ESTATE');
                } catch (error) {
                    console.error('Error uploading video:', error);
                } finally {
                    setUploadingVideo(false);
                }
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating real estate:', error);
        }
    };

    if (!isOpen) return null;

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
                        <h3 className="text-lg font-semibold text-gray-900">İlanı Düzenle</h3>
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
                                        {errors.categorySlug && (
                                            <p className="mt-1 text-sm text-red-600">{errors.categorySlug.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Emlak Tipi *
                                        </label>
                                        <select
                                            {...register('realEstateType')}
                                            className={`input-field ${errors.realEstateType ? 'border-red-500' : ''}`}
                                        >
                                            {Object.values(RealEstateType).map((type) => (
                                                <option key={type} value={type}>
                                                    {getRealEstateTypeLabel(type)}
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
                                            {...register('fromWho')}
                                            className={`input-field ${errors.fromWho ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Seçiniz</option>
                                            {Object.values(ListingFrom).map((type) => (
                                                <option key={type} value={type}>
                                                    {type === ListingFrom.OWNER ? 'Sahibinden' : type === ListingFrom.GALLERY ? 'Emlakçıdan' : 'Bankadan'}
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

                            {/* Property Details */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Emlak Detayları</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Oda Sayısı *
                                        </label>
                                        <input
                                            {...register('roomCount')}
                                            type="text"
                                            className={`input-field ${errors.roomCount ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            m² (Brüt) *
                                        </label>
                                        <input
                                            {...register('grossSquareMeter', { valueAsNumber: true })}
                                            type="number"
                                            min="1"
                                            className={`input-field ${errors.grossSquareMeter ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            m² (Net) *
                                        </label>
                                        <input
                                            {...register('netSquareMeter', { valueAsNumber: true })}
                                            type="number"
                                            min="1"
                                            className={`input-field ${errors.netSquareMeter ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bina Yaşı *
                                        </label>
                                        <input
                                            {...register('buildingAge')}
                                            type="text"
                                            className={`input-field ${errors.buildingAge ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kat *</label>
                                        <input
                                            {...register('floor', { valueAsNumber: true })}
                                            type="number"
                                            min="0"
                                            className={`input-field ${errors.floor ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Isıtma Tipi *
                                        </label>
                                        <select
                                            {...register('heatingType')}
                                            className={`input-field ${errors.heatingType ? 'border-red-500' : ''}`}
                                        >
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mutfak</label>
                                        <select
                                            {...register('kitchen')}
                                            className={`input-field ${errors.kitchen ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Seçiniz</option>
                                            {Object.values(KitchenType).map((type) => (
                                                <option key={type} value={type}>
                                                    {type === KitchenType.OPEN_AMERICAN ? 'Amerikan (Açık)' : 'Kapalı'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Banyo Sayısı</label>
                                        <input
                                            {...register('bathroomCount', { valueAsNumber: true })}
                                            type="number"
                                            min="0"
                                            className={`input-field ${errors.bathroomCount ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kat Sayısı</label>
                                        <input
                                            {...register('totalFloors', { valueAsNumber: true })}
                                            type="number"
                                            min="0"
                                            className={`input-field ${errors.totalFloors ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tapu Durumu</label>
                                        <select
                                            {...register('tittleStatus')}
                                            className={`input-field ${errors.tittleStatus ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Seçiniz</option>
                                            {Object.values(TittleStatus).map((type) => (
                                                <option key={type} value={type}>
                                                    {type === TittleStatus.SHARE_DEED ? 'Hisseli Tapu' :
                                                        type === TittleStatus.CONDOMINIUM ? 'Kat Mülkiyeti' :
                                                            type === TittleStatus.NO_DEED ? 'Tapusuz' :
                                                                type === TittleStatus.CONSTRUCTION_SERVITUDE ? 'Kat İrtifakı' :
                                                                    'Tam Tapu'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kullanım Durumu</label>
                                        <select
                                            {...register('usingStatus')}
                                            className={`input-field ${errors.usingStatus ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Seçiniz</option>
                                            {Object.values(UsingStatus).map((type) => (
                                                <option key={type} value={type}>
                                                    {type === UsingStatus.EMPTY ? 'Boş' : type === UsingStatus.TENANT ? 'Kiracılı' : 'Mülk Sahibi'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-span-2 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                        <label className="flex items-center space-x-2">
                                            <input {...register('balcony')} type="checkbox" className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5" />
                                            <span className="text-gray-700">Balkon</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input {...register('elevator')} type="checkbox" className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5" />
                                            <span className="text-gray-700">Asansör</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input {...register('parking')} type="checkbox" className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5" />
                                            <span className="text-gray-700">Otopark</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input {...register('inComplex')} type="checkbox" className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5" />
                                            <span className="text-gray-700">Site İçerisinde</span>
                                        </label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Depozito</label>
                                        <input
                                            {...register('deposit', { valueAsNumber: true })}
                                            type="number"
                                            className={`input-field ${errors.deposit ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Aidat</label>
                                        <input
                                            {...register('dues', { valueAsNumber: true })}
                                            type="number"
                                            className={`input-field ${errors.dues ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Video */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Video</h4>
                                {realEstate.videoUrl && (
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
                            disabled={isLoading || uploadingVideo}
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isLoading || uploadingVideo}
                            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>{uploadingVideo ? 'Video Yükleniyor...' : 'Kaydediliyor...'}</span>
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
