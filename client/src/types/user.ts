export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  medicalHistory?: string;
  abhaId?: string;
  language: string;
  emergencyContacts?: EmergencyContact[];
  insuranceInfo?: InsuranceInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface InsuranceInfo {
  provider?: string;
  policyNumber?: string;
  validUntil?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  rating: number;
  consultationFee: number;
  availability: DoctorAvailability[];
  hospitalAffiliation?: string;
  languages: string[];
  isOnline: boolean;
}

export interface DoctorAvailability {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  duration: number;
  type: 'consultation' | 'follow_up' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  prescription?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  recipientHospitalId: string;
  donationType: 'blood' | 'plasma' | 'platelets' | 'wbc' | 'rbc';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  quantity: number;
  rewardCoins: number;
  status: 'pending' | 'completed' | 'cancelled';
  scheduledDate: Date;
  completedDate?: Date;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  specialties: string[];
  emergencyServices: boolean;
  bloodBank: boolean;
  rating: number;
  phone: string;
  email: string;
}
