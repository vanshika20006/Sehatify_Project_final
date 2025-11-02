import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Search, Navigation, Phone, Clock, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  distance: number;
  specialties: string[];
  emergencyServices: boolean;
  cashless: boolean;
  timings: string;
}

export function LocateHospitalPage() {
  const { t } = useTranslation();
  const [location, setLocation] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

  // Mock hospital data
  const mockHospitals: Hospital[] = [
    {
      id: '1',
      name: 'Apollo Hospitals',
      address: 'Sarita Vihar, New Delhi - 110076',
      phone: '+91-11-26925858',
      rating: 4.5,
      distance: 2.3,
      specialties: ['Cardiology', 'Neurology', 'Oncology', 'Emergency'],
      emergencyServices: true,
      cashless: true,
      timings: '24/7'
    },
    {
      id: '2', 
      name: 'Fortis Hospital',
      address: 'Sector 62, Noida - 201301',
      phone: '+91-120-6200000',
      rating: 4.3,
      distance: 5.1,
      specialties: ['Orthopedics', 'Cardiology', 'Gastroenterology'],
      emergencyServices: true,
      cashless: true,
      timings: '24/7'
    },
    {
      id: '3',
      name: 'Max Healthcare',
      address: 'Press Enclave Road, Saket, New Delhi - 110017',
      phone: '+91-11-26515050',
      rating: 4.4,
      distance: 3.7,
      specialties: ['Pediatrics', 'Gynecology', 'Dermatology', 'Emergency'],
      emergencyServices: true,
      cashless: true,
      timings: '24/7'
    },
    {
      id: '4',
      name: 'AIIMS Hospital',
      address: 'Ansari Nagar, New Delhi - 110029',
      phone: '+91-11-26588500',
      rating: 4.6,
      distance: 8.2,
      specialties: ['All Specialties', 'Emergency', 'Trauma Center'],
      emergencyServices: true,
      cashless: false,
      timings: '24/7'
    }
  ];

  useEffect(() => {
    setHospitals(mockHospitals);
    setFilteredHospitals(mockHospitals);
  }, []);

  useEffect(() => {
    let filtered = hospitals;
    if (selectedSpecialty !== 'all') {
      filtered = hospitals.filter(hospital => 
        hospital.specialties.some(specialty => 
          specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
        )
      );
    }
    setFilteredHospitals(filtered);
  }, [selectedSpecialty, hospitals]);

  const getCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocation('Current Location');
          setIsLoading(false);
        },
        () => {
          alert('Unable to get location. Please enter manually.');
          setIsLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
            <MapPin className="w-4 h-4 mr-2" />
            Hospital Locator
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Locate Nearby{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Hospitals
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Find the nearest hospitals in your area with cashless treatment, emergency services, and specialized care.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-xl rounded-2xl border-0 bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl text-center text-gray-800">Find Hospitals Near You</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <div className="relative">
                    <Input
                      placeholder="Enter your location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 py-3 text-lg rounded-xl border-purple-200 focus:border-purple-400"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger className="py-3 text-lg rounded-xl border-purple-200">
                      <SelectValue placeholder="Specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Button 
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full py-3 text-lg rounded-xl border-purple-200 hover:bg-purple-50"
                  >
                    <Navigation className="w-5 h-5" />
                  </Button>
                </div>
                <div className="md:col-span-2">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 text-lg rounded-xl shadow-lg">
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {filteredHospitals.length} Hospitals Found
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">Sorted by distance</span>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredHospitals.map((hospital) => (
              <Card key={hospital.id} className="p-6 hover:shadow-xl transition-all duration-300 rounded-2xl border-0 bg-white">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{hospital.name}</h3>
                          <p className="text-gray-600 mb-2">{hospital.address}</p>
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-gray-700 font-medium">{hospital.rating}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 text-purple-400" />
                              <span className="text-gray-700">{hospital.distance} km away</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-green-500" />
                              <span className="text-gray-700">{hospital.timings}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {hospital.specialties.slice(0, 4).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                            {specialty}
                          </Badge>
                        ))}
                        {hospital.emergencyServices && (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                            Emergency 24/7
                          </Badge>
                        )}
                        {hospital.cashless && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                            Cashless Available
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 lg:ml-6">
                      <a href={`tel:${hospital.phone}`}>
                        <Button className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl shadow-lg">
                          <Phone className="w-4 h-4 mr-2" />
                          Call Hospital
                        </Button>
                      </a>
                      <Button variant="outline" className="w-full lg:w-auto border-purple-200 text-purple-700 hover:bg-purple-50 px-6 py-2 rounded-xl">
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Medical Emergency?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            For immediate medical emergencies, call the emergency services or nearest hospital directly
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="tel:108" className="inline-block">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Phone className="w-5 h-5 mr-2" />
                Call 108 - Emergency
              </Button>
            </a>
            <a href="tel:102" className="inline-block">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-10 py-4 text-lg rounded-xl transition-all duration-300">
                <Phone className="w-5 h-5 mr-2" />
                Call 102 - Ambulance
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}