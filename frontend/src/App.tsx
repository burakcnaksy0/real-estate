import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { checkAuthStatus } from './store/slices/authSlice';

// Layout Components
import { Layout } from './components/Layout/Layout';

// Page Components
import { HomePage } from './pages/HomePage';
import { TestPage } from './pages/TestPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { RealEstateListPage } from './pages/RealEstate/RealEstateListPage';
import { RealEstateDetailPage } from './pages/RealEstate/RealEstateDetailPage';
import { RealEstateCreatePage } from './pages/RealEstate/RealEstateCreatePage';
import { VehicleListPage } from './pages/Vehicle/VehicleListPage';
import { VehicleDetailPage } from './pages/Vehicle/VehicleDetailPage';
import { VehicleCreatePage } from './pages/Vehicle/VehicleCreatePage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { CreateListingPage } from './pages/CreateListingPage';

// Styles
import './index.css';

const AppContent: React.FC = () => {
  useEffect(() => {
    // Uygulama başladığında auth durumunu kontrol et
    store.dispatch(checkAuthStatus());
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Real Estate Routes */}
          <Route path="/real-estate" element={<RealEstateListPage />} />
          <Route path="/real-estate/:id" element={<RealEstateDetailPage />} />
          <Route path="/real-estate/create" element={<RealEstateCreatePage />} />

          {/* Vehicle Routes */}
          <Route path="/vehicles" element={<VehicleListPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/vehicles/create" element={<VehicleCreatePage />} />

          {/* Unified Create Listing Route */}
          <Route path="/create" element={<CreateListingPage />} />

          {/* Land Routes - Placeholder sayfalar */}
          <Route path="/lands" element={
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌾</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Arsa İlanları</h2>
              <p className="text-gray-600 mb-6">Arsa ilanları sayfası yakında aktif olacak.</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">• Tarla ilanları</p>
                <p className="text-sm text-gray-500">• Bahçe ilanları</p>
                <p className="text-sm text-gray-500">• İmarlı arsa ilanları</p>
              </div>
            </div>
          } />

          <Route path="/lands/create" element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Arsa İlanı Ver</h2>
              <p className="text-gray-600">Bu özellik yakında aktif olacak.</p>
            </div>
          } />

          {/* Workplace Routes - Placeholder sayfalar */}
          <Route path="/workplaces" element={
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">İşyeri İlanları</h2>
              <p className="text-gray-600 mb-6">İşyeri ilanları sayfası yakında aktif olacak.</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">• Ofis ilanları</p>
                <p className="text-sm text-gray-500">• Dükkan ilanları</p>
                <p className="text-sm text-gray-500">• Fabrika ilanları</p>
              </div>
            </div>
          } />

          <Route path="/workplaces/create" element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">İşyeri İlanı Ver</h2>
              <p className="text-gray-600">Bu özellik yakında aktif olacak.</p>
            </div>
          } />

          {/* User Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-listings" element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">İlanlarım</h2>
              <p className="text-gray-600">Giriş yaparak ilanlarınızı görüntüleyebilirsiniz.</p>
            </div>
          } />
          <Route path="/favorites" element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Favorilerim</h2>
              <p className="text-gray-600">Beğendiğiniz ilanları buradan takip edebilirsiniz.</p>
            </div>
          } />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;