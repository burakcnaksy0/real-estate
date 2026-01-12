import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { School, Stethoscope, Bus, ShoppingCart, Coffee, MapPin, Navigation } from 'lucide-react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for different categories
const createCustomIcon = (color: string) => {
    return new L.DivIcon({
        className: 'custom-icon',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

interface NearbyPlacesProps {
    latitude: number;
    longitude: number;
}

interface Place {
    id: number;
    lat: number;
    lon: number;
    name?: string;
    type: string;
    distance?: number;
}

const CATEGORIES = [
    { id: 'education', label: 'Eğitim', icon: School, query: 'amenity~"school|university|kindergarten"', color: '#3B82F6' },
    { id: 'health', label: 'Sağlık', icon: Stethoscope, query: 'amenity~"hospital|clinic|pharmacy"', color: '#EF4444' },
    { id: 'transport', label: 'Ulaşım', icon: Bus, query: 'public_transport~"station|stop_position"|amenity="bus_station"|highway="bus_stop"', color: '#10B981' },
    { id: 'market', label: 'Market', icon: ShoppingCart, query: 'shop~"supermarket|convenience"', color: '#F59E0B' },
    { id: 'food', label: 'Yeme-İçme', icon: Coffee, query: 'amenity~"restaurant|cafe|fast_food"', color: '#8B5CF6' }
];

export const NearbyPlaces: React.FC<NearbyPlacesProps> = ({ latitude, longitude }) => {
    const [activeCategory, setActiveCategory] = useState<string>('education');
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);

    // Calculate distance between two coordinates in meters
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(R * c);
    };

    const fetchPlaces = async (categoryObj: typeof CATEGORIES[0]) => {
        setLoading(true);
        try {
            // Overpass API Query
            const query = `
                [out:json][timeout:25];
                (
                  node[${categoryObj.query}](around:1000,${latitude},${longitude});
                );
                out body;
                >;
                out skel qt;
            `;

            const response = await axios.get('https://overpass-api.de/api/interpreter', {
                params: { data: query }
            });

            const fetchedPlaces = response.data.elements
                .filter((el: any) => el.tags && (el.tags.name || el.tags.amenity || el.tags.shop))
                .map((el: any) => ({
                    id: el.id,
                    lat: el.lat,
                    lon: el.lon,
                    name: el.tags.name || el.tags.amenity || el.tags.shop || 'İsimsiz',
                    type: categoryObj.id,
                    distance: calculateDistance(latitude, longitude, el.lat, el.lon)
                }))
                .sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0))
                .slice(0, 10); // Limit to top 10 results

            setPlaces(fetchedPlaces);
        } catch (error) {
            console.error('Error fetching nearby places:', error);
            setPlaces([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const category = CATEGORIES.find(c => c.id === activeCategory);
        if (category) {
            fetchPlaces(category);
        }
    }, [activeCategory, latitude, longitude]);

    const activeCategoryData = CATEGORIES.find(c => c.id === activeCategory);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
                <Navigation className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">Etrafımda Ne Var?</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Categories & List */}
                <div className="lg:w-1/3 flex flex-col gap-4">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeCategory === cat.id
                                    ? 'bg-primary-50 text-primary-700 ring-2 ring-primary-500 ring-offset-2'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <cat.icon className="h-4 w-4" />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Places List */}
                    <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : places.length > 0 ? (
                            places.map((place) => (
                                <div key={place.id} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-default border border-transparent hover:border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-gray-900 line-clamp-1">{place.name}</h4>
                                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full whitespace-nowrap">
                                            {place.distance}m
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 capitalize">
                                        {place.type === 'education' ? 'Okul/Eğitim' :
                                            place.type === 'health' ? 'Hastane/Eczane' :
                                                place.type === 'transport' ? 'Durak/İstasyon' :
                                                    place.type === 'market' ? 'Market/Bakkal' : 'Mekan'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                Bu kategoride yakında mekan bulunamadı.
                            </div>
                        )}
                    </div>
                </div>

                {/* Map */}
                <div className="lg:w-2/3 h-[400px] rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative z-0">
                    <MapContainer
                        center={[latitude, longitude]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Listing Location Marker */}
                        <Marker position={[latitude, longitude]} title="İlan Konumu">
                            <Popup>
                                <div className="font-bold text-center">İlan Konumu</div>
                            </Popup>
                        </Marker>

                        {/* Nearby Places Markers */}
                        {places.map((place) => (
                            <Marker
                                key={place.id}
                                position={[place.lat, place.lon]}
                                icon={createCustomIcon(activeCategoryData?.color || '#3B82F6')}
                            >
                                <Popup>
                                    <div className="font-semibold">{place.name}</div>
                                    <div className="text-xs text-gray-500">{place.distance}m uzaklıkta</div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};
