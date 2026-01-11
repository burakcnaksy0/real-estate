import React, { useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useWorkplaces } from '../../hooks/useWorkplaces';
import { useCategories } from '../../hooks/useCategories';
import { Workplace, WorkplaceCreateRequest, Currency, WorkplaceType } from '../../types';

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
    workplaceType: yup.mixed<WorkplaceType>().required('İşyeri tipi gereklidir'),
    squareMeter: yup.number().required('Metrekare gereklidir').min(1),
    floorCount: yup.number().required('Kat sayısı gereklidir').min(1),
    furnished: yup.boolean().required('Eşyalı bilgisi gereklidir'),
});

export const EditWorkplaceModal: React.FC<EditWorkplaceModalProps> = ({
    workplace,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { update, isLoading } = useWorkplaces();
    const { getActiveCategories } = useCategories();
    const activeCategories = getActiveCategories();

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
            });
        }
    }, [isOpen, workplace, reset]);

    const onSubmit = async (data: WorkplaceCreateRequest) => {
        try {
            await update(workplace.id, data);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating workplace:', error);
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

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                ></div>

                <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">İşyeri İlanını Düzenle</h3>
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

                            {/* Workplace Details */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-4">İşyeri Detayları</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Metrekare (m²) *</label>
                                        <input
                                            {...register('squareMeter', { valueAsNumber: true })}
                                            type="number"
                                            min="1"
                                            className={`input-field ${errors.squareMeter ? 'border-red-500' : ''}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kat Sayısı *</label>
                                        <input
                                            {...register('floorCount', { valueAsNumber: true })}
                                            type="number"
                                            min="1"
                                            className={`input-field ${errors.floorCount ? 'border-red-500' : ''}`}
                                        />
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
                        </div>
                    </form>

                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={isLoading}
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isLoading}
                            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Kaydediliyor...</span>
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
