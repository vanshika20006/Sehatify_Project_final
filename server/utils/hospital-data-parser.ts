import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hospitalsTable } from '../../shared/schema';
import { v4 as uuidv4 } from 'uuid';

interface HospitalData {
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  hours?: string;
  type: string;
}

export async function parseAndInsertHospitalData() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const sql_conn = neon(process.env.DATABASE_URL);
  const db = drizzle(sql_conn);

  // Hospital data from the provided files
  const hospitalData: HospitalData[] = [
    {
      name: "CHL Group of Hospitals",
      address: "A.B. Road, Near L.I.G Square, Indore, Madhya Pradesh 452008",
      rating: 4.1,
      reviewCount: 35,
      phone: "0731 662 2222",
      hours: "Open 24 hours",
      type: "Hospital"
    },
    {
      name: "Jupiter Hospital",
      address: "Scheme No. 94, Sector 1, Ring Road, Near Teen Imli Square, Indore, Madhya Pradesh 452020",
      rating: 4.5,
      reviewCount: 11,
      phone: "0731 471 8111",
      hours: "",
      type: "Hospital"
    },
    {
      name: "Bombay Hospital",
      address: "Eastern Ring Road, Ring Road, IDA Scheme No.94/95, Tulsi Nagar, Indore, Madhya Pradesh 452010",
      rating: 3.9,
      reviewCount: 56,
      phone: "0731 255 8866",
      hours: "",
      type: "Hospital"
    },
    {
      name: "Arihant Hospital & Research Centre",
      address: "283- A, Scheme No 71, Indore, Madhya Pradesh 452009",
      phone: "0731 278 5172",
      hours: "Open 24 hours",
      type: "Hospital"
    },
    {
      name: "AKASH HOSPITAL",
      address: "Bicholi Mardana Main Road, Opposite Agrawal Public School, Indore, Madhya Pradesh 452016",
      rating: 4.1,
      reviewCount: 25,
      phone: "097525 94080",
      hours: "",
      type: "Hospital"
    },
    {
      name: "Apollo Hospitals",
      address: "Scheme No. 74 C, Sector D, Indore, Madhya Pradesh 452010",
      phone: "0731 244 5566",
      hours: "Open 24 hours",
      type: "Hospital"
    },
    {
      name: "Choithram Hospital & Research Centre",
      address: "14, Manik Bagh Road, Indore, Madhya Pradesh 452014",
      phone: "0731 420 6750",
      hours: "",
      type: "Hospital"
    },
    {
      name: "Medista Hospital",
      address: "52/a, Khisnpuri Colony, Udhyog Nagar, Musakhedi, Indore, Madhya Pradesh 452020",
      rating: 5.0,
      reviewCount: 5,
      phone: "0731 353 6666",
      hours: "",
      type: "Hospital"
    },
    {
      name: "Indira Memorial Hospital",
      address: "59-B, Railway Station Main Road, Rajendra Nagar, Indore, Madhya Pradesh 452012",
      rating: 2.0,
      reviewCount: 2,
      phone: "098265 98089",
      hours: "Closed · Opens 10:30",
      type: "Hospital"
    },
    {
      name: "Sahaj Hospital - Endoscopic Super Speciality Center",
      address: "15/2 South Tukoganj Near Manas Bhavan, Behind Hotel Surya, Indore, Madhya Pradesh 452001",
      phone: "0731 251 0200",
      hours: "Open 24 hours",
      type: "Hospital"
    },
    {
      name: "Anand Hospital and Research Centre Private Limited",
      address: "7, Sindhu Nagar, Indore, Madhya Pradesh 452001",
      phone: "0731 409 2120",
      hours: "",
      type: "Hospital"
    },
    {
      name: "V One Hospital",
      address: "2/1, AB Rd, Near Geeta Bhawan, Chouraha, Indore, Madhya Pradesh",
      phone: "0731 358 8888",
      hours: "",
      type: "Hospital"
    },
    {
      name: "Samyak Hospital",
      address: "1, Bijlee Nagar, Bengali Square, Indore, Madhya Pradesh 452016",
      phone: "098269 41160",
      hours: "",
      type: "Hospital"
    },
    {
      name: "Mewara Medicare & Eycare",
      address: "102, OLD A. B Road, Indore, Madhya Pradesh 453441",
      rating: 4.7,
      reviewCount: 14,
      phone: "07324 276 108",
      hours: "",
      type: "Hospital"
    },
    {
      name: "Suyog Hospital",
      address: "195 Ushaganj Main Road, Indore, Madhya Pradesh 452001",
      phone: "0731 409 4647",
      hours: "",
      type: "Hospital"
    },
    {
      name: "Vishesh Hospital",
      address: "2/1, A.B. Road, Near Geeta Bhawan Chouraha, Indore, Madhya Pradesh 452001",
      phone: "0731 423 8111",
      hours: "",
      type: "Hospital"
    },
    {
      name: "Dolphin Hospital",
      address: "584, M G Road, Indore, Madhya Pradesh 452001",
      phone: "0731 254 0688",
      hours: "",
      type: "Hospital"
    },
    {
      name: "Gita Bhawan Hospital",
      address: "Gita Bhawan Road, Kailash Park, Indore, Madhya Pradesh 452001",
      phone: "0731 400 3315",
      hours: "",
      type: "Hospital"
    },
    {
      name: "Charak Hospital",
      address: "Film Bhawanrani Sati Gate Yn Rd, Indore, Madhya Pradesh 452003",
      phone: "0731 400 8700",
      hours: "",
      type: "Hospital"
    },
    {
      name: "Government P C Sethi Hospital",
      address: "Ab Road, Indore, Madhya Pradesh 452001",
      phone: "094066 67972",
      hours: "",
      type: "Hospital"
    }
  ];

  try {
    console.log('Starting hospital data insertion...');

    // Get approximate coordinates for Indore, Madhya Pradesh
    const indoreCoordinates = {
      latitude: 22.7196,
      longitude: 75.8577
    };

    // Add some variation to coordinates to simulate different locations
    const variations = [
      { lat: 0.05, lng: 0.05 },
      { lat: -0.03, lng: 0.02 },
      { lat: 0.02, lng: -0.04 },
      { lat: -0.01, lng: 0.03 },
      { lat: 0.04, lng: -0.02 },
      { lat: -0.02, lng: -0.01 },
      { lat: 0.01, lng: 0.04 },
      { lat: 0.03, lng: -0.03 },
      { lat: -0.04, lng: 0.01 },
      { lat: 0.02, lng: 0.02 }
    ];

    for (let i = 0; i < hospitalData.length; i++) {
      const hospital = hospitalData[i];
      const variation = variations[i % variations.length];

      // Extract pincode from address
      const pincodeMatch = hospital.address.match(/\d{6}/);
      const pincode = pincodeMatch ? pincodeMatch[0] : '452001';

      // Parse operating hours
      const operatingHours = hospital.hours === "Open 24 hours" ? [
        { day: 'Monday', open: '00:00', close: '23:59' },
        { day: 'Tuesday', open: '00:00', close: '23:59' },
        { day: 'Wednesday', open: '00:00', close: '23:59' },
        { day: 'Thursday', open: '00:00', close: '23:59' },
        { day: 'Friday', open: '00:00', close: '23:59' },
        { day: 'Saturday', open: '00:00', close: '23:59' },
        { day: 'Sunday', open: '00:00', close: '23:59' }
      ] : [
        { day: 'Monday', open: '09:00', close: '18:00' },
        { day: 'Tuesday', open: '09:00', close: '18:00' },
        { day: 'Wednesday', open: '09:00', close: '18:00' },
        { day: 'Thursday', open: '09:00', close: '18:00' },
        { day: 'Friday', open: '09:00', close: '18:00' },
        { day: 'Saturday', open: '09:00', close: '14:00' },
        { day: 'Sunday', open: '10:00', close: '13:00' }
      ];

      const hospitalRecord = {
        id: uuidv4(),
        name: hospital.name,
        address: hospital.address,
        city: 'Indore',
        state: 'Madhya Pradesh',
        country: 'India',
        pincode: pincode,
        phone: hospital.phone || '',
        email: `info@${hospital.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        specialties: ['General Medicine', 'Emergency Care', 'Surgery', 'Diagnostics'],
        rating: hospital.rating || 4.0,
        isPartner: true,
        coordinates: {
          latitude: indoreCoordinates.latitude + variation.lat,
          longitude: indoreCoordinates.longitude + variation.lng
        },
        operatingHours: operatingHours,
        emergencyServices: hospital.hours === "Open 24 hours"
      };

      await db.insert(hospitalsTable).values(hospitalRecord);
      console.log(`Inserted hospital: ${hospital.name}`);
    }

    console.log('Hospital data insertion completed successfully!');
    return { success: true, count: hospitalData.length };

  } catch (error) {
    console.error('Error inserting hospital data:', error);
    throw error;
  }
}