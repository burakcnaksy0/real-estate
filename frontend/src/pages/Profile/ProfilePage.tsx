import React from 'react';
import { User, Mail, Phone, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Kullanıcı bilgileri yüklenemedi
        </h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
        <button className="btn-secondary flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Düzenle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Kişisel Bilgiler</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Ad Soyad</p>
                  <p className="font-medium">{user.name} {user.surname}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Kullanıcı Adı</p>
                  <p className="font-medium">{user.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">E-posta</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              {user.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Telefon</p>
                    <p className="font-medium">{user.phoneNumber}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Üyelik Tarihi</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">0</div>
                <div className="text-sm text-gray-600">Aktif İlan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Satılan İlan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Toplam Görüntülenme</div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Roller</h3>
            <div className="space-y-2">
              {user.roles.map((role, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                >
                  {role.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};