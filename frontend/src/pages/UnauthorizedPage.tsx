import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home, LogIn } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Shield className="h-12 w-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Yetkisiz Erişim
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Bu sayfaya erişim yetkiniz bulunmamaktadır. 
          Lütfen uygun yetkilerle giriş yapın veya ana sayfaya dönün.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <LogIn className="h-4 w-4" />
            <span>Giriş Yap</span>
          </Link>
          
          <Link
            to="/"
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Ana Sayfa</span>
          </Link>
        </div>
      </div>
    </div>
  );
};