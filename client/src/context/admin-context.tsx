import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  bloodGroup: string;
  medicalHistory: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  currentVitals: {
    heartRate: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    oxygenSaturation: number;
    bodyTemperature: number;
    steps: number;
    sleepHours: number;
  };
  isEmergency: boolean;
  emergencyType: string | null;
  lastUpdated: Date;
  wristbandStatus: string;
  prescriptions: any[];
  doctorNotes: string;
  lastCheckup: Date;
}

interface AdminContextType {
  adminUser: AdminUser | null;
  patients: Patient[];
  loading: boolean;
  token: string | null;
  loginStep: 'credentials' | 'otp' | 'complete';
  tempEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshPatients: () => Promise<void>;
  getPatientById: (id: string) => Patient | undefined;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loginStep, setLoginStep] = useState<'credentials' | 'otp' | 'complete'>('credentials');
  const [tempEmail, setTempEmail] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Initialize admin state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setAdminUser(JSON.parse(storedUser));
      setLoginStep('complete');
      refreshPatients();
    }
  }, []);

  // Auto-refresh patients every 3 seconds when logged in
  useEffect(() => {
    if (adminUser && loginStep === 'complete') {
      const interval = setInterval(() => {
        refreshPatients();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [adminUser, loginStep]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setTempEmail(email);
        setLoginStep('otp');
        // In development, if OTP is provided, auto-fill it
        if (result.otp) {
          console.log('Development OTP:', result.otp);
        }
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setAdminUser(result.user);
        setToken(result.token);
        setLoginStep('complete');
        setTempEmail(null);
        
        // Store in localStorage
        localStorage.setItem('admin_token', result.token);
        localStorage.setItem('admin_user', JSON.stringify(result.user));
        
        // Load patients and redirect
        await refreshPatients();
        setLocation('/admin/dashboard');
      } else {
        throw new Error(result.message || 'OTP verification failed');
      }
    } catch (error: any) {
      console.error('Admin OTP verification error:', error);
      throw new Error(error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAdminUser(null);
    setToken(null);
    setPatients([]);
    setLoginStep('credentials');
    setTempEmail(null);
    
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    setLocation('/admin/login');
  };

  const refreshPatients = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/admin/patients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPatients(result.patients.map((p: any) => ({
            ...p,
            lastUpdated: new Date(p.lastUpdated),
            lastCheckup: new Date(p.lastCheckup)
          })));
        }
      }
    } catch (error) {
      console.error('Error refreshing patients:', error);
    }
  };

  const getPatientById = (id: string) => {
    return patients.find(p => p.id === id);
  };

  const value = {
    adminUser,
    patients,
    loading,
    token,
    loginStep,
    tempEmail,
    login,
    verifyOtp,
    logout,
    refreshPatients,
    getPatientById
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}