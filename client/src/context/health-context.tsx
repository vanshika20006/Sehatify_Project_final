import { createContext, useContext, useEffect, useState } from 'react';
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { VitalSigns, HealthAnalysis, InsertVitalSigns, InsertHealthAnalysis } from '@shared/schema';
import { mockHealthService } from '@/services/mock-health-data';
import { esp32HealthService } from '@/services/esp32-health-service';
// Health analysis will be handled server-side

interface HealthContextType {
  currentVitals: VitalSigns | null;
  historicalData: VitalSigns[];
  analysis: HealthAnalysis | null;
  isLoading: boolean;
  error: string | null;
  addVitalSigns: (vitals: Omit<InsertVitalSigns, 'userId'>) => Promise<void>;
  refreshAnalysis: () => Promise<void>;
}

export const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile, getAuthHeaders } = useAuth();
  // Initialize with default vitals that will be updated by ESP32 data
  const [currentVitals, setCurrentVitals] = useState<VitalSigns | null>({
    id: 'live-data',
    userId: 'demo-user',
    heartRate: 75,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    oxygenSaturation: 98,
    bodyTemperature: 98.6,
    deviceInfo: {
      deviceId: 'esp32-wristband-001',
      deviceType: 'wristband',
      manufacturer: 'ESP32',
      model: 'Health Wristband',
      isMedicalGrade: false
    },
    dataQuality: {
      confidence: 0.9,
      signalQuality: 'good',
      artifactsDetected: false
    },
    timestamp: new Date()
  });
  const [historicalData, setHistoricalData] = useState<VitalSigns[]>([]);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [esp32Data, setEsp32Data] = useState<{heartRate: number; oxygenSaturation: number; bodyTemperature: number; isConnected: boolean} | null>(null);

  // ESP32 data effect - Start in development mode even without user authentication
  useEffect(() => {
    // In development, always start ESP32 service to show real wristband data
    // In production, require authentication
    const shouldStart = import.meta.env.DEV || (user && user.id);
    
    if (!shouldStart) {
      return;
    }

    console.log('Health Context: Starting ESP32 service for real-time data', {
      isDev: import.meta.env.DEV,
      hasUser: !!user,
      userId: user?.id
    });
    
    // Start ESP32 service
    esp32HealthService.start();

    // Subscribe to ESP32 data updates
    const esp32Unsubscribe = esp32HealthService.subscribe((esp32Health) => {
      console.log('Health Context: Received ESP32 data:', esp32Health);
      setEsp32Data({
        heartRate: esp32Health.heartRate,
        oxygenSaturation: esp32Health.oxygenSaturation,
        bodyTemperature: esp32Health.bodyTemperature,
        isConnected: esp32Health.isConnected
      });

      // IMPORTANT: Update currentVitals with live ESP32 data for immediate display
      if (esp32Health.isConnected) {
        setCurrentVitals({
          id: 'live-esp32-data',
          userId: user?.id || 'demo-user',
          heartRate: esp32Health.heartRate,
          bloodPressureSystolic: 120, // Default for now since ESP32 doesn't provide this
          bloodPressureDiastolic: 80,  // Default for now since ESP32 doesn't provide this
          oxygenSaturation: esp32Health.oxygenSaturation,
          bodyTemperature: esp32Health.bodyTemperature,
          deviceInfo: {
            deviceId: 'esp32-wristband-001',
            deviceType: 'wristband',
            manufacturer: 'ESP32',
            model: 'Health Wristband',
            isMedicalGrade: false
          },
          dataQuality: {
            confidence: 0.95,
            signalQuality: 'excellent',
            artifactsDetected: false
          },
          timestamp: esp32Health.timestamp
        });
      }
    });

    return () => {
      esp32Unsubscribe();
      esp32HealthService.stop();
    };
  }, [user]); // Will restart ESP32 service if user changes

  useEffect(() => {
    if (!user || !user.id) {
      // Don't clear currentVitals if we have ESP32 data - keep showing real-time data
      if (!esp32Data?.isConnected) {
        setCurrentVitals(null);
      }
      setHistoricalData([]);
      setAnalysis(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Only use Firebase if it's properly configured
    if (db) {
      // Subscribe to real-time vital signs updates
      const vitalsQuery = query(
        collection(db, 'vitals'),
        where('userId', '==', user.id),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(vitalsQuery, 
        (snapshot) => {
          const vitals: VitalSigns[] = [];
          snapshot.forEach((doc) => {
            vitals.push({ id: doc.id, ...doc.data() } as VitalSigns);
          });

          setHistoricalData(vitals);
          if (vitals.length > 0) {
            setCurrentVitals(vitals[0]);
            // Analyze latest vitals
            analyzeVitals(vitals[0]);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Error fetching vitals:', error);
          setError('Failed to load health data');
          setIsLoading(false);
        }
      );

      return unsubscribe;
    } else {
      // Firebase not available, use MockHealthDataService for development mode
      console.log('Firebase not available, using MockHealthDataService for realistic development data');
      
      // Start the mock health service with hourly updates (for demo, use 10 seconds)
      mockHealthService.startRealTimeUpdates(10000); // 10 seconds for demo
      
      // Subscribe to mock health data updates
      const unsubscribe = mockHealthService.subscribe((mockData) => {
        // Store the base mock data
        const vitalSigns: VitalSigns = {
          id: mockData.id,
          userId: user.id,
          heartRate: mockData.heartRate,
          bloodPressureSystolic: mockData.bloodPressureSystolic,
          bloodPressureDiastolic: mockData.bloodPressureDiastolic,
          oxygenSaturation: mockData.oxygenSaturation,
          bodyTemperature: mockData.bodyTemperature,
          ecgData: mockData.ecgData,
          steps: mockData.steps,
          sleepHours: mockData.sleepHours,
          deviceInfo: mockData.deviceInfo,
          dataQuality: mockData.dataQuality,
          timestamp: mockData.timestamp,
          syncedAt: mockData.syncedAt
        };
        
        // Set base vitals from mock service (ESP32 overlay will be applied by separate effect)
        setCurrentVitals(vitalSigns);
        
        // Get historical data from mock service
        const mockHistoricalData = mockHealthService.getHistoricalData(50);
        const historicalVitals: VitalSigns[] = mockHistoricalData.map(mock => ({
          id: mock.id,
          userId: user.id,
          heartRate: mock.heartRate, // Keep historical data as mock data for trends
          bloodPressureSystolic: mock.bloodPressureSystolic,
          bloodPressureDiastolic: mock.bloodPressureDiastolic,
          oxygenSaturation: mock.oxygenSaturation, // Keep historical data as mock data for trends
          bodyTemperature: mock.bodyTemperature, // Keep historical data as mock data for trends
          ecgData: mock.ecgData,
          steps: mock.steps,
          sleepHours: mock.sleepHours,
          deviceInfo: mock.deviceInfo,
          dataQuality: mock.dataQuality,
          timestamp: mock.timestamp,
          syncedAt: mock.syncedAt
        }));
        
        setHistoricalData(historicalVitals);
        
        // Analyze latest vitals
        analyzeVitals(vitalSigns);
        setIsLoading(false);
      });
      
      // Generate initial historical data and current data
      const initialHistoricalData = mockHealthService.generateHistoricalData(7); // 7 days
      const initialVitals: VitalSigns[] = initialHistoricalData.map(mock => ({
        id: mock.id,
        userId: user.id,
        heartRate: mock.heartRate, // Keep initial historical data as mock data for trends
        bloodPressureSystolic: mock.bloodPressureSystolic,
        bloodPressureDiastolic: mock.bloodPressureDiastolic,
        oxygenSaturation: mock.oxygenSaturation, // Keep initial historical data as mock data for trends
        bodyTemperature: mock.bodyTemperature, // Keep initial historical data as mock data for trends
        ecgData: mock.ecgData,
        steps: mock.steps,
        sleepHours: mock.sleepHours,
        deviceInfo: mock.deviceInfo,
        dataQuality: mock.dataQuality,
        timestamp: mock.timestamp,
        syncedAt: mock.syncedAt
      }));
      
      setHistoricalData(initialVitals);
      if (initialVitals.length > 0) {
        setCurrentVitals(initialVitals[0]);
        analyzeVitals(initialVitals[0]);
      }
      setIsLoading(false);
      
      // Return cleanup function
      return unsubscribe;
    }
  }, [user]); // Remove esp32Data dependency to prevent re-subscriptions

  // Separate effect to update current vitals with ESP32 data when it changes
  useEffect(() => {
    if (esp32Data && esp32Data.isConnected) {
      setCurrentVitals(current => {
        if (!current) return current;
        
        // Only use ESP32 data if values are valid numbers
        const isValidNumber = (val: number) => typeof val === 'number' && isFinite(val) && val >= 0;
        
        const updated = {
          ...current,
          // Only update if ESP32 data is valid, keep existing values otherwise
          heartRate: isValidNumber(esp32Data.heartRate) ? esp32Data.heartRate : current.heartRate,
          oxygenSaturation: isValidNumber(esp32Data.oxygenSaturation) ? esp32Data.oxygenSaturation : current.oxygenSaturation,
          bodyTemperature: isValidNumber(esp32Data.bodyTemperature) ? esp32Data.bodyTemperature : current.bodyTemperature,
          timestamp: new Date() // Update timestamp to show real-time data
        };
        
        console.log('HealthContext: Updated currentVitals with ESP32 data:', {
          heartRate: updated.heartRate,
          oxygenSaturation: updated.oxygenSaturation, 
          bodyTemperature: updated.bodyTemperature,
          isConnected: esp32Data.isConnected
        });
        return updated;
      });
    } else if (esp32Data && !esp32Data.isConnected) {
      console.log('HealthContext: ESP32 disconnected, keeping existing vitals');
    }
  }, [esp32Data]);

  const analyzeVitals = async (vitals: VitalSigns) => {
    if (!userProfile) return;

    try {
      // Get authentication headers (includes Authorization token when available)
      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeaders
      };

      // Call server-side analysis API
      const response = await fetch('/api/health/analyze', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          vitals: {
            heartRate: vitals.heartRate,
            pulseRate: vitals.heartRate, // Use heartRate as pulse rate for now
            bloodPressureSystolic: vitals.bloodPressureSystolic,
            bloodPressureDiastolic: vitals.bloodPressureDiastolic,
            oxygenSaturation: vitals.oxygenSaturation,
            bodyTemperature: vitals.bodyTemperature,
            ecgRhythm: vitals.ecgData ? 'normal' : undefined,
            steps: vitals.steps || 0,
            sleepHours: vitals.sleepHours || 0,
            radiationExposure: 0, // Default value for now
            fallDetected: false, // Default value for now
            stressLevel: 'normal', // Default value for now
            timestamp: vitals.timestamp
          },
          userProfile: {
            age: userProfile.age,
            gender: userProfile.gender,
            medicalHistory: userProfile.medicalHistory
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const analysisData: Omit<InsertHealthAnalysis, 'id'> = {
          userId: user!.id,
          vitalSignsId: vitals.id,
          analysis: result.analysis,
          riskLevel: result.riskLevel,
          recommendations: result.recommendations,
          anomalies: result.anomalies,
          aiConfidence: result.confidence,
          timestamp: new Date()
        };

        // Save analysis to Firestore if available
        if (db) {
          const docRef = await addDoc(collection(db, 'analyses'), analysisData);
          setAnalysis({ id: docRef.id, ...analysisData });
        } else {
          // If Firestore not available, just set the analysis locally
          setAnalysis({ id: `local-${Date.now()}`, ...analysisData });
        }
      } else {
        // Fallback analysis if server fails
        const fallbackAnalysis: Omit<InsertHealthAnalysis, 'id'> = {
          userId: user!.id,
          vitalSignsId: vitals.id,
          analysis: 'Basic vital signs recorded. Server analysis temporarily unavailable.',
          riskLevel: vitals.heartRate > 100 || vitals.bloodPressureSystolic > 140 ? 'medium' : 'low',
          recommendations: ['Continue monitoring your health', 'Consult healthcare provider if symptoms persist'],
          anomalies: [],
          aiConfidence: 0.5,
          timestamp: new Date()
        };

        if (db) {
          const docRef = await addDoc(collection(db, 'analyses'), fallbackAnalysis);
          setAnalysis({ id: docRef.id, ...fallbackAnalysis });
        } else {
          setAnalysis({ id: `fallback-${Date.now()}`, ...fallbackAnalysis });
        }
      }

    } catch (error) {
      console.error('Error analyzing vitals:', error);
    }
  };

  const addVitalSigns = async (vitalsData: Omit<InsertVitalSigns, 'userId'>) => {
    if (!user) throw new Error('No user logged in');

    const vitals: Omit<InsertVitalSigns, 'id'> = {
      ...vitalsData,
      userId: user.id
    };

    await addDoc(collection(db, 'vitals'), vitals);
  };

  const refreshAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If no current vitals, generate sample vitals first
      if (!currentVitals) {
        const sampleVitals: Omit<InsertVitalSigns, 'userId'> = {
          heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 BPM
          bloodPressureSystolic: Math.floor(Math.random() * 40) + 110, // 110-150
          bloodPressureDiastolic: Math.floor(Math.random() * 30) + 70, // 70-100
          oxygenSaturation: Math.floor(Math.random() * 8) + 92, // 92-100%
          bodyTemperature: Math.random() * 4 + 97, // 97-101°F
          deviceInfo: {
            deviceId: 'demo-wristband-001',
            deviceType: 'wristband',
            manufacturer: 'Sehatify',
            model: 'SH-2025',
            isMedicalGrade: true,
            certifications: ['CE', 'FDA']
          },
          dataQuality: {
            confidence: 0.95,
            signalQuality: 'excellent',
            artifactsDetected: false
          },
          timestamp: new Date()
        };
        
        await addVitalSigns(sampleVitals);
        
        // Wait a moment for the data to be saved and the listener to update
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Now analyze the current vitals (either existing or just created)
      if (currentVitals) {
        await analyzeVitals(currentVitals);
      }
    } catch (error) {
      console.error('Error refreshing analysis:', error);
      setError('Failed to generate analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentVitals,
    historicalData,
    analysis,
    isLoading,
    error,
    addVitalSigns,
    refreshAnalysis
  };

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

