import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Home, Save } from 'lucide-react';
import { useRealEstate } from '../../hooks/useRealEstate';
import { useCategories } from '../../hooks/useCategories';
import { RealEstateCreateRequest, Currency, RealEstateType, HeatingType, OfferType, UsingStatus, KitchenType, TittleStatus, ListingFrom } from '../../types';
import { ImageUpload } from '../../components/ImageUpload/ImageUpload';
import { VideoUpload, VideoFile } from '../../components/VideoUpload/VideoUpload';
import { ImageService } from '../../services/imageService';
import { VideoService } from '../../services/videoService';
import { LocationPicker } from '../../components/LocationPicker/LocationPicker';

// Validation schema
const realEstateSchema = yup.object({
  title: yup
    .string()
    .required('Başlık gereklidir')
    .max(150, 'Başlık 150 karakterden uzun olamaz'),
  description: yup
    .string()
    .max(5000, 'Açıklama 5000 karakterden uzun olamaz'),
  price: yup
    .number()
    .required('Fiyat gereklidir')
    .min(1, 'Fiyat 0\'dan büyük olmalıdır'),
  currency: yup
    .mixed<Currency>()
    .required('Para birimi gereklidir'),
  categorySlug: yup
    .string()
    .required('Kategori gereklidir'),
  city: yup
    .string()
    .required('Şehir gereklidir')
    .max(50, 'Şehir 50 karakterden uzun olamaz'),
  district: yup
    .string()
    .required('İlçe gereklidir')
    .max(50, 'İlçe 50 karakterden uzun olamaz'),
  realEstateType: yup
    .mixed<RealEstateType>()
    .required('Emlak tipi gereklidir'),
  roomCount: yup
    .string()
    .required('Oda sayısı gereklidir'),
  grossSquareMeter: yup
    .number()
    .required('Brüt metrekare gereklidir')
    .min(1, 'Metrekare 0\'dan büyük olmalıdır'),
  netSquareMeter: yup
    .number()
    .required('Net metrekare gereklidir')
    .min(1, 'Metrekare 0\'dan büyük olmalıdır')
    .max(yup.ref('grossSquareMeter'), 'Net metrekare brüt metrekareden büyük olamaz'),
  buildingAge: yup
    .string()
    .required('Bina yaşı gereklidir'),
  floor: yup
    .number()
    .required('Kat gereklidir')
    .min(-5, 'Kat -5\'ten küçük olamaz'),
  heatingType: yup
    .mixed<HeatingType>()
    .required('Isıtma tipi gereklidir'),
  furnished: yup
    .boolean()
    .required('Eşyalı bilgisi gereklidir'),
  offerType: yup
    .mixed<OfferType>()
    .required('İşlem tipi gereklidir'),
  totalFloors: yup.number().nullable(),
  bathroomCount: yup.number().nullable(),
  balcony: yup.boolean().nullable(),
  usingStatus: yup.mixed<UsingStatus>().nullable(),
  kitchen: yup.mixed<KitchenType>().nullable(),
  elevator: yup.boolean().nullable(),
  parking: yup.boolean().nullable(),
  inComplex: yup.boolean().nullable(),
  complexName: yup.string().nullable(),
  dues: yup.number().nullable(),
  deposit: yup.number().nullable(),
  tittleStatus: yup.mixed<TittleStatus>().nullable(),
  fromWho: yup.mixed<ListingFrom>().nullable(),
});

interface ImageFile {
  file: File;
  preview: string;
  isPrimary: boolean;
}

interface RealEstateCreatePageProps {
  defaultCategorySlug?: string;
}

export const RealEstateCreatePage: React.FC<RealEstateCreatePageProps> = ({ defaultCategorySlug = 'emlak' }) => {
  const navigate = useNavigate();
  const { create, isLoading } = useRealEstate();
  const { getActiveCategories } = useCategories();
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
    watch,
  } = useForm<RealEstateCreateRequest>({
    resolver: yupResolver(realEstateSchema) as any,
    defaultValues: {
      currency: Currency.TRY,
      realEstateType: RealEstateType.APARTMENT,
      heatingType: HeatingType.NATURAL_GAS,
      furnished: false,
      offerType: OfferType.FOR_SALE,
      categorySlug: defaultCategorySlug,
      balcony: false,
      elevator: false,
      parking: false,
      inComplex: false,
    },
  });

  const onSubmit = async (data: RealEstateCreateRequest) => {
    try {
      const realEstateData = {
        ...data,
        latitude: location.latitude,
        longitude: location.longitude,
      };
      const result = await create(realEstateData);
      if (result.type.endsWith('/fulfilled')) {
        const listingId = (result.payload as any).id;

        // Upload images if any
        if (images.length > 0) {
          setUploadingImages(true);
          try {
            for (const image of images) {
              await ImageService.uploadImage(
                image.file,
                listingId,
                'REAL_ESTATE',
                image.isPrimary
              );
            }
          } catch (imageError) {
            console.error('Error uploading images:', imageError);
            // Continue to navigate even if image upload fails
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
              'REAL_ESTATE'
            );
          } catch (videoError: any) {
            console.error('Error uploading video:', videoError);
            toast.error(videoError?.response?.data?.message || 'Video yüklenirken bir hata oluştu');
          } finally {
            setUploadingVideo(false);
          }
        }

        navigate(`/real-estates/${listingId}`);
      }
    } catch (error) {
      console.error('Error creating real estate:', error);
    }
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">


      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Temel Bilgiler</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                İlan Başlığı *
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                className={`input-field ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: Merkezi konumda 3+1 daire"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>



            {/* Real Estate Type */}
            <div>
              <label htmlFor="realEstateType" className="block text-sm font-medium text-gray-700 mb-1">
                Emlak Tipi *
              </label>
              <select
                {...register('realEstateType')}
                id="realEstateType"
                className={`input-field ${errors.realEstateType ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                {Object.values(RealEstateType).map((type) => (
                  <option key={type} value={type}>
                    {getRealEstateTypeLabel(type)}
                  </option>
                ))}
              </select>
              {errors.realEstateType && (
                <p className="mt-1 text-sm text-red-600">{errors.realEstateType.message}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Şehir *
              </label>
              <input
                {...register('city')}
                type="text"
                id="city"
                className={`input-field ${errors.city ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: İstanbul"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            {/* District */}
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                İlçe *
              </label>
              <input
                {...register('district')}
                type="text"
                id="district"
                className={`input-field ${errors.district ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: Kadıköy"
              />
              {errors.district && (
                <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              className={`input-field ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="İlanınız hakkında detaylı bilgi verin..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Property Details */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Emlak Detayları</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Room Count */}
            <div>
              <label htmlFor="roomCount" className="block text-sm font-medium text-gray-700 mb-1">
                Oda Sayısı *
              </label>
              <select
                {...register('roomCount')}
                id="roomCount"
                className={`input-field ${errors.roomCount ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value="">Seçiniz</option>
                <option value="1+0">1+0 (Stüdyo)</option>
                <option value="1+1">1+1</option>
                <option value="2+1">2+1</option>
                <option value="3+1">3+1</option>
                <option value="3+2">3+2</option>
                <option value="4+1">4+1</option>
                <option value="4+2">4+2</option>
                <option value="5+1">5+1</option>
                <option value="5+2">5+2</option>
                <option value="6+1">6+1</option>
                <option value="6+2">6+2</option>
                <option value="7+1">7+1</option>
                <option value="7+2">7+2</option>
              </select>
              {errors.roomCount && (
                <p className="mt-1 text-sm text-red-600">{errors.roomCount.message}</p>
              )}
            </div>

            {/* Gross Square Meter */}
            <div>
              <label htmlFor="grossSquareMeter" className="block text-sm font-medium text-gray-700 mb-1">
                m² (Brüt) *
              </label>
              <input
                {...register('grossSquareMeter', { valueAsNumber: true })}
                type="number"
                id="grossSquareMeter"
                min="1"
                className={`input-field ${errors.grossSquareMeter ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 120"
              />
              {errors.grossSquareMeter && (
                <p className="mt-1 text-sm text-red-600">{errors.grossSquareMeter.message}</p>
              )}
            </div>

            {/* Net Square Meter */}
            <div>
              <label htmlFor="netSquareMeter" className="block text-sm font-medium text-gray-700 mb-1">
                m² (Net) *
              </label>
              <input
                {...register('netSquareMeter', { valueAsNumber: true })}
                type="number"
                id="netSquareMeter"
                min="1"
                className={`input-field ${errors.netSquareMeter ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 100"
              />
              {errors.netSquareMeter && (
                <p className="mt-1 text-sm text-red-600">{errors.netSquareMeter.message}</p>
              )}
            </div>

            {/* Building Age */}
            <div>
              <label htmlFor="buildingAge" className="block text-sm font-medium text-gray-700 mb-1">
                Bina Yaşı *
              </label>
              <select
                {...register('buildingAge')}
                id="buildingAge"
                className={`input-field ${errors.buildingAge ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value="">Seçiniz</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5-10">5-10 arası</option>
                <option value="11-15">11-15 arası</option>
                <option value="16-20">16-20 arası</option>
                <option value="21-25">21-25 arası</option>
                <option value="26-30">26-30 arası</option>
                <option value="31+">31 ve üzeri</option>
              </select>
              {errors.buildingAge && (
                <p className="mt-1 text-sm text-red-600">{errors.buildingAge.message}</p>
              )}
            </div>

            {/* Floor */}
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Bulunduğu Kat *
              </label>
              <input
                {...register('floor', { valueAsNumber: true })}
                type="number"
                id="floor"
                className={`input-field ${errors.floor ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 3"
              />
              {errors.floor && (
                <p className="mt-1 text-sm text-red-600">{errors.floor.message}</p>
              )}
            </div>

            {/* Total Floors */}
            <div>
              <label htmlFor="totalFloors" className="block text-sm font-medium text-gray-700 mb-1">
                Kat Sayısı
              </label>
              <input
                {...register('totalFloors', { valueAsNumber: true })}
                type="number"
                id="totalFloors"
                min="1"
                className={`input-field ${errors.totalFloors ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 10"
              />
              {errors.totalFloors && (
                <p className="mt-1 text-sm text-red-600">{errors.totalFloors.message}</p>
              )}
            </div>

            {/* Heating Type */}
            <div>
              <label htmlFor="heatingType" className="block text-sm font-medium text-gray-700 mb-1">
                Isıtma Tipi *
              </label>
              <select
                {...register('heatingType')}
                id="heatingType"
                className={`input-field ${errors.heatingType ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                {Object.values(HeatingType).map((type) => (
                  <option key={type} value={type}>
                    {getHeatingTypeLabel(type)}
                  </option>
                ))}
              </select>
              {errors.heatingType && (
                <p className="mt-1 text-sm text-red-600">{errors.heatingType.message}</p>
              )}
            </div>

            {/* Bathroom Count */}
            <div>
              <label htmlFor="bathroomCount" className="block text-sm font-medium text-gray-700 mb-1">
                Banyo Sayısı
              </label>
              <input
                {...register('bathroomCount', { valueAsNumber: true })}
                type="number"
                id="bathroomCount"
                min="0"
                className={`input-field ${errors.bathroomCount ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 1"
              />
              {errors.bathroomCount && (
                <p className="mt-1 text-sm text-red-600">{errors.bathroomCount.message}</p>
              )}
            </div>

            {/* Kitchen Type */}
            <div>
              <label htmlFor="kitchen" className="block text-sm font-medium text-gray-700 mb-1">
                Mutfak
              </label>
              <select
                {...register('kitchen')}
                id="kitchen"
                className={`input-field ${errors.kitchen ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value="">Seçiniz</option>
                {Object.values(KitchenType).map((type) => (
                  <option key={type} value={type}>
                    {type === KitchenType.OPEN_AMERICAN ? 'Amerikan (Açık)' : 'Kapalı'}
                  </option>
                ))}
              </select>
            </div>

            {/* Tittle Status */}
            <div>
              <label htmlFor="tittleStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Tapu Durumu
              </label>
              <select
                {...register('tittleStatus')}
                id="tittleStatus"
                className={`input-field ${errors.tittleStatus ? 'border-red-500 focus:ring-red-500' : ''}`}
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

            {/* Using Status */}
            <div>
              <label htmlFor="usingStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Kullanım Durumu
              </label>
              <select
                {...register('usingStatus')}
                id="usingStatus"
                className={`input-field ${errors.usingStatus ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value="">Seçiniz</option>
                {Object.values(UsingStatus).map((type) => (
                  <option key={type} value={type}>
                    {type === UsingStatus.EMPTY ? 'Boş' : type === UsingStatus.TENANT ? 'Kiracılı' : 'Mülk Sahibi'}
                  </option>
                ))}
              </select>
            </div>

            {/* From Who */}
            <div>
              <label htmlFor="fromWho" className="block text-sm font-medium text-gray-700 mb-1">
                Kimden
              </label>
              <select
                {...register('fromWho')}
                id="fromWho"
                className={`input-field ${errors.fromWho ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value="">Seçiniz</option>
                {Object.values(ListingFrom).map((type) => (
                  <option key={type} value={type}>
                    {type === ListingFrom.OWNER ? 'Sahibinden' : type === ListingFrom.GALLERY ? 'Emlakçıdan' : 'Bankadan'}
                  </option>
                ))}
              </select>
            </div>

            {/* Complex Name (Conditional) */}
            {watch('inComplex') && (
              <div className="md:col-span-2">
                <label htmlFor="complexName" className="block text-sm font-medium text-gray-700 mb-1">
                  Site Adı
                </label>
                <input
                  {...register('complexName')}
                  type="text"
                  id="complexName"
                  className={`input-field ${errors.complexName ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Site adı"
                />
              </div>
            )}

            {/* Booleans as Checkboxes */}
            <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {/* Furnished */}
              <label className="flex items-center space-x-2">
                <input
                  {...register('furnished')}
                  type="checkbox"
                  className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5"
                />
                <span className="text-gray-700">Eşyalı</span>
              </label>

              {/* Balcony */}
              <label className="flex items-center space-x-2">
                <input
                  {...register('balcony')}
                  type="checkbox"
                  className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5"
                />
                <span className="text-gray-700">Balkon</span>
              </label>

              {/* Elevator */}
              <label className="flex items-center space-x-2">
                <input
                  {...register('elevator')}
                  type="checkbox"
                  className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5"
                />
                <span className="text-gray-700">Asansör</span>
              </label>

              {/* Parking */}
              <label className="flex items-center space-x-2">
                <input
                  {...register('parking')}
                  type="checkbox"
                  className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5"
                />
                <span className="text-gray-700">Otopark</span>
              </label>

              {/* In Complex */}
              <label className="flex items-center space-x-2">
                <input
                  {...register('inComplex')}
                  type="checkbox"
                  className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5"
                />
                <span className="text-gray-700">Site İçerisinde</span>
              </label>
            </div>
          </div>
        </div>

        {/* Price Information */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Fiyat Bilgileri</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">İşlem Tipi *</label>
              <div className="flex space-x-4 mt-2">
                <label className="flex items-center cursor-pointer">
                  <input {...register('offerType')} type="radio" value={OfferType.FOR_SALE} className="w-4 h-4 text-primary-600" />
                  <span className="ml-2">Satılık</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input {...register('offerType')} type="radio" value={OfferType.FOR_RENT} className="w-4 h-4 text-primary-600" />
                  <span className="ml-2">Kiralık</span>
                </label>
              </div>
            </div>
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Fiyat *
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                id="price"
                min="1"
                className={`input-field ${errors.price ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 450000"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Para Birimi *
              </label>
              <select
                {...register('currency')}
                id="currency"
                className={`input-field ${errors.currency ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                {Object.values(Currency).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
              )}
            </div>

            {/* Deposit */}
            <div>
              <label htmlFor="deposit" className="block text-sm font-medium text-gray-700 mb-1">
                Depozito
              </label>
              <input
                {...register('deposit', { valueAsNumber: true })}
                type="number"
                id="deposit"
                className={`input-field ${errors.deposit ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 10000"
              />
              {errors.deposit && (
                <p className="mt-1 text-sm text-red-600">{errors.deposit.message}</p>
              )}
            </div>

            {/* Dues */}
            <div>
              <label htmlFor="dues" className="block text-sm font-medium text-gray-700 mb-1">
                Aidat
              </label>
              <input
                {...register('dues', { valueAsNumber: true })}
                type="number"
                id="dues"
                className={`input-field ${errors.dues ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 500"
              />
              {errors.dues && (
                <p className="mt-1 text-sm text-red-600">{errors.dues.message}</p>
              )}
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
          <p className="text-sm text-gray-500 mb-4">
            İlanınız için bir tanıtım videosu yükleyebilirsiniz. (Opsiyonel)
          </p>
          <VideoUpload
            video={video}
            onVideoChange={setVideo}
            maxSizeMB={50}
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
            disabled={isLoading || uploadingImages || uploadingVideo}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || uploadingImages || uploadingVideo ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>
                  {uploadingImages ? 'Görseller yükleniyor...' :
                    uploadingVideo ? 'Video yükleniyor...' :
                      'Kaydediliyor...'}
                </span>
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