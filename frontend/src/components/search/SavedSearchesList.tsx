import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, Play, Bell, BellOff } from 'lucide-react';
import searchService, { SavedSearch } from '../../services/searchService';
import { toast } from 'react-toastify';

interface SavedSearchesListProps {
    onExecuteSearch: (criteria: Record<string, any>) => void;
}

const SavedSearchesList: React.FC<SavedSearchesListProps> = ({ onExecuteSearch }) => {
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSavedSearches();
    }, []);

    const loadSavedSearches = async () => {
        try {
            setLoading(true);
            const searches = await searchService.getSavedSearches();
            setSavedSearches(searches);
        } catch (error) {
            console.error('Error loading saved searches:', error);
            toast.error('Kaydedilmiş aramalar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = (search: SavedSearch) => {
        onExecuteSearch(search.searchCriteria);
        toast.success(`"${search.name}" araması çalıştırıldı`);
    };

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`"${name}" aramasını silmek istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            await searchService.deleteSavedSearch(id);
            setSavedSearches(prev => prev.filter(s => s.id !== id));
            toast.success('Arama silindi');
        } catch (error) {
            console.error('Error deleting saved search:', error);
            toast.error('Arama silinemedi');
        }
    };

    const handleToggleNotification = async (search: SavedSearch) => {
        try {
            const updated = await searchService.updateSavedSearch(search.id, {
                name: search.name,
                searchCriteria: search.searchCriteria,
                notificationEnabled: !search.notificationEnabled
            });
            setSavedSearches(prev =>
                prev.map(s => s.id === search.id ? updated : s)
            );
            toast.success(
                updated.notificationEnabled
                    ? 'Bildirimler açıldı'
                    : 'Bildirimler kapatıldı'
            );
        } catch (error) {
            console.error('Error updating notification:', error);
            toast.error('Bildirim ayarı güncellenemedi');
        }
    };

    const formatCriteria = (criteria: Record<string, any>) => {
        const parts: string[] = [];

        if (criteria.city) parts.push(`📍 ${criteria.city}`);
        if (criteria.district) parts.push(`${criteria.district}`);
        if (criteria.minPrice || criteria.maxPrice) {
            const priceRange = [
                criteria.minPrice ? `${criteria.minPrice}₺` : '',
                criteria.maxPrice ? `${criteria.maxPrice}₺` : ''
            ].filter(Boolean).join(' - ');
            parts.push(`💰 ${priceRange}`);
        }
        if (criteria.minRooms || criteria.maxRooms) {
            const roomRange = [
                criteria.minRooms || '0',
                criteria.maxRooms || '∞'
            ].join(' - ');
            parts.push(`🛏️ ${roomRange} oda`);
        }

        return parts.length > 0 ? parts.join(' • ') : 'Filtre yok';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (savedSearches.length === 0) {
        return (
            <div className="text-center py-12">
                <Bookmark className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Kaydedilmiş arama yok
                </h3>
                <p className="text-gray-600">
                    Arama yaptıktan sonra "Aramayı Kaydet" butonuna tıklayarak aramalarınızı kaydedebilirsiniz.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Bookmark size={24} />
                Kaydedilmiş Aramalar
            </h2>

            {savedSearches.map((search) => (
                <div
                    key={search.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                {search.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                {formatCriteria(search.searchCriteria)}
                            </p>
                            <p className="text-xs text-gray-400">
                                Kaydedilme: {new Date(search.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                        </div>

                        <div className="flex gap-2 ml-4">
                            <button
                                onClick={() => handleToggleNotification(search)}
                                className={`p-2 rounded-lg transition-colors ${search.notificationEnabled
                                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                title={search.notificationEnabled ? 'Bildirimleri kapat' : 'Bildirimleri aç'}
                            >
                                {search.notificationEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                            </button>
                            <button
                                onClick={() => handleExecute(search)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Aramayı çalıştır"
                            >
                                <Play size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(search.id, search.name)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Sil"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SavedSearchesList;
