import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  userProfilesTable, vitalSignsTable, healthAnalysisTable, doctorsTable,
  medicalReportsTable, labsTable, labTestsTable, labBookingsTable,
  appointmentsTable, medicinesTable, ordersTable, prescriptionsTable,
  hospitalsTable, pharmaciesTable, donorProfilesTable, donationsTable,
  donationRequestsTable, hospitalRatingsTable, doctorRatingsTable
} from "@shared/schema";
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
import { IStorage } from "./storage";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// In development, use the connection without SSL requirements to avoid certificate issues
const databaseUrl = process.env.NODE_ENV === 'development' 
  ? process.env.DATABASE_URL.replace('?sslmode=require', '') 
  : process.env.DATABASE_URL;

const sql_conn = neon(databaseUrl);
export const db = drizzle(sql_conn);

// Type conversion utilities
function convertNullToUndefined<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] === null) {
      result[key] = undefined as any;
    }
  }
  return result;
}

function convertDbResultToUserProfile(dbResult: any): UserProfile {
  return convertNullToUndefined({
    ...dbResult,
    gender: dbResult.gender as UserProfile['gender'],
  }) as UserProfile;
}

function convertDbResultToMedicalReport(dbResult: any): MedicalReport {
  return convertNullToUndefined({
    ...dbResult,
    fileType: dbResult.fileType as MedicalReport['fileType'],
    sourceType: dbResult.sourceType as MedicalReport['sourceType'],
    reportType: dbResult.reportType as MedicalReport['reportType'],
  }) as MedicalReport;
}

function convertDbResultToLabTest(dbResult: any): LabTest {
  return convertNullToUndefined({
    ...dbResult,
    sampleType: dbResult.sampleType as LabTest['sampleType'],
  }) as LabTest;
}

function convertDbResultToLabBooking(dbResult: any): LabBooking {
  return convertNullToUndefined({
    ...dbResult,
    status: dbResult.status as LabBooking['status'],
    bookingType: dbResult.bookingType as LabBooking['bookingType'],
  }) as LabBooking;
}

function convertDbResultToDoctor(dbResult: any): Doctor {
  return convertNullToUndefined({
    ...dbResult,
  }) as Doctor;
}

function convertDbResultToAppointment(dbResult: any): Appointment {
  return convertNullToUndefined({
    ...dbResult,
    status: dbResult.status as Appointment['status'],
    paymentStatus: dbResult.paymentStatus as Appointment['paymentStatus'],
    appointmentType: dbResult.appointmentType as Appointment['appointmentType'],
  }) as Appointment;
}

function convertDbResultToMedicine(dbResult: any): Medicine {
  return convertNullToUndefined({
    ...dbResult,
    dosageForm: dbResult.dosageForm as Medicine['dosageForm'],
  }) as Medicine;
}

function convertDbResultToOrder(dbResult: any): Order {
  return convertNullToUndefined({
    ...dbResult,
    paymentStatus: dbResult.paymentStatus as Order['paymentStatus'],
  }) as Order;
}

function convertDbResultToPrescription(dbResult: any): Prescription {
  return convertNullToUndefined({
    ...dbResult,
    status: dbResult.status as Prescription['status'],
  }) as Prescription;
}

function convertDbResultToHospital(dbResult: any): Hospital {
  return convertNullToUndefined(dbResult) as Hospital;
}

function convertDbResultToPharmacy(dbResult: any): Pharmacy {
  return convertNullToUndefined(dbResult) as Pharmacy;
}

function convertDbResultToDonorProfile(dbResult: any): DonorProfile {
  return convertNullToUndefined({
    ...dbResult,
    bloodGroup: dbResult.bloodGroup as DonorProfile['bloodGroup'],
    donorType: dbResult.donorType as DonorProfile['donorType'],
  }) as DonorProfile;
}

function convertDbResultToDonation(dbResult: any): Donation {
  return convertNullToUndefined({
    ...dbResult,
    status: dbResult.status as Donation['status'],
    bloodGroup: dbResult.bloodGroup as Donation['bloodGroup'],
    donationType: dbResult.donationType as Donation['donationType'],
  }) as Donation;
}

function convertDbResultToDonationRequest(dbResult: any): DonationRequest {
  return convertNullToUndefined({
    ...dbResult,
    bloodGroup: dbResult.bloodGroup as DonationRequest['bloodGroup'],
    urgencyLevel: dbResult.urgencyLevel as DonationRequest['urgencyLevel'],
    donationType: dbResult.donationType as DonationRequest['donationType'],
  }) as DonationRequest;
}

function convertDbResultToVitalSigns(dbResult: any): VitalSigns {
  return convertNullToUndefined(dbResult) as VitalSigns;
}

function convertDbResultToHealthAnalysis(dbResult: any): HealthAnalysis {
  return convertNullToUndefined({
    ...dbResult,
    riskLevel: dbResult.riskLevel as HealthAnalysis['riskLevel'],
  }) as HealthAnalysis;
}

export class DbStorage implements IStorage {
  constructor() {
    if (process.env.NODE_ENV === 'development') {
      this.initializeDemoUser();
    }
  }

  private async initializeDemoUser() {
    try {
      // Check if demo user already exists
      const existingUser = await this.getUserByEmail('demo@sehatify.com');
      if (existingUser) {
        console.log('Demo user already exists in database:', existingUser.email);
        return;
      }

      // Create demo user
      const demoUser = await this.createUser({
        email: 'demo@sehatify.com',
        name: 'Demo User',
        age: 30,
        gender: 'male',
        phone: '+91-9876543210',
        medicalHistory: 'No major medical history',
        abhaId: 'AB123456789',
        language: 'en',
        country: 'IN'
      });
      
      console.log('Demo user initialized in database:', demoUser.email);
    } catch (error) {
      console.error('Error initializing demo user:', error);
    }
  }

  // User operations
  async getUser(id: string): Promise<UserProfile | undefined> {
    const result = await db.select().from(userProfilesTable).where(eq(userProfilesTable.id, id)).limit(1);
    return result[0] ? convertDbResultToUserProfile(result[0]) : undefined;
  }

  async getUserByEmail(email: string): Promise<UserProfile | undefined> {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await db.select().from(userProfilesTable).where(eq(userProfilesTable.email, normalizedEmail)).limit(1);
    return result[0] ? convertDbResultToUserProfile(result[0]) : undefined;
  }

  async createUser(insertUser: InsertUserProfile): Promise<UserProfile> {
    const normalizedEmail = insertUser.email.trim().toLowerCase();
    
    // Check for existing user
    const existing = await this.getUserByEmail(normalizedEmail);
    if (existing) {
      throw new Error(`User with email ${insertUser.email} already exists`);
    }

    const result = await db.insert(userProfilesTable).values({
      ...insertUser,
      email: normalizedEmail
    }).returning();
    
    return convertDbResultToUserProfile(result[0]);
  }

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    // Handle email normalization if email is being updated
    const updateData = { ...updates };
    if (updateData.email) {
      updateData.email = updateData.email.trim().toLowerCase();
      
      // Check if the new email is already taken by another user
      const existingUser = await this.getUserByEmail(updateData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error(`User with email ${updateData.email} already exists`);
      }
    }

    const result = await db.update(userProfilesTable)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(userProfilesTable.id, id))
      .returning();
    
    return result[0] ? convertDbResultToUserProfile(result[0]) : undefined;
  }

  // Medical Report operations
  async getMedicalReport(id: string): Promise<MedicalReport | undefined> {
    const result = await db.select().from(medicalReportsTable).where(eq(medicalReportsTable.id, id)).limit(1);
    return result[0] ? convertDbResultToMedicalReport(result[0]) : undefined;
  }

  async getMedicalReportsByUserId(userId: string): Promise<MedicalReport[]> {
    const result = await db.select().from(medicalReportsTable).where(eq(medicalReportsTable.userId, userId));
    return result.map(convertDbResultToMedicalReport);
  }

  async createMedicalReport(insertReport: InsertMedicalReport): Promise<MedicalReport> {
    const result = await db.insert(medicalReportsTable).values(insertReport).returning();
    return convertDbResultToMedicalReport(result[0]);
  }

  async updateMedicalReport(id: string, updates: Partial<MedicalReport>): Promise<MedicalReport | undefined> {
    const result = await db.update(medicalReportsTable)
      .set(updates)
      .where(eq(medicalReportsTable.id, id))
      .returning();
    
    return result[0] ? convertDbResultToMedicalReport(result[0]) : undefined;
  }

  async deleteMedicalReport(id: string): Promise<boolean> {
    const result = await db.delete(medicalReportsTable).where(eq(medicalReportsTable.id, id));
    return result.rowCount > 0;
  }

  // Lab operations
  async getLab(id: string): Promise<Lab | undefined> {
    const result = await db.select().from(labsTable).where(eq(labsTable.id, id)).limit(1);
    return result[0] as Lab;
  }

  async getLabs(filters?: { city?: string; specializations?: string[] }): Promise<Lab[]> {
    let query = db.select().from(labsTable);
    
    if (filters?.city) {
      query = query.where(sql`LOWER(${labsTable.city}) LIKE ${`%${filters.city.toLowerCase()}%`}`);
    }
    
    // Note: For specializations filtering with JSONB, we'd need more complex SQL
    // This is a simplified implementation
    const result = await query;
    return result as Lab[];
  }

  async createLab(insertLab: InsertLab): Promise<Lab> {
    const result = await db.insert(labsTable).values(insertLab).returning();
    return result[0] as Lab;
  }

  // Lab Test operations
  async getLabTest(id: string): Promise<LabTest | undefined> {
    const result = await db.select().from(labTestsTable).where(eq(labTestsTable.id, id)).limit(1);
    return result[0] ? convertDbResultToLabTest(result[0]) : undefined;
  }

  async getLabTestsByLabId(labId: string): Promise<LabTest[]> {
    const result = await db.select().from(labTestsTable).where(eq(labTestsTable.labId, labId));
    return result.map(convertDbResultToLabTest);
  }

  async createLabTest(insertTest: InsertLabTest): Promise<LabTest> {
    const result = await db.insert(labTestsTable).values(insertTest).returning();
    return convertDbResultToLabTest(result[0]);
  }

  // Lab Booking operations
  async getLabBooking(id: string): Promise<LabBooking | undefined> {
    const result = await db.select().from(labBookingsTable).where(eq(labBookingsTable.id, id)).limit(1);
    return result[0] ? convertDbResultToLabBooking(result[0]) : undefined;
  }

  async getLabBookingsByUserId(userId: string): Promise<LabBooking[]> {
    const result = await db.select().from(labBookingsTable).where(eq(labBookingsTable.userId, userId));
    return result.map(convertDbResultToLabBooking);
  }

  async createLabBooking(insertBooking: InsertLabBooking): Promise<LabBooking> {
    const result = await db.insert(labBookingsTable).values(insertBooking).returning();
    return convertDbResultToLabBooking(result[0]);
  }

  async updateLabBooking(id: string, updates: Partial<LabBooking>): Promise<LabBooking | undefined> {
    const result = await db.update(labBookingsTable)
      .set(updates)
      .where(eq(labBookingsTable.id, id))
      .returning();
    
    return result[0] ? convertDbResultToLabBooking(result[0]) : undefined;
  }

  // Doctor operations
  async getDoctor(id: string): Promise<Doctor | undefined> {
    const result = await db.select().from(doctorsTable).where(eq(doctorsTable.id, id)).limit(1);
    return result[0] ? convertDbResultToDoctor(result[0]) : undefined;
  }

  async getDoctors(filters?: { specialization?: string; city?: string }): Promise<Doctor[]> {
    let query = db.select().from(doctorsTable);
    
    if (filters?.specialization) {
      query = query.where(sql`LOWER(${doctorsTable.specialization}) LIKE ${`%${filters.specialization.toLowerCase()}%`}`);
    }
    
    const result = await query;
    return result.map(convertDbResultToDoctor);
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const result = await db.insert(doctorsTable).values(insertDoctor).returning();
    return convertDbResultToDoctor(result[0]);
  }

  // Appointment operations
  async getAppointment(id: string): Promise<Appointment | undefined> {
    const result = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id)).limit(1);
    return result[0] ? convertDbResultToAppointment(result[0]) : undefined;
  }

  async getAppointmentsByUserId(userId: string): Promise<Appointment[]> {
    const result = await db.select().from(appointmentsTable).where(eq(appointmentsTable.userId, userId));
    return result.map(convertDbResultToAppointment);
  }

  async getAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]> {
    const result = await db.select().from(appointmentsTable).where(eq(appointmentsTable.doctorId, doctorId));
    return result.map(convertDbResultToAppointment);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointmentsTable).values(insertAppointment).returning();
    return convertDbResultToAppointment(result[0]);
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const result = await db.update(appointmentsTable)
      .set(updates)
      .where(eq(appointmentsTable.id, id))
      .returning();
    
    return result[0] ? convertDbResultToAppointment(result[0]) : undefined;
  }

  // Medicine operations
  async getMedicine(id: string): Promise<Medicine | undefined> {
    const result = await db.select().from(medicinesTable).where(eq(medicinesTable.id, id)).limit(1);
    return result[0] ? convertDbResultToMedicine(result[0]) : undefined;
  }

  async getMedicines(filters?: { name?: string; prescriptionRequired?: boolean }): Promise<Medicine[]> {
    let query = db.select().from(medicinesTable);
    
    if (filters?.name) {
      query = query.where(sql`LOWER(${medicinesTable.name}) LIKE ${`%${filters.name.toLowerCase()}%`}`);
    }
    
    if (filters?.prescriptionRequired !== undefined) {
      query = query.where(eq(medicinesTable.prescriptionRequired, filters.prescriptionRequired));
    }
    
    const result = await query;
    return result.map(convertDbResultToMedicine);
  }

  async getMedicinesByIds(ids: string[]): Promise<Medicine[]> {
    if (ids.length === 0) return [];
    
    const result = await db.select()
      .from(medicinesTable)
      .where(sql`${medicinesTable.id} IN (${sql.raw(ids.map(() => '?').join(', '))})`, ...ids);
    
    return result.map(convertDbResultToMedicine);
  }

  async createMedicine(insertMedicine: InsertMedicine): Promise<Medicine> {
    const result = await db.insert(medicinesTable).values(insertMedicine).returning();
    return convertDbResultToMedicine(result[0]);
  }

  // Order operations
  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
    return result[0] ? convertDbResultToOrder(result[0]) : undefined;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const result = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));
    return result.map(convertDbResultToOrder);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await db.insert(ordersTable).values(insertOrder).returning();
    return convertDbResultToOrder(result[0]);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const result = await db.update(ordersTable)
      .set(updates)
      .where(eq(ordersTable.id, id))
      .returning();
    
    return result[0] ? convertDbResultToOrder(result[0]) : undefined;
  }

  // Prescription operations
  async getPrescription(id: string): Promise<Prescription | undefined> {
    const result = await db.select().from(prescriptionsTable).where(eq(prescriptionsTable.id, id)).limit(1);
    return result[0] ? convertDbResultToPrescription(result[0]) : undefined;
  }

  async getPrescriptionsByUserId(userId: string): Promise<Prescription[]> {
    const result = await db.select().from(prescriptionsTable).where(eq(prescriptionsTable.userId, userId));
    return result.map(convertDbResultToPrescription);
  }

  async getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]> {
    const result = await db.select().from(prescriptionsTable).where(eq(prescriptionsTable.doctorId, doctorId));
    return result.map(convertDbResultToPrescription);
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const result = await db.insert(prescriptionsTable).values(insertPrescription).returning();
    return convertDbResultToPrescription(result[0]);
  }


  // Pharmacy operations
  async getPharmacy(id: string): Promise<Pharmacy | undefined> {
    const result = await db.select().from(pharmaciesTable).where(eq(pharmaciesTable.id, id)).limit(1);
    return result[0] ? convertDbResultToPharmacy(result[0]) : undefined;
  }

  async getPharmacies(filters?: { city?: string; deliveryAvailable?: boolean }): Promise<Pharmacy[]> {
    let query = db.select().from(pharmaciesTable);
    
    if (filters?.city) {
      query = query.where(sql`LOWER(${pharmaciesTable.city}) LIKE ${`%${filters.city.toLowerCase()}%`}`);
    }
    
    if (filters?.deliveryAvailable !== undefined) {
      query = query.where(eq(pharmaciesTable.deliveryAvailable, filters.deliveryAvailable));
    }
    
    const result = await query;
    return result.map(convertDbResultToPharmacy);
  }

  async createPharmacy(insertPharmacy: InsertPharmacy): Promise<Pharmacy> {
    const result = await db.insert(pharmaciesTable).values(insertPharmacy).returning();
    return convertDbResultToPharmacy(result[0]);
  }

  // Donor Profile operations
  async getDonorProfile(userId: string): Promise<DonorProfile | undefined> {
    const result = await db.select().from(donorProfilesTable).where(eq(donorProfilesTable.userId, userId)).limit(1);
    return result[0] ? convertDbResultToDonorProfile(result[0]) : undefined;
  }

  async getDonorProfiles(filters?: { bloodGroup?: string; city?: string; isAvailable?: boolean }): Promise<DonorProfile[]> {
    let query = db.select().from(donorProfilesTable);
    
    if (filters?.bloodGroup) {
      query = query.where(eq(donorProfilesTable.bloodGroup, filters.bloodGroup));
    }
    
    if (filters?.isAvailable !== undefined) {
      query = query.where(eq(donorProfilesTable.isAvailable, filters.isAvailable));
    }
    
    const result = await query;
    return result.map(convertDbResultToDonorProfile);
  }

  async createDonorProfile(insertProfile: InsertDonorProfile): Promise<DonorProfile> {
    const result = await db.insert(donorProfilesTable).values(insertProfile).returning();
    return convertDbResultToDonorProfile(result[0]);
  }

  async updateDonorProfile(userId: string, updates: Partial<DonorProfile>): Promise<DonorProfile | undefined> {
    const result = await db.update(donorProfilesTable)
      .set(updates)
      .where(eq(donorProfilesTable.userId, userId))
      .returning();
    
    return result[0] ? convertDbResultToDonorProfile(result[0]) : undefined;
  }

  // Donation operations
  async getDonation(id: string): Promise<Donation | undefined> {
    const result = await db.select().from(donationsTable).where(eq(donationsTable.id, id)).limit(1);
    return result[0];
  }

  async getDonationsByDonorId(donorId: string): Promise<Donation[]> {
    return await db.select().from(donationsTable).where(eq(donationsTable.donorId, donorId));
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const result = await db.insert(donationsTable).values(insertDonation).returning();
    return result[0];
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation | undefined> {
    const result = await db.update(donationsTable)
      .set(updates)
      .where(eq(donationsTable.id, id))
      .returning();
    
    return result[0];
  }

  // Donation Request operations
  async getDonationRequest(id: string): Promise<DonationRequest | undefined> {
    const result = await db.select().from(donationRequestsTable).where(eq(donationRequestsTable.id, id)).limit(1);
    return result[0];
  }

  async getDonationRequests(filters?: { bloodGroup?: string; city?: string; urgencyLevel?: string }): Promise<DonationRequest[]> {
    let query = db.select().from(donationRequestsTable);
    
    if (filters?.bloodGroup) {
      query = query.where(eq(donationRequestsTable.bloodGroup, filters.bloodGroup));
    }
    
    if (filters?.urgencyLevel) {
      query = query.where(eq(donationRequestsTable.urgencyLevel, filters.urgencyLevel));
    }
    
    return await query;
  }

  async createDonationRequest(insertRequest: InsertDonationRequest): Promise<DonationRequest> {
    const result = await db.insert(donationRequestsTable).values(insertRequest).returning();
    return result[0];
  }

  async updateDonationRequest(id: string, updates: Partial<DonationRequest>): Promise<DonationRequest | undefined> {
    const result = await db.update(donationRequestsTable)
      .set(updates)
      .where(eq(donationRequestsTable.id, id))
      .returning();
    
    return result[0];
  }

  // Hospital operations
  async getHospital(id: string): Promise<Hospital | undefined> {
    const result = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, id)).limit(1);
    return result[0] as Hospital;
  }

  async getHospitals(filters?: { city?: string; specialties?: string[]; emergency?: boolean }): Promise<Hospital[]> {
    let query = db.select().from(hospitalsTable);
    
    if (filters?.city) {
      query = query.where(sql`${hospitalsTable.city} ILIKE ${`%${filters.city}%`}`);
    }
    
    const results = await query;
    let hospitals = results as Hospital[];
    
    // Client-side filtering for specialties and emergency
    if (filters?.specialties && filters.specialties.length > 0) {
      hospitals = hospitals.filter(h => 
        filters.specialties!.some(specialty => 
          h.specialties.includes(specialty)
        )
      );
    }
    
    if (filters?.emergency !== undefined) {
      hospitals = hospitals.filter(h => h.emergencyServices === filters.emergency);
    }
    
    return hospitals;
  }

  async createHospital(insertHospital: InsertHospital): Promise<Hospital> {
    const result = await db.insert(hospitalsTable).values(insertHospital).returning();
    return result[0] as Hospital;
  }

  // Hospital Rating operations
  async getHospitalRating(id: string): Promise<HospitalRating | undefined> {
    const result = await db.select().from(hospitalRatingsTable).where(eq(hospitalRatingsTable.id, id)).limit(1);
    return result[0];
  }

  async getHospitalRatingsByHospitalId(hospitalId: string): Promise<HospitalRating[]> {
    return await db.select().from(hospitalRatingsTable).where(eq(hospitalRatingsTable.hospitalId, hospitalId));
  }

  async createHospitalRating(insertRating: InsertHospitalRating): Promise<HospitalRating> {
    const result = await db.insert(hospitalRatingsTable).values(insertRating).returning();
    return result[0];
  }

  // Doctor Rating operations
  async getDoctorRating(id: string): Promise<DoctorRating | undefined> {
    const result = await db.select().from(doctorRatingsTable).where(eq(doctorRatingsTable.id, id)).limit(1);
    return result[0];
  }

  async getDoctorRatingsByDoctorId(doctorId: string): Promise<DoctorRating[]> {
    return await db.select().from(doctorRatingsTable).where(eq(doctorRatingsTable.doctorId, doctorId));
  }

  async createDoctorRating(insertRating: InsertDoctorRating): Promise<DoctorRating> {
    const result = await db.insert(doctorRatingsTable).values(insertRating).returning();
    return result[0];
  }

  // Vital Signs operations
  async getVitalSigns(id: string): Promise<VitalSigns | undefined> {
    const result = await db.select().from(vitalSignsTable).where(eq(vitalSignsTable.id, id)).limit(1);
    return result[0];
  }

  async getVitalSignsByUserId(userId: string, limit?: number): Promise<VitalSigns[]> {
    let query = db.select().from(vitalSignsTable)
      .where(eq(vitalSignsTable.userId, userId))
      .orderBy(desc(vitalSignsTable.timestamp));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }

  async createVitalSigns(insertVitals: InsertVitalSigns): Promise<VitalSigns> {
    const result = await db.insert(vitalSignsTable).values(insertVitals).returning();
    return result[0];
  }

  // Health Analysis operations
  async getHealthAnalysis(id: string): Promise<HealthAnalysis | undefined> {
    const result = await db.select().from(healthAnalysisTable).where(eq(healthAnalysisTable.id, id)).limit(1);
    return result[0];
  }

  async getHealthAnalysesByUserId(userId: string): Promise<HealthAnalysis[]> {
    return await db.select().from(healthAnalysisTable)
      .where(eq(healthAnalysisTable.userId, userId))
      .orderBy(desc(healthAnalysisTable.timestamp));
  }

  async createHealthAnalysis(insertAnalysis: InsertHealthAnalysis): Promise<HealthAnalysis> {
    const result = await db.insert(healthAnalysisTable).values(insertAnalysis).returning();
    return result[0];
  }
}