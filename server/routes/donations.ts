import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import { insertDonationSchema, insertDonorProfileSchema, insertDonationRequestSchema } from '@shared/schema';

const router = Router();

// Helper function to get authenticated user ID
function getAuthenticatedUserId(req: any): string {
  // In development mode, use demo user if no auth
  return req.user?.uid || (process.env.NODE_ENV === 'development' ? 'a2282785-e9d5-4a1b-9e3e-21d53d3a413e' : null);
}

// Helper function to calculate reward coins based on donation type
function calculateRewardCoins(donationType: string, quantity: number): number {
  const baseRates = {
    blood: 0.2, // 0.2 coins per ml
    plasma: 0.3, // 0.3 coins per ml
    platelets: 0.4, // 0.4 coins per ml
    wbc: 0.5, // 0.5 coins per ml
    rbc: 0.25 // 0.25 coins per ml
  };
  
  const rate = baseRates[donationType as keyof typeof baseRates] || 0.2;
  return Math.floor(quantity * rate);
}

// Helper function to calculate next eligible donation date
function calculateNextDonationDate(lastDonationDate: Date, donationType: string): Date {
  const intervals = {
    blood: 56, // 8 weeks
    plasma: 28, // 4 weeks
    platelets: 14, // 2 weeks
    wbc: 56, // 8 weeks
    rbc: 112 // 16 weeks
  };
  
  const daysToAdd = intervals[donationType as keyof typeof intervals] || 56;
  const nextDate = new Date(lastDonationDate);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate;
}

// Get donor profile for the authenticated user
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const donorProfile = await storage.getDonorProfile(userId);
    if (!donorProfile) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    res.json(donorProfile);
  } catch (error) {
    console.error('Error fetching donor profile:', error);
    res.status(500).json({ error: 'Failed to fetch donor profile' });
  }
});

// Create or update donor profile
router.post('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if profile already exists
    const existingProfile = await storage.getDonorProfile(userId);
    if (existingProfile) {
      return res.status(400).json({ error: 'Donor profile already exists' });
    }

    const profileData = { ...req.body, userId };
    const validatedData = insertDonorProfileSchema.parse(profileData);
    
    const donorProfile = await storage.createDonorProfile(validatedData);
    res.status(201).json(donorProfile);
  } catch (error) {
    console.error('Error creating donor profile:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid profile data', details: error.issues });
    }
    res.status(500).json({ error: 'Failed to create donor profile' });
  }
});

// Update donor profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updatedProfile = await storage.updateDonorProfile(userId, req.body);
    if (!updatedProfile) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating donor profile:', error);
    res.status(500).json({ error: 'Failed to update donor profile' });
  }
});

// Get donations for the authenticated user
router.get('/my-donations', authMiddleware, async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const donations = await storage.getDonationsByDonorId(userId);
    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Schedule a new donation
router.post('/schedule', authMiddleware, async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { recipientHospitalId, donationType, bloodGroup, quantity, scheduledDate } = req.body;

    // Validate required fields
    if (!recipientHospitalId || !donationType || !bloodGroup || !quantity || !scheduledDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if donor profile exists
    const donorProfile = await storage.getDonorProfile(userId);
    if (!donorProfile) {
      return res.status(400).json({ error: 'Donor profile not found. Please create a profile first.' });
    }

    // Check if donor is eligible (basic check)
    if (!donorProfile.isAvailable || !donorProfile.medicalEligibility.isEligible) {
      return res.status(400).json({ error: 'Donor is not currently eligible for donation' });
    }

    // Check if enough time has passed since last donation
    if (donorProfile.lastDonationDate) {
      const nextEligibleDate = calculateNextDonationDate(donorProfile.lastDonationDate, donationType);
      const scheduledDateTime = new Date(scheduledDate);
      
      if (scheduledDateTime < nextEligibleDate) {
        return res.status(400).json({ 
          error: `You must wait until ${nextEligibleDate.toLocaleDateString()} before donating again`,
          nextEligibleDate: nextEligibleDate.toISOString()
        });
      }
    }

    // Check if hospital exists
    const hospital = await storage.getHospital(recipientHospitalId);
    if (!hospital) {
      return res.status(400).json({ error: 'Hospital not found' });
    }

    // Calculate reward coins
    const rewardCoins = calculateRewardCoins(donationType, quantity);

    const donationData = {
      donorId: userId,
      recipientHospitalId,
      donationType,
      bloodGroup,
      quantity,
      rewardCoins,
      status: 'scheduled' as const,
      scheduledDate: new Date(scheduledDate)
    };

    const validatedData = insertDonationSchema.parse(donationData);
    const donation = await storage.createDonation(validatedData);

    res.status(201).json(donation);
  } catch (error) {
    console.error('Error scheduling donation:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid donation data', details: error.issues });
    }
    res.status(500).json({ error: 'Failed to schedule donation' });
  }
});

// Complete a donation (for hospital staff)
router.patch('/complete/:donationId', authMiddleware, async (req, res) => {
  try {
    const { donationId } = req.params;
    const { completedDate } = req.body;

    const donation = await storage.getDonation(donationId);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donation.status === 'completed') {
      return res.status(400).json({ error: 'Donation already completed' });
    }

    // Update donation status
    const updatedDonation = await storage.updateDonation(donationId, {
      status: 'completed',
      completedDate: completedDate ? new Date(completedDate) : new Date()
    });

    // Update donor profile stats and reward coins
    const donorProfile = await storage.getDonorProfile(donation.donorId);
    if (donorProfile) {
      await storage.updateDonorProfile(donation.donorId, {
        totalDonations: donorProfile.totalDonations + 1,
        rewardCoins: donorProfile.rewardCoins + donation.rewardCoins,
        lastDonationDate: updatedDonation?.completedDate || new Date()
      });
    }

    res.json(updatedDonation);
  } catch (error) {
    console.error('Error completing donation:', error);
    res.status(500).json({ error: 'Failed to complete donation' });
  }
});

// Cancel a donation
router.patch('/cancel/:donationId', authMiddleware, async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { donationId } = req.params;

    const donation = await storage.getDonation(donationId);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Only donor can cancel their own donation
    if (donation.donorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this donation' });
    }

    if (donation.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed donation' });
    }

    const updatedDonation = await storage.updateDonation(donationId, {
      status: 'cancelled'
    });

    res.json(updatedDonation);
  } catch (error) {
    console.error('Error cancelling donation:', error);
    res.status(500).json({ error: 'Failed to cancel donation' });
  }
});

// Get nearby hospitals with blood banks
router.get('/nearby-hospitals', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query; // radius in km

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const maxDistance = parseFloat(radius as string);

    // Get all hospitals
    const allHospitals = await storage.getHospitals();
    
    // Filter hospitals with blood banks and calculate distance
    const nearbyHospitals = allHospitals
      .filter(hospital => {
        // Check if hospital has blood bank capabilities
        return hospital.specialties.some(specialty => 
          specialty.toLowerCase().includes('blood') || 
          specialty.toLowerCase().includes('hematology')
        );
      })
      .map(hospital => {
        // Calculate distance using Haversine formula
        const distance = calculateDistance(lat, lng, hospital.coordinates.latitude, hospital.coordinates.longitude);
        return { ...hospital, distance };
      })
      .filter(hospital => hospital.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    res.json(nearbyHospitals);
  } catch (error) {
    console.error('Error fetching nearby hospitals:', error);
    res.status(500).json({ error: 'Failed to fetch nearby hospitals' });
  }
});

// Get donation requests from hospitals
router.get('/requests', optionalAuth, async (req, res) => {
  try {
    const { bloodGroup, city, urgencyLevel } = req.query;
    
    const filters: any = {};
    if (bloodGroup) filters.bloodGroup = bloodGroup as string;
    if (city) filters.city = city as string;
    if (urgencyLevel) filters.urgencyLevel = urgencyLevel as string;

    const requests = await storage.getDonationRequests(filters);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching donation requests:', error);
    res.status(500).json({ error: 'Failed to fetch donation requests' });
  }
});

// Create donation request (for hospitals)
router.post('/requests', authMiddleware, async (req, res) => {
  try {
    const validatedData = insertDonationRequestSchema.parse(req.body);
    const request = await storage.createDonationRequest(validatedData);
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating donation request:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.issues });
    }
    res.status(500).json({ error: 'Failed to create donation request' });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export { router as donationsRouter };