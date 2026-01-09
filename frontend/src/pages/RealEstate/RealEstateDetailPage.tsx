import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Home,
  Ruler,
  Thermometer,
  Building
} from 'lucide-react';
import { useRealEstate } from '../../hooks/useRealEstate';
import { useAuth } from '../../hooks/useAuth';
import { Currency, RealEstateType, HeatingType } from '../../types';

export const RealEstateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRealEstate, isLoading, fetchById, remove } = useRealEstate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      fetchById(Number(id));
    }
  }, [id, fetchById]);

  const handleDelete = async () => {
    if (currentRealEstate && window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      try {
        await remove(currentRealEstate.id);
        navigate('/real-estate');
      } catch (error) {
        console.error('Error deleting real estate:', error);
      }
    }
  };

  const formatPrice = (price: number, currency: Currency) => {
    return `${price.toLocaleString('tr-TR')} ${currency}`;
  };

  const getRealEstateTypeLabel = (type: RealEstateType) => {
    const labels = {
      [RealEstateType.APARTMENT]: 'Daire',
      [RealEstateType.HOUSE]: 'Ev',
      [RealEstateType.VILLA]: 'Villa',
      [RealEstateType.RESIDENCE]: 'Rezidans'
    };
    return labels[type] || type;
  };

  const getHeatingTypeLabel = (type: HeatingType) => {
    const labels = {
      [HeatingType.NATURAL_GAS]: 'Doğalgaz',
      [HeatingType.CENTRAL_HEATING]: 'Merkezi Isıtma',
      [HeatingType.STOVE_HEATING]: 'Soba',
      [HeatingType.AIR_CONDITIONING]: 'Klima'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRealEstate) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🏠</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          İlan bulunamadı
        </h3>
        <p className="text-gray-600 mb-4">
          Aradığınız ilan mevcut değil veya kaldırılmış olabilir.
        </p>
        <Link to="/real-estate" className="btn-primary">
          İlanlara Geri Dön
        </Link>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === currentRealEstate.ownerId;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
        <span>/</span>
        <Link to="/real-estate" className="hover:text-primary-600">Emlak İlanları</Link>
        <span>/</span>
        <span className="text-gray-900">{currentRealEstate.title}</span>
      </nav>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Geri Dön</span>
      </button>

      {/* Image Gallery */}
      <div className="h-64 md:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500 text-lg">Fotoğraf Galerisi (TODO)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Actions */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentRealEstate.title}
              </h1>
              <div className="flex items-center text-gray-600 space-x-4">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {currentRealEstate.city}, {currentRealEstate.district}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(currentRealEstate.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="flex space-x-2">
                <Link
                  to={`/real-estate/${currentRealEstate.id}/edit`}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Düzenle</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn-secondary text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Sil</span>
                </button>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="bg-primary-50 rounded-lg p-6">
            <div className="text-3xl font-bold text-primary-600">
              {formatPrice(currentRealEstate.price, currentRealEstate.currency)}
            </div>
            <div className="text-gray-600 mt-1">
              {getRealEstateTypeLabel(currentRealEstate.realEstateType)} • {currentRealEstate.categorySlug}
            </div>
          </div>

          {/* Property Details */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Emlak Detayları</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Home className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <div className="text-lg font-semibold">{currentRealEstate.roomCount}</div>
                <div className="text-sm text-gray-600">Oda Sayısı</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Ruler className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <div className="text-lg font-semibold">{currentRealEstate.squareMeter}</div>
                <div className="text-sm text-gray-600">m² (Brüt)</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Building className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <div className="text-lg font-semibold">{currentRealEstate.buildingAge}</div>
                <div className="text-sm text-gray-600">Bina Yaşı</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Thermometer className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                <div className="text-lg font-semibold">{currentRealEstate.floor}</div>
                <div className="text-sm text-gray-600">Kat</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Isıtma Tipi:</span>
                <span className="ml-2 text-gray-900">
                  {getHeatingTypeLabel(currentRealEstate.heatingType)}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Eşyalı:</span>
                <span className="ml-2 text-gray-900">
                  {currentRealEstate.furnished ? 'Evet' : 'Hayır'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {currentRealEstate.description && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Açıklama</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {currentRealEstate.description}
              </p>
            </div>
          )}

          {/* Map */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Konum</h2>
            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Harita (TODO)</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">{currentRealEstate.ownerUsername}</span>
              </div>
              
              {isAuthenticated ? (
                <>
                  <button className="w-full btn-primary flex items-center justify-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Telefonu Göster</span>
                  </button>
                  
                  <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Mesaj Gönder</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-3">İletişim bilgilerini görmek için giriş yapın</p>
                  <Link to="/login" className="btn-primary">
                    Giriş Yap
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Özet Bilgiler</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">İlan No:</span>
                <span className="font-medium">#{currentRealEstate.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durum:</span>
                <span className="font-medium capitalize">{currentRealEstate.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Güncellenme:</span>
                <span className="font-medium">
                  {new Date(currentRealEstate.updatedAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

          {/* Similar Listings */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Benzer İlanlar</h3>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Benzer İlan {index + 1}
                    </p>
                    <p className="text-xs text-gray-600">2+1 • 85 m²</p>
                    <p className="text-sm font-semibold text-primary-600">
                      450.000 TL
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};