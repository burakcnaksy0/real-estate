import React from 'react';
import { ActivityLog } from '../../types';
import { UserPlus, Home, Heart, MessageCircle } from 'lucide-react';

interface ActivityTimelineProps {
    activities: ActivityLog[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'USER_REGISTERED':
                return <UserPlus className="w-5 h-5 text-blue-500" />;
            case 'LISTING_CREATED':
                return <Home className="w-5 h-5 text-green-500" />;
            case 'FAVORITE_ADDED':
                return <Heart className="w-5 h-5 text-red-500" />;
            case 'MESSAGE_SENT':
                return <MessageCircle className="w-5 h-5 text-purple-500" />;
            default:
                return <Home className="w-5 h-5 text-gray-500" />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'USER_REGISTERED':
                return 'border-blue-500';
            case 'LISTING_CREATED':
                return 'border-green-500';
            case 'FAVORITE_ADDED':
                return 'border-red-500';
            case 'MESSAGE_SENT':
                return 'border-purple-500';
            default:
                return 'border-gray-500';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} dakika önce`;
        } else if (diffHours < 24) {
            return `${diffHours} saat önce`;
        } else if (diffDays < 7) {
            return `${diffDays} gün önce`;
        } else {
            return date.toLocaleDateString('tr-TR');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {activities.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Henüz aktivite bulunmuyor</p>
                ) : (
                    activities.map((activity, index) => (
                        <div key={`${activity.id}-${index}`} className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 ${getActivityColor(activity.type)} bg-white flex items-center justify-center`}>
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                                {activity.userName && (
                                    <p className="text-xs text-gray-500 mt-1">Kullanıcı: {activity.userName}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">{formatTimestamp(activity.timestamp)}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
