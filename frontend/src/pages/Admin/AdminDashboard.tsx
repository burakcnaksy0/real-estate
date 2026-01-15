import React, { useEffect, useState } from 'react';
import { AdminService } from '../../services/adminService';
import { UserStats, ListingStats, ActivityLog, GrowthData } from '../../types';
import { StatsCard } from '../../components/Admin/StatsCard';
import { ActivityTimeline } from '../../components/Admin/ActivityTimeline';
import { UserManagement } from './UserManagement';
import {
    Users, Home, TrendingUp, Activity, RefreshCw,
    LayoutDashboard, UserCog
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users'>('dashboard');
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [listingStats, setListingStats] = useState<ListingStats | null>(null);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [userGrowth, setUserGrowth] = useState<GrowthData[]>([]);
    const [listingGrowth, setListingGrowth] = useState<GrowthData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [users, listings, acts, uGrowth, lGrowth] = await Promise.all([
                AdminService.getUserStats(),
                AdminService.getListingStats(),
                AdminService.getRecentActivities(20),
                AdminService.getUserGrowth(6),
                AdminService.getListingGrowth(6),
            ]);

            setUserStats(users);
            setListingStats(listings);
            setActivities(acts);
            setUserGrowth(uGrowth);
            setListingGrowth(lGrowth);

            if (isRefresh) {
                toast.success('Veriler güncellendi');
            }
        } catch (error: any) {
            console.error('Dashboard data loading error:', error);
            toast.error('Veriler yüklenirken bir sorun oluştu');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadDashboardData(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <p className="mt-6 text-lg text-gray-700 font-medium">Veriler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Admin Paneli
                        </h1>
                        <p className="mt-2 text-gray-600">Sistem yönetimi ve istatistikler</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
                        >
                            <RefreshCw className={`w-5 h-5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Yenile</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8 flex space-x-1 bg-white/50 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-white/20 w-fit">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard'
                            ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Genel Bakış
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'users'
                            ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                            }`}
                    >
                        <UserCog className="w-4 h-4" />
                        Kullanıcı Yönetimi
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'users' ? (
                    <UserManagement />
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {userStats && (
                                <>
                                    <StatsCard
                                        title="Toplam Kullanıcı"
                                        value={userStats.totalUsers}
                                        icon={Users}
                                        color="blue"
                                        change={userStats.last30DaysUsers}
                                        changeLabel="son 30 gün"
                                    />
                                    <StatsCard
                                        title="Aktif Kullanıcı"
                                        value={userStats.activeUsers}
                                        icon={Activity}
                                        color="green"
                                    />
                                </>
                            )}
                            {listingStats && (
                                <>
                                    <StatsCard
                                        title="Toplam İlan"
                                        value={listingStats.totalListings}
                                        icon={Home}
                                        color="purple"
                                        change={listingStats.activeListings} // Using active listings as value for now or mock trend
                                    />
                                    <StatsCard
                                        title="Büyüme"
                                        value="24%"
                                        icon={TrendingUp}
                                        change={24}
                                        color="orange"
                                    />
                                </>
                            )}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* User Growth Chart */}
                            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Kullanıcı Büyümesi</h3>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={userGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="month"
                                            stroke="#6B7280"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="#6B7280"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#FFF',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#3B82F6"
                                            strokeWidth={3}
                                            name="Kullanıcı"
                                            dot={{ fill: '#3B82F6', r: 5 }}
                                            activeDot={{ r: 7 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Listing Growth Chart */}
                            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Home className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">İlan Büyümesi</h3>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={listingGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="month"
                                            stroke="#6B7280"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="#6B7280"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#FFF',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="count"
                                            fill="#10B981"
                                            name="İlan"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Category Distribution */}
                        {listingStats && (
                            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 mb-8 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Kategori Dağılımı</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="group relative overflow-hidden text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
                                        <p className="text-3xl font-bold text-blue-600 mb-2 relative z-10">{listingStats.realEstateCount}</p>
                                        <p className="text-sm text-gray-700 font-medium relative z-10">Emlak</p>
                                    </div>
                                    <div className="group relative overflow-hidden text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
                                        <p className="text-3xl font-bold text-green-600 mb-2 relative z-10">{listingStats.vehicleCount}</p>
                                        <p className="text-sm text-gray-700 font-medium relative z-10">Araç</p>
                                    </div>
                                    <div className="group relative overflow-hidden text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
                                        <p className="text-3xl font-bold text-purple-600 mb-2 relative z-10">{listingStats.landCount}</p>
                                        <p className="text-sm text-gray-700 font-medium relative z-10">Arsa</p>
                                    </div>
                                    <div className="group relative overflow-hidden text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
                                        <p className="text-3xl font-bold text-orange-600 mb-2 relative z-10">{listingStats.workplaceCount}</p>
                                        <p className="text-sm text-gray-700 font-medium relative z-10">İşyeri</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Activity Timeline */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <ActivityTimeline activities={activities} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};