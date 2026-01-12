import React from 'react';
import { User, Mail, Phone, Calendar, Settings, TrendingUp, Eye, Package, Award, Edit2, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Kullanıcı bilgileri yüklenemedi
          </h3>
          <p className="text-gray-600">Lütfen daha sonra tekrar deneyin.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Aktif İlan',
      value: '0',
      icon: Package,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Satılan İlan',
      value: '0',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      label: 'Toplam Görüntülenme',
      value: '0',
      icon: Eye,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'Başarı Puanı',
      value: '100',
      icon: Award,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  const getRoleBadgeColor = (role: string) => {
    const roleMap: Record<string, string> = {
      'ROLE_ADMIN': 'bg-gradient-to-r from-red-500 to-pink-500',
      'ROLE_USER': 'bg-gradient-to-r from-blue-500 to-indigo-500',
      'ROLE_MODERATOR': 'bg-gradient-to-r from-green-500 to-emerald-500'
    };
    return roleMap[role] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Cover */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-8 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white p-1 shadow-xl">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                  {user.name?.charAt(0).toUpperCase()}{user.surname?.charAt(0).toUpperCase()}
                </div>
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <Edit2 className="h-4 w-4 text-gray-700" />
              </button>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {user.name} {user.surname}
              </h1>
              <p className="text-blue-100 text-lg mb-3">@{user.username}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {user.roles.map((role, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center space-x-1 px-3 py-1 ${getRoleBadgeColor(role)} text-white text-sm font-semibold rounded-full shadow-lg`}
                  >
                    <Shield className="h-3 w-3" />
                    <span>{role.replace('ROLE_', '')}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Edit Button */}
            <button className="bg-white/20 backdrop-blur-lg hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg border border-white/30">
              <Settings className="h-5 w-5" />
              <span>Profili Düzenle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} rounded-xl p-3 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
              <div className={`h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Kişisel Bilgiler</h2>
              <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1 hover:underline">
                <Edit2 className="h-4 w-4" />
                <span>Düzenle</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="bg-blue-100 rounded-lg p-3">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Ad Soyad</p>
                  <p className="text-lg font-semibold text-gray-900">{user.name} {user.surname}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="bg-purple-100 rounded-lg p-3">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Kullanıcı Adı</p>
                  <p className="text-lg font-semibold text-gray-900">@{user.username}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="bg-green-100 rounded-lg p-3">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">E-posta</p>
                  <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                </div>
              </div>

              {user.phoneNumber && (
                <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                  <div className="bg-orange-100 rounded-lg p-3">
                    <Phone className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Telefon</p>
                    <p className="text-lg font-semibold text-gray-900">{user.phoneNumber}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="bg-pink-100 rounded-lg p-3">
                  <Calendar className="h-6 w-6 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Üyelik Tarihi</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Hesap Durumu</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Durum</span>
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Aktif</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Doğrulama</span>
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">Onaylı</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Hızlı İşlemler</h3>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                İlan Ver
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200">
                Mesajlarım
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200">
                Favorilerim
              </button>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Son Aktivite</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">Hesap oluşturuldu</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(user.createdAt, 'short')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};