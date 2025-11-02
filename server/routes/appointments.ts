import { Router } from 'express';
import { DbStorage } from '../db-storage';
import { optionalAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const dbStorage = new DbStorage();

// Appointment booking schema
const bookAppointmentSchema = z.object({
  doctorId: z.string(),
  appointmentType: z.enum(['video_call', 'clinic_visit', 'home_visit']),
  scheduledDateTime: z.string(),
  symptoms: z.string().optional(),
  patientInfo: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email(),
    age: z.number().optional()
  })
});

// POST /api/appointments - Book a new appointment
router.post('/', optionalAuth, async (req, res) => {
  try {
    const validationResult = bookAppointmentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid appointment data', 
        details: validationResult.error.issues 
      });
    }
    
    const appointmentData = validationResult.data;
    
    // Get doctors from database to ensure consistency with GET endpoint
    const doctors = await dbStorage.getDoctors();
    const doctor = doctors.find(d => d.id === appointmentData.doctorId);
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Get user ID from auth or use demo user in development
    let userId = (req as any).user?.uid;
    if (!userId) {
      if (process.env.NODE_ENV === 'development') {
        const demoUser = await dbStorage.getUserByEmail('demo@sehatify.com');
        if (!demoUser) {
          return res.status(400).json({ error: 'Demo user not found' });
        }
        userId = demoUser.id;
      } else {
        return res.status(401).json({ error: 'Authentication required' });
      }
    }

    // Create appointment
    const appointment = {
      userId: userId,
      doctorId: appointmentData.doctorId,
      appointmentType: appointmentData.appointmentType,
      scheduledDateTime: new Date(appointmentData.scheduledDateTime),
      timezone: 'Asia/Kolkata',
      duration: 30,
      consultationFee: doctor.consultationFee,
      status: 'scheduled' as const,
      paymentStatus: 'pending' as const,
      symptoms: appointmentData.symptoms || undefined,
      medicalReports: [],
      followUpRequired: false,
      bookedAt: new Date(),
      completedAt: undefined
    };
    
    const newAppointment = await dbStorage.createAppointment(appointment);
    
    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: newAppointment,
      doctor: {
        name: doctor.name,
        specialization: doctor.specialization,
        hospitalAffiliation: doctor.hospitalAffiliation
      }
    });
    
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// GET /api/appointments - Get user appointments
router.get('/', optionalAuth, async (req, res) => {
  try {
    // Get user ID from auth or use demo user in development
    let userId = (req as any).user?.uid;
    if (!userId) {
      if (process.env.NODE_ENV === 'development') {
        const demoUser = await dbStorage.getUserByEmail('demo@sehatify.com');
        if (!demoUser) {
          return res.status(400).json({ error: 'Demo user not found' });
        }
        userId = demoUser.id;
      } else {
        return res.status(401).json({ error: 'Authentication required' });
      }
    }
    
    const appointments = await dbStorage.getAppointmentsByUserId(userId);
    
    // Get doctor details for each appointment
    const doctors = await dbStorage.getDoctors();
    const appointmentsWithDoctors = appointments.map((appointment: any) => {
      const doctor = doctors.find(d => d.id === appointment.doctorId);
      return {
        ...appointment,
        doctor: doctor ? {
          name: doctor.name,
          specialization: doctor.specialization,
          hospitalAffiliation: doctor.hospitalAffiliation
        } : null
      };
    });
    
    res.json(appointmentsWithDoctors);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// PUT /api/appointments/:id/cancel - Cancel an appointment
router.put('/:id/cancel', optionalAuth, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { cancellationReason } = req.body;
    
    // Get user ID from auth or use demo user in development
    let userId = (req as any).user?.uid;
    if (!userId) {
      if (process.env.NODE_ENV === 'development') {
        const demoUser = await dbStorage.getUserByEmail('demo@sehatify.com');
        if (!demoUser) {
          return res.status(400).json({ error: 'Demo user not found' });
        }
        userId = demoUser.id;
      } else {
        return res.status(401).json({ error: 'Authentication required' });
      }
    }
    
    const appointment = await dbStorage.getAppointment(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // SECURITY: Verify user owns this appointment
    if (appointment.userId !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only cancel your own appointments' });
    }
    
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }
    
    await dbStorage.updateAppointment(appointmentId, {
      status: 'cancelled',
      cancellationReason: cancellationReason || 'Cancelled by user'
    });
    
    res.json({ message: 'Appointment cancelled successfully' });
    
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

export { router as appointmentsRouter };