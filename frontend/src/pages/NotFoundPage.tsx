import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Sayfa Bulunamadı
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir. 
          Ana sayfaya dönerek devam edebilirsiniz.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Geri Dön</span>
          </button>
          
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