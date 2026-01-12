import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ListingService } from '../services/listingService';
import { Sparkles, TrendingUp, Shield, Zap, Globe, ArrowRight, Search, Star } from 'lucide-react';

interface CategoryStats {
  name: string;
  href: string;
  icon: string;
  count: number;
  description: string;
  categorySlug: string;
  gradient: string;
}

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([
    { 
      name: 'Emlak', 
      href: '/real-estates', 
      icon: '🏠', 
      count: 0, 
      description: 'Ev, daire, villa', 
      categorySlug: 'konut',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      name: 'Araçlar', 
      href: '/vehicles', 
      icon: '🚗', 
      count: 0, 
      description: 'Otomobil, motosiklet', 
      categorySlug: 'vasita',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      name: 'Arsalar', 
      href: '/lands', 
      icon: '🌾', 
      count: 0, 
      description: 'Tarla, bahçe, arsa', 
      categorySlug: 'arsa',
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      name: 'İşyerleri', 
      href: '/workplaces', 
      icon: '🏢', 
      count: 0, 
      description: 'Ofis, dükkan, fabrika', 
      categorySlug: 'isyeri',
      gradient: 'from-orange-500 to-red-500'
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        setLoading(true);
        const stats = await ListingService.getCategoryStats();

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
    <div className="space-y-24 overflow-hidden">
      {/* Welcome Message for Authenticated Users */}
      {isAuthenticated && user && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
          <div className="relative bg-white/60 backdrop-blur-xl border border-emerald-200/50 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                    Hoş geldiniz, {user.name && user.surname ? `${user.name} ${user.surname}` : user.username}!
                  </h3>
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="text-slate-600 text-lg">
                  İlan vermek için hazır mısınız? Hemen başlayın!
                </p>
              </div>
              <Link
                to="/create"
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                İlan Ver
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative text-center py-24 px-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/50 rounded-full px-5 py-2 mb-8">
            <Star className="h-4 w-4 text-blue-600 fill-blue-600" />
            <span className="text-sm font-semibold text-slate-700">Türkiye'nin En Güvenilir Platformu</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Hayalinizdeki Yaşam,
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Vesta Güvencesiyle Başlar
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Emlak, araç, arsa ve iş yeri arayışlarınızda güvenilir limanınız. Modern arayüzümüz ve geniş portföyümüzle 
            hayallerinizdeki yatırımı bulmak artık <span className="font-semibold text-slate-800">çok daha kolay</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/listings"
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-5 px-10 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              <Search className="h-5 w-5" />
              Tüm İlanları Keşfet
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-semibold py-5 px-10 rounded-2xl shadow-xl border border-slate-200 transition-all duration-200 hover:scale-105"
              >
                Ücretsiz Kayıt Ol
                <Sparkles className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-50 rounded-full px-5 py-2 mb-4">
            <TrendingUp className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">Popüler Kategoriler</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Ne Arıyorsunuz?
          </h2>
          <p className="text-slate-600 text-xl max-w-2xl mx-auto">
            İhtiyacınıza uygun kategoriyi seçin ve binlerce ilan arasından size en uygun olanı bulun
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryStats.map((category, index) => (
            <Link
              key={category.name}
              to={category.href}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative p-8">
                <div className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-900 group-hover:to-slate-600 transition-all">
                  {category.name}
                </h3>
                
                <p className="text-slate-500 mb-4 text-sm">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <p className={`font-bold text-lg bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent`}>
                    {loading ? (
                      <span className="inline-block animate-pulse">...</span>
                    ) : (
                      `${formatCount(category.count)} ilan`
                    )}
                  </p>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white rounded-3xl"></div>
        
        <div className="relative py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full px-5 py-2 mb-4">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Neden Vesta?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Güvenli ve Kolay İlan Platformu
            </h2>
            <p className="text-slate-600 text-xl max-w-2xl mx-auto">
              Size en iyi deneyimi sunmak için tasarlandı
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Shield, 
                title: 'Doğrulanmış Güven', 
                description: 'Sahte ilanlarla vakit kaybetmeyin. Tüm ilanlar ekibimiz tarafından titizlikle kontrol edilir.',
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-50 to-cyan-50'
              },
              { 
                icon: Zap, 
                title: 'Hız ve Kolaylık', 
                description: 'Karmaşık menülerle uğraşmayın. İlan vermek de, aradığınızı bulmak da saniyeler sürer.',
                gradient: 'from-purple-500 to-pink-500',
                bgGradient: 'from-purple-50 to-pink-50'
              },
              { 
                icon: Globe, 
                title: 'Geniş Portföy', 
                description: 'Konut, araç, arsa ve iş yeri... Yatırım yapabileceğiniz tüm kategoriler tek bir platformda.',
                gradient: 'from-green-500 to-emerald-500',
                bgGradient: 'from-green-50 to-emerald-50'
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-slate-100"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`}></div>
                
                <div className="relative">
                  <div className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative text-center py-20 px-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">Başlamak İçin Hazır Mısınız?</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {isAuthenticated ? 'İlanınızı Hemen Verin' : 'Üye Olun ve İlan Verin'}
          </h2>
          
          <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            {isAuthenticated
              ? 'Mülkünüzü satmak veya kiralamak mı istiyorsunuz? Ücretsiz ilan vererek binlerce potansiyel alıcıya ulaşın.'
              : 'Ücretsiz üye olun ve mülkünüzü satmak veya kiralamak için ilan verin. Binlerce potansiyel alıcıya ulaşın.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/create"
                className="group inline-flex items-center gap-3 bg-white text-blue-600 hover:bg-blue-50 font-bold py-5 px-10 rounded-2xl shadow-2xl transition-all duration-200 hover:scale-105"
              >
                <Sparkles className="h-5 w-5" />
                İlan Ver
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-3 bg-white text-blue-600 hover:bg-blue-50 font-bold py-5 px-10 rounded-2xl shadow-2xl transition-all duration-200 hover:scale-105"
                >
                  <Sparkles className="h-5 w-5" />
                  Ücretsiz Kayıt Ol
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-5 px-10 rounded-2xl border border-white/30 transition-all duration-200 hover:scale-105"
                >
                  Giriş Yap
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};