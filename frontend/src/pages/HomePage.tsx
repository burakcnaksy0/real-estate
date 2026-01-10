import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-16">
      {/* Welcome Message for Authenticated Users */}
      {isAuthenticated && user && (
        <section className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Hoş geldiniz, {user.name && user.surname ? `${user.name} ${user.surname}` : user.username}!
              </h3>
              <p className="text-green-700">
                İlan vermek için hazır mısınız? Hemen başlayın!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Hayalinizdeki Mülkü Bulun
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Emlak, araç, arsa ve işyeri ilanlarında Türkiye'nin en güvenilir platformu
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow-lg">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Ne arıyorsunuz?"
                  className="w-full px-4 py-3 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <select className="w-full px-4 py-3 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Kategori Seçin</option>
                  <option value="emlak">Emlak</option>
                  <option value="arac">Araç</option>
                  <option value="arsa">Arsa</option>
                  <option value="isyeri">İşyeri</option>
                </select>
              </div>
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200">
                Ara
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategoriler</h2>
          <p className="text-gray-600 text-lg">Aradığınız kategoriyi seçin</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Emlak', href: '/real-estate', icon: '🏠', count: '5,234', description: 'Ev, daire, villa' },
            { name: 'Araçlar', href: '/vehicles', icon: '🚗', count: '3,456', description: 'Otomobil, motosiklet' },
            { name: 'Arsalar', href: '/lands', icon: '🌾', count: '1,234', description: 'Tarla, bahçe, arsa' },
            { name: 'İşyerleri', href: '/workplaces', icon: '🏢', count: '567', description: 'Ofis, dükkan, fabrika' },
          ].map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 group text-center"
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                {category.name}
              </h3>
              <p className="text-gray-500 text-sm mb-2">{category.description}</p>
              <p className="text-blue-600 font-medium">{category.count} ilan</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 rounded-2xl p-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Neden RealEstate?</h2>
          <p className="text-gray-600 text-lg">Güvenilir ve kolay ilan platformu</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🔒', title: 'Güvenli', description: 'Tüm ilanlar doğrulanır' },
            { icon: '⚡', title: 'Hızlı', description: 'Anında ilan yayınlama' },
            { icon: '📱', title: 'Kolay', description: 'Kullanıcı dostu arayüz' },
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-blue-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {isAuthenticated ? 'İlanınızı Hemen Verin' : 'Üye Olun ve İlan Verin'}
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          {isAuthenticated
            ? 'Mülkünüzü satmak veya kiralamak mı istiyorsunuz? Ücretsiz ilan vererek binlerce potansiyel alıcıya ulaşın.'
            : 'Ücretsiz üye olun ve mülkünüzü satmak veya kiralamak için ilan verin. Binlerce potansiyel alıcıya ulaşın.'
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Link
                to="/create"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
              >
                İlan Ver
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Ücretsiz Kayıt Ol
              </Link>
              <Link
                to="/login"
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Giriş Yap
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
};