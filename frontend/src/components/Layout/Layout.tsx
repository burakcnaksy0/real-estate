import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, MessageCircle, Menu, X, Home, Building2, Car, Landmark, Briefcase, Heart, Bell, Check, Search } from 'lucide-react';
import { MessageService } from '../../services/messageService';
import { Notification, NotificationType } from '../../types';
import { NotificationService } from '../../services/notificationService';
import { websocketService } from '../../services/websocketService';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';
import CompareBar from '../CompareBar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification states
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Notification Logic
      // Connect is already handled in App.tsx but we can ensure it's connected here too or just rely on App.tsx. 
      // Better to rely on App.tsx for connection, but we need to subscribe.

      fetchNotifications();

      const timer = setTimeout(() => {
        websocketService.subscribe(`/topic/notifications/${user.id}`, (notification: Notification) => {
          setNotifications(prev => [notification, ...prev]);
          if (!notification.isRead) {
            setNotificationUnreadCount(prev => prev + 1);
            toast.info(
              <div onClick={() => { navigate('/notifications'); setIsNotificationOpen(false); }} className="cursor-pointer">
                <strong>{notification.title}</strong>
                <p className="text-sm">{notification.message}</p>
              </div>
            );
          }
        });
      }, 2000); // 2 seconds delay to ensure connection

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?.id]);


  const fetchNotifications = async () => {
    try {
      const data = await NotificationService.getUserNotifications();
      setNotifications(data);
      setNotificationUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setNotificationUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setNotificationUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    if (notification.relatedListingId) {
      if (notification.relatedListingType === 'REAL_ESTATE') navigate(`/real-estates/${notification.relatedListingId}`);
      else if (notification.relatedListingType === 'VEHICLE') navigate(`/vehicles/${notification.relatedListingId}`);
      else if (notification.relatedListingType === 'LAND') navigate(`/lands/${notification.relatedListingId}`);
      else if (notification.relatedListingType === 'WORKPLACE') navigate(`/workplaces/${notification.relatedListingId}`);
      else navigate(`/listings/${notification.relatedListingId}`);
    }

    setIsNotificationOpen(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();

      // Poll every 30 seconds for new messages
      const interval = setInterval(loadUnreadCount, 30000);

      // Listen for custom event when messages are read
      const handleMessagesRead = () => {
        loadUnreadCount();
      };
      window.addEventListener('messagesRead', handleMessagesRead);

      return () => {
        clearInterval(interval);
        window.removeEventListener('messagesRead', handleMessagesRead);
      };
    }
  }, [isAuthenticated]);

  const loadUnreadCount = async () => {
    try {
      const count = await MessageService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Ana Sayfa', icon: Home },
    { to: '/real-estates', label: 'Emlak', icon: Building2 },
    { to: '/vehicles', label: 'Araçlar', icon: Car },
    { to: '/lands', label: 'Arsalar', icon: Landmark },
    { to: '/workplaces', label: 'İşyerleri', icon: Briefcase },
    { to: '/search', label: 'Gelişmiş Arama', icon: Search },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src="/vesta-logo.png"
                  alt="Vesta Logo"
                  className="h-12 w-auto transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                Vesta
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to="/favorites"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                >
                  <Heart className="h-4 w-4" />
                  <span>Favorilerim</span>
                </Link>
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  {/* İlan Ver Button */}
                  <Link
                    to="/create"
                    className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-green-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5"
                  >
                    <span>İlan Ver</span>
                  </Link>

                  {/* Messages Button */}
                  <Link
                    to="/messages"
                    className="relative flex items-center justify-center h-11 w-11 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Notification Bell */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className="relative flex items-center justify-center h-11 w-11 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                    >
                      <Bell className="h-5 w-5" />
                      {notificationUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                          {notificationUnreadCount > 9 ? '9+' : notificationUnreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotificationOpen && (
                      <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                          <h3 className="font-semibold text-gray-900">Bildirimler</h3>
                          {notificationUnreadCount > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Tümünü Okundu İşaretle
                            </button>
                          )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="font-medium text-gray-900">Bildiriminiz Yok</p>
                              <p className="text-sm text-gray-500 mt-1">Yeni bir şey olduğunda burada göreceksiniz.</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-50">
                              {notifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`p-4 hover:bg-gray-50 transition-all cursor-pointer ${!notification.isRead ? 'bg-blue-50/40 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  <div className="flex gap-4">
                                    <div className={`mt-1 min-w-[36px] w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${notification.type === 'FAVORITE' ? 'bg-red-100 text-red-500' :
                                      notification.type === 'VIEW' ? 'bg-blue-100 text-blue-500' :
                                        'bg-gray-100 text-gray-500'
                                      }`}>
                                      {notification.type === 'FAVORITE' ? <Heart className="w-5 h-5 fill-current" /> : <Bell className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start">
                                        <p className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                          {notification.title}
                                        </p>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                          {formatDate(notification.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                        {notification.message}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/50 text-center">
                          <Link to="/notifications" className="text-xs font-medium text-blue-600 hover:text-blue-700">Tüm Bildirimleri Gör</Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile */}
                  <Link
                    to="/profile"
                    className="hidden md:flex items-center space-x-2 px-4 py-2.5 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-md">
                      {user?.username?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <span className="font-semibold">{user?.username || 'Profil'}</span>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="hidden md:flex items-center space-x-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 border border-gray-200 hover:border-red-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Çıkış</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden md:block text-gray-700 hover:text-blue-600 font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-all duration-200"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center justify-center h-11 w-11 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link
                    to="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                  >
                    <Heart className="h-5 w-5" />
                    <span>Favorilerim</span>
                  </Link>
                  <Link
                    to="/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg"
                  >
                    <span>İlan Ver</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-200"
                  >
                    <User className="h-5 w-5" />
                    <span>{user?.username || 'Profil'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Çıkış Yap</span>
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-xl hover:bg-blue-50 transition-all duration-200"
                >
                  <span>Giriş Yap</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-8">
        {children}
      </main>

      {/* Compare Bar */}
      <CompareBar />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Vesta</h3>
              <p className="text-gray-400 text-sm">
                Modern emlak, araç ve arsa ilanları platformu.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Hızlı Linkler</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Ana Sayfa</Link></li>
                <li><Link to="/real-estates" className="text-gray-400 hover:text-white transition-colors">Emlak</Link></li>
                <li><Link to="/vehicles" className="text-gray-400 hover:text-white transition-colors">Araçlar</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">İletişim</h3>
              <p className="text-gray-400 text-sm">
                Sorularınız için bizimle iletişime geçin.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-sm">© 2024 Vesta. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};