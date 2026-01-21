import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import searchService, { SearchSuggestion } from '../../services/searchService';

interface SearchAutocompleteProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
    onSearch,
    placeholder = 'Şehir, ilçe veya ilan ara...'
}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout>();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions with debounce
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (query.length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        debounceTimer.current = setTimeout(async () => {
            try {
                const results = await searchService.getSuggestions(query);
                setSuggestions(results);
                setIsOpen(results.length > 0);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
            }
        }, 300);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSelectSuggestion(suggestions[selectedIndex]);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
        setQuery(suggestion.text);
        setIsOpen(false);
        setSelectedIndex(-1);
        onSearch(suggestion.text);
    };

    const handleSearch = () => {
        setIsOpen(false);
        onSearch(query);
    };

    const getSuggestionTypeLabel = (type: string) => {
        switch (type) {
            case 'city': return '📍 Şehir';
            case 'district': return '📍 İlçe';
            case 'category': return '🏷️ Kategori';
            case 'listing': return '📄 İlan';
            default: return '';
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                {query && (
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Ara
                    </button>
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={`${suggestion.type}-${suggestion.text}`}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className={`px-4 py-3 cursor-pointer transition-colors ${index === selectedIndex
                                    ? 'bg-blue-50'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        {getSuggestionTypeLabel(suggestion.type)}
                                    </span>
                                    <span className="font-medium">{suggestion.text}</span>
                                </div>
                                <span className="text-sm text-gray-400">
                                    {suggestion.count} ilan
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchAutocomplete;
