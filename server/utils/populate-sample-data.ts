import { storage } from '../storage';

export async function populateSampleData() {
  try {
    console.log('Populating sample donation data...');

    // Demo user ID - matches the one in the database
    const DEMO_USER_ID = 'a2282785-e9d5-4a1b-9e3e-21d53d3a413e';

    // Sample hospitals with blood banks
    const sampleHospitals = [
      {
        id: 'h1',
        name: 'Apollo Hospital',
        address: 'Jubilee Hills, Hyderabad',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        pincode: '500033',
        phone: '+91-40-23607777',
        email: 'info@apollohospital.com',
        specialties: ['Cardiology', 'Neurology', 'Oncology', 'Blood Bank', 'Hematology'],
        rating: 4.8,
        isPartner: true,
        coordinates: { latitude: 17.4239, longitude: 78.4738 },
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
        id: 'h2',
        name: 'Fortis Hospital',
        address: 'Bannerghatta Road, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        pincode: '560076',
        phone: '+91-80-66214444',
        email: 'info@fortishealthcare.com',
        specialties: ['Emergency', 'Critical Care', 'Trauma', 'Blood Bank'],
        rating: 4.6,
        isPartner: true,
        coordinates: { latitude: 12.9082, longitude: 77.6082 },
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
        id: 'h3',
        name: 'Max Healthcare',
        address: 'Saket, New Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110017',
        phone: '+91-11-26515050',
        email: 'info@maxhealthcare.com',
        specialties: ['Hematology', 'Blood Bank', 'Emergency', 'Oncology'],
        rating: 4.7,
        isPartner: true,
        coordinates: { latitude: 28.5245, longitude: 77.2066 },
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
      }
    ];

    // Create hospitals
    for (const hospital of sampleHospitals) {
      try {
        await storage.createHospital(hospital);
        console.log(`Created hospital: ${hospital.name}`);
      } catch (error) {
        console.log(`Hospital ${hospital.name} already exists or error:`, error);
      }
    }

    // Use the demo user ID for donor profile creation

    // Sample donor profile for the demo user
    const demoUserDonorProfile = {
      userId: DEMO_USER_ID,
      bloodGroup: 'O+' as const,
      isAvailable: true,
      lastDonationDate: new Date('2024-01-15'),
      totalDonations: 2,
      rewardCoins: 175,
      donorType: 'all' as const,
      location: {
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        coordinates: {
          latitude: 17.4065,
          longitude: 78.4772
        }
      },
      medicalEligibility: {
        weight: 65,
        hemoglobin: 13.5,
        lastHealthCheck: new Date('2024-01-01'),
        isEligible: true
      },
      emergencyContact: {
        name: 'Demo Contact',
        phone: '+91-9876543210',
        relation: 'Family'
      },
      registeredAt: new Date('2023-12-01')
    };

    // Create donor profile for demo user
    try {
      await storage.createDonorProfile(demoUserDonorProfile);
      console.log('Created demo user donor profile');
    } catch (error) {
      console.log('Demo user donor profile already exists or error:', error);
    }

    // Sample donation history for demo user
    const sampleDonations = [
      {
        donorId: DEMO_USER_ID,
        recipientHospitalId: 'h1',
        donationType: 'blood' as const,
        bloodGroup: 'O+' as const,
        quantity: 450,
        rewardCoins: 100,
        status: 'completed' as const,
        scheduledDate: new Date('2024-01-15'),
        completedDate: new Date('2024-01-15')
      },
      {
        donorId: DEMO_USER_ID,
        recipientHospitalId: 'h2',
        donationType: 'plasma' as const,
        bloodGroup: 'O+' as const,
        quantity: 250,
        rewardCoins: 75,
        status: 'completed' as const,
        scheduledDate: new Date('2024-02-20'),
        completedDate: new Date('2024-02-20')
      },
      {
        donorId: DEMO_USER_ID,
        recipientHospitalId: 'h3',
        donationType: 'blood' as const,
        bloodGroup: 'O+' as const,
        quantity: 450,
        rewardCoins: 100,
        status: 'scheduled' as const,
        scheduledDate: new Date('2024-12-15')
      }
    ];

    // Create sample donations
    for (const donation of sampleDonations) {
      try {
        await storage.createDonation(donation);
        console.log(`Created donation: ${donation.donationType} - ${donation.status}`);
      } catch (error) {
        console.log('Donation already exists or error:', error);
      }
    }

    // Sample donation requests from hospitals
    const sampleDonationRequests = [
      {
        hospitalId: 'h1',
        bloodGroup: 'O+' as const,
        donationType: 'blood' as const,
        urgencyLevel: 'high' as const,
        unitsNeeded: 10,
        unitsCollected: 3,
        location: {
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500033',
          coordinates: {
            latitude: 17.4239,
            longitude: 78.4738
          }
        },
        patientInfo: {
          age: 45,
          condition: 'Emergency surgery',
          department: 'Emergency',
          ward: 'ICU',
          isEmergency: true
        },
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        contactPerson: {
          name: 'Dr. Rajesh Kumar',
          phone: '+91-40-23607777',
          designation: 'Blood Bank Manager'
        },
        isActive: true
      },
      {
        hospitalId: 'h2',
        bloodGroup: 'A+' as const,
        donationType: 'plasma' as const,
        urgencyLevel: 'medium' as const,
        unitsNeeded: 5,
        unitsCollected: 1,
        location: {
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560076',
          coordinates: {
            latitude: 12.9082,
            longitude: 77.6082
          }
        },
        patientInfo: {
          age: 32,
          condition: 'Plasma therapy',
          department: 'Hematology',
          isEmergency: false
        },
        validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        contactPerson: {
          name: 'Dr. Priya Sharma',
          phone: '+91-80-66214444',
          designation: 'Hematologist'
        },
        isActive: true
      }
    ];

    // Create sample donation requests
    for (const request of sampleDonationRequests) {
      try {
        await storage.createDonationRequest(request);
        console.log(`Created donation request: ${request.bloodGroup} ${request.donationType} - ${request.urgencyLevel}`);
      } catch (error) {
        console.log('Donation request already exists or error:', error);
      }
    }

    // Sample doctors
    const sampleDoctors = [
      {
        id: 'd1',
        name: 'Dr. Priya Sharma',
        specialization: 'Cardiologist',
        qualification: 'MBBS, MD (Cardiology)',
        experience: 15,
        consultationFee: 800,
        rating: 4.8,
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
        id: 'd2',
        name: 'Dr. Rajesh Kumar',
        specialization: 'General Physician',
        qualification: 'MBBS, MD (Medicine)',
        experience: 10,
        consultationFee: 500,
        rating: 4.6,
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '18:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '18:00' },
          { day: 'Friday', startTime: '09:00', endTime: '18:00' }
        ],
        hospitalAffiliation: 'Fortis Hospital',
        languages: ['English', 'Hindi', 'Kannada'],
        isOnline: true
      },
      {
        id: 'd3',
        name: 'Dr. Anita Reddy',
        specialization: 'Pediatrician',
        qualification: 'MBBS, MD (Pediatrics)',
        experience: 12,
        consultationFee: 600,
        rating: 4.9,
        availability: [
          { day: 'Monday', startTime: '10:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '10:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '17:00' },
          { day: 'Friday', startTime: '10:00', endTime: '17:00' },
          { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
        ],
        hospitalAffiliation: 'Max Healthcare',
        languages: ['English', 'Hindi'],
        isOnline: true
      },
      {
        id: 'd4',
        name: 'Dr. Suresh Patel',
        specialization: 'Dermatologist',
        qualification: 'MBBS, MD (Dermatology)',
        experience: 8,
        consultationFee: 700,
        rating: 4.5,
        availability: [
          { day: 'Tuesday', startTime: '09:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '18:00' },
          { day: 'Saturday', startTime: '09:00', endTime: '13:00' }
        ],
        hospitalAffiliation: 'Apollo Hospital',
        languages: ['English', 'Hindi', 'Gujarati'],
        isOnline: true
      },
      {
        id: 'd5',
        name: 'Dr. Meera Singh',
        specialization: 'Gynecologist',
        qualification: 'MBBS, MS (Obstetrics & Gynecology)',
        experience: 14,
        consultationFee: 900,
        rating: 4.7,
        availability: [
          { day: 'Monday', startTime: '10:00', endTime: '16:00' },
          { day: 'Wednesday', startTime: '10:00', endTime: '16:00' },
          { day: 'Friday', startTime: '10:00', endTime: '16:00' }
        ],
        hospitalAffiliation: 'Fortis Hospital',
        languages: ['English', 'Hindi', 'Punjabi'],
        isOnline: true
      }
    ];

    // Create doctors
    for (const doctor of sampleDoctors) {
      try {
        await storage.createDoctor(doctor);
        console.log(`Created doctor: ${doctor.name}`);
      } catch (error) {
        console.log(`Doctor ${doctor.name} already exists or error:`, error);
      }
    }

    // Sample medicines
    const sampleMedicines = [
      {
        id: 'm1',
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        manufacturer: 'Cipla Ltd',
        composition: 'Paracetamol 500mg',
        dosageForm: 'Tablet',
        strength: '500mg',
        price: 25,
        prescriptionRequired: false
      },
      {
        id: 'm2',
        name: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin',
        manufacturer: 'Sun Pharma',
        composition: 'Amoxicillin 250mg',
        dosageForm: 'Capsule',
        strength: '250mg',
        price: 120,
        prescriptionRequired: true
      },
      {
        id: 'm3',
        name: 'Cetirizine 10mg',
        genericName: 'Cetirizine HCl',
        manufacturer: 'Dr. Reddy\'s',
        composition: 'Cetirizine Hydrochloride 10mg',
        dosageForm: 'Tablet',
        strength: '10mg',
        price: 40,
        prescriptionRequired: false
      },
      {
        id: 'm4',
        name: 'Omeprazole 20mg',
        genericName: 'Omeprazole',
        manufacturer: 'Lupin',
        composition: 'Omeprazole 20mg',
        dosageForm: 'Capsule',
        strength: '20mg',
        price: 85,
        prescriptionRequired: true
      },
      {
        id: 'm5',
        name: 'Vitamin D3 1000 IU',
        genericName: 'Cholecalciferol',
        manufacturer: 'Mankind Pharma',
        composition: 'Cholecalciferol 1000 IU',
        dosageForm: 'Tablet',
        strength: '1000 IU',
        price: 150,
        prescriptionRequired: false
      },
      {
        id: 'm6',
        name: 'Metformin 500mg',
        genericName: 'Metformin HCl',
        manufacturer: 'Torrent Pharma',
        composition: 'Metformin Hydrochloride 500mg',
        dosageForm: 'Tablet',
        strength: '500mg',
        price: 60,
        prescriptionRequired: true
      },
      {
        id: 'm7',
        name: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        manufacturer: 'Cipla Ltd',
        composition: 'Ibuprofen 400mg',
        dosageForm: 'Tablet',
        strength: '400mg',
        price: 45,
        prescriptionRequired: false
      },
      {
        id: 'm8',
        name: 'Azithromycin 500mg',
        genericName: 'Azithromycin',
        manufacturer: 'Zydus Cadila',
        composition: 'Azithromycin 500mg',
        dosageForm: 'Tablet',
        strength: '500mg',
        price: 180,
        prescriptionRequired: true
      }
    ];

    // Create medicines
    for (const medicine of sampleMedicines) {
      try {
        await storage.createMedicine(medicine);
        console.log(`Created medicine: ${medicine.name}`);
      } catch (error) {
        console.log(`Medicine ${medicine.name} already exists or error:`, error);
      }
    }

    console.log('Sample donation data population completed!');
  } catch (error) {
    console.error('Error populating sample data:', error);
  }
}