import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">RE</span>
              </div>
              <span className="text-xl font-bold">RealEstate</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Türkiye'nin en güvenilir emlak, araç ve işyeri ilan platformu. 
              Hayalinizdeki mülkü bulun veya mülkünüzü satın.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                Facebook
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                Twitter
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                Instagram
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/real-estate" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Emlak İlanları
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Araç İlanları
                </Link>
              </li>
              <li>
                <Link to="/lands" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Arsa İlanları
                </Link>
              </li>
              <li>
                <Link to="/workplaces" className="text-gray-300 hover:text-white transition-colors duration-200">
                  İşyeri İlanları
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Destek</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Yardım Merkezi
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  İletişim
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Gizlilik Politikası
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Kullanım Şartları
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 RealEstate. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};