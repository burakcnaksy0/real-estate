import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, User, LogOut, Plus, Search } from 'lucide-react';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/', { replace: true }); // Anasayfaya yönlendir
  };

  const navigationItems = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Emlak', href: '/real-estate' },
    { name: 'Araçlar', href: '/vehicles' },
    { name: 'Arsalar', href: '/lands' },
    { name: 'İşyerleri', href: '/workplaces' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">RE</span>
            </div>
            <span className="text-xl font-bold text-gray-900">RealEstate</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="İlan ara..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Create Listing Button */}
                <Link
                  to="/real-estate/create"
                  className="hidden md:flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ücretsiz İlan Ver</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user?.name ? user.name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name && user?.surname 
                          ? `${user.name} ${user.surname}` 
                          : user?.username}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <svg className="hidden md:block w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name && user?.surname 
                            ? `${user.name} ${user.surname}` 
                            : user?.username}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        {user?.phoneNumber && (
                          <p className="text-xs text-gray-400">{user.phoneNumber}</p>
                        )}
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profil Ayarları
                        </Link>
                        <Link
                          to="/my-listings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          İlanlarım
                        </Link>
                        <Link
                          to="/favorites"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Favorilerim
                        </Link>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Logout Button - Desktop */}
                <button
                  onClick={handleLogout}
                  className="hidden lg:flex items-center space-x-2 text-gray-700 hover:text-red-600 font-medium transition-colors duration-200"
                  title="Çıkış Yap"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Çıkış</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Search */}
              <div className="pt-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="İlan ara..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Mobile Create Listing Button */}
              {isAuthenticated && (
                <Link
                  to="/real-estate/create"
                  className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 mt-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Ücretsiz İlan Ver</span>
                </Link>
              )}

              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="text-center py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="text-center py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}

              {/* Mobile Logout Button */}
              {isAuthenticated && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};