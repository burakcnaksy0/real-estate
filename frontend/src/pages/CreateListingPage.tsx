import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import {
    Home,
    Car,
    Trees,
    Briefcase,
    Plus,
    ArrowLeft,
    TrendingUp,
    ShieldCheck,
    Zap,
    MousePointerClick,
    CheckCircle2
} from 'lucide-react';

export const CreateListingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    // useCategories aslında burada dinamik kategori çekmek için var ama statik router yapımız olduğu için manuel ilerliyoruz.
    // Yine de hook'u çağırmak cache vs için iyi olabilir.
    const { fetchAll: fetchCategories } = useCategories();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
        fetchCategories();
    }, [isAuthenticated, navigate, fetchCategories]);

    const handleCategorySelect = (slug: string) => {
        switch (slug) {
            case 'emlak':
                navigate('/real-estates/create');
                break;
            case 'arac':
                navigate('/vehicles/create');
                break;
            case 'arsa':
                navigate('/lands/create');
                break;
            case 'isyeri':
                navigate('/workplaces/create');
                break;
            default:
                break;
        }
    };

    const categories = [
        {
            id: 'emlak',
            title: 'Emlak',
            description: 'Daire, Villa, Müstakil Ev',
            icon: Home,
            color: 'blue',
            gradient: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            id: 'arac',
            title: 'Vasıta',
            description: 'Otomobil, SUV, Motosiklet',
            icon: Car,
            color: 'green',
            gradient: 'from-green-500 to-emerald-600',
            bg: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            id: 'arsa',
            title: 'Arsa',
            description: 'Tarla, Bahçe, İmarlı Arsa',
            icon: Trees,
            color: 'amber',
            gradient: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50',
            textColor: 'text-amber-600'
        },
        {
            id: 'isyeri',
            title: 'İşyeri',
            description: 'Ofis, Dükkan, Depo',
            icon: Briefcase,
            color: 'purple',
            gradient: 'from-purple-500 to-fuchsia-600',
            bg: 'bg-purple-50',
            textColor: 'text-purple-600'
        }
    ];

    const benefits = [
        {
            icon: Zap,
            title: 'Hızlı ve Kolay',
            desc: 'Saniyeler içinde ilanınızı oluşturun.'
        },
        {
            icon: TrendingUp,
            title: 'Geniş Kitle',
            desc: 'Binlerce alıcıya anında ulaşın.'
        },
        {
            icon: ShieldCheck,
            title: 'Güvenli',
            desc: 'Doğrulanmış kullanıcılarla alışveriş yapın.'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="group inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hover:shadow-md"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Geri Dön</span>
                </button>

                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gray-900 border border-gray-800 shadow-2xl mb-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <Plus className="w-64 h-64 text-white" />
                    </div>

                    <div className="relative px-8 py-16 md:py-20 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold mb-6">
                                <Zap className="w-4 h-4 text-yellow-400 fill-current" />
                                Hemen Satışa Başlayın
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                İlanınızı Oluşturun ve <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Milyonlara Ulaştırın</span>
                            </h1>
                            <p className="text-lg text-gray-300 md:max-w-xl">
                                Satmak veya kiralamak istediğiniz mülkünüzü, aracınızı veya ürününüzü en doğru kategoride listeleyerek potansiyel alıcılara hemen ulaşın.
                            </p>
                        </div>

                        {/* Quick Stats Grid (Decorative) */}
                        <div className="hidden md:grid grid-cols-2 gap-4 w-full max-w-md opacity-90">
                            {benefits.map((benefit, idx) => (
                                <div key={idx} className={`bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl ${idx === 2 ? 'col-span-2' : ''}`}>
                                    <benefit.icon className="w-8 h-8 text-blue-400 mb-3" />
                                    <h3 className="text-white font-bold mb-1">{benefit.title}</h3>
                                    <p className="text-sm text-gray-400">{benefit.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Category Selection Title */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <MousePointerClick className="w-6 h-6 text-blue-600" />
                        Bir Kategori Seçin
                    </h2>
                    <p className="text-gray-500 mt-2">İlanınıza en uygun kategoriyi seçerek devam edin</p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <button
                                key={category.id}
                                onClick={() => handleCategorySelect(category.id)}
                                className="group relative bg-white rounded-3xl p-1 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-left h-full"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10`}></div>

                                <div className="bg-white rounded-[20px] p-8 h-full flex flex-col relative z-10 border border-gray-100 group-hover:border-transparent transition-colors">
                                    <div className={`w-16 h-16 ${category.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className={`w-8 h-8 ${category.textColor}`} />
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {category.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 flex-1">
                                        {category.description}
                                    </p>

                                    <div className="mt-auto flex items-center text-sm font-semibold text-gray-400 group-hover:text-gray-900 transition-colors">
                                        İlan Ver <ArrowLeft className="w-4 h-4 rotate-180 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Steps Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-gray-900">Nasıl Çalışır?</h2>
                        <p className="text-gray-500 mt-2">Sadece 3 adımda ilanınız yayında</p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-[2.25rem] left-[16%] right-[16%] h-0.5 bg-gray-100">
                            <div className="h-full w-1/2 bg-blue-100"></div>
                            {/* Static progress look */}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="relative flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-blue-600/20 z-10 relative">
                                    1
                                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Kategori Seç</h3>
                                <p className="text-sm text-gray-500 max-w-[200px]">İlanınıza uygun kategoriyi yukarıdan seçerek başlayın.</p>
                            </div>

                            <div className="relative flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center text-xl font-bold mb-4 z-10 bg-gray-50">
                                    2
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Bilgileri Gir</h3>
                                <p className="text-sm text-gray-500 max-w-[200px]">İlan başlığı, fiyatı, özellikleri ve fotoğrafları ekleyin.</p>
                            </div>

                            <div className="relative flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center text-xl font-bold mb-4 z-10 bg-gray-50">
                                    3
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Yayınla</h3>
                                <p className="text-sm text-gray-500 max-w-[200px]">İlanınızı kontrol edin ve anında satışa başlayın.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
