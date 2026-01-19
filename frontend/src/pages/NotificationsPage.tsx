import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationService } from '../services/notificationService';
import { Notification } from '../types';
import { Bell, Check, Heart } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await NotificationService.getUserNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await NotificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await NotificationService.markAsRead(notification.id);
        }

        if (notification.relatedListingId) {
            if (notification.relatedListingType === 'REAL_ESTATE') navigate(`/real-estates/${notification.relatedListingId}`);
            else if (notification.relatedListingType === 'VEHICLE') navigate(`/vehicles/${notification.relatedListingId}`);
            else if (notification.relatedListingType === 'LAND') navigate(`/lands/${notification.relatedListingId}`);
            else if (notification.relatedListingType === 'WORKPLACE') navigate(`/workplaces/${notification.relatedListingId}`);
            else navigate(`/listings/${notification.relatedListingId}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Bell className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                            {notifications.length}
                        </span>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                        >
                            <Check className="w-4 h-4" />
                            <span>Tümünü Okundu İşaretle</span>
                        </button>
                    )}
                </div>

                <div className="divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Bildiriminiz Yok</h3>
                            <p className="text-gray-500">Yeni bir etkileşim olduğunda burada göreceksiniz.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer group relative ${!notification.isRead ? 'bg-blue-50/30' : ''
                                    }`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className={`mt-1 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${notification.type === 'FAVORITE' ? 'bg-red-100 text-red-500' :
                                            notification.type === 'VIEW' ? 'bg-blue-100 text-blue-500' :
                                                'bg-gray-100 text-gray-500'
                                        }`}>
                                        {notification.type === 'FAVORITE' ? <Heart className="w-6 h-6 fill-current" /> : <Bell className="w-6 h-6" />}
                                    </div>

                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`text-lg ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                                                {formatDate(notification.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed mb-2">
                                            {notification.message}
                                        </p>
                                        {!notification.isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></div>
                                        )}
                                    </div>

                                    {!notification.isRead && (
                                        <button
                                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Okundu olarak işaretle"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
