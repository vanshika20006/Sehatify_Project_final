import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MapPin, 
  Clock, 
  Star, 
  Phone, 
  Home, 
  Building, 
  FileText, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Truck,
  TestTube,
  Activity,
  Shield,
  Download,
  Eye
} from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';

interface Lab {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  rating: number;
  isPartner: boolean;
  homeCollectionAvailable: boolean;
  homeCollectionFee: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  operatingHours: Array<{
    day: string;
    open: string;
    close: string;
  }>;
  specializations: string[];
  accreditations: string[];
  reportDeliveryTime: {
    normal: string;
    urgent: string;
  };
}

interface LabTest {
  id: string;
  labId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  discountedPrice?: number;
  sampleType: 'blood' | 'urine' | 'stool' | 'saliva' | 'tissue' | 'imaging' | 'other';
  fastingRequired: boolean;
  fastingHours: number;
  reportTime: string;
  instructions?: string;
  normalRanges?: Record<string, string>;
}

interface LabBooking {
  id: string;
  userId: string;
  labId: string;
  testIds: string[];
  bookingType: 'home_collection' | 'lab_visit';
  scheduledDate: Date;
  scheduledTime: string;
  patientInfo: {
    name: string;
    age: number;
    gender: string;
    phone: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'booked' | 'sample_collected' | 'processing' | 'completed' | 'cancelled';
  phlebotomistId?: string;
  reportFileId?: string;
  cancellationReason?: string;
  bookedAt: Date;
  completedAt?: Date;
}

export function LabTestsPage() {
  const { t } = useTranslation();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [bookings, setBookings] = useState<LabBooking[]>([]);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'home_collection' | 'lab_visit'>('home_collection');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    phone: ''
  });
  const [address, setAddress] = useState({
    street: '',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '',
    landmark: ''
  });
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    loadLabsData();
    loadBookings();
  }, []);

  const loadLabsData = async () => {
    // Mock lab data - in real implementation, this would come from API
    const mockLabs: Lab[] = [
      {
        id: "agilus-silver-park",
        name: "Agilus Diagnostics – Silver Park",
        address: "No. 176, Silver Park Colony, Phase 2",
        city: "Indore",
        state: "Madhya Pradesh", 
        pincode: "453771",
        phone: "+91-731-1234567",
        email: "silverpark@agilus.com",
        rating: 4.3,
        isPartner: true,
        homeCollectionAvailable: true,
        homeCollectionFee: 50,
        coordinates: { latitude: 22.7196, longitude: 75.8577 },
        operatingHours: [
          { day: 'Monday', open: '06:00', close: '21:00' },
          { day: 'Tuesday', open: '06:00', close: '21:00' },
          { day: 'Wednesday', open: '06:00', close: '21:00' },
          { day: 'Thursday', open: '06:00', close: '21:00' },
          { day: 'Friday', open: '06:00', close: '21:00' },
          { day: 'Saturday', open: '06:00', close: '21:00' },
          { day: 'Sunday', open: '07:00', close: '19:00' }
        ],
        specializations: ["pathology", "radiology", "cardiology", "diabetes_care"],
        accreditations: ["NABL", "CAP", "ISO_15189"],
        reportDeliveryTime: { normal: "24 hours", urgent: "4 hours" }
      },
      {
        id: "agilus-nolakha",
        name: "Agilus Diagnostics – Nolakha",
        address: "No. 171/4, Khandelwal Nagar, Nolakha",
        city: "Indore",
        state: "Madhya Pradesh",
        pincode: "452001",
        phone: "+91-731-1234568",
        email: "nolakha@agilus.com", 
        rating: 4.2,
        isPartner: true,
        homeCollectionAvailable: true,
        homeCollectionFee: 50,
        coordinates: { latitude: 22.7296, longitude: 75.8677 },
        operatingHours: [
          { day: 'Monday', open: '06:00', close: '21:00' },
          { day: 'Tuesday', open: '06:00', close: '21:00' },
          { day: 'Wednesday', open: '06:00', close: '21:00' },
          { day: 'Thursday', open: '06:00', close: '21:00' },
          { day: 'Friday', open: '06:00', close: '21:00' },
          { day: 'Saturday', open: '06:00', close: '21:00' },
          { day: 'Sunday', open: '07:00', close: '19:00' }
        ],
        specializations: ["pathology", "radiology", "diabetes_care"],
        accreditations: ["NABL", "ISO_15189"],
        reportDeliveryTime: { normal: "24 hours", urgent: "6 hours" }
      },
      {
        id: "drlal-prabhu-nagar",
        name: "Dr Lal PathLabs – Annapurna Road (Prabhu Nagar)",
        address: "No 1, Annapurna Rd, Prabhu Nagar",
        city: "Indore",
        state: "Madhya Pradesh",
        pincode: "452009",
        phone: "+91-731-3456789",
        email: "prabhunagar@drlalpath.com",
        rating: 4.5,
        isPartner: true,
        homeCollectionAvailable: true,
        homeCollectionFee: 75,
        coordinates: { latitude: 22.7696, longitude: 75.9077 },
        operatingHours: [
          { day: 'Monday', open: '06:00', close: '22:00' },
          { day: 'Tuesday', open: '06:00', close: '22:00' },
          { day: 'Wednesday', open: '06:00', close: '22:00' },
          { day: 'Thursday', open: '06:00', close: '22:00' },
          { day: 'Friday', open: '06:00', close: '22:00' },
          { day: 'Saturday', open: '06:00', close: '22:00' },
          { day: 'Sunday', open: '07:00', close: '20:00' }
        ],
        specializations: ["pathology", "radiology", "molecular_diagnostics", "genetics"],
        accreditations: ["NABL", "CAP", "ISO_15189", "JCI", "FDA"],
        reportDeliveryTime: { normal: "12 hours", urgent: "2 hours" }
      },
      {
        id: "metropolis-janjeer-wala",
        name: "Metropolis Diagnostic Centre – Janjeer Wala Square", 
        address: "Krishna Tower, Janjeer Wala Square",
        city: "Indore",
        state: "Madhya Pradesh",
        pincode: "452001",
        phone: "+91-731-4567890",
        email: "janjeerwalasquare@metropolis.com",
        rating: 4.6,
        isPartner: true,
        homeCollectionAvailable: true,
        homeCollectionFee: 100,
        coordinates: { latitude: 22.7896, longitude: 75.9277 },
        operatingHours: [
          { day: 'Monday', open: '05:30', close: '22:30' },
          { day: 'Tuesday', open: '05:30', close: '22:30' },
          { day: 'Wednesday', open: '05:30', close: '22:30' },
          { day: 'Thursday', open: '05:30', close: '22:30' },
          { day: 'Friday', open: '05:30', close: '22:30' },
          { day: 'Saturday', open: '05:30', close: '22:30' },
          { day: 'Sunday', open: '06:30', close: '21:30' }
        ],
        specializations: ["pathology", "radiology", "molecular_diagnostics", "genetics", "specialized_tests"],
        accreditations: ["NABL", "CAP", "ISO_15189", "JCI", "FDA", "CE"],
        reportDeliveryTime: { normal: "6 hours", urgent: "1 hour" }
      }
    ];
    setLabs(mockLabs);
  };

  const loadLabTests = (labId: string) => {
    // Mock lab test data
    const mockTests: LabTest[] = [
      {
        id: "cbc-test",
        labId,
        name: "Complete Blood Count (CBC)",
        category: "Blood Test",
        description: "Comprehensive blood analysis including RBC, WBC, Hemoglobin, Platelets",
        price: 300,
        discountedPrice: 250,
        sampleType: "blood",
        fastingRequired: false,
        fastingHours: 0,
        reportTime: "4 hours",
        instructions: "No special preparation required",
        normalRanges: {
          "Hemoglobin (g/dL)": "12.0-15.5",
          "RBC count": "4.5-5.9 million",
          "WBC count": "4,000-11,000"
        }
      },
      {
        id: "lipid-profile",
        labId,
        name: "Lipid Profile",
        category: "Blood Test",
        description: "Cholesterol levels including Total, HDL, LDL, Triglycerides",
        price: 500,
        discountedPrice: 400,
        sampleType: "blood",
        fastingRequired: true,
        fastingHours: 12,
        reportTime: "6 hours",
        instructions: "Fast for 12 hours before test. Only water allowed.",
        normalRanges: {
          "Total Cholesterol": "<200 mg/dL",
          "HDL": ">40 mg/dL (men), >50 mg/dL (women)",
          "LDL": "<100 mg/dL",
          "Triglycerides": "<150 mg/dL"
        }
      },
      {
        id: "blood-sugar",
        labId,
        name: "Blood Sugar (Fasting)",
        category: "Blood Test",
        description: "Fasting glucose levels to check for diabetes",
        price: 150,
        discountedPrice: 120,
        sampleType: "blood",
        fastingRequired: true,
        fastingHours: 10,
        reportTime: "2 hours",
        instructions: "Fast for 10-12 hours. Only water allowed.",
        normalRanges: {
          "Glucose": "70-100 mg/dL"
        }
      },
      {
        id: "thyroid-function",
        labId,
        name: "Thyroid Function Test (TSH, T3, T4)",
        category: "Blood Test", 
        description: "Complete thyroid hormone analysis",
        price: 800,
        discountedPrice: 650,
        sampleType: "blood",
        fastingRequired: false,
        fastingHours: 0,
        reportTime: "8 hours",
        instructions: "No special preparation required",
        normalRanges: {
          "TSH": "0.4-4.0 mIU/L",
          "T3": "80-200 ng/dL",
          "T4": "4.5-12.0 μg/dL"
        }
      },
      {
        id: "vitamin-d3",
        labId,
        name: "Vitamin D3",
        category: "Blood Test",
        description: "25-Hydroxy Vitamin D levels",
        price: 1200,
        discountedPrice: 1000,
        sampleType: "blood",
        fastingRequired: false,
        fastingHours: 0,
        reportTime: "24 hours",
        instructions: "No special preparation required",
        normalRanges: {
          "Vitamin D3": "30-100 ng/mL (Sufficient)"
        }
      }
    ];
    setLabTests(mockTests);
  };

  const loadBookings = () => {
    // Mock booking data
    const mockBookings: LabBooking[] = [
      {
        id: "booking-1",
        userId: "demo-user",
        labId: "drlal-prabhu-nagar",
        testIds: ["cbc-test", "lipid-profile"],
        bookingType: "home_collection",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        scheduledTime: "09:00 AM",
        patientInfo: {
          name: "John Doe",
          age: 32,
          gender: "Male",
          phone: "+91-9876543210"
        },
        address: {
          street: "123 Sample Street",
          city: "Indore",
          state: "Madhya Pradesh",
          pincode: "452001",
          landmark: "Near City Mall"
        },
        totalAmount: 775,
        paymentStatus: "pending",
        status: "booked",
        bookedAt: new Date()
      }
    ];
    setBookings(mockBookings);
  };

  const handleLabSelect = (lab: Lab) => {
    setSelectedLab(lab);
    loadLabTests(lab.id);
    setIsBookingDialogOpen(true);
  };

  const handleTestToggle = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const calculateTotal = () => {
    const testsTotal = labTests
      .filter(test => selectedTests.includes(test.id))
      .reduce((sum, test) => sum + (test.discountedPrice || test.price), 0);
    const collectionFee = bookingType === 'home_collection' ? (selectedLab?.homeCollectionFee || 0) : 0;
    return testsTotal + collectionFee;
  };

  const handleBooking = async () => {
    if (!selectedLab || selectedTests.length === 0) return;

    setIsLoading(true);
    try {
      // Mock booking API call
      const bookingData = {
        labId: selectedLab.id,
        testIds: selectedTests,
        bookingType,
        scheduledDate,
        scheduledTime,
        patientInfo: {
          ...patientInfo,
          age: parseInt(patientInfo.age)
        },
        address: bookingType === 'home_collection' ? address : undefined,
        totalAmount: calculateTotal()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newBooking: LabBooking = {
        id: `booking-${Date.now()}`,
        userId: "demo-user",
        ...bookingData,
        scheduledDate: new Date(scheduledDate),
        paymentStatus: "pending",
        status: "booked",
        bookedAt: new Date()
      };

      setBookings(prev => [newBooking, ...prev]);
      setIsBookingDialogOpen(false);
      
      // Reset form
      setSelectedTests([]);
      setPatientInfo({ name: '', age: '', gender: '', phone: '' });
      setAddress({ street: '', city: 'Indore', state: 'Madhya Pradesh', pincode: '', landmark: '' });
      setScheduledDate('');
      setScheduledTime('');

      alert('Lab test booked successfully! You will receive a confirmation call shortly.');
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book lab test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLabs = labs.filter(lab => 
    lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lab.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      booked: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      sample_collected: { color: 'bg-yellow-100 text-yellow-800', icon: Truck },
      processing: { color: 'bg-purple-100 text-purple-800', icon: Activity },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.booked;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Lab Test & Diagnostic</h1>
              <p className="text-muted-foreground">Book lab tests and get reports from certified labs in Indore</p>
            </div>
            <div className="flex items-center space-x-2">
              <TestTube className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">{labs.length} Labs Available</span>
            </div>
          </div>

          <Tabs defaultValue="labs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="labs">Find Labs</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="reports">Test Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="labs" className="space-y-6">
              {/* Search Bar */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search labs by name or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Labs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredLabs.map((lab) => (
                  <Card key={lab.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{lab.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4" />
                            {lab.address}, {lab.city} - {lab.pincode}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{lab.rating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Lab Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{lab.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>6:00 AM - 9:00 PM</span>
                        </div>
                      </div>

                      {/* Specializations */}
                      <div>
                        <div className="text-sm font-medium mb-2">Specializations</div>
                        <div className="flex flex-wrap gap-1">
                          {lab.specializations.slice(0, 3).map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec.replace('_', ' ')}
                            </Badge>
                          ))}
                          {lab.specializations.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{lab.specializations.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Home Collection */}
                      {lab.homeCollectionAvailable && (
                        <Alert>
                          <Home className="h-4 w-4" />
                          <AlertDescription>
                            Home collection available for ₹{lab.homeCollectionFee}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Accreditations */}
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <div className="flex gap-1">
                          {lab.accreditations.map((acc) => (
                            <Badge key={acc} variant="outline" className="text-xs">
                              {acc}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Report Delivery Time */}
                      <div className="text-sm text-muted-foreground">
                        Reports ready in: <strong>{lab.reportDeliveryTime.normal}</strong> (Normal) | <strong>{lab.reportDeliveryTime.urgent}</strong> (Urgent)
                      </div>

                      {/* Book Test Button */}
                      <Button 
                        onClick={() => handleLabSelect(lab)}
                        className="w-full"
                      >
                        Book Test
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <TestTube className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-muted-foreground">No bookings yet. Book your first lab test!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const lab = labs.find(l => l.id === booking.labId);
                    const bookedTests = labTests.filter(t => booking.testIds.includes(t.id));
                    
                    return (
                      <Card key={booking.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{lab?.name}</CardTitle>
                              <CardDescription>
                                Booking ID: {booking.id} | {booking.scheduledDate.toLocaleDateString()} at {booking.scheduledTime}
                              </CardDescription>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Tests Booked */}
                          <div>
                            <div className="text-sm font-medium mb-2">Tests Booked</div>
                            <div className="space-y-1">
                              {bookedTests.map((test) => (
                                <div key={test.id} className="flex justify-between text-sm">
                                  <span>{test.name}</span>
                                  <span>₹{test.discountedPrice || test.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Booking Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-medium">Patient Info</div>
                              <div>{booking.patientInfo.name}, {booking.patientInfo.age} years</div>
                              <div>{booking.patientInfo.phone}</div>
                            </div>
                            <div>
                              <div className="font-medium">Collection</div>
                              <div className="flex items-center gap-1">
                                {booking.bookingType === 'home_collection' ? (
                                  <>
                                    <Home className="w-4 h-4" />
                                    Home Collection
                                  </>
                                ) : (
                                  <>
                                    <Building className="w-4 h-4" />
                                    Lab Visit
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Address for Home Collection */}
                          {booking.bookingType === 'home_collection' && booking.address && (
                            <div>
                              <div className="text-sm font-medium">Collection Address</div>
                              <div className="text-sm text-muted-foreground">
                                {booking.address.street}, {booking.address.city} - {booking.address.pincode}
                                {booking.address.landmark && `, Near ${booking.address.landmark}`}
                              </div>
                            </div>
                          )}

                          {/* Total Amount */}
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="font-medium">Total Amount</span>
                            <span className="text-lg font-bold">₹{booking.totalAmount}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {booking.status === 'completed' && (
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Download Report
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Reports</CardTitle>
                  <CardDescription>Your completed lab test reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-muted-foreground">No reports available yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Reports will appear here once your tests are completed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Lab Test - {selectedLab?.name}</DialogTitle>
            <DialogDescription>
              Select tests and provide details for booking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Collection Type */}
            <div>
              <Label className="text-base font-medium">Collection Type</Label>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => setBookingType('home_collection')}
                  className={`flex items-center gap-2 p-4 border rounded-lg ${
                    bookingType === 'home_collection' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Home Collection</div>
                    <div className="text-sm text-muted-foreground">
                      ₹{selectedLab?.homeCollectionFee} collection fee
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setBookingType('lab_visit')}
                  className={`flex items-center gap-2 p-4 border rounded-lg ${
                    bookingType === 'lab_visit' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <Building className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Lab Visit</div>
                    <div className="text-sm text-muted-foreground">Visit the lab</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Test Selection */}
            <div>
              <Label className="text-base font-medium">Select Tests</Label>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {labTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedTests.includes(test.id)}
                      onCheckedChange={() => handleTestToggle(test.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">{test.description}</div>
                      {test.fastingRequired && (
                        <div className="text-xs text-orange-600 mt-1">
                          Fasting required: {test.fastingHours} hours
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {test.discountedPrice && test.discountedPrice < test.price ? (
                        <div>
                          <span className="text-sm line-through text-gray-400">₹{test.price}</span>
                          <div className="font-medium">₹{test.discountedPrice}</div>
                        </div>
                      ) : (
                        <div className="font-medium">₹{test.price}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Report: {test.reportTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Patient Information */}
            <div>
              <Label className="text-base font-medium">Patient Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="patient-name">Full Name *</Label>
                  <Input
                    id="patient-name"
                    value={patientInfo.name}
                    onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="patient-age">Age *</Label>
                  <Input
                    id="patient-age"
                    type="number"
                    value={patientInfo.age}
                    onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="patient-gender">Gender *</Label>
                  <Select value={patientInfo.gender} onValueChange={(value) => setPatientInfo({...patientInfo, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="patient-phone">Phone Number *</Label>
                  <Input
                    id="patient-phone"
                    value={patientInfo.phone}
                    onChange={(e) => setPatientInfo({...patientInfo, phone: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address (for Home Collection) */}
            {bookingType === 'home_collection' && (
              <div>
                <Label className="text-base font-medium">Collection Address</Label>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label htmlFor="street">Street Address *</Label>
                    <Textarea
                      id="street"
                      value={address.street}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                      placeholder="House/Flat No., Building Name, Street"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={address.state}
                        onChange={(e) => setAddress({...address, state: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={address.pincode}
                        onChange={(e) => setAddress({...address, pincode: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                      id="landmark"
                      value={address.landmark}
                      onChange={(e) => setAddress({...address, landmark: e.target.value})}
                      placeholder="Nearby landmark for easy location"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Scheduling */}
            <div>
              <Label className="text-base font-medium">Schedule Collection</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="date">Preferred Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Preferred Time *</Label>
                  <Select value={scheduledTime} onValueChange={setScheduledTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="06:00 AM">06:00 AM</SelectItem>
                      <SelectItem value="07:00 AM">07:00 AM</SelectItem>
                      <SelectItem value="08:00 AM">08:00 AM</SelectItem>
                      <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                      <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                      <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                      <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                      <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                      <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                      <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                      <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                      <SelectItem value="05:00 PM">05:00 PM</SelectItem>
                      <SelectItem value="06:00 PM">06:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            {selectedTests.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-base font-medium mb-3">Bill Summary</div>
                <div className="space-y-2">
                  {labTests
                    .filter(test => selectedTests.includes(test.id))
                    .map((test) => (
                      <div key={test.id} className="flex justify-between text-sm">
                        <span>{test.name}</span>
                        <span>₹{test.discountedPrice || test.price}</span>
                      </div>
                    ))}
                  {bookingType === 'home_collection' && (
                    <div className="flex justify-between text-sm">
                      <span>Home Collection Fee</span>
                      <span>₹{selectedLab?.homeCollectionFee}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Book Button */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsBookingDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBooking}
                disabled={
                  selectedTests.length === 0 ||
                  !patientInfo.name ||
                  !patientInfo.age ||
                  !patientInfo.gender ||
                  !patientInfo.phone ||
                  !scheduledDate ||
                  !scheduledTime ||
                  (bookingType === 'home_collection' && (!address.street || !address.pincode)) ||
                  isLoading
                }
              >
                {isLoading ? 'Booking...' : `Book for ₹${calculateTotal()}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}