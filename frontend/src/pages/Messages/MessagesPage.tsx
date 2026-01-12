import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageService } from '../../services/messageService';
import { ConversationResponse, MessageDetailResponse } from '../../types';
import { MessageCircle, Send, ArrowLeft, User, Search, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

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

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation);
        }
    }, [selectedConversation]);

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

            // Mark unread messages as read
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
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Mesaj gönderilemedi');
        } finally {
            setSending(false);
        }
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
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-primary-600"></div>
                    <MessageCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="group inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-all duration-200"
                    >
                        <div className="p-1 rounded-lg group-hover:bg-slate-100 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </div>
                        <span className="font-medium">Geri Dön</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/20">
                            <MessageCircle className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Mesajlar</h1>
                            <p className="text-slate-500 text-sm mt-0.5">{conversations.length} aktif konuşma</p>
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-220px)] min-h-[600px]">
                        {/* Conversations List */}
                        <div className="border-r border-slate-200/70 flex flex-col bg-gradient-to-b from-slate-50/50 to-white">
                            {/* Search Header */}
                            <div className="p-4 border-b border-slate-200/70 bg-white/80 backdrop-blur-sm">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Konuşma ara..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100/70 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200 text-sm placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Conversations */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredConversations.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                                            <MessageCircle className="h-10 w-10 text-slate-400" />
                                        </div>
                                        <p className="text-slate-600 font-medium">Henüz mesajınız yok</p>
                                        <p className="text-slate-400 text-sm mt-1">Yeni bir konuşma başlatın</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {filteredConversations.map((conv) => (
                                            <button
                                                key={conv.otherUserId}
                                                onClick={() => setSelectedConversation(conv.otherUserId)}
                                                className={`w-full p-4 text-left transition-all duration-200 hover:bg-slate-50 relative group ${
                                                    selectedConversation === conv.otherUserId 
                                                        ? 'bg-gradient-to-r from-primary-50 to-primary-50/30 border-l-4 border-primary-600' 
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="relative flex-shrink-0">
                                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                                                            selectedConversation === conv.otherUserId
                                                                ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30'
                                                                : 'bg-gradient-to-br from-slate-200 to-slate-300 group-hover:from-primary-400 group-hover:to-primary-500'
                                                        }`}>
                                                            <User className={`h-6 w-6 ${
                                                                selectedConversation === conv.otherUserId ? 'text-white' : 'text-slate-600 group-hover:text-white'
                                                            }`} />
                                                        </div>
                                                        {conv.unreadCount > 0 && (
                                                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
                                                                {conv.unreadCount}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="font-semibold text-slate-900 truncate">
                                                                {conv.otherUserUsername}
                                                            </p>
                                                        </div>
                                                        {conv.lastMessage && (
                                                            <p className={`text-sm truncate ${
                                                                conv.unreadCount > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'
                                                            }`}>
                                                                {conv.lastMessage.content}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center justify-between mt-1.5">
                                                            {conv.lastMessage && (
                                                                <p className="text-xs text-slate-400 font-medium">
                                                                    {formatTime(conv.lastMessage.createdAt)}
                                                                </p>
                                                            )}
                                                            {conv.listingTitle && (
                                                                <p className="text-xs text-primary-600 font-medium truncate ml-2 bg-primary-50 px-2 py-0.5 rounded-full">
                                                                    📍 {conv.listingTitle}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages Thread */}
                        <div className="md:col-span-2 flex flex-col bg-gradient-to-b from-white to-slate-50/30">
                            {selectedConversation ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="border-b border-slate-200/70 p-4 bg-white/80 backdrop-blur-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                                    <User className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">
                                                        {selectedConv?.otherUserUsername}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">Çevrimiçi</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                                <MoreVertical className="h-5 w-5 text-slate-400" />
                                            </button>
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
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                                                        !showAvatar && !isOwn ? 'ml-11' : ''
                                                    }`}
                                                >
                                                    {!isOwn && showAvatar && (
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center mr-2 flex-shrink-0">
                                                            <User className="h-4 w-4 text-slate-600" />
                                                        </div>
                                                    )}
                                                    <div className={`max-w-xs lg:max-w-md ${!isOwn && !showAvatar ? 'ml-2' : ''}`}>
                                                        <div
                                                            className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                                                                isOwn
                                                                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-md'
                                                                    : 'bg-white border border-slate-200 text-slate-900 rounded-bl-md'
                                                            }`}
                                                        >
                                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                                        </div>
                                                        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                            <p className="text-xs text-slate-400 font-medium">
                                                                {formatTime(message.createdAt)}
                                                            </p>
                                                            {isOwn && (
                                                                <div className="text-slate-400">
                                                                    {message.isRead ? (
                                                                        <CheckCheck className="h-3.5 w-3.5 text-primary-600" />
                                                                    ) : (
                                                                        <Check className="h-3.5 w-3.5" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Message Input */}
                                    <div className="border-t border-slate-200/70 p-4 bg-white/80 backdrop-blur-sm">
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                                placeholder="Mesajınızı yazın..."
                                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200 placeholder:text-slate-400"
                                                disabled={sending}
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim() || sending}
                                                className="px-5 py-3 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2 transition-all duration-200 font-medium"
                                            >
                                                <Send className="h-4 w-4" />
                                                <span className="hidden sm:inline">Gönder</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                                            <MessageCircle className="h-12 w-12 text-slate-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                            Bir konuşma seçin
                                        </h3>
                                        <p className="text-slate-500 text-sm">
                                            Mesajlaşmaya başlamak için soldaki listeden bir kullanıcı seçin
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};