import React, { useState, useEffect } from 'react';
import { X, Search, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
            loadContacts();
            setSearchQuery('');
            setSelectedContact(null);
            setCustomMessage('');
            setSuccess(false);
            setError(null);
        }
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">İlanı Paylaş</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Listing Info */}
                    <div className="bg-primary-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Paylaşılacak İlan:</p>
                        <p className="font-medium text-gray-900">{listingTitle}</p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <p className="text-sm text-green-800">İlan başarıyla paylaşıldı!</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {!success && (
                        <>
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Kişi ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            {/* Contacts List */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Kişi Seç:</p>
                                {loadingContacts ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                                    </div>
                                ) : filteredContacts.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-8">
                                        {searchQuery ? 'Kişi bulunamadı' : 'Henüz mesajlaştığınız kişi yok'}
                                    </p>
                                ) : (
                                    <div className="max-h-48 overflow-y-auto space-y-1">
                                        {filteredContacts.map((contact) => (
                                            <button
                                                key={contact.id}
                                                onClick={() => setSelectedContact(contact)}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedContact?.id === contact.id
                                                        ? 'bg-primary-100 border-2 border-primary-500'
                                                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                                    }`}
                                            >
                                                <p className="font-medium text-gray-900">{contact.username}</p>
                                                {contact.email && (
                                                    <p className="text-xs text-gray-500">{contact.email}</p>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Custom Message */}
                            {selectedContact && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Mesaj (Opsiyonel):
                                    </label>
                                    <textarea
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        placeholder="İlanla birlikte bir mesaj ekleyin..."
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!success && (
                    <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                        <button
                            onClick={onClose}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={!selectedContact || loading}
                            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Gönderiliyor...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
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
