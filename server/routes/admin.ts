import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Admin authentication schema
const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const adminVerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

// Temporary storage for OTPs (in production, use Redis or database)
const otpStorage = new Map<string, { otp: string; expiresAt: number; verified: boolean }>();

// Demo admin credentials
const DEMO_ADMIN = {
  email: 'admin@sehatify.com',
  password: 'admin123',
  name: 'Dr. Admin',
  role: 'admin'
};

// Generate fixed OTP for demo purposes
function generateOTP(): string {
  return "797452";
}

// POST /api/admin/login - Admin login (step 1: credentials verification)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = adminLoginSchema.parse(req.body);

    // Verify admin credentials
    if (email !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    otpStorage.set(email, { otp, expiresAt, verified: false });

    console.log(`Admin OTP for ${email}: ${otp}`); // In development, log OTP

    res.json({
      success: true,
      message: 'OTP sent successfully. Please verify to complete login.',
      otpRequired: true,
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(400).json({
      success: false,
      message: error instanceof z.ZodError ? 'Invalid input data' : 'Login failed'
    });
  }
});

// POST /api/admin/verify-otp - Admin OTP verification (step 2)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = adminVerifyOtpSchema.parse(req.body);

    const storedOtpData = otpStorage.get(email);
    
    if (!storedOtpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new login.'
      });
    }

    if (Date.now() > storedOtpData.expiresAt) {
      otpStorage.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new login.'
      });
    }

    if (storedOtpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Mark as verified and generate admin token
    storedOtpData.verified = true;
    const adminToken = `admin_${Date.now()}_${Math.random()}`;

    // Clean up OTP
    setTimeout(() => otpStorage.delete(email), 1000);

    res.json({
      success: true,
      message: 'Admin login successful',
      user: {
        id: 'admin-1',
        email: DEMO_ADMIN.email,
        name: DEMO_ADMIN.name,
        role: DEMO_ADMIN.role
      },
      token: adminToken
    });
  } catch (error) {
    console.error('Admin OTP verification error:', error);
    res.status(400).json({
      success: false,
      message: error instanceof z.ZodError ? 'Invalid input data' : 'OTP verification failed'
    });
  }
});

// GET /api/admin/patients - Get all patients for admin dashboard
router.get('/patients', authMiddleware, async (req, res) => {
  try {
    // Get patients from database/mock data
    const patients = await getPatientData();
    
    res.json({
      success: true,
      patients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients'
    });
  }
});

// GET /api/admin/patient/:id - Get specific patient details
router.get('/patient/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await getPatientById(id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      patient
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient details'
    });
  }
});

// Mock patient data generator
async function getPatientData() {
  const patients = [];
  const firstNames = ['Arjun', 'Priya', 'Amit', 'Sneha', 'Rahul', 'Kavya', 'Vikash', 'Anita', 'Sanjay', 'Meera', 'Rajesh', 'Pooja', 'Karan', 'Deepika', 'Rohit', 'Sunita', 'Aditya', 'Ritu', 'Manish', 'Neha', 'Vijay', 'Swati', 'Ashok', 'Geeta', 'Nitin'];
  const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Verma', 'Jain', 'Yadav', 'Mishra', 'Tiwari', 'Chandra', 'Rao', 'Reddy', 'Nair', 'Iyer', 'Bansal', 'Chopra', 'Malhotra', 'Saxena', 'Joshi', 'Pandey', 'Kapoor', 'Sethi', 'Bhatia'];
  
  for (let i = 0; i < 25; i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const age = 20 + Math.floor(Math.random() * 60);
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    
    // Generate realistic vitals with some variation
    const baseHeartRate = 70 + Math.floor(Math.random() * 30);
    const baseSystolic = 110 + Math.floor(Math.random() * 30);
    const baseDiastolic = 70 + Math.floor(Math.random() * 20);
    const baseOxygen = 95 + Math.floor(Math.random() * 5);
    const baseTemp = 97.5 + Math.random() * 2;
    
    // Determine emergency status (5% chance)
    const isEmergency = Math.random() < 0.05;
    const emergencyType = isEmergency ? 
      ['Low Blood Pressure', 'High Heart Rate', 'Low Oxygen', 'High Temperature'][Math.floor(Math.random() * 4)] : null;
    
    // Adjust vitals if emergency
    let currentVitals = {
      heartRate: baseHeartRate + (Math.random() - 0.5) * 10,
      bloodPressureSystolic: baseSystolic + (Math.random() - 0.5) * 10,
      bloodPressureDiastolic: baseDiastolic + (Math.random() - 0.5) * 8,
      oxygenSaturation: baseOxygen + (Math.random() - 0.5) * 3,
      bodyTemperature: baseTemp + (Math.random() - 0.5) * 1,
      steps: Math.floor(Math.random() * 8000) + 2000,
      sleepHours: 6 + Math.random() * 3
    };
    
    if (isEmergency) {
      switch (emergencyType) {
        case 'Low Blood Pressure':
          currentVitals.bloodPressureSystolic = 80 + Math.random() * 10;
          currentVitals.bloodPressureDiastolic = 50 + Math.random() * 10;
          break;
        case 'High Heart Rate':
          currentVitals.heartRate = 120 + Math.random() * 30;
          break;
        case 'Low Oxygen':
          currentVitals.oxygenSaturation = 85 + Math.random() * 8;
          break;
        case 'High Temperature':
          currentVitals.bodyTemperature = 102 + Math.random() * 3;
          break;
      }
    }
    
    patients.push({
      id: `patient-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      age,
      gender,
      bloodGroup: ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'][Math.floor(Math.random() * 8)],
      medicalHistory: [
        'No major medical history',
        'Diabetes Type 2',
        'Hypertension',
        'Asthma',
        'Heart Disease',
        'Arthritis'
      ][Math.floor(Math.random() * 6)],
      emergencyContact: {
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        relation: ['Spouse', 'Parent', 'Sibling', 'Child'][Math.floor(Math.random() * 4)]
      },
      currentVitals,
      isEmergency,
      emergencyType,
      lastUpdated: new Date(),
      wristbandStatus: Math.random() > 0.1 ? 'connected' : 'disconnected',
      prescriptions: generatePrescriptions(),
      doctorNotes: `Patient shows ${isEmergency ? 'concerning' : 'stable'} vital signs. ${isEmergency ? 'Immediate attention required.' : 'Continue regular monitoring.'}`,
      lastCheckup: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
    });
  }
  
  return patients;
}

async function getPatientById(id: string) {
  const patients = await getPatientData();
  return patients.find(p => p.id === id);
}

function generatePrescriptions() {
  const medications = [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
    { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: '30 days' },
    { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: '30 days' },
    { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '14 days' }
  ];
  
  const numPrescriptions = Math.floor(Math.random() * 3) + 1;
  const prescriptions = [];
  
  for (let i = 0; i < numPrescriptions; i++) {
    const med = medications[Math.floor(Math.random() * medications.length)];
    prescriptions.push({
      ...med,
      prescribedBy: 'Dr. Kumar',
      prescribedDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
      status: Math.random() > 0.3 ? 'active' : 'completed'
    });
  }
  
  return prescriptions;
}

export default router;