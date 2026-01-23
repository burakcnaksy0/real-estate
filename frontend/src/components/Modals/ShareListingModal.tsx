import React, { useState, useEffect } from 'react';
import { X, Search, Send, Loader2, CheckCircle, AlertCircle, Home, Car, Map, Briefcase, ChevronRight } from 'lucide-react';
import { ShareService, ShareableContact } from '../../services/shareService';

interface ShareListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    listingId: number;
    listingType: string;
    listingTitle: string;
}

export const ShareListingModal: React.FC<ShareListingModalProps> = ({
    isOpen,
    onClose,
    listingId,
    listingType,
    listingTitle,
}) => {
    const [contacts, setContacts] = useState<ShareableContact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<ShareableContact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedContact, setSelectedContact] = useState<ShareableContact | null>(null);
    const [customMessage, setCustomMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            loadContacts();
            setSearchQuery('');
            setSelectedContact(null);
            setCustomMessage('');
            setSuccess(false);
            setError(null);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = contacts.filter(contact =>
                contact.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredContacts(filtered);
        } else {
            setFilteredContacts(contacts);
        }
    }, [searchQuery, contacts]);

    const loadContacts = async () => {
        setLoadingContacts(true);
        try {
            const data = await ShareService.getShareableContacts();
            setContacts(data);
            setFilteredContacts(data);
        } catch (err) {
            console.error('Error loading contacts:', err);
            setError('Kişiler yüklenemedi');
        } finally {
            setLoadingContacts(false);
        }
    };

    const handleShare = async () => {
        if (!selectedContact) return;

        setLoading(true);
        setError(null);

        try {
            await ShareService.shareListing({
                recipientId: selectedContact.id,
                listingId,
                listingType,
                message: customMessage.trim() || undefined,
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error('Error sharing listing:', err);
            setError(err.response?.data?.message || 'İlan paylaşılamadı');
        } finally {
            setLoading(false);
        }
    };

    const getListingIcon = () => {
        switch (listingType) {
            case 'VEHICLE': return <Car className="h-6 w-6 text-blue-600" />;
            case 'REAL_ESTATE': return <Home className="h-6 w-6 text-orange-600" />;
            case 'LAND': return <Map className="h-6 w-6 text-green-600" />;
            case 'WORKPLACE': return <Briefcase className="h-6 w-6 text-purple-600" />;
            default: return <Home className="h-6 w-6 text-gray-600" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">İlanı Paylaş</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Listing Preview Card */}
                    <div className="relative group overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
                                {getListingIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Paylaşılacak İlan</p>
                                <p className="font-bold text-gray-900 line-clamp-2 leading-tight">{listingTitle}</p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Success Message */}
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Paylaşıldı!</h3>
                            <p className="text-gray-500">İlan başarıyla gönderildi.</p>
                        </div>
                    ) : (
                        <>
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
                                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                    <p className="text-sm font-medium text-red-800">{error}</p>
                                </div>
                            )}

                            {/* Search & Contacts */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Kişi ara..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Kişiler</p>

                                    <div className="min-h-[200px] max-h-[240px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                        {loadingContacts ? (
                                            <div className="flex items-center justify-center py-12">
                                                <Loader2 className="h-8 w-8 animate-spin text-blue-100" />
                                            </div>
                                        ) : filteredContacts.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="inline-block p-4 bg-gray-50 rounded-full mb-3">
                                                    <Search className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 font-medium">Kişi bulunamadı</p>
                                            </div>
                                        ) : (
                                            filteredContacts.map((contact) => (
                                                <button
                                                    key={contact.id}
                                                    onClick={() => setSelectedContact(contact)}
                                                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 relative overflow-hidden group ${selectedContact?.id === contact.id
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]'
                                                        : 'bg-white hover:bg-gray-50 border border-gray-100'
                                                        }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedContact?.id === contact.id
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600'
                                                        }`}>
                                                        {contact.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-bold truncate ${selectedContact?.id === contact.id ? 'text-white' : 'text-gray-900'}`}>
                                                            {contact.username}
                                                        </p>
                                                        {contact.email && (
                                                            <p className={`text-xs truncate ${selectedContact?.id === contact.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                {contact.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {selectedContact?.id === contact.id && (
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            <CheckCircle className="w-5 h-5 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Message Input */}
                            <div className={`transition-all duration-300 ${selectedContact ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2 pointer-events-none'}`}>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block px-1">
                                    Mesaj Ekle <span className="text-gray-400 font-normal normal-case">(İsteğe bağlı)</span>
                                </label>
                                <textarea
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="Bir şeyler yazın..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none outline-none"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!success && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-4 focus:ring-gray-100"
                            disabled={loading}
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={!selectedContact || loading}
                            className="flex-[2] px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transform active:scale-95 duration-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Gönderiliyor...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5" />
                                    <span>Paylaş</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
