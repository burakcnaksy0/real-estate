import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">RE</span>
              </div>
              <span className="text-xl font-bold text-gray-900">RealEstate</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Ana Sayfa
              </Link>
              <Link to="/real-estate" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Emlak
              </Link>
              <Link to="/vehicles" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Araçlar
              </Link>
              <Link to="/lands" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Arsalar
              </Link>
              <Link to="/workplaces" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                İşyerleri
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Kayıt Ol
              </Link>
              <Link
                to="/real-estate/create"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                İlan Ver
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 RealEstate. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};