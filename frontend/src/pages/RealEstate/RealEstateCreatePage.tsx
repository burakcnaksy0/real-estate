import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Home, Save } from 'lucide-react';
import { useRealEstate } from '../../hooks/useRealEstate';
import { useCategories } from '../../hooks/useCategories';
import { RealEstateCreateRequest, Currency, RealEstateType, HeatingType, OfferType } from '../../types';
import { ImageUpload } from '../../components/ImageUpload/ImageUpload';
import { ImageService } from '../../services/imageService';

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
    .number()
    .required('Oda sayısı gereklidir')
    .min(0, 'Oda sayısı negatif olamaz'),
  squareMeter: yup
    .number()
    .required('Metrekare gereklidir')
    .min(1, 'Metrekare 0\'dan büyük olmalıdır'),
  buildingAge: yup
    .number()
    .required('Bina yaşı gereklidir')
    .min(0, 'Bina yaşı negatif olamaz'),
  floor: yup
    .number()
    .required('Kat gereklidir')
    .min(0, 'Kat negatif olamaz'),
  heatingType: yup
    .mixed<HeatingType>()
    .required('Isıtma tipi gereklidir'),
  furnished: yup
    .boolean()
    .required('Eşyalı bilgisi gereklidir'),
  offerType: yup
    .mixed<OfferType>()
    .required('İşlem tipi gereklidir'),
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
  const [uploadingImages, setUploadingImages] = useState(false);

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
    },
  });

  const onSubmit = async (data: RealEstateCreateRequest) => {
    try {
      const result = await create(data);
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
              <input
                {...register('roomCount', { valueAsNumber: true })}
                type="number"
                id="roomCount"
                min="0"
                className={`input-field ${errors.roomCount ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 3"
              />
              {errors.roomCount && (
                <p className="mt-1 text-sm text-red-600">{errors.roomCount.message}</p>
              )}
            </div>

            {/* Square Meter */}
            <div>
              <label htmlFor="squareMeter" className="block text-sm font-medium text-gray-700 mb-1">
                Metrekare (m²) *
              </label>
              <input
                {...register('squareMeter', { valueAsNumber: true })}
                type="number"
                id="squareMeter"
                min="1"
                className={`input-field ${errors.squareMeter ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 120"
              />
              {errors.squareMeter && (
                <p className="mt-1 text-sm text-red-600">{errors.squareMeter.message}</p>
              )}
            </div>

            {/* Building Age */}
            <div>
              <label htmlFor="buildingAge" className="block text-sm font-medium text-gray-700 mb-1">
                Bina Yaşı *
              </label>
              <input
                {...register('buildingAge', { valueAsNumber: true })}
                type="number"
                id="buildingAge"
                min="0"
                className={`input-field ${errors.buildingAge ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 5"
              />
              {errors.buildingAge && (
                <p className="mt-1 text-sm text-red-600">{errors.buildingAge.message}</p>
              )}
            </div>

            {/* Floor */}
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Kat *
              </label>
              <input
                {...register('floor', { valueAsNumber: true })}
                type="number"
                id="floor"
                min="0"
                className={`input-field ${errors.floor ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 3"
              />
              {errors.floor && (
                <p className="mt-1 text-sm text-red-600">{errors.floor.message}</p>
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

            {/* Furnished */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eşyalı *
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center">
                  <input
                    {...register('furnished')}
                    type="radio"
                    value="true"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Evet</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('furnished')}
                    type="radio"
                    value="false"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hayır</span>
                </label>
              </div>
              {errors.furnished && (
                <p className="mt-1 text-sm text-red-600">{errors.furnished.message}</p>
              )}
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
          </div>
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
                <span>{uploadingImages ? 'Görseller yükleniyor...' : 'Kaydediliyor...'}</span>
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