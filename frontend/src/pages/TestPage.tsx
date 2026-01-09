import React from 'react';

export const TestPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Test Sayfası</h1>
      <p className="text-gray-700 mb-4">
        Bu sayfa projenin çalıştığını test etmek için oluşturuldu.
      </p>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Tailwind CSS Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded">
            <h3 className="font-bold text-blue-800">Mavi Kutu</h3>
            <p className="text-blue-600">Bu bir test kutusudur.</p>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <h3 className="font-bold text-green-800">Yeşil Kutu</h3>
            <p className="text-green-600">Bu bir test kutusudur.</p>
          </div>
          <div className="bg-red-100 p-4 rounded">
            <h3 className="font-bold text-red-800">Kırmızı Kutu</h3>
            <p className="text-red-600">Bu bir test kutusudur.</p>
          </div>
        </div>
      </div>
      
      <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Test Butonu
      </button>
    </div>
  );
};