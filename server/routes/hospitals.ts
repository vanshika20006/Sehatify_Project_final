import { Router } from 'express';
import { DbStorage } from '../db-storage';

const router = Router();
const dbStorage = new DbStorage();

// Hospital data from the provided files
const hospitalData = [
  {
    name: "CHL Group of Hospitals",
    address: "A.B. Road, Near L.I.G Square, Indore, Madhya Pradesh 452008",
    city: "Indore",
    state: "Madhya Pradesh",
    country: "India",
    pincode: "452008",
    phone: "0731 662 2222",
    email: "info@chlhospitals.com",
    specialties: ["Cardiology", "Neurology", "Orthopedics", "Emergency Care"],
    rating: 4.1,
    isPartner: true,
    coordinates: { latitude: 22.7196, longitude: 75.8577 },
    operatingHours: [
      { day: 'Monday', open: '00:00', close: '23:59' },
      { day: 'Tuesday', open: '00:00', close: '23:59' },
      { day: 'Wednesday', open: '00:00', close: '23:59' },
      { day: 'Thursday', open: '00:00', close: '23:59' },
      { day: 'Friday', open: '00:00', close: '23:59' },
      { day: 'Saturday', open: '00:00', close: '23:59' },
      { day: 'Sunday', open: '00:00', close: '23:59' }
    ],
    emergencyServices: true
  },
  {
    name: "Jupiter Hospital",
    address: "Scheme No. 94, Sector 1, Ring Road, Near Teen Imli Square, Indore, Madhya Pradesh 452020",
    city: "Indore",
    state: "Madhya Pradesh",
    country: "India",
    pincode: "452020",
    phone: "0731 471 8111",
    email: "info@jupiterhospital.com",
    specialties: ["Multi-specialty", "Cancer Care", "Heart Surgery"],
    rating: 4.5,
    isPartner: true,
    coordinates: { latitude: 22.7296, longitude: 75.8677 },
    operatingHours: [
      { day: 'Monday', open: '00:00', close: '23:59' },
      { day: 'Tuesday', open: '00:00', close: '23:59' },
      { day: 'Wednesday', open: '00:00', close: '23:59' },
      { day: 'Thursday', open: '00:00', close: '23:59' },
      { day: 'Friday', open: '00:00', close: '23:59' },
      { day: 'Saturday', open: '00:00', close: '23:59' },
      { day: 'Sunday', open: '00:00', close: '23:59' }
    ],
    emergencyServices: true
  },
  {
    name: "Apollo Hospitals",
    address: "Scheme No. 74 C, Sector D, Indore, Madhya Pradesh 452010",
    city: "Indore",
    state: "Madhya Pradesh",
    country: "India",
    pincode: "452010",
    phone: "0731 244 5566",
    email: "info@apollohospitals.com",
    specialties: ["Cardiology", "Neurosurgery", "Oncology"],
    rating: 4.3,
    isPartner: true,
    coordinates: { latitude: 22.7096, longitude: 75.8477 },
    operatingHours: [
      { day: 'Monday', open: '00:00', close: '23:59' },
      { day: 'Tuesday', open: '00:00', close: '23:59' },
      { day: 'Wednesday', open: '00:00', close: '23:59' },
      { day: 'Thursday', open: '00:00', close: '23:59' },
      { day: 'Friday', open: '00:00', close: '23:59' },
      { day: 'Saturday', open: '00:00', close: '23:59' },
      { day: 'Sunday', open: '00:00', close: '23:59' }
    ],
    emergencyServices: true
  },
  {
    name: "Medista Hospital",
    address: "52/a, Khisnpuri Colony, Udhyog Nagar, Musakhedi, Indore, Madhya Pradesh 452020",
    city: "Indore",
    state: "Madhya Pradesh",
    country: "India",
    pincode: "452020",
    phone: "0731 353 6666",
    email: "info@medistahospital.com",
    specialties: ["Gynecology", "Orthopedics", "General Medicine"],
    rating: 5.0,
    isPartner: true,
    coordinates: { latitude: 22.7396, longitude: 75.8777 },
    operatingHours: [
      { day: 'Monday', open: '09:00', close: '18:00' },
      { day: 'Tuesday', open: '09:00', close: '18:00' },
      { day: 'Wednesday', open: '09:00', close: '18:00' },
      { day: 'Thursday', open: '09:00', close: '18:00' },
      { day: 'Friday', open: '09:00', close: '18:00' },
      { day: 'Saturday', open: '09:00', close: '14:00' },
      { day: 'Sunday', open: '10:00', close: '13:00' }
    ],
    emergencyServices: false
  },
  {
    name: "Bombay Hospital",
    address: "Eastern Ring Road, Ring Road, IDA Scheme No.94/95, Tulsi Nagar, Indore, Madhya Pradesh 452010",
    city: "Indore",
    state: "Madhya Pradesh",
    country: "India",
    pincode: "452010",
    phone: "0731 255 8866",
    email: "info@bombayhospital.com",
    specialties: ["General Medicine", "Emergency Care", "Surgery", "Diagnostics"],
    rating: 3.9,
    isPartner: true,
    coordinates: { latitude: 22.7050, longitude: 75.8550 },
    operatingHours: [
      { day: 'Monday', open: '09:00', close: '18:00' },
      { day: 'Tuesday', open: '09:00', close: '18:00' },
      { day: 'Wednesday', open: '09:00', close: '18:00' },
      { day: 'Thursday', open: '09:00', close: '18:00' },
      { day: 'Friday', open: '09:00', close: '18:00' },
      { day: 'Saturday', open: '09:00', close: '14:00' },
      { day: 'Sunday', open: '10:00', close: '13:00' }
    ],
    emergencyServices: true
  }
];

// GET /api/hospitals - Get all hospitals
router.get('/', async (req, res) => {
  try {
    try {
      const hospitals = await dbStorage.getHospitals();
      
      // If no hospitals in database, populate with sample data
      if (hospitals.length === 0) {
        console.log('No hospitals found in database, populating with sample data...');
        
        for (const hospital of hospitalData) {
          await dbStorage.createHospital(hospital);
        }
        
        // Fetch the newly inserted hospitals
        const newHospitals = await dbStorage.getHospitals();
        res.json(newHospitals);
      } else {
        res.json(hospitals);
      }
    } catch (dbError) {
      console.error('Database error, using fallback hospital data:', dbError);
      // Return fallback data when database is unavailable
      res.json(hospitalData);
    }
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
});

// GET /api/hospitals/nearby - Get hospitals near a location
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const hospitals = await dbStorage.getHospitals();
    
    // Calculate distance and filter
    const hospitalsWithDistance = hospitals.map(hospital => {
      const distance = calculateDistance(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        hospital.coordinates.latitude,
        hospital.coordinates.longitude
      );
      return { ...hospital, distance };
    });
    
    // Filter by radius and sort by distance
    const nearbyHospitals = hospitalsWithDistance
      .filter(h => h.distance <= parseFloat(radius as string))
      .sort((a, b) => a.distance - b.distance);
    
    res.json(nearbyHospitals);
  } catch (error) {
    console.error('Error fetching nearby hospitals:', error);
    res.status(500).json({ error: 'Failed to fetch nearby hospitals' });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export { router as hospitalsRouter };