import { Router } from 'express';
import { z } from 'zod';
import { DbStorage } from '../db-storage';
import { labBookingSchema } from '../../shared/schema';

const router = Router();
const dbStorage = new DbStorage();

// Lab booking schema for API validation
const labBookingRequestSchema = z.object({
  labId: z.string(),
  testIds: z.array(z.string()),
  bookingType: z.enum(['home_collection', 'lab_visit']),
  scheduledDate: z.string(), // Will be converted to Date
  scheduledTime: z.string(),
  patientInfo: z.object({
    name: z.string(),
    age: z.number(),
    gender: z.string(),
    phone: z.string()
  }),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    landmark: z.string().optional()
  }).optional(),
  totalAmount: z.number()
});

// GET /api/labs - Get all labs with optional filters
router.get('/', async (req, res) => {
  try {
    const { city, specializations } = req.query;
    
    const filters: { city?: string; specializations?: string[] } = {};
    
    if (city && typeof city === 'string') {
      filters.city = city;
    }
    
    if (specializations && typeof specializations === 'string') {
      filters.specializations = specializations.split(',');
    }
    
    const labs = await dbStorage.getLabs(filters);
    res.json(labs);
  } catch (error) {
    console.error('Error fetching labs:', error);
    res.status(500).json({ error: 'Failed to fetch labs' });
  }
});

// GET /api/labs/:id - Get specific lab
router.get('/:id', async (req, res) => {
  try {
    const lab = await dbStorage.getLab(req.params.id);
    if (!lab) {
      return res.status(404).json({ error: 'Lab not found' });
    }
    res.json(lab);
  } catch (error) {
    console.error('Error fetching lab:', error);
    res.status(500).json({ error: 'Failed to fetch lab' });
  }
});

// GET /api/labs/:id/tests - Get tests for a specific lab
router.get('/:id/tests', async (req, res) => {
  try {
    const tests = await dbStorage.getLabTestsByLabId(req.params.id);
    res.json(tests);
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    res.status(500).json({ error: 'Failed to fetch lab tests' });
  }
});

// POST /api/labs/book - Book lab test
router.post('/book', async (req, res) => {
  try {
    const validationResult = labBookingRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid booking data', 
        details: validationResult.error.issues 
      });
    }
    
    const bookingData = validationResult.data;
    
    // Get demo user from database (in production, get from authenticated user)
    const demoUser = await dbStorage.getUserByEmail('demo@sehatify.com');
    if (!demoUser) {
      return res.status(400).json({ error: 'Demo user not found' });
    }
    
    // Validate lab exists
    const lab = await dbStorage.getLab(bookingData.labId);
    if (!lab) {
      return res.status(404).json({ error: 'Lab not found' });
    }
    
    // Create booking
    const booking = {
      userId: demoUser.id,
      labId: bookingData.labId,
      testIds: bookingData.testIds,
      bookingType: bookingData.bookingType,
      scheduledDate: new Date(bookingData.scheduledDate),
      scheduledTime: bookingData.scheduledTime,
      patientInfo: bookingData.patientInfo,
      address: bookingData.address,
      totalAmount: bookingData.totalAmount,
      paymentStatus: 'pending' as const,
      status: 'booked' as const,
      bookedAt: new Date()
    };
    
    const newBooking = await dbStorage.createLabBooking(booking);
    
    res.status(201).json({
      message: 'Lab test booked successfully',
      booking: newBooking,
      lab: {
        name: lab.name,
        address: lab.address
      }
    });
    
  } catch (error) {
    console.error('Error booking lab test:', error);
    res.status(500).json({ error: 'Failed to book lab test' });
  }
});

// GET /api/labs/bookings - Get user's lab bookings
router.get('/bookings', async (req, res) => {
  try {
    // Get demo user from database (in production, get from authenticated user)
    const demoUser = await dbStorage.getUserByEmail('demo@sehatify.com');
    if (!demoUser) {
      return res.status(400).json({ error: 'Demo user not found' });
    }
    
    const bookings = await dbStorage.getLabBookingsByUserId(demoUser.id);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching lab bookings:', error);
    res.status(500).json({ error: 'Failed to fetch lab bookings' });
  }
});

// PUT /api/labs/bookings/:id - Update lab booking status
router.put('/bookings/:id', async (req, res) => {
  try {
    const { status, reportFileId } = req.body;
    
    const updates: any = {};
    if (status) updates.status = status;
    if (reportFileId) updates.reportFileId = reportFileId;
    if (status === 'completed') updates.completedAt = new Date();
    
    const updatedBooking = await dbStorage.updateLabBooking(req.params.id, updates);
    
    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating lab booking:', error);
    res.status(500).json({ error: 'Failed to update lab booking' });
  }
});

export default router;