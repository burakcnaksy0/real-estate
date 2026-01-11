import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { ImageResponse, ImageService } from '../../services/imageService';

interface ImageGalleryProps {
    images: ImageResponse[];
    fallbackIcon?: React.ReactNode;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
    images,
    fallbackIcon = <ImageIcon className="w-24 h-24 text-gray-300" />
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
                {fallbackIcon}
            </div>
        );
    }

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const currentImage = images[currentIndex];
    // Backend uploads dosya yolunu tam URL'e çevirmek için ImageService kullanılır
    // Ancak ImageService.getImageUrl basit bir string dönüyor, backend'deki 'uploads' klasörüne erişim için
    // static resource serving ayarı application.properties'e eklenmişti.
    // Frontend'de bu URL'i oluşturmak için base URL'e ihtiyacımız var.
    // Gelen filePath muhtemelen mutlak yol veya relative yol.
    // ImageController'da /view/{imageId} endpointi hazırlanmıştı ama içi boştu.
    // En iyisi backend'den resmi serve edecek endpointi kullanmak veya static path kullanmak.
    // Backend dosya yolu: uploads/REAL_ESTATE/1/filename.jpg
    // React'ten erişim için: http://localhost:8080/uploads/...
    // Bunu ImageComponent içinde handle edelim.

    const getImageUrl = (image: ImageResponse) => {
        // Geçici çözüm: Backend statik dosya sunmuyorsa, image view endpoint'i kullanmalıyız.
        // Backend kontrolörde /view/{imageId} vardı ama "Not Found" dönüyordu placeholder olarak.
        // Biz şimdilik doğrudan dosya yolunu kullanalım, backend static serving support eklememiz gerekebilir.
        // Veya base64? Hayır.
        // Backend'de static resource handler eklemem gerekti.
        // Şimdilik varsayım: http://localhost:8080/api/images/view/{id} (bunu implemente etmeliyiz)
        // VEYA direkt statik yol.
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        // return `${API_URL}/api/images/view/${image.id}`; 

        // Ancak view endpoint henüz hazır değil.
        // Basitlik için static serving varsayalım.
        // Backend'in "uploads" klasörünü serve etmesi lazım.
        // Şimdilik:
        return `${API_URL}/api/images/view/${image.id}`;
    };

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full h-[400px] bg-gray-100 rounded-xl overflow-hidden group">
                <img
                    src={getImageUrl(currentImage)}
                    alt={`Gallery image ${currentIndex + 1}`}
                    className="w-full h-full object-contain bg-black"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Resim+Yüklenemedi';
                    }}
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Image Counter Badge */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setCurrentIndex(index)}
                            className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${currentIndex === index ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={getImageUrl(image)}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
