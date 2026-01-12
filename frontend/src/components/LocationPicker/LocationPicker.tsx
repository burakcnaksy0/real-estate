import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
    latitude?: number;
    longitude?: number;
    onLocationChange: (lat: number, lng: number) => void;
    height?: string;
}

// Component to handle map click events
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
    latitude,
    longitude,
    onLocationChange,
    height = '400px'
}) => {
    const [position, setPosition] = useState<[number, number] | null>(
        latitude && longitude ? [latitude, longitude] : null
    );

    // Update position when props change
    useEffect(() => {
        if (latitude && longitude) {
            setPosition([latitude, longitude]);
        }
    }, [latitude, longitude]);

    // Default center (Istanbul)
    const defaultCenter: [number, number] = [41.0082, 28.9784];
    const center = position || defaultCenter;

    const handleMapClick = (lat: number, lng: number) => {
        setPosition([lat, lng]);
        onLocationChange(lat, lng);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Konum Seçin
                </label>
                {position && (
                    <span className="text-xs text-gray-500">
                        {position[0].toFixed(6)}, {position[1].toFixed(6)}
                    </span>
                )}
            </div>
            <div
                style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}
                className="border-2 border-gray-300 hover:border-primary-500 transition-colors"
            >
                <MapContainer
                    center={center}
                    zoom={position ? 15 : 11}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onClick={handleMapClick} />
                    {position && <Marker position={position} />}
                </MapContainer>
            </div>
            <p className="text-xs text-gray-500">
                {position
                    ? '✓ Konum seçildi. Değiştirmek için harita üzerinde başka bir yere tıklayın.'
                    : 'Harita üzerinde bir noktaya tıklayarak konum seçin.'}
            </p>
        </div>
    );
};
