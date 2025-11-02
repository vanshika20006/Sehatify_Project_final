import { z } from 'zod';

const API_BASE = '/api/donations';

// Types for API responses
export interface DonorProfile {
  id: string;
  userId: string;
  bloodGroup: string;
  isAvailable: boolean;
  lastDonationDate?: Date;
  totalDonations: number;
  rewardCoins: number;
  donorType: string;
  location: {
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  medicalEligibility: {
    weight: number;
    hemoglobin: number;
    lastHealthCheck?: Date;
    isEligible: boolean;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  registeredAt: Date;
}

export interface Donation {
  id: string;
  donorId: string;
  recipientHospitalId: string;
  donationType: string;
  bloodGroup: string;
  quantity: number;
  rewardCoins: number;
  status: string;
  scheduledDate: Date;
  completedDate?: Date;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  specialties: string[];
  rating: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  emergencyServices: boolean;
  distance?: number;
}

export interface DonationRequest {
  id: string;
  hospitalId: string;
  bloodGroup: string;
  donationType: string;
  urgencyLevel: string;
  unitsNeeded: number;
  unitsCollected: number;
  location: {
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  patientInfo: {
    age?: number;
    condition: string;
    department?: string;
    ward?: string;
    isEmergency: boolean;
  };
  validUntil: Date;
  contactPerson: {
    name: string;
    phone: string;
    designation: string;
  };
  isActive: boolean;
  createdAt: Date;
}

class DonationsService {
  // Get current user's donor profile
  async getDonorProfile(authHeaders?: Record<string, string>): Promise<DonorProfile | null> {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        headers: {
          ...authHeaders,
        },
        credentials: 'include',
      });
      
      if (response.status === 404) {
        return null; // No profile exists
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch donor profile');
      }
      
      const data = await response.json();
      return {
        ...data,
        lastDonationDate: data.lastDonationDate ? new Date(data.lastDonationDate) : undefined,
        registeredAt: new Date(data.registeredAt),
        medicalEligibility: {
          ...data.medicalEligibility,
          lastHealthCheck: data.medicalEligibility.lastHealthCheck ? new Date(data.medicalEligibility.lastHealthCheck) : undefined,
        }
      };
    } catch (error) {
      console.error('Error fetching donor profile:', error);
      throw error;
    }
  }

  // Create donor profile
  async createDonorProfile(profileData: Omit<DonorProfile, 'id' | 'userId' | 'totalDonations' | 'rewardCoins' | 'registeredAt'>, authHeaders?: Record<string, string>): Promise<DonorProfile> {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create donor profile');
      }
      
      const data = await response.json();
      return {
        ...data,
        lastDonationDate: data.lastDonationDate ? new Date(data.lastDonationDate) : undefined,
        registeredAt: new Date(data.registeredAt),
        medicalEligibility: {
          ...data.medicalEligibility,
          lastHealthCheck: data.medicalEligibility.lastHealthCheck ? new Date(data.medicalEligibility.lastHealthCheck) : undefined,
        }
      };
    } catch (error) {
      console.error('Error creating donor profile:', error);
      throw error;
    }
  }

  // Update donor profile
  async updateDonorProfile(updates: Partial<DonorProfile>, authHeaders?: Record<string, string>): Promise<DonorProfile> {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update donor profile');
      }
      
      const data = await response.json();
      return {
        ...data,
        lastDonationDate: data.lastDonationDate ? new Date(data.lastDonationDate) : undefined,
        registeredAt: new Date(data.registeredAt),
        medicalEligibility: {
          ...data.medicalEligibility,
          lastHealthCheck: data.medicalEligibility.lastHealthCheck ? new Date(data.medicalEligibility.lastHealthCheck) : undefined,
        }
      };
    } catch (error) {
      console.error('Error updating donor profile:', error);
      throw error;
    }
  }

  // Get user's donation history
  async getMyDonations(authHeaders?: Record<string, string>): Promise<Donation[]> {
    try {
      const response = await fetch(`${API_BASE}/my-donations`, {
        headers: {
          ...authHeaders,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch donations');
      }
      
      const data = await response.json();
      return data.map((donation: any) => ({
        ...donation,
        scheduledDate: new Date(donation.scheduledDate),
        completedDate: donation.completedDate ? new Date(donation.completedDate) : undefined,
      }));
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
  }

  // Schedule a new donation
  async scheduleDonation(donationData: {
    recipientHospitalId: string;
    donationType: string;
    bloodGroup: string;
    quantity: number;
    scheduledDate: Date;
  }, authHeaders?: Record<string, string>): Promise<Donation> {
    try {
      const response = await fetch(`${API_BASE}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'include',
        body: JSON.stringify({
          ...donationData,
          scheduledDate: donationData.scheduledDate.toISOString(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule donation');
      }
      
      const data = await response.json();
      return {
        ...data,
        scheduledDate: new Date(data.scheduledDate),
        completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      };
    } catch (error) {
      console.error('Error scheduling donation:', error);
      throw error;
    }
  }

  // Cancel a donation
  async cancelDonation(donationId: string, authHeaders?: Record<string, string>): Promise<Donation> {
    try {
      const response = await fetch(`${API_BASE}/cancel/${donationId}`, {
        method: 'PATCH',
        headers: {
          ...authHeaders,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel donation');
      }
      
      const data = await response.json();
      return {
        ...data,
        scheduledDate: new Date(data.scheduledDate),
        completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      };
    } catch (error) {
      console.error('Error cancelling donation:', error);
      throw error;
    }
  }

  // Get nearby hospitals with blood banks
  async getNearbyHospitals(latitude: number, longitude: number, radius = 50, authHeaders?: Record<string, string>): Promise<Hospital[]> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString(),
      });
      
      const response = await fetch(`${API_BASE}/nearby-hospitals?${params}`, {
        headers: {
          ...authHeaders,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby hospitals');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching nearby hospitals:', error);
      throw error;
    }
  }

  // Get donation requests from hospitals
  async getDonationRequests(filters?: {
    bloodGroup?: string;
    city?: string;
    urgencyLevel?: string;
  }, authHeaders?: Record<string, string>): Promise<DonationRequest[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.bloodGroup) params.append('bloodGroup', filters.bloodGroup);
      if (filters?.city) params.append('city', filters.city);
      if (filters?.urgencyLevel) params.append('urgencyLevel', filters.urgencyLevel);
      
      const response = await fetch(`${API_BASE}/requests?${params}`, {
        headers: {
          ...authHeaders,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch donation requests');
      }
      
      const data = await response.json();
      return data.map((request: any) => ({
        ...request,
        validUntil: new Date(request.validUntil),
        createdAt: new Date(request.createdAt),
      }));
    } catch (error) {
      console.error('Error fetching donation requests:', error);
      throw error;
    }
  }

  // Get user's current location using browser geolocation
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to default location (Indore)
          resolve({
            latitude: 22.7196,
            longitude: 75.8577,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  // Calculate days until next donation based on last donation and type
  calculateDaysUntilNext(lastDonationDate?: Date, donationType = 'blood'): number {
    if (!lastDonationDate) return 0;
    
    const intervals = {
      blood: 56, // 8 weeks
      plasma: 28, // 4 weeks
      platelets: 14, // 2 weeks
      wbc: 56, // 8 weeks
      rbc: 112 // 16 weeks
    };
    
    const daysInterval = intervals[donationType as keyof typeof intervals] || 56;
    const nextDate = new Date(lastDonationDate);
    nextDate.setDate(nextDate.getDate() + daysInterval);
    
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }
}

export const donationsService = new DonationsService();