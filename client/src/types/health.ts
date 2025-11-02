export interface VitalSigns {
  id: string;
  userId: string;
  heartRate: number;
  pulseRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  ecgData?: string;
  ecgRhythm?: 'normal' | 'irregular' | 'atrial_fibrillation' | 'tachycardia' | 'bradycardia';
  steps?: number;
  sleepHours?: number;
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'vigorous';
  radiationExposure?: number; // dosimeter reading in microsieverts
  fallDetected?: boolean;
  stressLevel?: 'low' | 'medium' | 'high' | 'critical';
  hydrationLevel?: number; // percentage
  caloriesBurned?: number;
  timestamp: Date;
}

export interface HealthAnalysis {
  id: string;
  userId: string;
  vitalSignsId: string;
  analysis: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  anomalies?: string[];
  aiConfidence: number;
  timestamp: Date;
}

export interface HealthMetrics {
  averageHeartRate: number;
  averageBloodPressure: string;
  averageOxygenSaturation: number;
  averageTemperature: number;
  totalSteps: number;
  averageSleepHours: number;
}

export interface HealthTrend {
  metric: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  type: 'medical' | 'fall' | 'abnormal_vitals' | 'manual';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  vitalSigns?: {
    heartRate?: number;
    bloodPressure?: string;
    oxygenSaturation?: number;
  };
  status: 'active' | 'resolved' | 'false_alarm';
  timestamp: Date;
}

export interface WearableDevice {
  id: string;
  userId: string;
  deviceType: string;
  serialNumber: string;
  isConnected: boolean;
  batteryLevel: number;
  lastSync: Date;
  firmwareVersion: string;
}

export interface HealthPrediction {
  id: string;
  userId: string;
  predictionType: '1week' | '2week' | '1month';
  analysis: string;
  predictedConditions: string[];
  riskFactors: string[];
  confidence: number;
  recommendedActions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface DoctorReport {
  id: string;
  userId: string;
  doctorId: string;
  reportContent: string;
  healthPredictionId?: string;
  vitalSignsIds: string[];
  labReports?: string[];
  status: 'generated' | 'sent' | 'viewed' | 'responded';
  timestamp: Date;
}

export interface PathologyTest {
  id: string;
  userId: string;
  testType: string;
  labId: string;
  status: 'requested' | 'sample_collected' | 'processing' | 'completed' | 'cancelled';
  results?: string;
  collectionDate?: Date;
  reportDate?: Date;
  urgency: 'routine' | 'urgent' | 'emergency';
}

export interface MedicineOrder {
  id: string;
  userId: string;
  prescriptionId?: string;
  medicines: {
    name: string;
    dosage: string;
    quantity: number;
    price: number;
    discountedPrice: number;
  }[];
  totalAmount: number;
  discountAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  pharmacyPartnerId: string;
  orderDate: Date;
  expectedDelivery: Date;
}

export interface HealthChangeNotification {
  id: string;
  userId: string;
  changeType: 'improvement' | 'decline' | 'anomaly' | 'emergency';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  actionRequired: boolean;
  relatedVitalSignsId: string;
  timestamp: Date;
  acknowledged: boolean;
}
