import React, { useState } from 'react';
import { Filter, MapPin, DollarSign, Home, Calendar, X } from 'lucide-react';
import { AdvancedSearchCriteria } from '../../services/searchService';
import { ListingStatus } from '../../types';

interface AdvancedSearchFormProps {
    onSearch: (criteria: AdvancedSearchCriteria) => void;
    onClose?: () => void;
}

const AdvancedSearchForm: React.FC<AdvancedSearchFormProps> = ({ onSearch, onClose }) => {
    const [criteria, setCriteria] = useState<AdvancedSearchCriteria>({
        sortBy: 'date',
        sortOrder: 'desc'
    });

    const [activeTab, setActiveTab] = useState<'location' | 'price' | 'features'>('location');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(criteria);
    };

    const handleReset = () => {
        setCriteria({ sortBy: 'date', sortOrder: 'desc' });
    };

    const updateCriteria = (field: keyof AdvancedSearchCriteria, value: any) => {
        setCriteria(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Filter size={24} />
                    Gelişmiş Arama
                </h2>
                {onClose && (
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                <button
                    onClick={() => setActiveTab('location')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'location'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    <MapPin className="inline mr-2" size={18} />
                    Konum
                </button>
                <button
                    onClick={() => setActiveTab('price')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'price'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    <DollarSign className="inline mr-2" size={18} />
                    Fiyat & Durum
                </button>
                <button
                    onClick={() => setActiveTab('features')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'features'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    <Home className="inline mr-2" size={18} />
                    Özellikler
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Location Tab */}
                {activeTab === 'location' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Şehir
                                </label>
                                <input
                                    type="text"
                                    value={criteria.city || ''}
                                    onChange={(e) => updateCriteria('city', e.target.value)}
                                    placeholder="Örn: İstanbul"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    İlçe
                                </label>
                                <input
                                    type="text"
                                    value={criteria.district || ''}
                                    onChange={(e) => updateCriteria('district', e.target.value)}
                                    placeholder="Örn: Kadıköy"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Yakınımdaki İlanlar
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={criteria.latitude || ''}
                                    onChange={(e) => updateCriteria('latitude', parseFloat(e.target.value))}
                                    placeholder="Enlem"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={criteria.longitude || ''}
                                    onChange={(e) => updateCriteria('longitude', parseFloat(e.target.value))}
                                    placeholder="Boylam"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    value={criteria.radiusKm || ''}
                                    onChange={(e) => updateCriteria('radiusKm', parseFloat(e.target.value))}
                                    placeholder="Yarıçap (km)"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Price Tab */}
                {activeTab === 'price' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Min Fiyat (₺)
                                </label>
                                <input
                                    type="number"
                                    value={criteria.minPrice || ''}
                                    onChange={(e) => updateCriteria('minPrice', parseFloat(e.target.value))}
                                    placeholder="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Fiyat (₺)
                                </label>
                                <input
                                    type="number"
                                    value={criteria.maxPrice || ''}
                                    onChange={(e) => updateCriteria('maxPrice', parseFloat(e.target.value))}
                                    placeholder="Sınırsız"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                İlan Durumu
                            </label>
                            <select
                                value={criteria.status || ''}
                                onChange={(e) => updateCriteria('status', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Tümü</option>
                                <option value={ListingStatus.ACTIVE}>Aktif</option>
                                <option value={ListingStatus.PASSIVE}>Pasif</option>
                                <option value={ListingStatus.SOLD}>Satıldı</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sıralama
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={criteria.sortBy || 'date'}
                                    onChange={(e) => updateCriteria('sortBy', e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="date">Tarih</option>
                                    <option value="price">Fiyat</option>
                                    <option value="relevance">İlgililik</option>
                                    {criteria.latitude && criteria.longitude && (
                                        <option value="distance">Uzaklık</option>
                                    )}
                                </select>
                                <select
                                    value={criteria.sortOrder || 'desc'}
                                    onChange={(e) => updateCriteria('sortOrder', e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="asc">Artan</option>
                                    <option value="desc">Azalan</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Min Oda Sayısı
                                </label>
                                <input
                                    type="number"
                                    value={criteria.minRooms || ''}
                                    onChange={(e) => updateCriteria('minRooms', parseInt(e.target.value))}
                                    placeholder="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Oda Sayısı
                                </label>
                                <input
                                    type="number"
                                    value={criteria.maxRooms || ''}
                                    onChange={(e) => updateCriteria('maxRooms', parseInt(e.target.value))}
                                    placeholder="Sınırsız"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Min Alan (m²)
                                </label>
                                <input
                                    type="number"
                                    value={criteria.minArea || ''}
                                    onChange={(e) => updateCriteria('minArea', parseInt(e.target.value))}
                                    placeholder="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Alan (m²)
                                </label>
                                <input
                                    type="number"
                                    value={criteria.maxArea || ''}
                                    onChange={(e) => updateCriteria('maxArea', parseInt(e.target.value))}
                                    placeholder="Sınırsız"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Marka (Araç)
                                </label>
                                <input
                                    type="text"
                                    value={criteria.brand || ''}
                                    onChange={(e) => updateCriteria('brand', e.target.value)}
                                    placeholder="Örn: Toyota"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Model (Araç)
                                </label>
                                <input
                                    type="text"
                                    value={criteria.model || ''}
                                    onChange={(e) => updateCriteria('model', e.target.value)}
                                    placeholder="Örn: Corolla"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6 pt-6 border-t">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Temizle
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Ara
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdvancedSearchForm;
