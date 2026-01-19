import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageService } from '../../services/messageService';
import { ConversationResponse, MessageDetailResponse } from '../../types';
import { MessageCircle, Send, ArrowLeft, User, Search, MoreVertical, Check, CheckCheck, Smile, Ban, Trash2, Bell, BellOff, Flag } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { formatLastSeen } from '../../utils/dateUtils';
import { websocketService } from '../../services/websocketService';

export const MessagesPage: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId?: string }>();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<ConversationResponse[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<number | null>(
        userId ? parseInt(userId) : null
    );
    const [messages, setMessages] = useState<MessageDetailResponse[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLInputElement>(null);
    const optionsMenuRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation);
            messageInputRef.current?.focus();
        }
    }, [selectedConversation]);

    useEffect(() => {
        if (user?.id) {
            const topic = `/topic/messages/${user.id}`;
            const subscription = websocketService.subscribe(
                topic,
                (message: MessageDetailResponse) => {
                    handleIncomingMessage(message);
                }
            );

            return () => {
                if (subscription) subscription.unsubscribe();
            };
        }
    }, [user?.id, selectedConversation]);

    const handleIncomingMessage = (message: MessageDetailResponse) => {
        const isOwnMessage = message.senderId === user?.id;
        const otherUserId = isOwnMessage ? message.receiverId : message.senderId;

        if (selectedConversation === otherUserId) {
            setMessages(prev => [...prev, message]);

            if (!isOwnMessage) {
                MessageService.markAsRead(message.id);
            }
        }

        setConversations(prev => {
            const existingIndex = prev.findIndex(c => c.otherUserId === otherUserId);

            if (existingIndex === -1) {
                loadConversations();
                return prev;
            }

            const updatedConvs = [...prev];
            const conv = { ...updatedConvs[existingIndex] };

            conv.lastMessage = message;

            if (!isOwnMessage && selectedConversation !== otherUserId) {
                conv.unreadCount += 1;
            }

            updatedConvs.splice(existingIndex, 1);
            return [conv, ...updatedConvs];
        });
    };

    const loadConversations = async () => {
        try {
            const data = await MessageService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Error loading conversations:', error);
            toast.error('Konuşmalar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (otherUserId: number) => {
        try {
            const data = await MessageService.getConversationWithUser(otherUserId);
            setMessages(data);

            const unreadMessages = data.filter(m => !m.isRead && m.receiverId === (user?.id || 0));
            if (unreadMessages.length > 0) {
                for (const msg of unreadMessages) {
                    await MessageService.markAsRead(msg.id);
                }
                window.dispatchEvent(new Event('messagesRead'));
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            toast.error('Mesajlar yüklenemedi');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        setSending(true);
        try {
            await MessageService.sendMessage({
                receiverId: selectedConversation,
                content: newMessage.trim(),
            });
            setNewMessage('');
            await loadMessages(selectedConversation);
            await loadConversations();
            messageInputRef.current?.focus();
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Mesaj gönderilemedi');
        } finally {
            setSending(false);
        }
    };

    // Close options menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
                setShowOptionsMenu(false);
            }
        };

        if (showOptionsMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptionsMenu]);

    const handleBlockUser = () => {
        if (!selectedConv) return;

        // TODO: Implement actual block functionality with backend
        toast.success(`${selectedConv.otherUserUsername} engellendi`);
        setShowOptionsMenu(false);
        setSelectedConversation(null);
        // In real implementation, you would call an API to block the user
    };

    const handleDeleteConversation = async () => {
        if (!selectedConversation) return;

        if (window.confirm('Bu sohbeti silmek istediğinizden emin misiniz? Tüm mesajlar kalıcı olarak silinecektir.')) {
            try {
                // Call backend to delete conversation
                await MessageService.deleteConversation(selectedConversation);

                // Clear UI state
                setConversations(prev => prev.filter(c => c.otherUserId !== selectedConversation));
                setMessages([]);
                setSelectedConversation(null);
                setShowOptionsMenu(false);

                toast.success('Sohbet ve tüm mesajlar silindi');
            } catch (error) {
                console.error('Error deleting conversation:', error);
                toast.error('Sohbet silinirken bir hata oluştu');
            }
        }
    };

    const handleMuteNotifications = () => {
        if (!selectedConv) return;

        // TODO: Implement actual mute functionality with backend
        toast.success(`${selectedConv.otherUserUsername} için bildirimler kapatıldı`);
        setShowOptionsMenu(false);
        // In real implementation, you would call an API to mute notifications
    };

    const handleReportUser = () => {
        if (!selectedConv) return;

        // TODO: Implement actual report functionality with backend
        toast.success(`${selectedConv.otherUserUsername} bildirildi`);
        setShowOptionsMenu(false);
        // In real implementation, you would show a report dialog and call an API
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Şimdi';
        if (diffMins < 60) return `${diffMins}dk`;
        if (diffHours < 24) return `${diffHours}s`;
        if (diffDays < 7) return `${diffDays}g`;
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    const selectedConv = conversations.find(c => c.otherUserId === selectedConversation);

    const filteredConversations = conversations.filter(conv =>
        conv.otherUserUsername.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600"></div>
                    <MessageCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Geri Dön</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-2xl">
                            <MessageCircle className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-indigo-600">Mesajlarım</h1>
                            <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                <span className="inline-block h-2 w-2 bg-green-500 rounded-full"></span>
                                {conversations.length} aktif konuşma
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex" style={{ height: 'calc(100vh - 220px)', minHeight: '600px' }}>
                    {/* Conversations List */}
                    <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col bg-white ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                        {/* Search */}
                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Konuşmalarda ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Conversations */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <MessageCircle className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 font-medium mb-1">Henüz mesajınız yok</p>
                                    <p className="text-gray-400 text-sm">Yeni bir konuşma başlatın</p>
                                </div>
                            ) : (
                                <div>
                                    {filteredConversations.map((conv) => (
                                        <button
                                            key={conv.otherUserId}
                                            onClick={() => setSelectedConversation(conv.otherUserId)}
                                            className={`w-full p-4 text-left transition-all hover:bg-gray-50 border-l-4 ${selectedConversation === conv.otherUserId
                                                ? 'bg-indigo-50 border-indigo-600'
                                                : 'border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="relative flex-shrink-0">
                                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${selectedConversation === conv.otherUserId
                                                        ? 'bg-indigo-600'
                                                        : 'bg-gray-200'
                                                        }`}>
                                                        <User className={`h-6 w-6 ${selectedConversation === conv.otherUserId ? 'text-white' : 'text-gray-600'
                                                            }`} />
                                                    </div>
                                                    {conv.otherUserLastSeen && formatLastSeen(conv.otherUserLastSeen) === 'Az önce aktif' && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <p className="font-semibold text-gray-900 truncate">{conv.otherUserUsername}</p>
                                                        {conv.lastMessage && (
                                                            <span className="text-xs text-gray-400 ml-2">{formatTime(conv.lastMessage.createdAt)}</span>
                                                        )}
                                                    </div>
                                                    {conv.lastMessage && (
                                                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                                                            }`}>
                                                            {conv.lastMessage.content}
                                                        </p>
                                                    )}
                                                    {conv.listingTitle && (
                                                        <div className="flex items-center gap-1 text-xs text-indigo-600 mt-1">
                                                            <span>📍</span>
                                                            <span className="truncate">{conv.listingTitle}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Messages Thread */}
                    <div className={`flex-1 flex flex-col bg-white ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="border-b border-gray-100 p-4 flex-shrink-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setSelectedConversation(null)}
                                                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                                            </button>
                                            <div className="relative">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                                {selectedConv?.otherUserLastSeen && formatLastSeen(selectedConv.otherUserLastSeen) === 'Az önce aktif' && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{selectedConv?.otherUserUsername}</h3>
                                                <p className={`text-xs ${selectedConv?.otherUserLastSeen && formatLastSeen(selectedConv.otherUserLastSeen) === 'Az önce aktif'
                                                    ? 'text-green-600'
                                                    : 'text-gray-500'
                                                    }`}>
                                                    {selectedConv?.otherUserLastSeen
                                                        ? (formatLastSeen(selectedConv.otherUserLastSeen) === 'Az önce aktif' ? '● Çevrimiçi' : formatLastSeen(selectedConv.otherUserLastSeen))
                                                        : 'Çevrimdışı'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative" ref={optionsMenuRef}>
                                            <button
                                                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="h-5 w-5 text-gray-400" />
                                            </button>

                                            {showOptionsMenu && (
                                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                                    <button
                                                        onClick={handleMuteNotifications}
                                                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
                                                    >
                                                        <BellOff className="h-4 w-4 text-gray-500" />
                                                        <span>Bildirimleri Kapat</span>
                                                    </button>

                                                    <button
                                                        onClick={handleDeleteConversation}
                                                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-gray-500" />
                                                        <span>Sohbeti Sil</span>
                                                    </button>

                                                    <div className="my-1 border-t border-gray-100"></div>

                                                    <button
                                                        onClick={handleBlockUser}
                                                        className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600 transition-colors"
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                        <span>Kullanıcıyı Engelle</span>
                                                    </button>

                                                    <button
                                                        onClick={handleReportUser}
                                                        className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600 transition-colors"
                                                    >
                                                        <Flag className="h-4 w-4" />
                                                        <span>Kullanıcıyı Bildir</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {messages.map((message, index) => {
                                        const isOwn = message.senderId === (user?.id || 0);
                                        const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${!showAvatar && !isOwn ? 'ml-10' : ''
                                                    }`}
                                            >
                                                {!isOwn && showAvatar && (
                                                    <div className="h-8 w-8 rounded-lg bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
                                                        <User className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                )}
                                                <div className="max-w-md">
                                                    <div
                                                        className={`px-4 py-2.5 rounded-2xl ${isOwn
                                                            ? 'bg-indigo-600 text-white rounded-br-md'
                                                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                                            }`}
                                                    >
                                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>
                                                        {isOwn && (
                                                            message.isRead ? (
                                                                <CheckCheck className="h-3.5 w-3.5 text-indigo-600" />
                                                            ) : (
                                                                <Check className="h-3.5 w-3.5 text-gray-400" />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="border-t border-gray-100 p-4 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <button className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors">
                                            <Smile className="h-5 w-5" />
                                        </button>
                                        <input
                                            ref={messageInputRef}
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                            placeholder="Mesajınızı buraya yazın..."
                                            className="flex-1 px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm outline-none"
                                            disabled={sending}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim() || sending}
                                            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <Send className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-8">
                                <div className="text-center">
                                    <div className="w-24 h-24 mx-auto mb-6 bg-indigo-50 rounded-full flex items-center justify-center">
                                        <MessageCircle className="h-12 w-12 text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Mesajlaşmaya Başla</h3>
                                    <p className="text-gray-500 max-w-sm">
                                        Sol taraftan bir konuşma seçin veya ilanlar üzerinden yeni bir satıcıyla iletişime geçin.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};