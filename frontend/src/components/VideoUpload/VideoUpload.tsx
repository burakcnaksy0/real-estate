import React, { useState, useRef } from 'react';
import { Upload, X, Video as VideoIcon, Play } from 'lucide-react';

export interface VideoFile {
    file: File;
    preview?: string;
}

interface VideoUploadProps {
    video: VideoFile | null;
    onVideoChange: (video: VideoFile | null) => void;
    maxSizeMB?: number;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
    video,
    onVideoChange,
    maxSizeMB = 50,
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
        if (files.length === 0) return;
        const file = files[0]; // Only accept one video for now

        // Check file type
        if (!file.type.startsWith('video/')) {
            alert(`${file.name} geçerli bir video dosyası değil`);
            return;
        }

        // Check file size
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
            alert(`${file.name} çok büyük. Maksimum ${maxSizeMB}MB olmalı`);
            return;
        }

        const newVideo: VideoFile = {
            file,
            preview: URL.createObjectURL(file),
        };

        onVideoChange(newVideo);
    };

    const removeVideo = () => {
        if (video?.preview) {
            URL.revokeObjectURL(video.preview);
        }
        onVideoChange(null);
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {!video ? (
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
                        accept="video/*"
                        onChange={handleFileInput}
                        className="hidden"
                    />

                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

                    <p className="text-gray-600 mb-2">
                        Videoyu sürükleyip bırakın veya{' '}
                        <button
                            type="button"
                            onClick={openFileDialog}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            dosya seçin
                        </button>
                    </p>

                    <p className="text-sm text-gray-500">
                        Maksimum {maxSizeMB}MB video yükleyebilirsiniz
                    </p>
                </div>
            ) : (
                /* Video Preview */
                <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-black">
                    <video
                        src={video.preview}
                        controls
                        className="w-full h-64 object-contain"
                    />
                    <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2">
                        <p className="truncate">{video.file.name}</p>
                        <p>{(video.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
            )}
        </div>
    );
};
