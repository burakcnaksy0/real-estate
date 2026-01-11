import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';

interface ImageFile {
    file: File;
    preview: string;
    isPrimary: boolean;
}

interface ImageUploadProps {
    images: ImageFile[];
    onImagesChange: (images: ImageFile[]) => void;
    maxImages?: number;
    maxSizeMB?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    images,
    onImagesChange,
    maxImages = 10,
    maxSizeMB = 10,
}) => {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (files: File[]) => {
        const validFiles = files.filter((file) => {
            // Check file type
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} geçerli bir görsel dosyası değil`);
                return false;
            }

            // Check file size
            const sizeMB = file.size / (1024 * 1024);
            if (sizeMB > maxSizeMB) {
                alert(`${file.name} çok büyük. Maksimum ${maxSizeMB}MB olmalı`);
                return false;
            }

            return true;
        });

        // Check max images limit
        if (images.length + validFiles.length > maxImages) {
            alert(`Maksimum ${maxImages} görsel yükleyebilirsiniz`);
            return;
        }

        const newImages: ImageFile[] = validFiles.map((file, index) => ({
            file,
            preview: URL.createObjectURL(file),
            isPrimary: images.length === 0 && index === 0, // First image is primary by default
        }));

        onImagesChange([...images, ...newImages]);
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);

        // If removed image was primary and there are other images, make first one primary
        if (images[index].isPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true;
        }

        onImagesChange(newImages);
        URL.revokeObjectURL(images[index].preview);
    };

    const setPrimaryImage = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            isPrimary: i === index,
        }));
        onImagesChange(newImages);
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                />

                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

                <p className="text-gray-600 mb-2">
                    Görselleri sürükleyip bırakın veya{' '}
                    <button
                        type="button"
                        onClick={openFileDialog}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        dosya seçin
                    </button>
                </p>

                <p className="text-sm text-gray-500">
                    Maksimum {maxImages} görsel, her biri {maxSizeMB}MB'dan küçük olmalı
                </p>

                {images.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                        {images.length} / {maxImages} görsel yüklendi
                    </p>
                )}
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                        >
                            <img
                                src={image.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Primary Badge */}
                            {image.isPrimary && (
                                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Ana Görsel
                                </div>
                            )}

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                {!image.isPrimary && (
                                    <button
                                        type="button"
                                        onClick={() => setPrimaryImage(index)}
                                        className="bg-white text-gray-700 hover:bg-blue-600 hover:text-white px-3 py-1 rounded text-sm transition-colors"
                                    >
                                        Ana Yap
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="bg-white text-red-600 hover:bg-red-600 hover:text-white p-2 rounded transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* File Info */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="truncate">{image.file.name}</p>
                                <p>{(image.file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {images.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-16 h-16 mx-auto mb-2 text-gray-300" />
                    <p>Henüz görsel eklenmedi</p>
                </div>
            )}
        </div>
    );
};
