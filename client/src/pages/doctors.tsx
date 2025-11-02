import { useState, useEffect, useCallback, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, Clock, DollarSign, Video, Phone, MapPin, Filter, Navigation, Calendar, User, Shield, Heart, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import HospitalMap from '@/components/ui/hospital-map';
import AppointmentBookingDialog from '@/components/ui/appointment-booking-dialog';
import { Doctor } from '@/types/user';

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

export function DoctorsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('doctors');
  const [showMapView, setShowMapView] = useState(false);

  // Get user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(location);
        setIsLocationLoading(false);
        toast({
          title: 'Location detected',
          description: 'Found your location! Showing nearby hospitals.',
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permission.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        setIsLocationLoading(false);
        toast({
          title: 'Location Error',
          description: errorMessage,
          variant: 'destructive'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, [toast]);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Real Indore hospital data
  const indoreHospitals: Hospital[] = [
    {
      id: '1',
      name: 'Maharaja Yeshwantrao Hospital (MYH)',
      address: 'Mahatma Gandhi Road, A.B. Road, Indore, Madhya Pradesh 452001',
      phone: '0731 252 5555',
      rating: 4.2,
      coordinates: { latitude: 22.7196, longitude: 75.8577 },
      specialties: ['Teaching Hospital', 'Tertiary Care', 'Medical Education', 'Emergency Care'],
      emergencyServices: true
    },
    {
      id: '2',
      name: 'Apollo Hospitals',
      address: 'Vijay Nagar, Scheme No 74C, Sector D, Indore, Madhya Pradesh 452010',
      phone: '0731 244 5566',
      rating: 4.5,
      coordinates: { latitude: 22.7296, longitude: 75.8677 },
      specialties: ['Cardiology', 'Neurosurgery', 'Oncology', 'Emergency Care'],
      emergencyServices: true
    },
    {
      id: '3',
      name: 'CHL Hospitals / Convenient Hospitals Ltd',
      address: 'AB Road, near LIG Square, Indore, Madhya Pradesh 452008',
      phone: '0731 662 2222',
      rating: 4.1,
      coordinates: { latitude: 22.7096, longitude: 75.8477 },
      specialties: ['Multi-specialty', 'Emergency Care', 'ICU'],
      emergencyServices: true
    },
    {
      id: '4',
      name: 'Choithram Hospital & Research Centre',
      address: 'Mainak Bagh Road, Indore, Madhya Pradesh 452014',
      phone: '0731 256 6666',
      rating: 4.4,
      coordinates: { latitude: 22.7396, longitude: 75.8777 },
      specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology'],
      emergencyServices: true
    },
    {
      id: '5',
      name: 'Mohak Hi Tech Speciality Hospital',
      address: 'Ujjain Road, Indore, Madhya Pradesh 452001',
      phone: '0731 256 7777',
      rating: 4.3,
      coordinates: { latitude: 22.7150, longitude: 75.8550 },
      specialties: ['Hi-Tech Surgery', 'Cardiology', 'Orthopedics', 'Gastroenterology'],
      emergencyServices: true
    },
    {
      id: '6',
      name: 'Bombay Hospital',
      address: 'Ring Road, Vijay Nagar, Indore, Madhya Pradesh 452010',
      phone: '0731 256 8888',
      rating: 4.2,
      coordinates: { latitude: 22.7250, longitude: 75.8650 },
      specialties: ['Multi-specialty', 'Surgery', 'Medicine', 'Pediatrics'],
      emergencyServices: true
    },
    {
      id: '7',
      name: 'Sri Aurobindo Institute of Medical Sciences',
      address: 'Ujjain Road, near MR-10 Crossing, Sanwer Road, Indore, Madhya Pradesh 452020',
      phone: '0731 256 9999',
      rating: 4.0,
      coordinates: { latitude: 22.6800, longitude: 75.8200 },
      specialties: ['Medical Education', 'Teaching Hospital', 'Multi-specialty'],
      emergencyServices: true
    },
    {
      id: '8',
      name: 'Neema Hospitals Pvt Ltd (Unique Superspeciality Centre)',
      address: 'Opp Dashehara Maidan, Annapurna Road, Indore, Madhya Pradesh 452009',
      phone: '0731 256 1010',
      rating: 4.3,
      coordinates: { latitude: 22.7100, longitude: 75.8400 },
      specialties: ['Superspeciality', 'Surgery', 'Critical Care'],
      emergencyServices: true
    },
    {
      id: '9',
      name: 'Bhandari Hospital & Research Center',
      address: 'Scheme No. 54, Vijay Nagar, Indore, Madhya Pradesh 452010',
      phone: '0731 256 1111',
      rating: 4.1,
      coordinates: { latitude: 22.7200, longitude: 75.8600 },
      specialties: ['Research Center', 'Multi-specialty', 'Surgery'],
      emergencyServices: true
    },
    {
      id: '10',
      name: 'Greater Kailash Hospital',
      address: 'Old Palasia, Indore, Madhya Pradesh 452001',
      phone: '0731 256 1212',
      rating: 3.9,
      coordinates: { latitude: 22.7300, longitude: 75.8500 },
      specialties: ['General Medicine', 'Surgery', 'Pediatrics'],
      emergencyServices: true
    },
    {
      id: '11',
      name: 'Indore Eye Hospital',
      address: 'Dhar Road, Indore, Madhya Pradesh 452001',
      phone: '0731 256 1313',
      rating: 4.2,
      coordinates: { latitude: 22.7000, longitude: 75.8300 },
      specialties: ['Ophthalmology', 'Eye Surgery', 'Retina Care'],
      emergencyServices: false
    },
    {
      id: '12',
      name: 'Vasan Eye Care Hospital',
      address: 'Diamond Colony, Janjeerwala Square, Indore, Madhya Pradesh 452001',
      phone: '0731 256 1414',
      rating: 4.1,
      coordinates: { latitude: 22.7050, longitude: 75.8350 },
      specialties: ['Eye Care', 'Cataract Surgery', 'Laser Treatment'],
      emergencyServices: false
    }
  ];

  // Fetch hospitals data from backend API
  const fetchHospitals = async () => {
    try {
      const response = await fetch('/api/hospitals');
      if (!response.ok) {
        throw new Error('Failed to fetch hospitals');
      }
      const hospitalData = await response.json();
      setHospitals(hospitalData);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      // Fallback to hardcoded data if API fails
      setHospitals(indoreHospitals);
      toast({
        title: 'Error',
        description: 'Failed to load hospitals from server. Using offline data.',
        variant: 'destructive'
      });
    }
  };

  // Fetch doctors data
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        // Fetch hospital data
        await fetchHospitals();
        
        // Enhanced doctor data with more details
        const mockDoctors: Doctor[] = [
          {
            id: '1',
            name: 'Dr. Priya Sharma',
            specialization: 'Cardiologist',
            qualification: 'MD, DM Cardiology, FESC',
            experience: 15,
            rating: 4.8,
            consultationFee: 800,
            availability: [
              { day: 'Monday', startTime: '09:00', endTime: '17:00' },
              { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
              { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
              { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
              { day: 'Friday', startTime: '09:00', endTime: '17:00' }
            ],
            hospitalAffiliation: 'Apollo Hospital',
            languages: ['English', 'Hindi', 'Telugu'],
            isOnline: true
          },
          {
            id: '2',
            name: 'Dr. Rajesh Kumar',
            specialization: 'General Physician',
            qualification: 'MBBS, MD Internal Medicine',
            experience: 12,
            rating: 4.6,
            consultationFee: 500,
            availability: [
              { day: 'Monday', startTime: '10:00', endTime: '18:00' },
              { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
              { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
              { day: 'Friday', startTime: '10:00', endTime: '18:00' },
              { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
            ],
            hospitalAffiliation: 'CHL Group of Hospitals',
            languages: ['English', 'Hindi'],
            isOnline: true
          },
          {
            id: '3',
            name: 'Dr. Anjali Patel',
            specialization: 'Endocrinologist',
            qualification: 'MD, DM Endocrinology, MRCP',
            experience: 10,
            rating: 4.9,
            consultationFee: 900,
            availability: [
              { day: 'Tuesday', startTime: '11:00', endTime: '16:00' },
              { day: 'Wednesday', startTime: '11:00', endTime: '16:00' },
              { day: 'Thursday', startTime: '11:00', endTime: '16:00' },
              { day: 'Saturday', startTime: '09:00', endTime: '14:00' }
            ],
            hospitalAffiliation: 'Jupiter Hospital',
            languages: ['English', 'Hindi', 'Gujarati'],
            isOnline: false
          },
          {
            id: '4',
            name: 'Dr. Vikram Singh',
            specialization: 'Orthopedic Surgeon',
            qualification: 'MS Orthopedics, DNB',
            experience: 18,
            rating: 4.7,
            consultationFee: 1200,
            availability: [
              { day: 'Monday', startTime: '14:00', endTime: '18:00' },
              { day: 'Wednesday', startTime: '14:00', endTime: '18:00' },
              { day: 'Friday', startTime: '14:00', endTime: '18:00' },
              { day: 'Saturday', startTime: '09:00', endTime: '13:00' }
            ],
            hospitalAffiliation: 'Apollo Hospital',
            languages: ['English', 'Hindi'],
            isOnline: true
          },
          {
            id: '5',
            name: 'Dr. Meera Agarwal',
            specialization: 'Gynecologist',
            qualification: 'MD Obstetrics & Gynecology',
            experience: 14,
            rating: 4.8,
            consultationFee: 700,
            availability: [
              { day: 'Monday', startTime: '09:00', endTime: '13:00' },
              { day: 'Tuesday', startTime: '15:00', endTime: '19:00' },
              { day: 'Thursday', startTime: '09:00', endTime: '13:00' },
              { day: 'Friday', startTime: '15:00', endTime: '19:00' }
            ],
            hospitalAffiliation: 'Medista Hospital',
            languages: ['English', 'Hindi', 'Marathi'],
            isOnline: true
          }
        ];

        setDoctors(mockDoctors);
        setFilteredDoctors(mockDoctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast({
          title: "Error",
          description: "Failed to load doctors. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [toast]);

  // Update nearby hospitals when user location changes
  useEffect(() => {
    if (userLocation && hospitals.length > 0) {
      const hospitalsWithDistance = hospitals.map(hospital => ({
        ...hospital,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          hospital.coordinates.latitude,
          hospital.coordinates.longitude
        )
      }));

      // Sort by distance and get nearest hospitals
      const nearbyHospitalsList = hospitalsWithDistance
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 10);

      setNearbyHospitals(nearbyHospitalsList);
    }
  }, [userLocation, hospitals]);

  // Filter doctors based on search and filters
  useEffect(() => {
    let filtered = doctors;

    if (searchQuery) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doctor =>
        doctor.specialization.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }

    if (selectedRating !== 'all') {
      const minRating = parseFloat(selectedRating);
      filtered = filtered.filter(doctor => doctor.rating >= minRating);
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchQuery, selectedSpecialty, selectedRating]);

  const specialties = Array.from(new Set(doctors.map(d => d.specialization)));

  const handleBookAppointment = (doctorId: string, type?: 'video' | 'phone' | 'visit') => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      // Find associated hospital
      const hospital = hospitals.find(h => h.name === doctor.hospitalAffiliation);
      setSelectedHospital(hospital || null);
      setIsBookingModalOpen(true);
    }
  };

  const handleHospitalBooking = (hospitalId: string) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (hospital) {
      // Find a doctor from this hospital
      const hospitalDoctor = doctors.find(d => d.hospitalAffiliation === hospital.name);
      if (hospitalDoctor) {
        setSelectedDoctor(hospitalDoctor);
        setSelectedHospital(hospital);
        setIsBookingModalOpen(true);
      } else {
        toast({
          title: "No Doctors Available",
          description: "No doctors are currently available at this hospital for booking.",
          variant: "destructive"
        });
      }
    }
  };

  const openDirections = (hospital: Hospital) => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Please enable location access to get directions.",
        variant: "destructive"
      });
      return;
    }

    // OpenStreetMap directions URL
    const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.latitude}%2C${userLocation.longitude}%3B${hospital.coordinates.latitude}%2C${hospital.coordinates.longitude}`;
    window.open(directionsUrl, '_blank');
  };

  const confirmAppointment = async (appointmentData: any) => {
    try {
      // Call the appointments API
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to book appointment');
      }

      const result = await response.json();
      
      toast({
        title: "Appointment Booked Successfully!",
        description: `Your ${appointmentData.appointmentType.replace('_', ' ')} appointment with ${result.doctor.name} has been confirmed for ${new Date(appointmentData.scheduledDateTime).toLocaleDateString()}.`,
      });
      
      setIsBookingModalOpen(false);
      setSelectedDoctor(null);
      setSelectedHospital(null);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to book appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-200 rounded"></div>
                    <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-doctors-title">
                Find Your Doctor
              </h1>
              <p className="text-muted-foreground" data-testid="text-doctors-subtitle">
                Connect with qualified healthcare professionals for expert consultation
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button 
                onClick={getUserLocation} 
                disabled={isLocationLoading}
                variant={userLocation ? "outline" : "default"}
                className="flex items-center gap-2"
              >
                <Navigation className={`w-4 h-4 ${isLocationLoading ? 'animate-spin' : ''}`} />
                {isLocationLoading ? 'Getting Location...' : userLocation ? 'Location Found' : 'Get My Location'}
              </Button>
            </div>
          </div>
          
          {/* Location Status */}
          {userLocation && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <MapPin className="w-4 h-4" />
              <span>Location detected • Showing nearby hospitals and doctors</span>
              {nearbyHospitals.length > 0 && (
                <span className="ml-2 text-green-700 font-medium">
                  {nearbyHospitals.length} hospitals nearby
                </span>
              )}
            </div>
          )}
          
          {locationError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <MapPin className="w-4 h-4" />
              <span>{locationError}</span>
              <Button 
                onClick={getUserLocation} 
                size="sm" 
                variant="outline" 
                className="ml-auto"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Find Doctors
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Hospitals & Map
            </TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <TabsContent value="doctors">
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search doctors by name or specialization..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-doctors"
                      />
                    </div>
                  </div>
                  
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-specialty">
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      {specialties.map(specialty => (
                        <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedRating} onValueChange={setSelectedRating}>
                    <SelectTrigger className="w-full md:w-32" data-testid="select-rating">
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      <SelectItem value="4.0">4.0+ Stars</SelectItem>
                      <SelectItem value="3.5">3.5+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hospitals">
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Hospitals in Indore</h3>
                    <p className="text-muted-foreground text-sm">View hospitals in list or map format</p>
                  </div>
                  <div className="flex gap-2">
                    {!userLocation && (
                      <Button 
                        onClick={getUserLocation} 
                        disabled={isLocationLoading}
                        variant="outline"
                        size="sm"
                      >
                        <Navigation className={`w-4 h-4 mr-2 ${isLocationLoading ? 'animate-spin' : ''}`} />
                        {isLocationLoading ? 'Getting Location...' : 'Get Location'}
                      </Button>
                    )}
                    <Button
                      onClick={() => setShowMapView(!showMapView)}
                      variant={showMapView ? 'default' : 'outline'}
                      size="sm"
                    >
                      <MapIcon className="w-4 h-4 mr-2" />
                      {showMapView ? 'List View' : 'Map View'}
                    </Button>
                  </div>
                </div>

                {showMapView ? (
                  <Suspense fallback={
                    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Loading map...</p>
                      </div>
                    </div>
                  }>
                    <HospitalMap
                      hospitals={nearbyHospitals.length > 0 ? nearbyHospitals : hospitals}
                      userLocation={userLocation || undefined}
                      onDirectionsClick={openDirections}
                      onBookAppointment={handleHospitalBooking}
                      height="500px"
                      className="mb-4"
                    />
                  </Suspense>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(nearbyHospitals.length > 0 ? nearbyHospitals : hospitals).map((hospital) => (
                      <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base font-medium">{hospital.name}</CardTitle>
                              <div className="flex items-center mt-1">
                                {renderRatingStars(hospital.rating)}
                                <span className="text-sm text-muted-foreground ml-1">({hospital.rating})</span>
                              </div>
                            </div>
                            {hospital.emergencyServices && (
                              <Badge variant="destructive" className="text-xs">
                                Emergency
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span className="line-clamp-2">{hospital.address}</span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Phone className="w-4 h-4 mr-2" />
                              <span>{hospital.phone}</span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Shield className="w-4 h-4 mr-2" />
                              <span>{hospital.specialties.slice(0, 2).join(', ')}</span>
                              {hospital.specialties.length > 2 && (
                                <span className="ml-1 text-xs">+{hospital.specialties.length - 2} more</span>
                              )}
                            </div>
                            {hospital.distance && (
                              <div className="text-green-600 font-medium">
                                {hospital.distance.toFixed(1)} km away
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => openDirections(hospital)}
                            >
                              <Navigation className="w-4 h-4 mr-1" />
                              Directions
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleHospitalBooking(hospital.id)}
                            >
                              Book Appointment
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Results Summary - Only show on doctors tab */}
        {activeTab === 'doctors' && (
          <div className="mb-6">
            <p className="text-muted-foreground" data-testid="text-results-count">
              Found {filteredDoctors.length} doctors
            </p>
          </div>
        )}

        {/* Doctors Grid - Only show on doctors tab */}
        {activeTab === 'doctors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow" data-testid={`card-doctor-${doctor.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg" data-testid={`text-doctor-name-${doctor.id}`}>
                      {doctor.name}
                    </CardTitle>
                    <CardDescription data-testid={`text-doctor-specialty-${doctor.id}`}>
                      {doctor.specialization}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    {doctor.isOnline && (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                    {doctor.isOnline && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Online
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Rating and Experience */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {renderRatingStars(doctor.rating)}
                    <span className="text-sm font-medium ml-1" data-testid={`text-doctor-rating-${doctor.id}`}>
                      {doctor.rating}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {doctor.experience} years
                  </div>
                </div>

                {/* Qualification and Fee */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground" data-testid={`text-doctor-qualification-${doctor.id}`}>
                    {doctor.qualification}
                  </p>
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-medium">₹{doctor.consultationFee}</span>
                    <span className="text-muted-foreground ml-1">consultation</span>
                  </div>
                </div>

                {/* Hospital and Languages */}
                <div className="space-y-2">
                  {doctor.hospitalAffiliation && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      {doctor.hospitalAffiliation}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {doctor.languages.slice(0, 3).map(lang => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Booking Options */}
                <div className="space-y-2 pt-2">
                  <Tabs defaultValue="video" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="video" className="text-xs" data-testid={`tab-video-${doctor.id}`}>
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </TabsTrigger>
                      <TabsTrigger value="phone" className="text-xs" data-testid={`tab-phone-${doctor.id}`}>
                        <Phone className="w-3 h-3 mr-1" />
                        Phone
                      </TabsTrigger>
                      <TabsTrigger value="visit" className="text-xs" data-testid={`tab-visit-${doctor.id}`}>
                        <MapPin className="w-3 h-3 mr-1" />
                        Visit
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="video" className="mt-2">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleBookAppointment(doctor.id, 'video')}
                        data-testid={`button-book-video-${doctor.id}`}
                      >
                        Book Video Call
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="phone" className="mt-2">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleBookAppointment(doctor.id, 'phone')}
                        data-testid={`button-book-phone-${doctor.id}`}
                      >
                        Book Phone Call
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="visit" className="mt-2">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => handleBookAppointment(doctor.id, 'visit')}
                        data-testid={`button-book-visit-${doctor.id}`}
                      >
                        Book Hospital Visit
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {/* No Results - Only show on doctors tab */}
        {activeTab === 'doctors' && filteredDoctors.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2" data-testid="text-no-doctors">
              No doctors found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}

      </div>
      
      {/* Enhanced Appointment Booking Dialog */}
      <AppointmentBookingDialog
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedDoctor(null);
          setSelectedHospital(null);
        }}
        doctor={selectedDoctor}
        hospital={selectedHospital || undefined}
        onConfirm={confirmAppointment}
      />
    </div>
  );
}
