import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Star, Navigation, Phone, MapPin, Building2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  distance?: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  specialties: string[];
  emergencyServices: boolean;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface HospitalMapProps {
  hospitals: Hospital[];
  userLocation?: UserLocation;
  onDirectionsClick?: (hospital: Hospital) => void;
  onBookAppointment?: (hospitalId: string) => void;
  className?: string;
  height?: string;
}

// Custom icon for hospitals
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map bounds and zoom
function MapBoundsHandler({ hospitals, userLocation }: { hospitals: Hospital[], userLocation?: UserLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (hospitals.length === 0) return;
    
    const bounds = L.latLngBounds([]);
    
    // Add hospital coordinates to bounds
    hospitals.forEach(hospital => {
      bounds.extend([hospital.coordinates.latitude, hospital.coordinates.longitude]);
    });
    
    // Add user location if available
    if (userLocation) {
      bounds.extend([userLocation.latitude, userLocation.longitude]);
    }
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [hospitals, userLocation, map]);
  
  return null;
}

const HospitalMap: React.FC<HospitalMapProps> = ({
  hospitals,
  userLocation,
  onDirectionsClick,
  onBookAppointment,
  className = "",
  height = "400px"
}) => {
  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Default center (Indore coordinates)
  const defaultCenter: [number, number] = [22.7196, 75.8577];
  
  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Hospital markers */}
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={[hospital.coordinates.latitude, hospital.coordinates.longitude]}
            icon={hospitalIcon}
          >
            <Popup maxWidth={300}>
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium leading-tight">{hospital.name}</CardTitle>
                      <div className="flex items-center mt-1">
                        {renderRatingStars(hospital.rating)}
                        <span className="text-xs text-muted-foreground ml-1">({hospital.rating})</span>
                      </div>
                    </div>
                    {hospital.emergencyServices && (
                      <Badge variant="destructive" className="text-xs">
                        Emergency
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="line-clamp-2">{hospital.address}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Phone className="w-3 h-3 mr-1" />
                      <span>{hospital.phone}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Building2 className="w-3 h-3 mr-1" />
                      <span className="line-clamp-1">
                        {hospital.specialties.slice(0, 2).join(', ')}
                        {hospital.specialties.length > 2 && ` +${hospital.specialties.length - 2} more`}
                      </span>
                    </div>
                    
                    {hospital.distance && (
                      <div className="text-xs text-green-600 font-medium">
                        {hospital.distance.toFixed(1)} km away
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      {onDirectionsClick && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => onDirectionsClick(hospital)}
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          Directions
                        </Button>
                      )}
                      {onBookAppointment && (
                        <Button 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => onBookAppointment(hospital.id)}
                        >
                          Book
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <MapPin className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="font-medium text-sm">Your Location</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Accuracy: ±{userLocation.accuracy?.toFixed(0) || '?'}m
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Auto-fit bounds */}
        <MapBoundsHandler hospitals={hospitals} userLocation={userLocation} />
      </MapContainer>
    </div>
  );
};

export default HospitalMap;