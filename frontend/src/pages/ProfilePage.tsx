import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ListingService } from '../services/listingService';
import { UserService } from '../services/userService';
import { FavoriteService } from '../services/favoriteService';
import { BaseListing, Role, UpdateProfileRequest, ChangePasswordRequest, Favorite } from '../types';
import { Link } from 'react-router-dom';
import {
    User, Settings, Lock, Package, Edit2, Trash2, Eye,
    MapPin, Calendar, LogOut, Shield, Phone, Mail, Save, Heart,
    TrendingUp, CheckCircle, XCircle, Clock, Star, Award as AwardIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { checkAuthStatus, setUser } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import { formatDate } from '../utils/formatters';
import { getImageUrl } from '../utils/imageUtils';

export const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const dispatch = useDispatch<AppDispatch>();
    const [activeTab, setActiveTab] = useState<'listings' | 'favorites' | 'profile' | 'security'>('listings');
    const [myListings, setMyListings] = useState<BaseListing[]>([]);
    const [myFavorites, setMyFavorites] = useState<Favorite[]>([]);
    const [loadingListings, setLoadingListings] = useState(false);
    const [loadingFavorites, setLoadingFavorites] = useState(false);

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { isSubmitting: isProfileSubmitting }
    } = useForm<UpdateProfileRequest>({
        values: {
            name: user?.name,
            surname: user?.surname,
            email: user?.email,
            phoneNumber: user?.phoneNumber
        }
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: { isSubmitting: isPasswordSubmitting, errors: passwordErrors }
    } = useForm<ChangePasswordRequest & { confirmPassword: string }>();

    useEffect(() => {
        if (activeTab === 'listings' && user) {
            fetchMyListings();
        } else if (activeTab === 'favorites' && user) {
            fetchMyFavorites();
        }
    }, [activeTab, user]);

    const fetchMyListings = async () => {
        setLoadingListings(true);
        try {
            const data = await ListingService.getMyListings();
            setMyListings(data);
        } catch (error) {
            console.error('Error fetching my listings:', error);
            toast.error('İlanlarınız yüklenirken bir sorun oluştu.');
        } finally {
            setLoadingListings(false);
        }
    };

    const fetchMyFavorites = async () => {
        setLoadingFavorites(true);
        try {
            const data = await FavoriteService.getUserFavorites();
            setMyFavorites(data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            toast.error('Favorileriniz yüklenirken bir sorun oluştu.');
        } finally {
            setLoadingFavorites(false);
        }
    };

    const onProfileSubmit = async (data: UpdateProfileRequest) => {
        try {
            await UserService.updateProfile(data);
            toast.success('Profil bilgileriniz güncellendi.');
            dispatch(checkAuthStatus());
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Profil güncellenemedi.');
        }
    };

    const onPasswordSubmit = async (data: ChangePasswordRequest & { confirmPassword: string }) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error('Yeni şifreler eşleşmiyor.');
            return;
        }

        try {
            await UserService.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            toast.success('Şifreniz başarıyla değiştirildi.');
            resetPassword();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Şifre değiştirilemedi (Mevcut şifreniz hatalı olabilir).');
        }
    };

    const getDetailUrl = (listing: BaseListing | Favorite): string => {
        // Favorite objeleri için listingId, BaseListing objeleri için id kullanılır
        const listingId = 'listingId' in listing ? listing.listingId : listing.id;

        if (listing.listingType === 'REAL_ESTATE') return `/real-estates/${listingId}`;
        if (listing.listingType === 'VEHICLE') return `/vehicles/${listingId}`;
        if (listing.listingType === 'LAND') return `/lands/${listingId}`;
        if (listing.listingType === 'WORKPLACE') return `/workplaces/${listingId}`;

        // categorySlug sadece BaseListing'de var
        if ('categorySlug' in listing) {
            const slug = listing.categorySlug?.toLowerCase();
            switch (slug) {
                case 'konut': case 'emlak': return `/real-estates/${listingId}`;
                case 'vasita': case 'arac': case 'vehicle': return `/vehicles/${listingId}`;
                case 'arsa': case 'land': return `/lands/${listingId}`;
                case 'isyeri': case 'workplace': return `/workplaces/${listingId}`;
            }
        }

        return `/listings/${listingId}`;
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Oturum Açmanız Gerekiyor</h2>
                    <p className="text-gray-600 mb-6">Profil sayfanıza erişmek için lütfen giriş yapın.</p>
                    <Link to="/login" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg transition-all">Giriş Yap</Link>
                </div>
            </div>
        );
    }

    const activeListings = myListings.filter(l => l.status === 'ACTIVE').length;
    const soldListings = myListings.filter(l => l.status === 'SOLD').length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Modern Hero Header */}
            <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>

                <div className="relative px-8 py-12">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* Avatar Section */}
                        <div className="relative group">
                            <div className="w-36 h-36 rounded-3xl bg-white/10 backdrop-blur-lg p-1.5 shadow-2xl border border-white/20 relative overflow-hidden">
                                {user.profilePicture ? (
                                    <img
                                        src={getImageUrl(user.profilePicture)}
                                        alt={user.name}
                                        className="w-full h-full rounded-[20px] object-cover"
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <div className={`w-full h-full rounded-[20px] bg-gradient-to-br from-white to-blue-100 flex items-center justify-center text-blue-600 text-5xl font-bold shadow-inner ${user.profilePicture ? 'hidden' : ''}`}>
                                    {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <input
                                type="file"
                                id="profilePictureInput"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        if (file.size > 5000000) {
                                            toast.error('Dosya boyutu 5MB dan küçük olmalı');
                                            return;
                                        }
                                        try {
                                            const updatedUser = await UserService.updateProfilePicture(file);
                                            toast.success('Profil fotoğrafı güncellendi');
                                            dispatch(setUser(updatedUser)); // Update global state and localStorage
                                            // dispatch(checkAuthStatus()); // No longer needed if we set user directly
                                        } catch (error) {
                                            toast.error('Profil fotoğrafı güncellenemedi');
                                        }
                                    }
                                }}
                            />
                            <button
                                onClick={() => document.getElementById('profilePictureInput')?.click()}
                                className="absolute -bottom-2 -right-2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-10"
                            >
                                <Edit2 className="h-5 w-5 text-blue-600" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-semibold mb-3 border border-white/30">
                                <Shield className="w-4 h-4" />
                                {user.roles.includes(Role.ROLE_ADMIN) ? 'Yönetici' : 'Bireysel Üye'}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                                {user.name} {user.surname}
                            </h1>
                            <p className="text-blue-100 text-xl mb-6">@{user.username}</p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white border border-white/30">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm font-medium">{user.email}</span>
                                </div>
                                {user.phoneNumber && (
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white border border-white/30">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm font-medium">{user.phoneNumber}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white border border-white/30">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm font-medium">Üyelik: {formatDate(user.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-xl transition-all font-semibold border border-white/30 hover:border-white/50 shadow-lg"
                        >
                            <LogOut className="w-5 h-5" />
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 rounded-xl p-3 group-hover:scale-110 transition-transform">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{myListings.length}</div>
                    <div className="text-gray-600 font-medium">Toplam İlan</div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 rounded-xl p-3 group-hover:scale-110 transition-transform">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{activeListings}</div>
                    <div className="text-gray-600 font-medium">Aktif İlan</div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-red-100 rounded-xl p-3 group-hover:scale-110 transition-transform">
                            <Heart className="h-6 w-6 text-red-600" />
                        </div>
                        <AwardIcon className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{myFavorites.length}</div>
                    <div className="text-gray-600 font-medium">Favori</div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 rounded-xl p-3 group-hover:scale-110 transition-transform">
                            <XCircle className="h-6 w-6 text-purple-600" />
                        </div>
                        <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{soldListings}</div>
                    <div className="text-gray-600 font-medium">Satılan</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Modern Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-6 border border-gray-100">
                        <div className="p-2">
                            <nav className="space-y-2">
                                {[
                                    { id: 'listings', icon: Package, label: 'İlanlarım', color: 'blue' },
                                    { id: 'favorites', icon: Heart, label: 'Favorilerim', color: 'red' },
                                    { id: 'profile', icon: User, label: 'Profil Bilgileri', color: 'green' },
                                    { id: 'security', icon: Lock, label: 'Güvenlik', color: 'purple' }
                                ].map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all font-semibold group ${isActive
                                                ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-500/30`
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}

                                {user?.roles?.includes(Role.ROLE_ADMIN) && (
                                    <>
                                        <div className="my-2 border-t border-gray-100"></div>
                                        <Link
                                            to="/admin"
                                            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all font-semibold group text-purple-700 hover:bg-purple-50"
                                        >
                                            <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span>Admin Paneli</span>
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    {activeTab === 'listings' && (
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">İlanlarım</h2>
                                    <p className="text-gray-600">Yayınladığınız ve pasife aldığınız tüm ilanlar</p>
                                </div>
                                <Link
                                    to="/create"
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg transition-all hover:-translate-y-0.5"
                                >
                                    <Package className="w-5 h-5" />
                                    Yeni İlan
                                </Link>
                            </div>

                            {loadingListings ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                                    <p className="text-gray-600 font-medium">İlanlarınız yükleniyor...</p>
                                </div>
                            ) : myListings.length === 0 ? (
                                <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
                                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <Package className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Henüz ilanınız bulunmuyor</h3>
                                    <p className="text-gray-600 mb-6">İlk ilanınızı oluşturun ve satışa başlayın!</p>
                                    <Link
                                        to="/create"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg transition-all"
                                    >
                                        Hemen İlan Ver
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myListings.map(listing => (
                                        <div
                                            key={listing.id}
                                            className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all p-6"
                                        >
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="w-full md:w-48 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-200 group-hover:border-blue-300 transition-all relative">
                                                    {listing.imageUrl ? (
                                                        <img
                                                            src={`http://localhost:8080${listing.imageUrl}?t=${Date.now()}`}
                                                            alt={listing.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`absolute inset-0 flex items-center justify-center ${listing.imageUrl ? 'hidden' : ''}`}>
                                                        <Package className="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition-colors group-hover:scale-110" />
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 mb-2">
                                                                {listing.categoryName || listing.listingType}
                                                            </span>
                                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                {listing.title}
                                                            </h3>
                                                        </div>
                                                        <span className={`px-4 py-2 text-sm font-bold rounded-xl border-2 ${listing.status === 'ACTIVE'
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : listing.status === 'SOLD'
                                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                                : 'bg-gray-50 text-gray-700 border-gray-200'
                                                            }`}>
                                                            {listing.status === 'ACTIVE' ? '✓ Yayında' : listing.status === 'SOLD' ? '✕ Satıldı' : '⊗ Pasif'}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                                                            <MapPin className="w-4 h-4 text-blue-500" />
                                                            {listing.city}, {listing.district}
                                                        </span>
                                                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                                                            <Calendar className="w-4 h-4 text-purple-500" />
                                                            {formatDate(listing.createdAt)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: listing.currency }).format(listing.price)}
                                                        </div>
                                                        <Link
                                                            to={getDetailUrl(listing)}
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Görüntüle
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'favorites' && (
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Favorilerim</h2>
                                    <p className="text-gray-600">Beğendiğiniz ve kaydettiğiniz ilanlar</p>
                                </div>
                            </div>

                            {loadingFavorites ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-6"></div>
                                    <p className="text-gray-600 font-medium">Favorileriniz yükleniyor...</p>
                                </div>
                            ) : myFavorites.length === 0 ? (
                                <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-red-50 rounded-2xl border-2 border-dashed border-gray-300">
                                    <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <Heart className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Henüz favori ilanınız yok</h3>
                                    <p className="text-gray-600 mb-6">Beğendiğiniz ilanları favorilere ekleyerek buradan kolayca erişebilirsiniz</p>
                                    <Link
                                        to="/"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 font-semibold shadow-lg transition-all"
                                    >
                                        İlanları Keşfet
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myFavorites.map(favorite => (
                                        <div
                                            key={favorite.id}
                                            className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-red-300 hover:shadow-xl transition-all p-6"
                                        >
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="w-full md:w-48 h-40 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-red-200 group-hover:border-red-300 transition-all relative">
                                                    {favorite.imageUrl ? (
                                                        <img
                                                            src={`http://localhost:8080${favorite.imageUrl}?t=${Date.now()}`}
                                                            alt={favorite.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`absolute inset-0 flex items-center justify-center ${favorite.imageUrl ? 'hidden' : ''}`}>
                                                        <Heart className="w-12 h-12 text-red-400 group-hover:text-red-500 transition-colors group-hover:scale-110 fill-current" />
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 mb-2">
                                                                {favorite.listingType}
                                                            </span>
                                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                                                                {favorite.title}
                                                            </h3>
                                                        </div>
                                                        <span className={`px-4 py-2 text-sm font-bold rounded-xl border-2 ${favorite.status === 'ACTIVE'
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : favorite.status === 'SOLD'
                                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                                : 'bg-gray-50 text-gray-700 border-gray-200'
                                                            }`}>
                                                            {favorite.status === 'ACTIVE' ? '✓ Yayında' : favorite.status === 'SOLD' ? '✕ Satıldı' : '⊗ Pasif'}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                                                            <MapPin className="w-4 h-4 text-red-500" />
                                                            {favorite.city}, {favorite.district}
                                                        </span>
                                                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                                                            <Calendar className="w-4 h-4 text-purple-500" />
                                                            {formatDate(favorite.createdAt)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                        <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: favorite.currency }).format(favorite.price)}
                                                        </div>
                                                        <Link
                                                            to={getDetailUrl(favorite)}
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Görüntüle
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil Bilgileri</h2>
                                <p className="text-gray-600">Kişisel bilgilerinizi güncelleyin</p>
                            </div>

                            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Ad
                                        </label>
                                        <input
                                            type="text"
                                            {...registerProfile('name')}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="Adınız"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Soyad
                                        </label>
                                        <input
                                            type="text"
                                            {...registerProfile('surname')}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="Soyadınız"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            E-posta
                                        </label>
                                        <input
                                            type="email"
                                            {...registerProfile('email')}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="ornek@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Telefon
                                        </label>
                                        <input
                                            type="tel"
                                            {...registerProfile('phoneNumber')}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="+90 555 123 45 67"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={isProfileSubmitting}
                                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-5 h-5" />
                                        {isProfileSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Güvenlik Ayarları</h2>
                                <p className="text-gray-600">Şifrenizi değiştirin ve hesabınızı güvende tutun</p>
                            </div>

                            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Mevcut Şifre
                                        </label>
                                        <input
                                            type="password"
                                            {...registerPassword('currentPassword', { required: 'Mevcut şifre gerekli' })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                            placeholder="••••••••"
                                        />
                                        {passwordErrors.currentPassword && (
                                            <p className="mt-2 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Yeni Şifre
                                        </label>
                                        <input
                                            type="password"
                                            {...registerPassword('newPassword', {
                                                required: 'Yeni şifre gerekli',
                                                minLength: { value: 6, message: 'Şifre en az 6 karakter olmalı' }
                                            })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                            placeholder="••••••••"
                                        />
                                        {passwordErrors.newPassword && (
                                            <p className="mt-2 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Yeni Şifre (Tekrar)
                                        </label>
                                        <input
                                            type="password"
                                            {...registerPassword('confirmPassword', { required: 'Şifre tekrarı gerekli' })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                            placeholder="••••••••"
                                        />
                                        {passwordErrors.confirmPassword && (
                                            <p className="mt-2 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={isPasswordSubmitting}
                                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Lock className="w-5 h-5" />
                                        {isPasswordSubmitting ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};