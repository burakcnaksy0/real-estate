import React from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Settings,
  TrendingUp,
  Eye,
  Package,
  Award,
  Edit2,
  Shield,
  LogOut,
  MapPin,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <User className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Kullanıcı bilgileri yükleniyor</h3>
          <p className="text-gray-500">Lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Aktif İlan',
      value: '0',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      label: 'Satılan İlan',
      value: '0',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100'
    },
    {
      label: 'Görüntülenme',
      value: '0',
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100'
    },
    {
      label: 'Başarı Puanı',
      value: '100',
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100'
    }
  ];

  const getRoleBadgeColor = (role: string) => {
    const roleMap: Record<string, string> = {
      'ROLE_ADMIN': 'bg-red-100 text-red-700 border-red-200',
      'ROLE_USER': 'bg-blue-100 text-blue-700 border-blue-200',
      'ROLE_MODERATOR': 'bg-green-100 text-green-700 border-green-200'
    };
    return roleMap[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          </div>

          {/* Profile Content */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6 gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-white flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 text-4xl font-bold">
                    {user.name?.charAt(0).toUpperCase()}{user.surname?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {user.name} {user.surname}
                </h1>
                <p className="text-gray-500 font-medium mb-3">@{user.username}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {user.roles.map((role, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(role)}`}
                    >
                      <Shield className="w-3 h-3" />
                      {role.replace('ROLE_', '')}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Doğrulanmış Hesap
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/10 active:scale-95">
                  <Settings className="w-4 h-4" />
                  Ayarlar
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 hover:border-red-100 transition-all active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
                    <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-0.5">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Kişisel Bilgiler
                </h2>
                <button className="text-blue-600 text-sm font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  Düzenle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-500">Ad Soyad</label>
                  <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {user.name} {user.surname}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-500">Kullanıcı Adı</label>
                  <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    @{user.username}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-500">E-posta Adresi</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-gray-900">{user.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-500">Telefon Numarası</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-gray-900">{user.phoneNumber || '-'}</span>
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-500">Üyelik Tarihi</label>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            {/* Account Status Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Shield className="w-32 h-32" />
              </div>
              <h3 className="text-lg font-bold mb-4 relative z-10">Hesap Güvenliği</h3>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <span className="text-sm font-medium">E-posta Doğrulama</span>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <span className="text-sm font-medium">Telefon Doğrulama</span>
                  {user.phoneNumber ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <span className="text-xs bg-yellow-400/20 text-yellow-200 px-2 py-1 rounded">Eksik</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Hızlı İşlemler</h3>
              <div className="space-y-3">
                <Link to="/create-listing" className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-2xl group transition-colors border border-gray-100 hover:border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-blue-700">Yeni İlan Ver</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-blue-600 shadow-sm">
                    →
                  </div>
                </Link>

                <Link to="/messages" className="flex items-center justify-between p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl group transition-colors border border-gray-100 hover:border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-purple-600 group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-purple-700">Mesajlarım</span>
                  </div>
                </Link>

                <Link to="/favorites" className="flex items-center justify-between p-4 bg-gray-50 hover:bg-red-50 rounded-2xl group transition-colors border border-gray-100 hover:border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-red-600 group-hover:scale-110 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-red-700">Favorilerim</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};