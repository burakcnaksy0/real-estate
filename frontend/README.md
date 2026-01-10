# Vesta Frontend

Bu proje, Spring Boot backend'i ile %100 uyumlu React frontend uygulamasıdır.

## 🚀 Özellikler

### 🏗️ **Mimari**
- **React 18** + **TypeScript**
- **Redux Toolkit** (State Management)
- **React Router v6** (Routing)
- **React Hook Form** + **Yup** (Form Management & Validation)
- **Axios** (HTTP Client)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)

### 🔐 **Authentication**
- JWT tabanlı kimlik doğrulama
- Otomatik token yenileme
- Role-based access control (RBAC)
- Protected routes

### 📱 **Responsive Design**
- Mobile-first yaklaşım
- Tablet ve desktop uyumlu
- Modern UI/UX tasarım

### 🏠 **İlan Yönetimi**
- Emlak, araç, arsa ve işyeri ilanları
- Gelişmiş filtreleme ve arama
- Sayfalama (pagination)
- CRUD operasyonları

## 🛠️ **Kurulum**

### Gereksinimler
- Node.js 16+
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Environment dosyasını oluşturun:**
```bash
cp .env.example .env
```

3. **Backend URL'ini ayarlayın:**
```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

4. **Uygulamayı başlatın:**
```bash
npm start
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 📁 **Proje Yapısı**

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── Layout/         # Layout bileşenleri (Header, Footer)
│   └── ProtectedRoute.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useRealEstate.ts
│   └── useCategories.ts
├── pages/              # Sayfa bileşenleri
│   ├── Auth/           # Giriş/Kayıt sayfaları
│   ├── RealEstate/     # Emlak sayfaları
│   ├── Vehicle/        # Araç sayfaları
│   └── Profile/        # Profil sayfaları
├── services/           # API servisleri
│   ├── api.ts          # Axios konfigürasyonu
│   ├── authService.ts  # Authentication servisi
│   └── realEstateService.ts
├── store/              # Redux store
│   ├── slices/         # Redux slices
│   └── index.ts
├── types/              # TypeScript tip tanımları
└── App.tsx             # Ana uygulama bileşeni
```

## 🔌 **API Entegrasyonu**

### Backend Uyumluluğu
Frontend, Spring Boot backend'inin tüm endpoint'leri ile tam uyumludur:

- **Authentication:** `/api/auth/*`
- **Categories:** `/api/categories/*`
- **Real Estate:** `/api/realestates/*`
- **Vehicles:** `/api/vehicles/*`
- **Lands:** `/api/lands/*`
- **Workplaces:** `/api/workplaces/*`

### Request/Response Tipleri
Backend'deki DTO'lar ile birebir eşleşen TypeScript tipleri:

```typescript
// Backend: RealEstateCreateRequest.java
interface RealEstateCreateRequest {
  title: string;
  description?: string;
  price: number;
  currency: Currency;
  // ... diğer alanlar
}
```

## 🎨 **Styling**

### Tailwind CSS
- Utility-first CSS framework
- Responsive design
- Custom color palette
- Component classes

### Tema Renkleri
```css
primary: {
  50: '#eff6ff',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
}
```

## 🔒 **Güvenlik**

### Authentication
- JWT token localStorage'da saklanır
- Otomatik token geçerlilik kontrolü
- Expired token'larda otomatik logout

### API Security
- Request interceptor ile otomatik token ekleme
- Response interceptor ile error handling
- CORS desteği

## 📱 **Responsive Breakpoints**

```css
sm: '640px'   # Küçük tablet
md: '768px'   # Tablet
lg: '1024px'  # Küçük desktop
xl: '1280px'  # Desktop
```

## 🧪 **Test**

```bash
# Unit testleri çalıştır
npm test

# Coverage raporu
npm run test:coverage
```

## 🚀 **Production Build**

```bash
# Production build oluştur
npm run build

# Build'i serve et
npm install -g serve
serve -s build
```

## 🔧 **Geliştirme**

### Yeni Sayfa Ekleme
1. `src/pages/` altında yeni klasör oluşturun
2. Component'i oluşturun
3. `App.tsx`'e route ekleyin
4. Gerekirse store slice'ı ekleyin

### Yeni API Service Ekleme
1. `src/services/` altında service dosyası oluşturun
2. `api.ts`'deki generic metodları kullanın
3. TypeScript tiplerini `types/index.ts`'e ekleyin

### State Management
Redux Toolkit kullanılır:
- Async thunks ile API çağrıları
- Slice'lar ile state yönetimi
- Custom hooks ile component entegrasyonu

## 🐛 **Hata Ayıklama**

### Yaygın Sorunlar

1. **CORS Hatası:**
   - Backend'de CORS konfigürasyonunu kontrol edin
   - `SecurityConfig.java`'da `corsConfigurationSource` ayarları

2. **Authentication Hatası:**
   - JWT token'ın geçerliliğini kontrol edin
   - Backend'de token validation ayarları

3. **API Endpoint Hatası:**
   - Backend'in çalıştığından emin olun
   - URL'lerin doğru olduğunu kontrol edin

## 📚 **Daha Fazla Bilgi**

- [React Documentation](https://reactjs.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/)

## 🤝 **Katkıda Bulunma**

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 **Lisans**

Bu proje MIT lisansı altında lisanslanmıştır.