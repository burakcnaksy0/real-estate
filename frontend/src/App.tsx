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
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/Auth/ResetPasswordPage';
import { OAuth2RedirectHandler } from './pages/Auth/OAuth2RedirectHandler';
import { RealEstateListPage } from './pages/RealEstate/RealEstateListPage';
import { RealEstateDetailPage } from './pages/RealEstate/RealEstateDetailPage';
import { RealEstateCreatePage } from './pages/RealEstate/RealEstateCreatePage';
import { VehicleListPage } from './pages/Vehicle/VehicleListPage';
import { VehicleDetailPage } from './pages/Vehicle/VehicleDetailPage';
import { VehicleCreatePage } from './pages/Vehicle/VehicleCreatePage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { AllListingsPage } from './pages/AllListingsPage';
import { LandListPage } from './pages/Land/LandListPage';
import { LandCreatePage } from './pages/Land/LandCreatePage';
import { LandDetailPage } from './pages/Land/LandDetailPage';
import { WorkplaceListPage } from './pages/Workplace/WorkplaceListPage';
import { WorkplaceCreatePage } from './pages/Workplace/WorkplaceCreatePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { WorkplaceDetailPage } from './pages/Workplace/WorkplaceDetailPage';
import { MessagesPage } from './pages/Messages/MessagesPage';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminRoute } from './components/Admin/AdminRoute';

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
          <Route path="/listings" element={<AllListingsPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Real Estate Routes */}
          <Route path="/real-estates" element={<RealEstateListPage />} />
          <Route path="/real-estates/:id" element={<RealEstateDetailPage />} />
          <Route path="/real-estates/create" element={<RealEstateCreatePage />} />

          {/* Vehicle Routes */}
          <Route path="/vehicles" element={<VehicleListPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/vehicles/create" element={<VehicleCreatePage />} />

          {/* Unified Create Listing Route */}
          <Route path="/create" element={<CreateListingPage />} />

          {/* Land Routes */}
          <Route path="/lands" element={<LandListPage />} />
          <Route path="/lands/:id" element={<LandDetailPage />} />
          <Route path="/lands/create" element={<LandCreatePage />} />

          {/* Workplace Routes */}
          <Route path="/workplaces" element={<WorkplaceListPage />} />
          <Route path="/workplaces/:id" element={<WorkplaceDetailPage />} />
          <Route path="/workplaces/create" element={<WorkplaceCreatePage />} />

          {/* User Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-listings" element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">İlanlarım</h2>
              <p className="text-gray-600">Giriş yaparak ilanlarınızı görüntüleyebilirsiniz.</p>
            </div>
          } />
          <Route path="/favorites" element={<FavoritesPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:userId" element={<MessagesPage />} />

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