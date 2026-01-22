import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ListingService } from '../services/listingService';
import {
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Search,
  Star,
  Home,
  Car,
  Map,
  Building2,
  User as UserIcon,
  Check,
  MapPin
} from 'lucide-react';

interface CategoryStats {
  name: string;
  href: string;
  icon: React.ElementType;
  count: number;
  description: string;
  categorySlug: string;
  colorClass: string;
  bgClass: string;
}

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([
    {
      name: 'Emlak',
      href: '/real-estates',
      icon: Home,
      count: 0,
      description: 'Satılık & Kiralık Konutlar',
      categorySlug: 'emlak',
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50'
    },
    {
      name: 'Araçlar',
      href: '/vehicles',
      icon: Car,
      count: 0,
      description: 'Otomobil, SUV & Motosiklet',
      categorySlug: 'arac',
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-50'
    },
    {
      name: 'Arsalar',
      href: '/lands',
      icon: Map,
      count: 0,
      description: 'Yatırımlık Arsa & Tarlalar',
      categorySlug: 'arsa',
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50'
    },
    {
      name: 'İşyerleri',
      href: '/workplaces',
      icon: Building2,
      count: 0,
      description: 'Ofis, Dükkan & Depo',
      categorySlug: 'isyeri',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const formatCount = (count: number): string => {
    return new Intl.NumberFormat('tr-TR', { notation: "compact", compactDisplay: "short" }).format(count);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <div className="relative h-[600px] lg:h-[700px] flex items-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent opacity-90" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 backdrop-blur-md border border-blue-400/30 text-blue-100 text-sm font-medium mb-6 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Türkiye'nin Yeni Nesil İlan Platformu</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-sm">
              {isAuthenticated && user ? (
                <>
                  Tekrar Hoş Geldin, <span className="text-blue-300">{user.name}</span>.<br />
                  <span className="text-2xl lg:text-4xl font-normal text-gray-200 mt-2 block">Bugün ne arıyorsun?</span>
                </>
              ) : (
                <>
                  Hayallerinizdeki <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">Yaşamı</span><br />
                  Keşfetmeye Başlayın
                </>
              )}
            </h1>

            <p className="text-lg text-gray-200 mb-10 max-w-xl mx-auto leading-relaxed">
              Binlerce emlak, vasıta ve arsa ilanı arasından size en uygun olanı güvenle bulun. Vesta ile ilan vermek de aramak da çok kolay.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white rounded-2xl shadow-xl p-2 transition-all focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:scale-[1.01]">
                <div className="pl-4 text-gray-400">
                  <Search className="w-6 h-6" />
                </div>
                <input
                  type="text"
                  placeholder="Nereyi veya neyi arıyorsunuz? (Örn: Kadıköy Satılık Daire)"
                  className="w-full px-4 py-3 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
                >
                  Ara
                </button>
              </div>
            </form>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-200 font-medium">
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Doğrulanmış İlanlar</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Güvenli Ödeme</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> 7/24 Destek</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section (Floating) */}
      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-10">
          {[
            { label: 'Aktif İlan', value: '15k+', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Mutlu Müşteri', value: '45k+', icon: UserIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Şehir', value: '81', icon: MapPin, color: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Yıllık Deneyim', value: '10+', icon: Shield, color: 'text-green-500', bg: 'bg-green-50' },
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</span>
              <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">Kategoriler</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Neler Keşfetmek İstersiniz?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              İhtiyacınız olan her türlü ilan kategorisine kolayca ulaşın. En popüler kategorilerimizi sizin için derledik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryStats.map((category) => (
              <Link
                to={category.href}
                key={category.name}
                className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.bgClass} opacity-50 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-150`}></div>

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10 ${category.bgClass} ${category.colorClass}`}>
                  <category.icon className="w-8 h-8" />
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="bg-gray-50 px-3 py-1 rounded-full text-xs font-semibold text-gray-600 border border-gray-100">
                      {loading ? '...' : formatCount(category.count)} İlan
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 rounded-l-full blur-3xl opacity-60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Happy Family"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                      <Star className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Müşteri Memnuniyeti</p>
                      <p className="text-sm text-gray-600">Binlerce mutlu müşteri Vesta'yı tercih ediyor.</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
            </div>

            <div className="w-full lg:w-1/2">
              <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">Neden Vesta?</span>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                İlan Vermenin ve Aramanın <br />
                <span className="text-blue-600">En Kolay Yolu</span>
              </h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                Vesta, gelişmiş filtreleme seçenekleri, güvenli mesajlaşma altyapısı ve kullanıcı dostu arayüzü ile aradığınızı bulmanızı kolaylaştırır.
              </p>

              <div className="space-y-6">
                {[
                  { title: 'Güvenli Altyapı', desc: 'Tüm verileriniz 256-bit SSL şifreleme ile korunur.', icon: Shield },
                  { title: 'Hızlı İşlem', desc: 'İlanlarınızı saniyeler içinde oluşturun ve yayınlayın.', icon: Zap },
                  { title: 'Global Erişim', desc: 'İlanlarınız 81 ilde milyonlarca kullanıcıya ulaşsın.', icon: Globe },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-500 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link to="/register" className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold transition-all hover:shadow-lg hover:-translate-y-1">
                  Hemen Başla <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">İlan Vermeye Hazır mısın?</h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
            Evinizi, arabanızı veya arsanızı satmak artık çok kolay. Ücretsiz üye olun ve ilanınızı hemen yayınlayın.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/create" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20">
              Ücretsiz İlan Ver
            </Link>
            <Link to="/listings" className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors border border-blue-500">
              İlanları İncele
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};