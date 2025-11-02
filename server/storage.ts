import { 
  type UserProfile, type InsertUserProfile,
  type MedicalReport, type InsertMedicalReport,
  type Lab, type InsertLab,
  type LabTest, type InsertLabTest,
  type LabBooking, type InsertLabBooking,
  type Doctor, type InsertDoctor,
  type Appointment, type InsertAppointment,
  type Medicine, type InsertMedicine,
  type Order, type InsertOrder,
  type Prescription, type InsertPrescription,
  type Hospital, type InsertHospital,
  type Pharmacy, type InsertPharmacy,
  type DonorProfile, type InsertDonorProfile,
  type Donation, type InsertDonation,
  type DonationRequest, type InsertDonationRequest,
  type HospitalRating, type InsertHospitalRating,
  type DoctorRating, type InsertDoctorRating,
  type VitalSigns, type InsertVitalSigns,
  type HealthAnalysis, type InsertHealthAnalysis
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<UserProfile | undefined>;
  getUserByEmail(email: string): Promise<UserProfile | undefined>;
  createUser(user: InsertUserProfile): Promise<UserProfile>;
  updateUser(id: string, user: Partial<UserProfile>): Promise<UserProfile | undefined>;

  // Medical Report operations
  getMedicalReport(id: string): Promise<MedicalReport | undefined>;
  getMedicalReportsByUserId(userId: string): Promise<MedicalReport[]>;
  createMedicalReport(report: InsertMedicalReport): Promise<MedicalReport>;
  updateMedicalReport(id: string, report: Partial<MedicalReport>): Promise<MedicalReport | undefined>;
  deleteMedicalReport(id: string): Promise<boolean>;

  // Lab operations
  getLab(id: string): Promise<Lab | undefined>;
  getLabs(filters?: { city?: string; specializations?: string[] }): Promise<Lab[]>;
  createLab(lab: InsertLab): Promise<Lab>;

  // Lab Test operations
  getLabTest(id: string): Promise<LabTest | undefined>;
  getLabTestsByLabId(labId: string): Promise<LabTest[]>;
  createLabTest(test: InsertLabTest): Promise<LabTest>;

  // Lab Booking operations
  getLabBooking(id: string): Promise<LabBooking | undefined>;
  getLabBookingsByUserId(userId: string): Promise<LabBooking[]>;
  createLabBooking(booking: InsertLabBooking): Promise<LabBooking>;
  updateLabBooking(id: string, booking: Partial<LabBooking>): Promise<LabBooking | undefined>;

  // Doctor operations
  getDoctor(id: string): Promise<Doctor | undefined>;
  getDoctors(filters?: { specialization?: string; city?: string }): Promise<Doctor[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;

  // Appointment operations
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByUserId(userId: string): Promise<Appointment[]>;
  getAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment | undefined>;

  // Medicine operations
  getMedicine(id: string): Promise<Medicine | undefined>;
  getMedicines(filters?: { name?: string; prescriptionRequired?: boolean }): Promise<Medicine[]>;
  getMedicinesByIds(ids: string[]): Promise<Medicine[]>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;

  // Order operations
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<Order>): Promise<Order | undefined>;

  // Prescription operations
  getPrescription(id: string): Promise<Prescription | undefined>;
  getPrescriptionsByUserId(userId: string): Promise<Prescription[]>;
  getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;

  // Hospital operations
  getHospital(id: string): Promise<Hospital | undefined>;
  getHospitals(filters?: { city?: string; specialties?: string[] }): Promise<Hospital[]>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;

  // Pharmacy operations
  getPharmacy(id: string): Promise<Pharmacy | undefined>;
  getPharmacies(filters?: { city?: string; deliveryAvailable?: boolean }): Promise<Pharmacy[]>;
  createPharmacy(pharmacy: InsertPharmacy): Promise<Pharmacy>;

  // Donor Profile operations
  getDonorProfile(userId: string): Promise<DonorProfile | undefined>;
  getDonorProfiles(filters?: { bloodGroup?: string; city?: string; isAvailable?: boolean }): Promise<DonorProfile[]>;
  createDonorProfile(profile: InsertDonorProfile): Promise<DonorProfile>;
  updateDonorProfile(userId: string, profile: Partial<DonorProfile>): Promise<DonorProfile | undefined>;

  // Donation operations
  getDonation(id: string): Promise<Donation | undefined>;
  getDonationsByDonorId(donorId: string): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonation(id: string, donation: Partial<Donation>): Promise<Donation | undefined>;

  // Donation Request operations
  getDonationRequest(id: string): Promise<DonationRequest | undefined>;
  getDonationRequests(filters?: { bloodGroup?: string; city?: string; urgencyLevel?: string }): Promise<DonationRequest[]>;
  createDonationRequest(request: InsertDonationRequest): Promise<DonationRequest>;
  updateDonationRequest(id: string, request: Partial<DonationRequest>): Promise<DonationRequest | undefined>;

  // Hospital Rating operations
  getHospitalRating(id: string): Promise<HospitalRating | undefined>;
  getHospitalRatingsByHospitalId(hospitalId: string): Promise<HospitalRating[]>;
  createHospitalRating(rating: InsertHospitalRating): Promise<HospitalRating>;

  // Doctor Rating operations
  getDoctorRating(id: string): Promise<DoctorRating | undefined>;
  getDoctorRatingsByDoctorId(doctorId: string): Promise<DoctorRating[]>;
  createDoctorRating(rating: InsertDoctorRating): Promise<DoctorRating>;

  // Vital Signs operations
  getVitalSigns(id: string): Promise<VitalSigns | undefined>;
  getVitalSignsByUserId(userId: string, limit?: number): Promise<VitalSigns[]>;
  createVitalSigns(vitals: InsertVitalSigns): Promise<VitalSigns>;

  // Health Analysis operations
  getHealthAnalysis(id: string): Promise<HealthAnalysis | undefined>;
  getHealthAnalysesByUserId(userId: string): Promise<HealthAnalysis[]>;
  createHealthAnalysis(analysis: InsertHealthAnalysis): Promise<HealthAnalysis>;
}

export class MemStorage implements IStorage {
  private users: Map<string, UserProfile>;
  private medicalReports: Map<string, MedicalReport>;
  private labs: Map<string, Lab>;
  private labTests: Map<string, LabTest>;
  private labBookings: Map<string, LabBooking>;
  private doctors: Map<string, Doctor>;
  private appointments: Map<string, Appointment>;
  private medicines: Map<string, Medicine>;
  private orders: Map<string, Order>;
  private prescriptions: Map<string, Prescription>;
  private hospitals: Map<string, Hospital>;
  private pharmacies: Map<string, Pharmacy>;
  private donorProfiles: Map<string, DonorProfile>; // keyed by userId
  private donations: Map<string, Donation>;
  private donationRequests: Map<string, DonationRequest>;
  private hospitalRatings: Map<string, HospitalRating>;
  private doctorRatings: Map<string, DoctorRating>;
  private vitalSigns: Map<string, VitalSigns>;
  private healthAnalyses: Map<string, HealthAnalysis>;

  // Secondary indexes for optimized lookups
  private usersByEmail: Map<string, string>; // email -> userId
  private reportsByUserId: Map<string, Set<string>>; // userId -> Set of reportIds
  private appointmentsByUserId: Map<string, Set<string>>; // userId -> Set of appointmentIds
  private appointmentsByDoctorId: Map<string, Set<string>>; // doctorId -> Set of appointmentIds
  private testsByLabId: Map<string, Set<string>>; // labId -> Set of testIds
  private bookingsByUserId: Map<string, Set<string>>; // userId -> Set of bookingIds

  constructor() {
    this.users = new Map();
    this.medicalReports = new Map();
    this.labs = new Map();
    this.labTests = new Map();
    this.labBookings = new Map();
    this.doctors = new Map();
    this.appointments = new Map();
    this.medicines = new Map();
    this.orders = new Map();
    this.prescriptions = new Map();
    this.hospitals = new Map();
    this.pharmacies = new Map();
    this.donorProfiles = new Map();
    this.donations = new Map();
    this.donationRequests = new Map();
    this.hospitalRatings = new Map();
    this.doctorRatings = new Map();
    this.vitalSigns = new Map();
    this.healthAnalyses = new Map();

    // Initialize secondary indexes
    this.usersByEmail = new Map();
    this.reportsByUserId = new Map();
    this.appointmentsByUserId = new Map();
    this.appointmentsByDoctorId = new Map();
    this.testsByLabId = new Map();
    this.bookingsByUserId = new Map();

    // Initialize demo user for development
    if (process.env.NODE_ENV === 'development') {
      this.initializeDemoUser();
    }
  }

  private initializeDemoUser() {
    const demoUser: UserProfile = {
      id: 'demo-user-1',
      email: 'demo@sehatify.com',
      name: 'Demo User',
      age: 30,
      gender: 'male',
      phone: '+91-9876543210',
      medicalHistory: 'No major medical history',
      abhaId: 'AB123456789',
      language: 'en',
      country: 'IN',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(demoUser.id, demoUser);
    this.usersByEmail.set(demoUser.email.toLowerCase(), demoUser.id);
    console.log('Demo user initialized in storage:', demoUser.email);
  }

  // User operations
  async getUser(id: string): Promise<UserProfile | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<UserProfile | undefined> {
    const normalizedEmail = email.trim().toLowerCase();
    const userId = this.usersByEmail.get(normalizedEmail);
    return userId ? this.users.get(userId) : undefined;
  }

  async createUser(insertUser: InsertUserProfile): Promise<UserProfile> {
    // Enforce email uniqueness
    const normalizedEmail = insertUser.email.trim().toLowerCase();
    if (this.usersByEmail.has(normalizedEmail)) {
      throw new Error(`User with email ${insertUser.email} already exists`);
    }
    
    const id = randomUUID();
    const now = new Date();
    const user: UserProfile = { 
      ...insertUser, 
      email: normalizedEmail,
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.users.set(id, user);
    this.usersByEmail.set(normalizedEmail, id);
    return user;
  }

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    // Validate email uniqueness BEFORE making any changes (atomicity)
    let normalizedEmail: string | undefined;
    if (updates.email && updates.email !== user.email) {
      normalizedEmail = updates.email.trim().toLowerCase();
      const existingUserId = this.usersByEmail.get(normalizedEmail);
      if (existingUserId && existingUserId !== id) {
        throw new Error(`User with email ${updates.email} already exists`);
      }
    }
    
    // All validation passed - now commit changes atomically
    const updatedUser: UserProfile = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    
    if (normalizedEmail) {
      updatedUser.email = normalizedEmail;
      this.usersByEmail.delete(user.email);
      this.usersByEmail.set(normalizedEmail, id);
    }
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Medical Report operations
  async getMedicalReport(id: string): Promise<MedicalReport | undefined> {
    return this.medicalReports.get(id);
  }

  async getMedicalReportsByUserId(userId: string): Promise<MedicalReport[]> {
    const reportIds = this.reportsByUserId.get(userId);
    if (!reportIds) return [];
    
    return Array.from(reportIds)
      .map(id => this.medicalReports.get(id)!)
      .filter(Boolean);
  }

  async createMedicalReport(insertReport: InsertMedicalReport): Promise<MedicalReport> {
    // Validate user exists
    if (!this.users.has(insertReport.userId)) {
      throw new Error(`User with id ${insertReport.userId} does not exist`);
    }
    
    const id = randomUUID();
    const report: MedicalReport = {
      ...insertReport,
      id,
      uploadedAt: new Date()
    };
    this.medicalReports.set(id, report);
    
    // Update secondary index
    if (!this.reportsByUserId.has(report.userId)) {
      this.reportsByUserId.set(report.userId, new Set());
    }
    this.reportsByUserId.get(report.userId)!.add(id);
    
    return report;
  }

  async updateMedicalReport(id: string, updates: Partial<MedicalReport>): Promise<MedicalReport | undefined> {
    const report = this.medicalReports.get(id);
    if (!report) return undefined;
    
    // Validate new userId exists if changing
    if (updates.userId && updates.userId !== report.userId) {
      if (!this.users.has(updates.userId)) {
        throw new Error(`User with id ${updates.userId} does not exist`);
      }
    }
    
    const updatedReport: MedicalReport = { ...report, ...updates };
    this.medicalReports.set(id, updatedReport);
    
    // Update secondary index if userId changed
    if (updates.userId && updates.userId !== report.userId) {
      // Remove from old user's reports
      const oldUserReports = this.reportsByUserId.get(report.userId);
      if (oldUserReports) {
        oldUserReports.delete(id);
      }
      
      // Add to new user's reports
      if (!this.reportsByUserId.has(updatedReport.userId)) {
        this.reportsByUserId.set(updatedReport.userId, new Set());
      }
      this.reportsByUserId.get(updatedReport.userId)!.add(id);
    }
    
    return updatedReport;
  }

  async deleteMedicalReport(id: string): Promise<boolean> {
    const report = this.medicalReports.get(id);
    if (!report) return false;
    
    const deleted = this.medicalReports.delete(id);
    
    // Clean up secondary index
    if (deleted) {
      const userReports = this.reportsByUserId.get(report.userId);
      if (userReports) {
        userReports.delete(id);
      }
    }
    
    return deleted;
  }

  // Lab operations
  async getLab(id: string): Promise<Lab | undefined> {
    return this.labs.get(id);
  }

  async getLabs(filters?: { city?: string; specializations?: string[] }): Promise<Lab[]> {
    let results = Array.from(this.labs.values());
    
    if (filters?.city) {
      results = results.filter(lab => lab.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    
    if (filters?.specializations?.length) {
      results = results.filter(lab => 
        filters.specializations!.some(spec => lab.specializations.includes(spec))
      );
    }
    
    return results;
  }

  async createLab(insertLab: InsertLab): Promise<Lab> {
    const id = randomUUID();
    const lab: Lab = { ...insertLab, id };
    this.labs.set(id, lab);
    return lab;
  }

  // Lab Test operations
  async getLabTest(id: string): Promise<LabTest | undefined> {
    return this.labTests.get(id);
  }

  async getLabTestsByLabId(labId: string): Promise<LabTest[]> {
    const testIds = this.testsByLabId.get(labId);
    if (!testIds) return [];
    
    return Array.from(testIds)
      .map(id => this.labTests.get(id)!)
      .filter(Boolean);
  }

  async createLabTest(insertTest: InsertLabTest): Promise<LabTest> {
    // Validate lab exists
    if (!this.labs.has(insertTest.labId)) {
      throw new Error(`Lab with id ${insertTest.labId} does not exist`);
    }
    
    const id = randomUUID();
    const test: LabTest = { ...insertTest, id };
    this.labTests.set(id, test);
    
    // Update secondary index
    if (!this.testsByLabId.has(insertTest.labId)) {
      this.testsByLabId.set(insertTest.labId, new Set());
    }
    this.testsByLabId.get(insertTest.labId)!.add(id);
    
    return test;
  }

  // Lab Booking operations
  async getLabBooking(id: string): Promise<LabBooking | undefined> {
    return this.labBookings.get(id);
  }

  async getLabBookingsByUserId(userId: string): Promise<LabBooking[]> {
    const bookingIds = this.bookingsByUserId.get(userId);
    if (!bookingIds) return [];
    
    return Array.from(bookingIds)
      .map(id => this.labBookings.get(id)!)
      .filter(Boolean);
  }

  async createLabBooking(insertBooking: InsertLabBooking): Promise<LabBooking> {
    // Validate user and lab exist
    if (!this.users.has(insertBooking.userId)) {
      throw new Error(`User with id ${insertBooking.userId} does not exist`);
    }
    if (!this.labs.has(insertBooking.labId)) {
      throw new Error(`Lab with id ${insertBooking.labId} does not exist`);
    }
    // Validate all test IDs exist and belong to the specified lab
    for (const testId of insertBooking.testIds) {
      const test = this.labTests.get(testId);
      if (!test) {
        throw new Error(`Lab test with id ${testId} does not exist`);
      }
      if (test.labId !== insertBooking.labId) {
        throw new Error(`Lab test ${testId} does not belong to lab ${insertBooking.labId}`);
      }
    }
    
    const id = randomUUID();
    const booking: LabBooking = {
      ...insertBooking,
      id,
      bookedAt: new Date()
    };
    this.labBookings.set(id, booking);
    
    // Update secondary index
    if (!this.bookingsByUserId.has(booking.userId)) {
      this.bookingsByUserId.set(booking.userId, new Set());
    }
    this.bookingsByUserId.get(booking.userId)!.add(id);
    
    return booking;
  }

  async updateLabBooking(id: string, updates: Partial<LabBooking>): Promise<LabBooking | undefined> {
    const booking = this.labBookings.get(id);
    if (!booking) return undefined;
    
    // Validate new FKs exist if changing
    if (updates.userId && updates.userId !== booking.userId) {
      if (!this.users.has(updates.userId)) {
        throw new Error(`User with id ${updates.userId} does not exist`);
      }
    }
    if (updates.labId && updates.labId !== booking.labId) {
      if (!this.labs.has(updates.labId)) {
        throw new Error(`Lab with id ${updates.labId} does not exist`);
      }
    }
    if (updates.testIds) {
      const labId = updates.labId || booking.labId;
      for (const testId of updates.testIds) {
        const test = this.labTests.get(testId);
        if (!test) {
          throw new Error(`Lab test with id ${testId} does not exist`);
        }
        if (test.labId !== labId) {
          throw new Error(`Lab test ${testId} does not belong to lab ${labId}`);
        }
      }
    }
    
    const updatedBooking: LabBooking = { ...booking, ...updates };
    this.labBookings.set(id, updatedBooking);
    
    // Update secondary indexes if userId changed
    if (updates.userId && updates.userId !== booking.userId) {
      // Remove from old user's bookings
      const oldUserBookings = this.bookingsByUserId.get(booking.userId);
      if (oldUserBookings) {
        oldUserBookings.delete(id);
      }
      
      // Add to new user's bookings
      if (!this.bookingsByUserId.has(updatedBooking.userId)) {
        this.bookingsByUserId.set(updatedBooking.userId, new Set());
      }
      this.bookingsByUserId.get(updatedBooking.userId)!.add(id);
    }
    
    return updatedBooking;
  }

  // Doctor operations
  async getDoctor(id: string): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async getDoctors(filters?: { specialization?: string; city?: string }): Promise<Doctor[]> {
    let results = Array.from(this.doctors.values());
    
    if (filters?.specialization) {
      results = results.filter(doctor => 
        doctor.specialization.toLowerCase().includes(filters.specialization!.toLowerCase())
      );
    }
    
    if (filters?.city) {
      results = results.filter(doctor => {
        // Check if doctor has hospitalAffiliation and match city
        const hospital = this.hospitals.get(doctor.hospitalAffiliation || '');
        return hospital ? hospital.city.toLowerCase().includes(filters.city!.toLowerCase()) : false;
      });
    }
    
    return results;
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    // Validate hospital affiliation if provided
    if (insertDoctor.hospitalAffiliation && !this.hospitals.has(insertDoctor.hospitalAffiliation)) {
      throw new Error(`Hospital with id ${insertDoctor.hospitalAffiliation} does not exist`);
    }
    
    const id = randomUUID();
    const doctor: Doctor = { ...insertDoctor, id };
    this.doctors.set(id, doctor);
    return doctor;
  }

  // Appointment operations
  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByUserId(userId: string): Promise<Appointment[]> {
    const appointmentIds = this.appointmentsByUserId.get(userId);
    if (!appointmentIds) return [];
    
    return Array.from(appointmentIds)
      .map(id => this.appointments.get(id)!)
      .filter(Boolean);
  }

  async getAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]> {
    const appointmentIds = this.appointmentsByDoctorId.get(doctorId);
    if (!appointmentIds) return [];
    
    return Array.from(appointmentIds)
      .map(id => this.appointments.get(id)!)
      .filter(Boolean);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    // Validate user and doctor exist
    if (!this.users.has(insertAppointment.userId)) {
      throw new Error(`User with id ${insertAppointment.userId} does not exist`);
    }
    if (!this.doctors.has(insertAppointment.doctorId)) {
      throw new Error(`Doctor with id ${insertAppointment.doctorId} does not exist`);
    }
    
    const id = randomUUID();
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      bookedAt: new Date()
    };
    this.appointments.set(id, appointment);
    
    // Update secondary indexes
    if (!this.appointmentsByUserId.has(appointment.userId)) {
      this.appointmentsByUserId.set(appointment.userId, new Set());
    }
    this.appointmentsByUserId.get(appointment.userId)!.add(id);
    
    if (!this.appointmentsByDoctorId.has(appointment.doctorId)) {
      this.appointmentsByDoctorId.set(appointment.doctorId, new Set());
    }
    this.appointmentsByDoctorId.get(appointment.doctorId)!.add(id);
    
    return appointment;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    // Validate new FKs exist if changing
    if (updates.userId && updates.userId !== appointment.userId) {
      if (!this.users.has(updates.userId)) {
        throw new Error(`User with id ${updates.userId} does not exist`);
      }
    }
    if (updates.doctorId && updates.doctorId !== appointment.doctorId) {
      if (!this.doctors.has(updates.doctorId)) {
        throw new Error(`Doctor with id ${updates.doctorId} does not exist`);
      }
    }
    
    const updatedAppointment: Appointment = { ...appointment, ...updates };
    this.appointments.set(id, updatedAppointment);
    
    // Update secondary indexes if userId or doctorId changed
    if (updates.userId && updates.userId !== appointment.userId) {
      // Remove from old user's appointments
      const oldUserAppointments = this.appointmentsByUserId.get(appointment.userId);
      if (oldUserAppointments) {
        oldUserAppointments.delete(id);
      }
      
      // Add to new user's appointments
      if (!this.appointmentsByUserId.has(updatedAppointment.userId)) {
        this.appointmentsByUserId.set(updatedAppointment.userId, new Set());
      }
      this.appointmentsByUserId.get(updatedAppointment.userId)!.add(id);
    }
    
    if (updates.doctorId && updates.doctorId !== appointment.doctorId) {
      // Remove from old doctor's appointments
      const oldDoctorAppointments = this.appointmentsByDoctorId.get(appointment.doctorId);
      if (oldDoctorAppointments) {
        oldDoctorAppointments.delete(id);
      }
      
      // Add to new doctor's appointments
      if (!this.appointmentsByDoctorId.has(updatedAppointment.doctorId)) {
        this.appointmentsByDoctorId.set(updatedAppointment.doctorId, new Set());
      }
      this.appointmentsByDoctorId.get(updatedAppointment.doctorId)!.add(id);
    }
    
    return updatedAppointment;
  }

  // Medicine operations
  async getMedicine(id: string): Promise<Medicine | undefined> {
    return this.medicines.get(id);
  }

  async getMedicines(filters?: { name?: string; prescriptionRequired?: boolean }): Promise<Medicine[]> {
    let results = Array.from(this.medicines.values());
    
    if (filters?.name) {
      results = results.filter(medicine => 
        medicine.name.toLowerCase().includes(filters.name!.toLowerCase()) ||
        medicine.genericName.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }
    
    if (filters?.prescriptionRequired !== undefined) {
      results = results.filter(medicine => medicine.prescriptionRequired === filters.prescriptionRequired);
    }
    
    return results;
  }

  async createMedicine(insertMedicine: InsertMedicine): Promise<Medicine> {
    const id = randomUUID();
    const medicine: Medicine = { ...insertMedicine, id };
    this.medicines.set(id, medicine);
    return medicine;
  }

  // Order operations
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    // Validate user exists
    if (!this.users.has(insertOrder.userId)) {
      throw new Error(`User with id ${insertOrder.userId} does not exist`);
    }
    // Validate pharmacy exists if specified
    if (insertOrder.pharmacyId && !this.pharmacies.has(insertOrder.pharmacyId)) {
      throw new Error(`Pharmacy with id ${insertOrder.pharmacyId} does not exist`);
    }
    // Validate all medicine IDs exist
    for (const item of insertOrder.orderItems) {
      if (!this.medicines.has(item.medicineId)) {
        throw new Error(`Medicine with id ${item.medicineId} does not exist`);
      }
    }
    // Validate prescription exists if specified
    if (insertOrder.prescriptionId && !this.prescriptions.has(insertOrder.prescriptionId)) {
      throw new Error(`Prescription with id ${insertOrder.prescriptionId} does not exist`);
    }
    
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      orderedAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    // Validate new FKs exist if changing (mirror createOrder validation)
    if (updates.userId && updates.userId !== order.userId) {
      if (!this.users.has(updates.userId)) {
        throw new Error(`User with id ${updates.userId} does not exist`);
      }
    }
    if (updates.pharmacyId && updates.pharmacyId !== order.pharmacyId) {
      if (!this.pharmacies.has(updates.pharmacyId)) {
        throw new Error(`Pharmacy with id ${updates.pharmacyId} does not exist`);
      }
    }
    if (updates.prescriptionId && updates.prescriptionId !== order.prescriptionId) {
      if (!this.prescriptions.has(updates.prescriptionId)) {
        throw new Error(`Prescription with id ${updates.prescriptionId} does not exist`);
      }
    }
    if (updates.orderItems) {
      for (const item of updates.orderItems) {
        if (!this.medicines.has(item.medicineId)) {
          throw new Error(`Medicine with id ${item.medicineId} does not exist`);
        }
      }
    }
    
    const updatedOrder: Order = { ...order, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Prescription operations
  async getPrescription(id: string): Promise<Prescription | undefined> {
    return this.prescriptions.get(id);
  }

  async getPrescriptionsByUserId(userId: string): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter(prescription => prescription.userId === userId);
  }

  async getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter(prescription => prescription.doctorId === doctorId);
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    // Validate user and doctor exist
    if (!this.users.has(insertPrescription.userId)) {
      throw new Error(`User with id ${insertPrescription.userId} does not exist`);
    }
    if (!this.doctors.has(insertPrescription.doctorId)) {
      throw new Error(`Doctor with id ${insertPrescription.doctorId} does not exist`);
    }
    // Validate all medicine IDs exist
    for (const medicineEntry of insertPrescription.medicines) {
      if (!this.medicines.has(medicineEntry.medicineId)) {
        throw new Error(`Medicine with id ${medicineEntry.medicineId} does not exist`);
      }
    }
    
    const id = randomUUID();
    const prescription: Prescription = { ...insertPrescription, id };
    this.prescriptions.set(id, prescription);
    return prescription;
  }

  // Hospital operations
  async getHospital(id: string): Promise<Hospital | undefined> {
    return this.hospitals.get(id);
  }

  async getHospitals(filters?: { city?: string; specialties?: string[] }): Promise<Hospital[]> {
    let results = Array.from(this.hospitals.values());
    
    if (filters?.city) {
      results = results.filter(hospital => hospital.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    
    if (filters?.specialties?.length) {
      results = results.filter(hospital => 
        filters.specialties!.some(specialty => hospital.specialties.includes(specialty))
      );
    }
    
    return results;
  }

  async createHospital(insertHospital: InsertHospital): Promise<Hospital> {
    const id = randomUUID();
    const hospital: Hospital = { ...insertHospital, id };
    this.hospitals.set(id, hospital);
    return hospital;
  }

  // Pharmacy operations
  async getPharmacy(id: string): Promise<Pharmacy | undefined> {
    return this.pharmacies.get(id);
  }

  async getPharmacies(filters?: { city?: string; deliveryAvailable?: boolean }): Promise<Pharmacy[]> {
    let results = Array.from(this.pharmacies.values());
    
    if (filters?.city) {
      results = results.filter(pharmacy => pharmacy.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    
    if (filters?.deliveryAvailable !== undefined) {
      results = results.filter(pharmacy => pharmacy.deliveryAvailable === filters.deliveryAvailable);
    }
    
    return results;
  }

  async createPharmacy(insertPharmacy: InsertPharmacy): Promise<Pharmacy> {
    const id = randomUUID();
    const pharmacy: Pharmacy = { ...insertPharmacy, id };
    this.pharmacies.set(id, pharmacy);
    return pharmacy;
  }

  // Donor Profile operations
  async getDonorProfile(userId: string): Promise<DonorProfile | undefined> {
    return this.donorProfiles.get(userId);
  }

  async getDonorProfiles(filters?: { bloodGroup?: string; city?: string; isAvailable?: boolean }): Promise<DonorProfile[]> {
    let results = Array.from(this.donorProfiles.values());
    
    if (filters?.bloodGroup) {
      results = results.filter(profile => profile.bloodGroup === filters.bloodGroup);
    }
    
    if (filters?.city) {
      results = results.filter(profile => profile.location.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    
    if (filters?.isAvailable !== undefined) {
      results = results.filter(profile => profile.isAvailable === filters.isAvailable);
    }
    
    return results;
  }

  async createDonorProfile(insertProfile: InsertDonorProfile): Promise<DonorProfile> {
    // Validate user exists
    if (!this.users.has(insertProfile.userId)) {
      throw new Error(`User with id ${insertProfile.userId} does not exist`);
    }
    
    // Prevent overwriting existing profile
    if (this.donorProfiles.has(insertProfile.userId)) {
      throw new Error(`Donor profile for user ${insertProfile.userId} already exists`);
    }
    
    const profile: DonorProfile = {
      ...insertProfile,
      id: randomUUID(),
      registeredAt: new Date()
    };
    this.donorProfiles.set(profile.userId, profile);
    return profile;
  }

  async updateDonorProfile(userId: string, updates: Partial<DonorProfile>): Promise<DonorProfile | undefined> {
    const profile = this.donorProfiles.get(userId);
    if (!profile) return undefined;
    
    const updatedProfile: DonorProfile = { ...profile, ...updates };
    this.donorProfiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  // Donation operations
  async getDonation(id: string): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async getDonationsByDonorId(donorId: string): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(donation => donation.donorId === donorId);
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    // Validate donor and recipient hospital exist
    if (!this.donorProfiles.has(insertDonation.donorId)) {
      throw new Error(`Donor profile with id ${insertDonation.donorId} does not exist`);
    }
    if (!this.hospitals.has(insertDonation.recipientHospitalId)) {
      throw new Error(`Hospital with id ${insertDonation.recipientHospitalId} does not exist`);
    }
    
    const id = randomUUID();
    const donation: Donation = { ...insertDonation, id };
    this.donations.set(id, donation);
    return donation;
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation | undefined> {
    const donation = this.donations.get(id);
    if (!donation) return undefined;
    
    const updatedDonation: Donation = { ...donation, ...updates };
    this.donations.set(id, updatedDonation);
    return updatedDonation;
  }

  // Donation Request operations
  async getDonationRequest(id: string): Promise<DonationRequest | undefined> {
    return this.donationRequests.get(id);
  }

  async getDonationRequests(filters?: { bloodGroup?: string; city?: string; urgencyLevel?: string }): Promise<DonationRequest[]> {
    let results = Array.from(this.donationRequests.values()).filter(request => request.isActive);
    
    if (filters?.bloodGroup) {
      results = results.filter(request => request.bloodGroup === filters.bloodGroup);
    }
    
    if (filters?.city) {
      results = results.filter(request => request.location.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    
    if (filters?.urgencyLevel) {
      results = results.filter(request => request.urgencyLevel === filters.urgencyLevel);
    }
    
    return results;
  }

  async createDonationRequest(insertRequest: InsertDonationRequest): Promise<DonationRequest> {
    const id = randomUUID();
    const request: DonationRequest = {
      ...insertRequest,
      id,
      createdAt: new Date()
    };
    this.donationRequests.set(id, request);
    return request;
  }

  async updateDonationRequest(id: string, updates: Partial<DonationRequest>): Promise<DonationRequest | undefined> {
    const request = this.donationRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest: DonationRequest = { ...request, ...updates };
    this.donationRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Hospital Rating operations
  async getHospitalRating(id: string): Promise<HospitalRating | undefined> {
    return this.hospitalRatings.get(id);
  }

  async getHospitalRatingsByHospitalId(hospitalId: string): Promise<HospitalRating[]> {
    return Array.from(this.hospitalRatings.values()).filter(rating => rating.hospitalId === hospitalId);
  }

  async createHospitalRating(insertRating: InsertHospitalRating): Promise<HospitalRating> {
    const id = randomUUID();
    const rating: HospitalRating = {
      ...insertRating,
      id,
      createdAt: new Date()
    };
    this.hospitalRatings.set(id, rating);
    return rating;
  }

  // Doctor Rating operations
  async getDoctorRating(id: string): Promise<DoctorRating | undefined> {
    return this.doctorRatings.get(id);
  }

  async getDoctorRatingsByDoctorId(doctorId: string): Promise<DoctorRating[]> {
    return Array.from(this.doctorRatings.values()).filter(rating => rating.doctorId === doctorId);
  }

  async createDoctorRating(insertRating: InsertDoctorRating): Promise<DoctorRating> {
    // Validate user and doctor exist
    if (!this.users.has(insertRating.userId)) {
      throw new Error(`User with id ${insertRating.userId} does not exist`);
    }
    if (!this.doctors.has(insertRating.doctorId)) {
      throw new Error(`Doctor with id ${insertRating.doctorId} does not exist`);
    }

    const id = randomUUID();
    const rating: DoctorRating = {
      ...insertRating,
      id,
      createdAt: new Date()
    };
    this.doctorRatings.set(id, rating);
    return rating;
  }

  // Vital Signs operations
  async getVitalSigns(id: string): Promise<VitalSigns | undefined> {
    return this.vitalSigns.get(id);
  }

  async getVitalSignsByUserId(userId: string, limit?: number): Promise<VitalSigns[]> {
    let results = Array.from(this.vitalSigns.values())
      .filter(vitals => vitals.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (limit) {
      results = results.slice(0, limit);
    }
    
    return results;
  }

  async createVitalSigns(insertVitals: InsertVitalSigns): Promise<VitalSigns> {
    // Validate user exists
    if (!this.users.has(insertVitals.userId)) {
      throw new Error(`User with id ${insertVitals.userId} does not exist`);
    }
    
    const id = randomUUID();
    const vitals: VitalSigns = { ...insertVitals, id };
    this.vitalSigns.set(id, vitals);
    return vitals;
  }

  // Health Analysis operations
  async getHealthAnalysis(id: string): Promise<HealthAnalysis | undefined> {
    return this.healthAnalyses.get(id);
  }

  async getHealthAnalysesByUserId(userId: string): Promise<HealthAnalysis[]> {
    return Array.from(this.healthAnalyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createHealthAnalysis(insertAnalysis: InsertHealthAnalysis): Promise<HealthAnalysis> {
    // Validate user and vital signs exist
    if (!this.users.has(insertAnalysis.userId)) {
      throw new Error(`User with id ${insertAnalysis.userId} does not exist`);
    }
    if (!this.vitalSigns.has(insertAnalysis.vitalSignsId)) {
      throw new Error(`Vital signs with id ${insertAnalysis.vitalSignsId} does not exist`);
    }
    
    const id = randomUUID();
    const analysis: HealthAnalysis = { ...insertAnalysis, id };
    this.healthAnalyses.set(id, analysis);
    return analysis;
  }
}

import { FirebaseStorage } from './firebase-storage';
import { adminStorage } from './services/firebase-admin';

// Use Firebase Storage if available, otherwise fall back to in-memory storage for development
import { DbStorage } from './db-storage';

let storageInstance: IStorage;

try {
  // Check if DATABASE_URL is available for database storage
  if (process.env.DATABASE_URL) {
    console.log('Using PostgreSQL database storage');
    storageInstance = new DbStorage();
  } else if (adminStorage && process.env.NODE_ENV !== 'development') {
    storageInstance = new FirebaseStorage();
    console.log('Using Firebase Storage');
  } else {
    console.log('Development mode: using in-memory storage');
    storageInstance = new MemStorage();
  }
} catch (error) {
  console.warn('Database Storage initialization failed, falling back to in-memory storage:', error);
  storageInstance = new MemStorage();
}

export const storage = storageInstance;
