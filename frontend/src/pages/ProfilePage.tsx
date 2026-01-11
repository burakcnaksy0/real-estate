import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ListingService } from '../services/listingService';
import { UserService } from '../services/userService';
import { FavoriteService } from '../services/favoriteService';
import { BaseListing, Role, UpdateProfileRequest, ChangePasswordRequest, Favorite } from '../types';
import { Link } from 'react-router-dom';
import {
    User, Settings, Lock, Package, Edit2, Trash2, Eye,
    MapPin, Calendar, LogOut, Shield, Phone, Mail, Save, Heart
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { checkAuthStatus } from '../store/slices/authSlice';
import { AppDispatch } from '../store';

export const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const dispatch = useDispatch<AppDispatch>();
    const [activeTab, setActiveTab] = useState<'listings' | 'favorites' | 'profile' | 'security'>('listings');
    const [myListings, setMyListings] = useState<BaseListing[]>([]);
    const [myFavorites, setMyFavorites] = useState<Favorite[]>([]);
    const [loadingListings, setLoadingListings] = useState(false);
    const [loadingFavorites, setLoadingFavorites] = useState(false);

    // Forms
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
            dispatch(checkAuthStatus()); // Refresh user data in store
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

    const getDetailUrl = (listing: BaseListing): string => {
        if (listing.listingType === 'REAL_ESTATE') return `/real-estates/${listing.id}`;
        if (listing.listingType === 'VEHICLE') return `/vehicles/${listing.id}`;
        if (listing.listingType === 'LAND') return `/lands/${listing.id}`;
        if (listing.listingType === 'WORKPLACE') return `/workplaces/${listing.id}`;

        const slug = listing.categorySlug?.toLowerCase();
        switch (slug) {
            case 'konut': case 'emlak': return `/real-estates/${listing.id}`;
            case 'vasita': case 'arac': case 'vehicle': return `/vehicles/${listing.id}`;
            case 'arsa': case 'land': return `/lands/${listing.id}`;
            case 'isyeri': case 'workplace': return `/workplaces/${listing.id}`;
            default: return `/listings/${listing.id}`;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-bold mb-4">Oturum Açmanız Gerekiyor</h2>
                <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Giriş Yap</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 bg-gradient-to-r from-blue-50 to-white border border-blue-100">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold border-4 border-white shadow-lg shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.name} {user.surname}</h1>
                    <p className="text-gray-500 font-medium text-lg">@{user.username}</p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                            <Mail className="w-4 h-4 text-blue-500" />{user.email}
                        </div>
                        {user.phoneNumber && (
                            <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                                <Phone className="w-4 h-4 text-blue-500" />{user.phoneNumber}
                            </div>
                        )}
                        <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                            <Shield className="w-4 h-4 text-green-600" />
                            {user.roles.includes(Role.ROLE_ADMIN) ? 'Yönetici' : 'Bireysel Üye'}
                        </div>
                    </div>
                </div>
                <div className="shrink-0">
                    <button onClick={logout} className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-medium shadow-sm hover:shadow-md">
                        <LogOut className="w-5 h-5" />Çıkış Yap
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-6">
                        <nav className="flex flex-col p-2 space-y-1">
                            <button onClick={() => setActiveTab('listings')} className={`flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all ${activeTab === 'listings' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <Package className="w-5 h-5" /><span>İlanlarım ve Portföy</span>
                            </button>
                            <button onClick={() => setActiveTab('favorites')} className={`flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all ${activeTab === 'favorites' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <Heart className="w-5 h-5" /><span>Favorilerim</span>
                            </button>
                            <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <User className="w-5 h-5" /><span>Profil Bilgileri</span>
                            </button>
                            <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all ${activeTab === 'security' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <Lock className="w-5 h-5" /><span>Şifre ve Güvenlik</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="md:col-span-3">
                    {activeTab === 'listings' && (
                        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[500px]">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                                <div><h2 className="text-xl font-bold text-gray-900">İlanlarım</h2><p className="text-gray-500 text-sm mt-1">Yayınladığınız ve pasife aldığınız tüm ilanlar</p></div>
                            </div>
                            {loadingListings ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div><p className="text-gray-500">İlanlarınız yükleniyor...</p>
                                </div>
                            ) : myListings.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><Package className="w-8 h-8 text-blue-600" /></div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz ilanınız bulunmuyor</h3>
                                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Hemen İlan Ver</Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myListings.map(listing => (
                                        <div key={listing.id} className="flex flex-col sm:flex-row gap-5 p-5 border border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-white group">
                                            <div className="w-full sm:w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-gray-200"><Package className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" /></div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1">{listing.categoryName || listing.listingType}</span>
                                                            <h3 className="text-lg font-bold text-gray-900 truncate pr-2 group-hover:text-blue-600 transition-colors" title={listing.title}>{listing.title}</h3>
                                                        </div>
                                                        <span className={`shrink-0 whitespace-nowrap px-3 py-1 text-xs font-bold rounded-full border ${listing.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : listing.status === 'SOLD' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>{listing.status === 'ACTIVE' ? 'Yayında' : listing.status === 'SOLD' ? 'Satıldı' : 'Pasif'}</span>
                                                    </div>
                                                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500"><span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {listing.city}, {listing.district}</span><span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(listing.createdAt)}</span></div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                    <div className="text-xl font-bold text-blue-700">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: listing.currency }).format(listing.price)}</div>
                                                    <Link to={getDetailUrl(listing)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors"><Eye className="w-4 h-4" /> Görüntüle</Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'favorites' && (
                        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[500px]">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                                <div><h2 className="text-xl font-bold text-gray-900">Favorilerim</h2><p className="text-gray-500 text-sm mt-1">Beğendiğiniz ve kaydettiğiniz ilanlar</p></div>
                            </div>
                            {loadingFavorites ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div><p className="text-gray-500">Favorileriniz yükleniyor...</p>
                                </div>
                            ) : myFavorites.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Heart className="w-8 h-8 text-red-600" /></div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz favori ilanınız yok</h3>
                                    <p className="text-gray-500 mb-4">Beğendiğiniz ilanları favorilere ekleyerek buradan kolayca erişebilirsiniz</p>
                                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">İlanları Keşfet</Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myFavorites.map(favorite => (
                                        <div key={favorite.id} className="flex flex-col sm:flex-row gap-5 p-5 border border-gray-100 rounded-xl hover:border-red-300 hover:shadow-md transition-all bg-white group">
                                            <div className="w-full sm:w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-gray-200"><Heart className="w-10 h-10 text-gray-400 group-hover:text-red-500 transition-colors" /></div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-1">{favorite.listingType}</span>
                                                            <h3 className="text-lg font-bold text-gray-900 truncate pr-2 group-hover:text-red-600 transition-colors" title={favorite.title}>{favorite.title}</h3>
                                                        </div>
                                                        <span className={`shrink-0 whitespace-nowrap px-3 py-1 text-xs font-bold rounded-full border ${favorite.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : favorite.status === 'SOLD' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>{favorite.status === 'ACTIVE' ? 'Yayında' : favorite.status === 'SOLD' ? 'Satıldı' : 'Pasif'}</span>
                                                    </div>
                                                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500"><span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {favorite.city}, {favorite.district}</span><span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(favorite.createdAt)}</span></div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                    <div className="text-xl font-bold text-red-700">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: favorite.currency }).format(favorite.price)}</div>
                                                    <Link to={`/${favorite.listingType.toLowerCase().replace('_', '-')}s/${favorite.listingId}`} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium transition-colors"><Eye className="w-4 h-4" /> Görüntüle</Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                            <div className="border-b border-gray-100 pb-6 mb-8"><h2 className="text-xl font-bold text-gray-900">Profil Bilgileri</h2><p className="text-gray-500 text-sm mt-1">Kişisel bilgilerinizi buradan güncelleyebilirsiniz</p></div>
                            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6 max-w-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Ad</label><input {...registerProfile('name')} type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" /></div>
                                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Soyad</label><input {...registerProfile('surname')} type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" /></div>
                                </div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Kullanıcı Adı</label><div className="relative"><span className="absolute left-4 top-3 text-gray-400">@</span><input type="text" value={user.username} readOnly className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 bg-gray-50 text-gray-500 cursor-not-allowed" /></div></div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-2">E-posta</label><div className="relative"><Mail className="absolute left-4 top-3 w-5 h-5 text-gray-400" /><input {...registerProfile('email')} type="email" className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" /></div></div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Telefon</label><div className="relative"><Phone className="absolute left-4 top-3 w-5 h-5 text-gray-400" /><input {...registerProfile('phoneNumber')} type="tel" className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" /></div></div>
                                <div className="pt-6 flex items-center justify-end border-t border-gray-100">
                                    <button type="submit" disabled={isProfileSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm disabled:opacity-50">
                                        {isProfileSubmitting ? 'Kaydediliyor...' : <><Save className="w-4 h-4" /> Değişiklikleri Kaydet</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                            <div className="border-b border-gray-100 pb-6 mb-8"><h2 className="text-xl font-bold text-gray-900">Şifre ve Güvenlik</h2><p className="text-gray-500 text-sm mt-1">Hesap şifrenizi güncelleyin</p></div>
                            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 max-w-lg">
                                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Mevcut Şifre</label><input {...registerPassword('currentPassword', { required: 'Mevcut şifre gereklidir' })} type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />{passwordErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword.message}</p>}</div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Yeni Şifre</label><input {...registerPassword('newPassword', { required: 'Yeni şifre gereklidir', minLength: { value: 6, message: 'En az 6 karakter olmalı' } })} type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" /><p className="text-xs text-gray-500 mt-1">En az 6 karakter olmalı</p>{passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>}</div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Yeni Şifre (Tekrar)</label><input {...registerPassword('confirmPassword', { required: 'Şifre tekrarı gereklidir' })} type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />{passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>}</div>
                                <div className="pt-6 flex items-center justify-end border-t border-gray-100">
                                    <button type="submit" disabled={isPasswordSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm disabled:opacity-50">
                                        {isPasswordSubmitting ? 'Güncelleniyor...' : <><Lock className="w-4 h-4" /> Şifreyi Güncelle</>}
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
