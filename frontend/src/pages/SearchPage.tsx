import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchAutocomplete from '../components/search/SearchAutocomplete';
import AdvancedSearchForm from '../components/search/AdvancedSearchForm';
import SavedSearchesList from '../components/search/SavedSearchesList';
import { Filter, Bookmark } from 'lucide-react';
import { AdvancedSearchCriteria } from '../services/searchService';

const SearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [showSavedSearches, setShowSavedSearches] = useState(false);

    const handleQuickSearch = (query: string) => {
        // Navigate to listings page with query parameter
        navigate(`/listings?query=${encodeURIComponent(query)}`);
    };

    const handleAdvancedSearch = (criteria: AdvancedSearchCriteria) => {
        // Build query string from criteria
        const params = new URLSearchParams();
        Object.entries(criteria).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        navigate(`/listings?${params.toString()}`);
        setShowAdvancedSearch(false);
    };

    const handleExecuteSavedSearch = (criteria: Record<string, any>) => {
        const params = new URLSearchParams();
        Object.entries(criteria).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        navigate(`/listings?${params.toString()}`);
        setShowSavedSearches(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        İlanları Keşfedin
                    </h1>
                    <p className="text-lg text-gray-600">
                        Gelişmiş arama özellikleri ile aradığınız ilana kolayca ulaşın
                    </p>
                </div>

                {/* Quick Search */}
                <div className="mb-8">
                    <SearchAutocomplete onSearch={handleQuickSearch} />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center mb-12">
                    <button
                        onClick={() => {
                            setShowAdvancedSearch(!showAdvancedSearch);
                            setShowSavedSearches(false);
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${showAdvancedSearch
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 border border-gray-300 hover:shadow-md'
                            }`}
                    >
                        <Filter size={20} />
                        Gelişmiş Arama
                    </button>
                    <button
                        onClick={() => {
                            setShowSavedSearches(!showSavedSearches);
                            setShowAdvancedSearch(false);
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${showSavedSearches
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 border border-gray-300 hover:shadow-md'
                            }`}
                    >
                        <Bookmark size={20} />
                        Kaydedilmiş Aramalar
                    </button>
                </div>

                {/* Advanced Search Form */}
                {showAdvancedSearch && (
                    <div className="mb-8 animate-fadeIn">
                        <AdvancedSearchForm
                            onSearch={handleAdvancedSearch}
                            onClose={() => setShowAdvancedSearch(false)}
                        />
                    </div>
                )}

                {/* Saved Searches List */}
                {showSavedSearches && (
                    <div className="mb-8 animate-fadeIn bg-white rounded-lg shadow-lg p-6">
                        <SavedSearchesList onExecuteSearch={handleExecuteSavedSearch} />
                    </div>
                )}

                {/* Features */}
                {!showAdvancedSearch && !showSavedSearches && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold mb-2">Full-Text Search</h3>
                            <p className="text-gray-600">
                                Türkçe dil desteği ile gelişmiş metin araması yapın
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-4">📍</div>
                            <h3 className="text-xl font-semibold mb-2">Konum Bazlı Arama</h3>
                            <p className="text-gray-600">
                                Yakınınızdaki ilanları mesafe bazlı bulun
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-4">💾</div>
                            <h3 className="text-xl font-semibold mb-2">Aramalarınızı Kaydedin</h3>
                            <p className="text-gray-600">
                                Sık kullandığınız aramaları kaydedin ve hızlıca erişin
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default SearchPage;
