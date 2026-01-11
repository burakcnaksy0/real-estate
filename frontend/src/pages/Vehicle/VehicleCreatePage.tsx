import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowLeft, Car, Save } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { createVehicleAsync } from '../../store/slices/vehicleSlice';
import { useCategories } from '../../hooks/useCategories';
import { VehicleCreateRequest, Currency, FuelType, Transmission, OfferType } from '../../types';
import { ImageUpload } from '../../components/ImageUpload/ImageUpload';
import { ImageService } from '../../services/imageService';

// Validation schema
const vehicleSchema = yup.object({
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
  brand: yup
    .string()
    .required('Marka gereklidir')
    .max(50, 'Marka 50 karakterden uzun olamaz'),
  model: yup
    .string()
    .required('Model gereklidir')
    .max(50, 'Model 50 karakterden uzun olamaz'),
  year: yup
    .number()
    .required('Model yılı gereklidir')
    .min(1900, 'Geçerli bir yıl girin')
    .max(new Date().getFullYear() + 1, 'Geçerli bir yıl girin'),
  fuelType: yup
    .mixed<FuelType>()
    .required('Yakıt tipi gereklidir'),
  transmission: yup
    .mixed<Transmission>()
    .required('Vites tipi gereklidir'),
  kilometer: yup
    .number()
    .required('Kilometre gereklidir')
    .min(0, 'Kilometre negatif olamaz'),
  engineVolume: yup
    .string()
    .max(20, 'Motor hacmi 20 karakterden uzun olamaz'),
  offerType: yup
    .mixed<OfferType>()
    .required('İşlem tipi gereklidir'),
});

interface ImageFile {
  file: File;
  preview: string;
  isPrimary: boolean;
}

export const VehicleCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.vehicles);
  const { getActiveCategories } = useCategories();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const activeCategories = getActiveCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleCreateRequest>({
    resolver: yupResolver(vehicleSchema) as any,
    defaultValues: {
      currency: Currency.TRY,
      fuelType: FuelType.GASOLINE,
      transmission: Transmission.MANUAL,
      categorySlug: 'arac',
      offerType: OfferType.FOR_SALE,
    },
  });

  const onSubmit = async (data: VehicleCreateRequest) => {
    try {
      const result = await dispatch(createVehicleAsync(data));
      if (result.meta.requestStatus === 'fulfilled') {
        const listingId = (result.payload as any).id;

        // Upload images if any
        if (images.length > 0) {
          setUploadingImages(true);
          try {
            for (const image of images) {
              await ImageService.uploadImage(
                image.file,
                listingId,
                'VEHICLE',
                image.isPrimary
              );
            }
          } catch (imageError) {
            console.error('Error uploading images:', imageError);
          } finally {
            setUploadingImages(false);
          }
        }

        navigate(`/vehicles/${listingId}`);
      }
    } catch (error) {
      console.error('Error creating vehicle:', error);
    }
  };

  const getFuelTypeLabel = (type: FuelType) => {
    const labels = {
      [FuelType.GASOLINE]: 'Benzin',
      [FuelType.DIESEL]: 'Dizel',
      [FuelType.ELECTRIC]: 'Elektrik',
      [FuelType.LPG]: 'LPG',
      [FuelType.HYBRID]: 'Hibrit'
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
                placeholder="Örn: 2020 Model Toyota Corolla"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>



            {/* Brand */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                Marka *
              </label>
              <input
                {...register('brand')}
                type="text"
                id="brand"
                className={`input-field ${errors.brand ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: Toyota"
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
              )}
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Model *
              </label>
              <input
                {...register('model')}
                type="text"
                id="model"
                className={`input-field ${errors.model ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: Corolla"
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
              )}
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Model Yılı *
              </label>
              <input
                {...register('year', { valueAsNumber: true })}
                type="number"
                id="year"
                min="1900"
                max={new Date().getFullYear() + 1}
                className={`input-field ${errors.year ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 2020"
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
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
              placeholder="Aracınız hakkında detaylı bilgi verin..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Araç Detayları</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fuel Type */}
            <div>
              <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">
                Yakıt Tipi *
              </label>
              <select
                {...register('fuelType')}
                id="fuelType"
                className={`input-field ${errors.fuelType ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                {Object.values(FuelType).map((type) => (
                  <option key={type} value={type}>
                    {getFuelTypeLabel(type)}
                  </option>
                ))}
              </select>
              {errors.fuelType && (
                <p className="mt-1 text-sm text-red-600">{errors.fuelType.message}</p>
              )}
            </div>

            {/* Transmission */}
            <div>
              <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
                Vites Tipi *
              </label>
              <select
                {...register('transmission')}
                id="transmission"
                className={`input-field ${errors.transmission ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                {Object.values(Transmission).map((type) => (
                  <option key={type} value={type}>
                    {getTransmissionLabel(type)}
                  </option>
                ))}
              </select>
              {errors.transmission && (
                <p className="mt-1 text-sm text-red-600">{errors.transmission.message}</p>
              )}
            </div>

            {/* Kilometer */}
            <div>
              <label htmlFor="kilometer" className="block text-sm font-medium text-gray-700 mb-1">
                Kilometre *
              </label>
              <input
                {...register('kilometer', { valueAsNumber: true })}
                type="number"
                id="kilometer"
                min="0"
                className={`input-field ${errors.kilometer ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 50000"
              />
              {errors.kilometer && (
                <p className="mt-1 text-sm text-red-600">{errors.kilometer.message}</p>
              )}
            </div>

            {/* Engine Volume */}
            <div>
              <label htmlFor="engineVolume" className="block text-sm font-medium text-gray-700 mb-1">
                Motor Hacmi
              </label>
              <input
                {...register('engineVolume')}
                type="text"
                id="engineVolume"
                className={`input-field ${errors.engineVolume ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Örn: 1.6"
              />
              {errors.engineVolume && (
                <p className="mt-1 text-sm text-red-600">{errors.engineVolume.message}</p>
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
                placeholder="Örn: 250000"
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