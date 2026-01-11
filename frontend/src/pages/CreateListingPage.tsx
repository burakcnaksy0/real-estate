import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { Home, Car, MapPin, Building, FileText, LayoutGrid, ArrowLeft } from 'lucide-react';

export const CreateListingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { categories, fetchAll: fetchCategories } = useCategories();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
        fetchCategories();
    }, [isAuthenticated, navigate, fetchCategories]);

    const getCategoryIcon = (slug: string) => {
        switch (slug) {
            case 'emlak': return <Home className="w-5 h-5" />;
            case 'arac': return <Car className="w-5 h-5" />;
            case 'arsa': return <MapPin className="w-5 h-5" />;
            case 'isyeri': return <Building className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    const handleCategorySelect = (slug: string) => {
        switch (slug) {
            case 'emlak':
            case 'konut':
            case 'ev':
                navigate('/real-estates/create');
                break;
            case 'arac':
                navigate('/vehicles/create');
                break;
            case 'arsa':
                navigate('/lands/create');
                break;
            case 'isyeri':
                navigate('/workplaces/create');
                break;
            default:
                break;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Geri Dön</span>
                    </button>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">İlan Oluştur</h1>
                        <p className="mt-2 text-gray-600">İlan vermek istediğiniz kategoriyi seçerek başlayın.</p>
                    </div>
                </div>

                {/* Category Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <button
                        onClick={() => handleCategorySelect('emlak')}
                        className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 flex flex-col items-center gap-4"
                    >
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <Home className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Emlak</h3>
                            <p className="text-sm text-gray-500 mt-1">Ev, Daire, Villa</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleCategorySelect('arac')}
                        className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-200 flex flex-col items-center gap-4"
                    >
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                            <Car className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Araç</h3>
                            <p className="text-sm text-gray-500 mt-1">Otomobil, Motor</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleCategorySelect('arsa')}
                        className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-amber-500 hover:shadow-lg transition-all duration-200 flex flex-col items-center gap-4"
                    >
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                            <MapPin className="w-8 h-8 text-amber-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">Arsa</h3>
                            <p className="text-sm text-gray-500 mt-1">Tarla, Bahçe</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleCategorySelect('isyeri')}
                        className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all duration-200 flex flex-col items-center gap-4"
                    >
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <Building className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">İşyeri</h3>
                            <p className="text-sm text-gray-500 mt-1">Ofis, Dükkan</p>
                        </div>
                    </button>
                </div>

                {/* Info Section */}
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200 border-dashed">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                        <LayoutGrid className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Kategori Seçin</h3>
                    <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                        İlan oluşturmak için yukarıdaki kategorilerden birini seçiniz.
                    </p>
                </div>
            </div>
        </div>
    );
};
