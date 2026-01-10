import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';

// Category types
enum CategoryType {
    REAL_ESTATE = 'emlak',
    VEHICLE = 'arac',
    LAND = 'arsa',
    WORKPLACE = 'isyeri'
}

export const CreateListingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { categories, fetchAll: fetchCategories } = useCategories();
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
        fetchCategories();
    }, [isAuthenticated, navigate, fetchCategories]);

    const onSubmit = async (data: any) => {
        try {
            setIsLoading(true);

            // categorySlug'ı ekle
            const formData = {
                ...data,
                categorySlug: selectedCategory
            };

            console.log('Form data:', formData);
            console.log('Selected category:', selectedCategory);

            // Kategoriye göre doğru API'yi çağır
            let response;
            switch (selectedCategory) {
                case CategoryType.VEHICLE:
                    const { VehicleService } = await import('../services/vehicleService');
                    response = await VehicleService.create(formData);
                    break;
                case CategoryType.REAL_ESTATE:
                    const { RealEstateService } = await import('../services/realEstateService');
                    response = await RealEstateService.create(formData);
                    break;
                case CategoryType.LAND:
                    const { LandService } = await import('../services/landService');
                    response = await LandService.create(formData);
                    break;
                case CategoryType.WORKPLACE:
                    const { WorkplaceService } = await import('../services/workplaceService');
                    response = await WorkplaceService.create(formData);
                    break;
                default:
                    throw new Error('Geçersiz kategori seçimi');
            }

            console.log('API Response:', response);
            alert('İlan başarıyla oluşturuldu!');
            navigate('/');
        } catch (error: any) {
            console.error('Error creating listing:', error);
            const errorMessage = error.response?.data?.message || error.message || 'İlan oluşturulurken bir hata oluştu';
            alert('Hata: ' + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryIcon = (categorySlug: string) => {
        const icons: Record<string, string> = {
            'emlak': '🏠',
            'arac': '🚗',
            'arsa': '🌾',
            'isyeri': '🏢'
        };
        return icons[categorySlug] || '📋';
    };

    const renderCategorySpecificFields = () => {
        if (!selectedCategory) return null;

        const category = categories.find(c => c.slug === selectedCategory);
        if (!category) return null;

        switch (selectedCategory) {
            case CategoryType.REAL_ESTATE:
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Emlak Tipi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Emlak Tipi *
                                </label>
                                <select
                                    {...register('realEstateType', { required: 'Emlak tipi gereklidir' })}
                                    className="input-field"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="APARTMENT">Daire</option>
                                    <option value="HOUSE">Ev</option>
                                    <option value="VILLA">Villa</option>
                                    <option value="RESIDENCE">Rezidans</option>
                                </select>
                                {errors.realEstateType && (
                                    <p className="mt-1 text-sm text-red-600">{errors.realEstateType.message as string}</p>
                                )}
                            </div>

                            {/* Oda Sayısı */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Oda Sayısı *
                                </label>
                                <input
                                    {...register('roomCount', { required: 'Oda sayısı gereklidir', min: 0 })}
                                    type="number"
                                    className="input-field"
                                    placeholder="Örn: 3"
                                />
                                {errors.roomCount && (
                                    <p className="mt-1 text-sm text-red-600">{errors.roomCount.message as string}</p>
                                )}
                            </div>

                            {/* Metrekare */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Metrekare (m²) *
                                </label>
                                <input
                                    {...register('squareMeter', { required: 'Metrekare gereklidir', min: 1 })}
                                    type="number"
                                    className="input-field"
                                    placeholder="Örn: 120"
                                />
                                {errors.squareMeter && (
                                    <p className="mt-1 text-sm text-red-600">{errors.squareMeter.message as string}</p>
                                )}
                            </div>

                            {/* Bina Yaşı */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bina Yaşı *
                                </label>
                                <input
                                    {...register('buildingAge', { required: 'Bina yaşı gereklidir', min: 0 })}
                                    type="number"
                                    className="input-field"
                                    placeholder="Örn: 5"
                                />
                                {errors.buildingAge && (
                                    <p className="mt-1 text-sm text-red-600">{errors.buildingAge.message as string}</p>
                                )}
                            </div>

                            {/* Kat */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kat *
                                </label>
                                <input
                                    {...register('floor', { required: 'Kat gereklidir', min: 0 })}
                                    type="number"
                                    className="input-field"
                                    placeholder="Örn: 3"
                                />
                                {errors.floor && (
                                    <p className="mt-1 text-sm text-red-600">{errors.floor.message as string}</p>
                                )}
                            </div>

                            {/* Isıtma Tipi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Isıtma Tipi *
                                </label>
                                <select
                                    {...register('heatingType', { required: 'Isıtma tipi gereklidir' })}
                                    className="input-field"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="NATURAL_GAS">Doğalgaz</option>
                                    <option value="CENTRAL_HEATING">Merkezi Isıtma</option>
                                    <option value="STOVE_HEATING">Soba</option>
                                    <option value="AIR_CONDITIONING">Klima</option>
                                </select>
                                {errors.heatingType && (
                                    <p className="mt-1 text-sm text-red-600">{errors.heatingType.message as string}</p>
                                )}
                            </div>

                            {/* Eşyalı */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Eşyalı *
                                </label>
                                <select
                                    {...register('furnished', { required: 'Eşyalı bilgisi gereklidir' })}
                                    className="input-field"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="true">Evet</option>
                                    <option value="false">Hayır</option>
                                </select>
                                {errors.furnished && (
                                    <p className="mt-1 text-sm text-red-600">{errors.furnished.message as string}</p>
                                )}
                            </div>
                        </div>
                    </>
                );

            case CategoryType.VEHICLE:
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Marka */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Marka *
                                </label>
                                <input
                                    {...register('brand', { required: 'Marka gereklidir' })}
                                    type="text"
                                    className="input-field"
                                    placeholder="Örn: Toyota"
                                />
                                {errors.brand && (
                                    <p className="mt-1 text-sm text-red-600">{errors.brand.message as string}</p>
                                )}
                            </div>

                            {/* Model */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Model *
                                </label>
                                <input
                                    {...register('model', { required: 'Model gereklidir' })}
                                    type="text"
                                    className="input-field"
                                    placeholder="Örn: Corolla"
                                />
                                {errors.model && (
                                    <p className="mt-1 text-sm text-red-600">{errors.model.message as string}</p>
                                )}
                            </div>

                            {/* Yıl */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Yıl *
                                </label>
                                <input
                                    {...register('year', { required: 'Yıl gereklidir', min: 1900, max: new Date().getFullYear() + 1 })}
                                    type="number"
                                    className="input-field"
                                    placeholder="Örn: 2020"
                                />
                                {errors.year && (
                                    <p className="mt-1 text-sm text-red-600">{errors.year.message as string}</p>
                                )}
                            </div>

                            {/* Kilometre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kilometre *
                                </label>
                                <input
                                    {...register('kilometer', { required: 'Kilometre gereklidir', min: 0 })}
                                    type="number"
                                    className="input-field"
                                    placeholder="Örn: 45000"
                                />
                                {errors.kilometer && (
                                    <p className="mt-1 text-sm text-red-600">{errors.kilometer.message as string}</p>
                                )}
                            </div>

                            {/* Yakıt Tipi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Yakıt Tipi *
                                </label>
                                <select
                                    {...register('fuelType', { required: 'Yakıt tipi gereklidir' })}
                                    className="input-field"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="GASOLINE">Benzin</option>
                                    <option value="DIESEL">Dizel</option>
                                    <option value="LPG">LPG</option>
                                    <option value="ELECTRIC">Elektrik</option>
                                    <option value="HYBRID">Hibrit</option>
                                </select>
                                {errors.fuelType && (
                                    <p className="mt-1 text-sm text-red-600">{errors.fuelType.message as string}</p>
                                )}
                            </div>

                            {/* Vites Tipi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vites Tipi *
                                </label>
                                <select
                                    {...register('transmission', { required: 'Vites tipi gereklidir' })}
                                    className="input-field"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="MANUAL">Manuel</option>
                                    <option value="AUTOMATIC">Otomatik</option>
                                    <option value="SEMI_AUTOMATIC">Yarı Otomatik</option>
                                </select>
                                {errors.transmission && (
                                    <p className="mt-1 text-sm text-red-600">{errors.transmission.message as string}</p>
                                )}
                            </div>
                        </div>
                    </>
                );

            case CategoryType.LAND:
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Arsa Tipi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Arsa Tipi *
                                </label>
                                <select
                                    {...register('landType', { required: 'Arsa tipi gereklidir' })}
                                    className="input-field"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="RESIDENTIAL">Konut İmarlı</option>
                                    <option value="COMMERCIAL">Ticari İmarlı</option>
                                    <option value="AGRICULTURAL">Tarla</option>
                                    <option value="GARDEN">Bahçe</option>
                                </select>
                                {errors.landType && (
                                    <p className="mt-1 text-sm text-red-600">{errors.landType.message as string}</p>
                                )}
                            </div>

                            {/* Metrekare */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Metrekare (m²) *
                                </label>
                                <input
                                    {...register('squareMeter', { required: 'Metrekare gereklidir', min: 1 })}
                                    type="number"
                                    className="input-field"
                                    placeholder="Örn: 500"
                                />
                                {errors.squareMeter && (
                                    <p className="mt-1 text-sm text-red-600">{errors.squareMeter.message as string}</p>
                                )}
                            </div>

                            {/* İmar Durumu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    İmar Durumu
                                </label>
                                <input
                                    {...register('zoningStatus')}
                                    type="text"
                                    className="input-field"
                                    placeholder="Örn: İmarlı"
                                />
                            </div>

                            {/* Parsel No */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Parsel No *
                                </label>
                                <input
                                    {...register('parcelNumber', { required: 'Parsel no gereklidir', min: 1 })}
                                    type="number"
                                    className="input-field"
                                    placeholder="Örn: 123"
                                />
                                {errors.parcelNumber && (
                                    <p className="mt-1 text-sm text-red-600">{errors.parcelNumber.message as string}</p>
                                )}
                            </div>

                            {/* Ada No */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ada No *
                                </label>
                                <input
                                    {...register('islandNumber', { required: 'Ada no gereklidir', min: 1 })}
                                    type="number"
                                    className="input-field"
                                    placeholder="Örn: 456"
                                />
                                {errors.islandNumber && (
                                    <p className="mt-1 text-sm text-red-600">{errors.islandNumber.message as string}</p>
                                )}
                            </div>
                        </div>
                    </>
                );

            case CategoryType.WORKPLACE:
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* İşyeri Tipi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    İşyeri Tipi *
                                </label>
                                <select
                                    {...register('workplaceType', { required: 'İşyeri tipi gereklidir' })}
                                    className="input-field"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="OFFICE">Ofis</option>
                                    <option value="SHOP">Dükkan</option>
                                    <option value="WAREHOUSE">Depo</option>
                                    <option value="FACTORY">Fabrika</option>
                                </select>
                                {errors.workplaceType && (
                                    <p className="mt-1 text-sm text-red-600">{errors.workplaceType.message as string}</p>
                                )}
                            </div>

                            {/* Metrekare */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Metrekare (m²) *
                                </label>
                                <input
                                    {...register('squareMeter', { required: 'Metrekare gereklidir', min: 1 })}
                                    type="number"
                                    className="input-field"
                                    placeholder="Örn: 150"
                                />
                                {errors.squareMeter && (
                                    <p className="mt-1 text-sm text-red-600">{errors.squareMeter.message as string}</p>
                                )}
                            </div>

                            {/* Kat Sayısı */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kat Sayısı *
                                </label>
                                <input
                                    {...register('floorCount', { required: 'Kat sayısı gereklidir', min: 1 })}
                                    type="number"
                                    className="input-field"
                                    placeholder="Örn: 2"
                                />
                                {errors.floorCount && (
                                    <p className="mt-1 text-sm text-red-600">{errors.floorCount.message as string}</p>
                                )}
                            </div>

                            {/* Eşyalı */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Eşyalı *
                                </label>
                                <select
                                    {...register('furnished', { required: 'Eşyalı bilgisi gereklidir' })}
                                    className="input-field"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="true">Evet</option>
                                    <option value="false">Hayır</option>
                                </select>
                                {errors.furnished && (
                                    <p className="mt-1 text-sm text-red-600">{errors.furnished.message as string}</p>
                                )}
                            </div>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Geri Dön</span>
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">İlan Ver</h1>
                        <p className="text-gray-600 mt-1">
                            İlanınızın detaylarını girin
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Category Selection */}
                <div className="card p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Kategori Seçimi</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.filter(c => c.active).map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedCategory(category.slug)}
                                className={`p-6 rounded-lg border-2 transition-all duration-200 ${selectedCategory === category.slug
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="text-4xl mb-2">{getCategoryIcon(category.slug)}</div>
                                <div className="font-medium text-gray-900">{category.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Basic Information - Only show if category is selected */}
                {selectedCategory && (
                    <>
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Temel Bilgiler</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        İlan Başlığı *
                                    </label>
                                    <input
                                        {...register('title', { required: 'Başlık gereklidir', maxLength: 150 })}
                                        type="text"
                                        className="input-field"
                                        placeholder="Örn: Merkezi konumda 3+1 daire"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>
                                    )}
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Şehir *
                                    </label>
                                    <input
                                        {...register('city', { required: 'Şehir gereklidir' })}
                                        type="text"
                                        className="input-field"
                                        placeholder="Örn: İstanbul"
                                    />
                                    {errors.city && (
                                        <p className="mt-1 text-sm text-red-600">{errors.city.message as string}</p>
                                    )}
                                </div>

                                {/* District */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        İlçe *
                                    </label>
                                    <input
                                        {...register('district', { required: 'İlçe gereklidir' })}
                                        type="text"
                                        className="input-field"
                                        placeholder="Örn: Kadıköy"
                                    />
                                    {errors.district && (
                                        <p className="mt-1 text-sm text-red-600">{errors.district.message as string}</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Açıklama
                                </label>
                                <textarea
                                    {...register('description', { maxLength: 5000 })}
                                    rows={4}
                                    className="input-field"
                                    placeholder="İlanınız hakkında detaylı bilgi verin..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description.message as string}</p>
                                )}
                            </div>
                        </div>

                        {/* Category Specific Fields */}
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Detaylı Bilgiler</h2>
                            {renderCategorySpecificFields()}
                        </div>

                        {/* Price Information */}
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Fiyat Bilgileri</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fiyat *
                                    </label>
                                    <input
                                        {...register('price', { required: 'Fiyat gereklidir', min: 1 })}
                                        type="number"
                                        className="input-field"
                                        placeholder="Örn: 450000"
                                    />
                                    {errors.price && (
                                        <p className="mt-1 text-sm text-red-600">{errors.price.message as string}</p>
                                    )}
                                </div>

                                {/* Currency */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Para Birimi *
                                    </label>
                                    <select
                                        {...register('currency', { required: 'Para birimi gereklidir' })}
                                        className="input-field"
                                    >
                                        <option value="">Seçiniz</option>
                                        <option value="TRY">TRY</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                    {errors.currency && (
                                        <p className="mt-1 text-sm text-red-600">{errors.currency.message as string}</p>
                                    )}
                                </div>
                            </div>
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
                                disabled={isLoading}
                                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Kaydediliyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        <span>İlanı Yayınla</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
};
