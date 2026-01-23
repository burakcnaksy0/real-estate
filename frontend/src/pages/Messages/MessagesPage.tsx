import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MessageService } from '../../services/messageService';
import { ConversationResponse, MessageDetailResponse } from '../../types';
import {
    MessageCircle,
    Send,
    ArrowLeft,
    User,
    Search,
    MoreVertical,
    Check,
    CheckCheck,
    Smile,
    Ban,
    Trash2,
    BellOff,
    Flag,
    Phone,
    Video,
    Image,
    Paperclip,
    MoreHorizontal
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { formatLastSeen } from '../../utils/dateUtils';
import { websocketService } from '../../services/websocketService';
import { getImageUrl } from '../../utils/imageUtils';

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
    const messageInputRef = useRef<HTMLTextAreaElement>(null);
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
        toast.success(`${selectedConv.otherUserUsername} engellendi`);
        setShowOptionsMenu(false);
        setSelectedConversation(null);
    };

    const handleDeleteConversation = async () => {
        if (!selectedConversation) return;

        if (window.confirm('Bu sohbeti silmek istediğinizden emin misiniz? Tüm mesajlar kalıcı olarak silinecektir.')) {
            try {
                await MessageService.deleteConversation(selectedConversation);
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
        toast.success(`${selectedConv.otherUserUsername} için bildirimler kapatıldı`);
        setShowOptionsMenu(false);
    };

    const handleReportUser = () => {
        if (!selectedConv) return;
        toast.success(`${selectedConv.otherUserUsername} bildirildi`);
        setShowOptionsMenu(false);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Şimdi';
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const selectedConv = conversations.find(c => c.otherUserId === selectedConversation);

    const filteredConversations = conversations.filter(conv =>
        conv.otherUserUsername.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <MessageCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-6 font-sans">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-[calc(100vh-48px)] flex flex-col">

                {/* Modern Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-white p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                Mesajlar
                                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                    {conversations.length}
                                </span>
                            </h1>
                            <p className="text-sm text-gray-500">Sohbetleriniz ve bildirimleriniz</p>
                        </div>
                    </div>
                </div>

                {/* Main Messages Container */}
                <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex relative">
                    {/* Sidebar / Conversation List */}
                    <div className={`w-full md:w-96 border-r border-gray-100 flex flex-col bg-gray-50/50 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                        {/* Search Bar */}
                        <div className="p-5 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Sohbetlerde ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* Conversations */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {filteredConversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <MessageCircle className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="font-semibold text-gray-900">Mesaj Bulunamadı</p>
                                    <p className="text-sm text-gray-500 mt-1">Arama kriterlerinize uygun bir sonuç yok.</p>
                                </div>
                            ) : (
                                filteredConversations.map((conv) => (
                                    <button
                                        key={conv.otherUserId}
                                        onClick={() => setSelectedConversation(conv.otherUserId)}
                                        className={`w-full p-4 rounded-2xl text-left transition-all relative group ${selectedConversation === conv.otherUserId
                                            ? 'bg-blue-600 shadow-lg shadow-blue-600/20'
                                            : 'hover:bg-white hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="relative flex-shrink-0">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${selectedConversation === conv.otherUserId
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-white border text-blue-600'
                                                    }`}>
                                                    {conv.otherUserUsername.charAt(0).toUpperCase()}
                                                </div>
                                                {conv.otherUserLastSeen && formatLastSeen(conv.otherUserLastSeen) === 'Az önce aktif' && (
                                                    <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={`font-bold truncate ${selectedConversation === conv.otherUserId ? 'text-white' : 'text-gray-900'}`}>
                                                        {conv.otherUserUsername}
                                                    </h3>
                                                    {conv.lastMessage && (
                                                        <span className={`text-xs ${selectedConversation === conv.otherUserId ? 'text-blue-100' : 'text-gray-400'}`}>
                                                            {formatTime(conv.lastMessage.createdAt)}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className={`text-sm truncate mb-1 ${selectedConversation === conv.otherUserId
                                                    ? 'text-blue-100'
                                                    : conv.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'
                                                    }`}>
                                                    {conv.lastMessage?.content}
                                                </p>

                                                {(conv.unreadCount > 0 && selectedConversation !== conv.otherUserId) && (
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] shadow-sm">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-1 flex flex-col bg-white ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setSelectedConversation(null)}
                                            className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                                        </button>

                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                {selectedConv?.otherUserUsername.charAt(0).toUpperCase()}
                                            </div>
                                            {selectedConv?.otherUserLastSeen && formatLastSeen(selectedConv.otherUserLastSeen) === 'Az önce aktif' && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-gray-900">{selectedConv?.otherUserUsername}</h3>
                                            <span className={`text-xs flex items-center gap-1 ${selectedConv?.otherUserLastSeen && formatLastSeen(selectedConv.otherUserLastSeen) === 'Az önce aktif'
                                                ? 'text-green-600 font-medium'
                                                : 'text-gray-500'
                                                }`}>
                                                {selectedConv?.otherUserLastSeen && formatLastSeen(selectedConv.otherUserLastSeen) === 'Az önce aktif'
                                                    ? '● Çevrimiçi'
                                                    : 'Son görülme: ' + (selectedConv?.otherUserLastSeen ? formatLastSeen(selectedConv.otherUserLastSeen) : 'Bilinmiyor')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                            <Phone className="w-5 h-5" />
                                        </button>
                                        <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                            <Video className="w-5 h-5" />
                                        </button>
                                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                        <div className="relative" ref={optionsMenuRef}>
                                            <button
                                                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                                                className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                                            >
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>

                                            {showOptionsMenu && (
                                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                    <button onClick={handleMuteNotifications} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700">
                                                        <BellOff className="h-4 w-4 text-gray-500" /> Bildirimleri Kapat
                                                    </button>
                                                    <button onClick={handleDeleteConversation} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700">
                                                        <Trash2 className="h-4 w-4 text-gray-500" /> Sohbeti Sil
                                                    </button>
                                                    <div className="my-1 border-t border-gray-100"></div>
                                                    <button onClick={handleBlockUser} className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 text-sm font-medium text-red-600">
                                                        <Ban className="h-4 w-4" /> Kullanıcıyı Engelle
                                                    </button>
                                                    <button onClick={handleReportUser} className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 text-sm font-medium text-red-600">
                                                        <Flag className="h-4 w-4" /> Bildir
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Messages View */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')]">
                                    {messages.map((message, index) => {
                                        const isOwn = message.senderId === (user?.id || 0);
                                        const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                                        // Check for listing link
                                        const listingMatch = message.content.match(/(\/real-estates|\/vehicles|\/lands|\/workplaces)\/(\d+)/);
                                        const isListingShare = !!listingMatch;

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex items-end gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${!showAvatar ? 'mt-1' : 'mt-4'}`}
                                            >
                                                {!isOwn && (
                                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-200 text-xs font-bold ${!showAvatar ? 'opacity-0' : ''}`}>
                                                        {selectedConv?.otherUserUsername.charAt(0).toUpperCase()}
                                                    </div>
                                                )}

                                                <div className={`group max-w-[70%] relative`}>
                                                    {isListingShare ? (
                                                        <Link
                                                            to={listingMatch[0]}
                                                            className={`block overflow-hidden rounded-2xl shadow-sm border transition-all hover:shadow-md ${isOwn
                                                                ? 'bg-blue-600 border-blue-600 text-white rounded-br-none'
                                                                : 'bg-white border-gray-200 text-gray-800 rounded-bl-none'
                                                                }`}
                                                        >
                                                            <div className={`p-4 ${isOwn ? 'bg-blue-700/50' : 'bg-gray-50'}`}>
                                                                <div className="flex items-center gap-2 mb-1 opacity-80">
                                                                    <span className="text-xs uppercase font-bold tracking-wider">İlan Paylaşımı</span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-lg ${isOwn ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                                                                        <Image className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-sm leading-tight">İlanı görüntülemek için tıklayın</p>
                                                                        <p className={`text-xs mt-0.5 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                            İlan No: {listingMatch[2]}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {message.content.replace(listingMatch[0], '').trim() && (
                                                                <div className="px-4 py-3 text-sm">
                                                                    {message.content.replace(listingMatch[0], '').trim()}
                                                                </div>
                                                            )}
                                                        </Link>
                                                    ) : (
                                                        <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${isOwn
                                                            ? 'bg-blue-600 text-white rounded-br-none'
                                                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                                            }`}>
                                                            {message.content}
                                                        </div>
                                                    )}

                                                    <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 ${isOwn ? 'right-0' : 'left-0'}`}>
                                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                            {formatTime(message.createdAt)}
                                                        </span>
                                                        {isOwn && (
                                                            message.isRead
                                                                ? <CheckCheck className="w-3 h-3 text-blue-600" />
                                                                : <Check className="w-3 h-3 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0">
                                    <div className="flex items-end gap-3 max-w-4xl mx-auto">
                                        <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                            <Paperclip className="w-5 h-5" />
                                        </button>
                                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl flex items-center px-4 py-2 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                                            <textarea
                                                ref={messageInputRef}
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                                placeholder="Bir mesaj yazın..."
                                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm max-h-32 resize-none"
                                                rows={1}
                                                disabled={sending}
                                                style={{ minHeight: '24px' }}
                                            />
                                            <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors">
                                                <Smile className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim() || sending}
                                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                                <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <MessageCircle className="w-16 h-16 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">Mesajlaşmaya Başlayın</h2>
                                <p className="text-gray-500 max-w-md mx-auto mb-8">
                                    Sol taraftaki listeden bir konuşma seçin veya ilanlar üzerinden satıcılarla iletişime geçin.
                                </p>
                                <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                            <CheckCheck className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900 text-sm">Okundu Bilgisi</p>
                                            <p className="text-xs text-gray-500">Mesajlarınız okunduğunda haberdar olun</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900 text-sm">Hızlı İletişim</p>
                                            <p className="text-xs text-gray-500">Satıcılarla anında bağlantı kurun</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};