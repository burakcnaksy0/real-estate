import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, User, LogOut, Plus, Search, Shield, Bell, Check, Trash2 } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import { Role, Notification } from '../../types';
import { NotificationService } from '../../services/notificationService';
import { websocketService } from '../../services/websocketService';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Initial fetch and WebSocket subscription
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      websocketService.connect();
      fetchNotifications();

      // Subscribe to notifications
      // Small delay to ensure connection
      const timer = setTimeout(() => {
        websocketService.subscribe(`/topic/notifications/${user.id}`, (notification: Notification) => {
          setNotifications(prev => [notification, ...prev]);
          if (!notification.isRead) {
            setUnreadCount(prev => prev + 1);
            toast.info(
              <div onClick={() => navigate('/notifications')} className="cursor-pointer">
                <strong>{notification.title}</strong>
                <p className="text-sm">{notification.message}</p>
              </div>
            );
          }
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?.id]);


  const fetchNotifications = async () => {
    try {
      const data = await NotificationService.getUserNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on type/relatedId
    if (notification.relatedListingId) {
      if (notification.relatedListingType === 'REAL_ESTATE') navigate(`/real-estates/${notification.relatedListingId}`);
      else if (notification.relatedListingType === 'VEHICLE') navigate(`/vehicles/${notification.relatedListingId}`);
      else if (notification.relatedListingType === 'LAND') navigate(`/lands/${notification.relatedListingId}`);
      else if (notification.relatedListingType === 'WORKPLACE') navigate(`/workplaces/${notification.relatedListingId}`);
      else navigate(`/listings/${notification.relatedListingId}`);
    }

    setIsNotificationOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isUserMenuOpen || isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isNotificationOpen]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/', { replace: true }); // Anasayfaya yönlendir
  };

  const navigationItems = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Emlak', href: '/real-estates' },
    { name: 'Araçlar', href: '/vehicles' },
    { name: 'Arsalar', href: '/lands' },
    { name: 'İşyerleri', href: '/workplaces' },
    { name: 'Favorilerim', href: '/favorites' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/vesta-logo.png"
              alt="Vesta Logo"
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">Vesta</span>
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
                  to="/real-estates/create"
                  className="hidden md:flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ücretsiz İlan Ver</span>
                </Link>

                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative"
                  >
                    <Bell className="h-6 w-6 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Bildirimler</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Tümünü Okundu İşaretle
                          </button>
                        )}
                      </div>

                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Henüz bildiriminiz yok</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex gap-3">
                                  <div className={`mt-1 min-w-[32px] w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'FAVORITE' ? 'bg-red-100 text-red-500' :
                                      notification.type === 'VIEW' ? 'bg-blue-100 text-blue-500' :
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                    {notification.type === 'FAVORITE' ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                      {formatDate(notification.createdAt)}
                                    </p>
                                  </div>
                                  {!notification.isRead && (
                                    <div className="mt-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    {user?.profilePicture ? (
                      <img
                        src={getImageUrl(user.profilePicture)}
                        alt={user.name || user.username}
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user?.name ? user.name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
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

                        {/* Admin Panel Link - Only for admins */}
                        {user?.roles?.includes(Role.ROLE_ADMIN) && (
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors duration-200 font-medium"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4 mr-3" />
                            Admin Paneli
                          </Link>
                        )}
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
                  to="/real-estates/create"
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