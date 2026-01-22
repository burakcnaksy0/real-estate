import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ListingService } from '../services/listingService';
import { UserService } from '../services/userService';
import { FavoriteService } from '../services/favoriteService';
import { BaseListing, Role, UpdateProfileRequest, ChangePasswordRequest, Favorite } from '../types';
import { Link } from 'react-router-dom';
import {
    User, Settings, Lock, Package, Edit2, Eye,
    MapPin, Calendar, LogOut, Shield, Phone, Mail, Save, Heart,
    TrendingUp, CheckCircle, XCircle, Clock, Star, Award as AwardIcon,
    Home, Car, Trees, Briefcase, ArrowRight
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
        const listingId = 'listingId' in listing ? listing.listingId : listing.id;

        if (listing.listingType === 'REAL_ESTATE') return `/real-estates/${listingId}`;
        if (listing.listingType === 'VEHICLE') return `/vehicles/${listingId}`;
        if (listing.listingType === 'LAND') return `/lands/${listingId}`;
        if (listing.listingType === 'WORKPLACE') return `/workplaces/${listingId}`;

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

    const getCategoryIcon = (slug?: string) => {
        const s = slug?.toLowerCase() || '';
        if (s === 'emlak' || s === 'konut' || s === 'real_estate') return <Home className="w-4 h-4" />;
        if (s === 'arac' || s === 'vasita' || s === 'vehicle') return <Car className="w-4 h-4" />;
        if (s === 'arsa' || s === 'land') return <Trees className="w-4 h-4" />;
        if (s === 'isyeri' || s === 'workplace') return <Briefcase className="w-4 h-4" />;
        return <Package className="w-4 h-4" />;
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency }).format(price);
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
        <div className="min-h-screen bg-gray-50/50 py-8 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Modern Hero Header */}
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

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
                                                dispatch(setUser(updatedUser));
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
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 p-6 flex items-center justify-between group">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Toplam İlan</p>
                            <p className="text-3xl font-bold text-gray-900">{myListings.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 p-6 flex items-center justify-between group">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Aktif İlan</p>
                            <p className="text-3xl font-bold text-gray-900">{activeListings}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 p-6 flex items-center justify-between group">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Favori İlan</p>
                            <p className="text-3xl font-bold text-gray-900">{myFavorites.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Heart className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 p-6 flex items-center justify-between group">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Satılan</p>
                            <p className="text-3xl font-bold text-gray-900">{soldListings}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <XCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Modern Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-6 overflow-hidden">
                            <div className="p-3 space-y-2">
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
                                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold ${isActive
                                                ? `bg-${tab.color}-50 text-${tab.color}-700 ring-1 ring-${tab.color}-200`
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? '' : 'text-gray-400'}`} />
                                            <span>{tab.label}</span>
                                            {isActive && <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-${tab.color}-500`}></div>}
                                        </button>
                                    );
                                })}

                                {user?.roles?.includes(Role.ROLE_ADMIN) && (
                                    <>
                                        <div className="my-2 border-t border-gray-100"></div>
                                        <Link
                                            to="/admin"
                                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-gray-700 hover:bg-gray-50"
                                        >
                                            <Shield className="w-5 h-5 text-gray-400" />
                                            <span>Admin Paneli</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        {activeTab === 'listings' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">İlanlarım ({myListings.length})</h2>
                                    <Link
                                        to="/create"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors"
                                    >
                                        <Package className="w-4 h-4" />
                                        Yeni İlan Ekle
                                    </Link>
                                </div>

                                {loadingListings ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
                                        ))}
                                    </div>
                                ) : myListings.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Henüz ilanınız yok</h3>
                                        <p className="text-gray-500 mb-6">Satmak veya kiralamak istediğiniz mülkleri hemen ekleyin.</p>
                                        <Link to="/create" className="text-blue-600 font-semibold hover:underline">Hemen İlan Ver →</Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {myListings.map(listing => (
                                            <Link
                                                key={listing.id}
                                                to={getDetailUrl(listing)}
                                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-[380px] relative"
                                            >
                                                <div className="relative h-48 overflow-hidden bg-gray-100">
                                                    <div className="absolute top-3 right-3 z-20">
                                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm border border-white/20 text-white ${listing.status === 'ACTIVE' ? 'bg-green-500' :
                                                                listing.status === 'SOLD' ? 'bg-red-500' : 'bg-gray-500'
                                                            }`}>
                                                            {listing.status === 'ACTIVE' ? 'Aktif' : listing.status === 'SOLD' ? 'Satıldı' : 'Pasif'}
                                                        </span>
                                                    </div>

                                                    {listing.imageUrl ? (
                                                        <img
                                                            src={`http://localhost:8080${listing.imageUrl}?t=${Date.now()}`}
                                                            alt={listing.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.parentElement?.querySelector('.placeholder')?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`placeholder w-full h-full flex items-center justify-center bg-gray-50 ${listing.imageUrl ? 'hidden' : ''}`}>
                                                        <Package className="w-10 h-10 text-gray-300" />
                                                    </div>

                                                    <div className="absolute bottom-3 left-3 z-20">
                                                        <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm flex items-center gap-1">
                                                            {getCategoryIcon(listing.categorySlug)}
                                                            {listing.categoryName || 'İlan'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-4 flex-1 flex flex-col">
                                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1" title={listing.title}>
                                                        {listing.title}
                                                    </h3>
                                                    <div className="flex items-center text-gray-500 text-xs mb-3">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {listing.city}, {listing.district}
                                                    </div>

                                                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-0.5">Fiyat</p>
                                                            <p className="text-lg font-bold text-blue-600">
                                                                {formatPrice(listing.price, listing.currency)}
                                                            </p>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'favorites' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">Favorilerim ({myFavorites.length})</h2>
                                </div>

                                {loadingFavorites ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100"></div>
                                        ))}
                                    </div>
                                ) : myFavorites.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Heart className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Favori ilanınız yok</h3>
                                        <p className="text-gray-500 mb-6">Beğendiğiniz ilanları kaydederek daha sonra inceleyebilirsiniz.</p>
                                        <Link to="/listings" className="text-blue-600 font-semibold hover:underline">İlanları Keşfet →</Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {myFavorites.map(favorite => (
                                            <Link
                                                key={favorite.id}
                                                to={getDetailUrl(favorite)}
                                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-[380px] relative"
                                            >
                                                <div className="relative h-48 overflow-hidden bg-gray-100">
                                                    <div className="absolute top-3 right-3 z-20">
                                                        <div className="p-1.5 bg-white rounded-full shadow-sm text-red-500">
                                                            <Heart className="w-4 h-4 fill-current" />
                                                        </div>
                                                    </div>

                                                    {favorite.imageUrl ? (
                                                        <img
                                                            src={`http://localhost:8080${favorite.imageUrl}?t=${Date.now()}`}
                                                            alt={favorite.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.parentElement?.querySelector('.placeholder')?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`placeholder w-full h-full flex items-center justify-center bg-gray-50 ${favorite.imageUrl ? 'hidden' : ''}`}>
                                                        <Heart className="w-10 h-10 text-gray-300" />
                                                    </div>

                                                    <div className="absolute bottom-3 left-3 z-20">
                                                        <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm flex items-center gap-1">
                                                            {getCategoryIcon(favorite.listingType)}
                                                            {favorite.listingType}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-4 flex-1 flex flex-col">
                                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1 mb-1" title={favorite.title}>
                                                        {favorite.title}
                                                    </h3>
                                                    <div className="flex items-center text-gray-500 text-xs mb-3">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {favorite.city}, {favorite.district}
                                                    </div>

                                                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-0.5">Fiyat</p>
                                                            <p className="text-lg font-bold text-red-600">
                                                                {formatPrice(favorite.price, favorite.currency)}
                                                            </p>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="mb-8 border-b border-gray-100 pb-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Profil Bilgileri</h2>
                                    <p className="text-gray-500">Kişisel bilgilerinizi buradan güncelleyebilirsiniz.</p>
                                </div>

                                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Ad</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    {...registerProfile('name')}
                                                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                                    placeholder="Adınız"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Soyad</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    {...registerProfile('surname')}
                                                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                                    placeholder="Soyadınız"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">E-posta</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Mail className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="email"
                                                    {...registerProfile('email')}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                                    placeholder="ornek@email.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Telefon</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    {...registerProfile('phoneNumber')}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                                    placeholder="+90 555 123 45 67"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <button
                                            type="submit"
                                            disabled={isProfileSubmitting}
                                            className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save className="w-5 h-5" />
                                            {isProfileSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="mb-8 border-b border-gray-100 pb-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Güvenlik Ayarları</h2>
                                    <p className="text-gray-600">Şifrenizi değiştirerek hesabınızı güvence altına alın.</p>
                                </div>

                                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 max-w-2xl">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Mevcut Şifre</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="password"
                                                    {...registerPassword('currentPassword', { required: 'Mevcut şifre gerekli' })}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            {passwordErrors.currentPassword && (
                                                <p className="text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Yeni Şifre</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="password"
                                                    {...registerPassword('newPassword', {
                                                        required: 'Yeni şifre gerekli',
                                                        minLength: { value: 6, message: 'Şifre en az 6 karakter olmalı' }
                                                    })}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            {passwordErrors.newPassword && (
                                                <p className="text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Yeni Şifre (Tekrar)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="password"
                                                    {...registerPassword('confirmPassword', { required: 'Şifre tekrarı gerekli' })}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            {passwordErrors.confirmPassword && (
                                                <p className="text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-start pt-6">
                                        <button
                                            type="submit"
                                            disabled={isPasswordSubmitting}
                                            className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Lock className="w-5 h-5" />
                                            {isPasswordSubmitting ? 'Değiştiriliyor...' : 'Şifreyi Güncelle'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};