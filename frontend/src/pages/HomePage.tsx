import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ListingService, CategoryStatsResponse } from '../services/listingService';

interface CategoryStats {
  name: string;
  href: string;
  icon: string;
  count: number;
  description: string;
  categorySlug: string;
}

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([
    { name: 'Emlak', href: '/real-estates', icon: '🏠', count: 0, description: 'Ev, daire, villa', categorySlug: 'konut' },
    { name: 'Araçlar', href: '/vehicles', icon: '🚗', count: 0, description: 'Otomobil, motosiklet', categorySlug: 'vasita' },
    { name: 'Arsalar', href: '/lands', icon: '🌾', count: 0, description: 'Tarla, bahçe, arsa', categorySlug: 'arsa' },
    { name: 'İşyerleri', href: '/workplaces', icon: '🏢', count: 0, description: 'Ofis, dükkan, fabrika', categorySlug: 'isyeri' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        setLoading(true);
        const stats = await ListingService.getCategoryStats();

        // Backend'den gelen verileri mevcut kategori bilgileriyle birleştir
        const updatedStats = categoryStats.map(category => {
          const backendStat = stats.find(s => s.categorySlug === category.categorySlug);
          return {
            ...category,
            count: backendStat ? backendStat.count : 0
          };
        });

        setCategoryStats(updatedStats);
      } catch (error) {
        console.error('Error fetching category stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  const formatCount = (count: number): string => {
    return new Intl.NumberFormat('tr-TR').format(count);
  };

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
            Hayalinizdeki Yaşam, <br className="hidden md:block" /> Vesta Güvencesiyle Başlar
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Emlak, araç, arsa ve iş yeri arayışlarınızda güvenilir limanınız. Modern arayüzümüz ve geniş portföyümüzle hayallerinizdeki yatırımı bulmak artık çok daha kolay.
          </p>

          {/* Quick Access to All Listings */}
          <div>
            <Link
              to="/listings"
              className="inline-block bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Tüm İlanları Görüntüle ve Filtrele
            </Link>
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
          {categoryStats.map((category) => (
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
              <p className="text-blue-600 font-medium">
                {loading ? (
                  <span className="inline-block animate-pulse">...</span>
                ) : (
                  `${formatCount(category.count)} ilan`
                )}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 rounded-2xl p-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Neden Vesta?</h2>
          <p className="text-gray-600 text-lg">Güvenilir ve kolay ilan platformu</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🛡️', title: 'Doğrulanmış Güven', description: 'Sahte ilanlarla vakit kaybetmeyin. Tüm ilanlar ekibimiz tarafından titizlikle kontrol edilir.' },
            { icon: '⚡', title: 'Hız ve Kolaylık', description: 'Karmaşık menülerle uğraşmayın. İlan vermek de, aradığınızı bulmak da saniyeler sürer.' },
            { icon: '🌐', title: 'Geniş Portföy', description: 'Konut, araç, arsa ve iş yeri... Yatırım yapabileceğiniz tüm kategoriler tek bir platformda.' },
          ].map((feature, index) => (
            <div key={index} className="text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
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