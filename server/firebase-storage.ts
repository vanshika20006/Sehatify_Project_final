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
import { adminDb } from './services/firebase-admin';
import { IStorage } from './storage';

export class FirebaseStorage implements IStorage {

  // User operations
  async getUser(id: string): Promise<UserProfile | undefined> {
    const doc = await adminDb.collection('users').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as UserProfile : undefined;
  }

  async getUserByEmail(email: string): Promise<UserProfile | undefined> {
    const snapshot = await adminDb.collection('users').where('email', '==', email.trim().toLowerCase()).limit(1).get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserProfile;
  }

  async createUser(user: InsertUserProfile): Promise<UserProfile> {
    // Check if user already exists
    const existing = await this.getUserByEmail(user.email);
    if (existing) {
      throw new Error(`User with email ${user.email} already exists`);
    }

    const now = new Date();
    const userData = {
      ...user,
      email: user.email.trim().toLowerCase(),
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await adminDb.collection('users').add(userData);
    return { id: docRef.id, ...userData };
  }

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    const docRef = adminDb.collection('users').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return undefined;

    // Check email uniqueness if changing
    if (updates.email) {
      const existing = await this.getUserByEmail(updates.email);
      if (existing && existing.id !== id) {
        throw new Error(`User with email ${updates.email} already exists`);
      }
      updates.email = updates.email.trim().toLowerCase();
    }

    const updatedData = {
      ...updates,
      updatedAt: new Date()
    };

    await docRef.update(updatedData);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as UserProfile;
  }

  // Medical Report operations
  async getMedicalReport(id: string): Promise<MedicalReport | undefined> {
    const doc = await adminDb.collection('medicalReports').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as MedicalReport : undefined;
  }

  async getMedicalReportsByUserId(userId: string): Promise<MedicalReport[]> {
    const snapshot = await adminDb.collection('medicalReports').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalReport));
  }

  async createMedicalReport(report: InsertMedicalReport): Promise<MedicalReport> {
    const reportData = {
      ...report,
      uploadedAt: new Date()
    };
    
    const docRef = await adminDb.collection('medicalReports').add(reportData);
    return { id: docRef.id, ...reportData };
  }

  async updateMedicalReport(id: string, updates: Partial<MedicalReport>): Promise<MedicalReport | undefined> {
    const docRef = adminDb.collection('medicalReports').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return undefined;

    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as MedicalReport;
  }

  async deleteMedicalReport(id: string): Promise<boolean> {
    try {
      await adminDb.collection('medicalReports').doc(id).delete();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Lab operations
  async getLab(id: string): Promise<Lab | undefined> {
    const doc = await adminDb.collection('labs').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Lab : undefined;
  }

  async getLabs(filters?: { city?: string; specializations?: string[] }): Promise<Lab[]> {
    let query = adminDb.collection('labs') as any;
    
    if (filters?.city && typeof filters.city === 'string') {
      const cityLower = filters.city.toLowerCase();
      query = query.where('city', '>=', cityLower).where('city', '<=', cityLower + '\uf8ff');
    }
    
    const snapshot = await query.get();
    let results = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Lab));
    
    // Filter by specializations in memory (Firestore doesn't support array-contains-any for this use case)
    if (filters?.specializations?.length) {
      results = results.filter(lab => 
        filters.specializations!.some(spec => lab.specializations.includes(spec))
      );
    }
    
    return results;
  }

  async createLab(lab: InsertLab): Promise<Lab> {
    const docRef = await adminDb.collection('labs').add(lab);
    return { id: docRef.id, ...lab };
  }

  // Lab Test operations
  async getLabTest(id: string): Promise<LabTest | undefined> {
    const doc = await adminDb.collection('labTests').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as LabTest : undefined;
  }

  async getLabTestsByLabId(labId: string): Promise<LabTest[]> {
    const snapshot = await adminDb.collection('labTests').where('labId', '==', labId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabTest));
  }

  async createLabTest(test: InsertLabTest): Promise<LabTest> {
    const docRef = await adminDb.collection('labTests').add(test);
    return { id: docRef.id, ...test };
  }

  // Lab Booking operations
  async getLabBooking(id: string): Promise<LabBooking | undefined> {
    const doc = await adminDb.collection('labBookings').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as LabBooking : undefined;
  }

  async getLabBookingsByUserId(userId: string): Promise<LabBooking[]> {
    const snapshot = await adminDb.collection('labBookings').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabBooking));
  }

  async createLabBooking(booking: InsertLabBooking): Promise<LabBooking> {
    const bookingData = {
      ...booking,
      bookedAt: new Date()
    };
    
    const docRef = await adminDb.collection('labBookings').add(bookingData);
    return { id: docRef.id, ...bookingData };
  }

  async updateLabBooking(id: string, updates: Partial<LabBooking>): Promise<LabBooking | undefined> {
    const docRef = adminDb.collection('labBookings').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return undefined;

    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as LabBooking;
  }

  // Doctor operations
  async getDoctor(id: string): Promise<Doctor | undefined> {
    const doc = await adminDb.collection('doctors').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Doctor : undefined;
  }

  async getDoctors(filters?: { specialization?: string; city?: string }): Promise<Doctor[]> {
    let query = adminDb.collection('doctors') as any;
    
    if (filters?.specialization && typeof filters.specialization === 'string') {
      const specializationLower = filters.specialization.toLowerCase();
      query = query.where('specialization', '>=', specializationLower)
                  .where('specialization', '<=', specializationLower + '\uf8ff');
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Doctor));
  }

  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    const docRef = await adminDb.collection('doctors').add(doctor);
    return { id: docRef.id, ...doctor };
  }

  // Appointment operations
  async getAppointment(id: string): Promise<Appointment | undefined> {
    const doc = await adminDb.collection('appointments').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Appointment : undefined;
  }

  async getAppointmentsByUserId(userId: string): Promise<Appointment[]> {
    const snapshot = await adminDb.collection('appointments').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  }

  async getAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]> {
    const snapshot = await adminDb.collection('appointments').where('doctorId', '==', doctorId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const appointmentData = {
      ...appointment,
      bookedAt: new Date()
    };
    
    const docRef = await adminDb.collection('appointments').add(appointmentData);
    return { id: docRef.id, ...appointmentData };
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const docRef = adminDb.collection('appointments').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return undefined;

    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Appointment;
  }

  // Medicine operations
  async getMedicine(id: string): Promise<Medicine | undefined> {
    const doc = await adminDb.collection('medicines').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Medicine : undefined;
  }

  async getMedicines(filters?: { name?: string; prescriptionRequired?: boolean }): Promise<Medicine[]> {
    let query = adminDb.collection('medicines') as any;
    
    if (filters?.name && typeof filters.name === 'string') {
      const nameLower = filters.name.toLowerCase();
      query = query.where('name', '>=', nameLower)
                  .where('name', '<=', nameLower + '\uf8ff');
    }
    
    if (filters?.prescriptionRequired !== undefined) {
      query = query.where('prescriptionRequired', '==', filters.prescriptionRequired);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Medicine));
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const docRef = await adminDb.collection('medicines').add(medicine);
    return { id: docRef.id, ...medicine };
  }

  // Order operations
  async getOrder(id: string): Promise<Order | undefined> {
    const doc = await adminDb.collection('orders').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Order : undefined;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const snapshot = await adminDb.collection('orders').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const orderData = {
      ...order,
      orderedAt: new Date()
    };
    const docRef = await adminDb.collection('orders').add(orderData);
    return { id: docRef.id, ...orderData };
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const docRef = adminDb.collection('orders').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return undefined;

    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Order;
  }

  // Prescription operations
  async getPrescription(id: string): Promise<Prescription | undefined> {
    const doc = await adminDb.collection('prescriptions').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Prescription : undefined;
  }

  async getPrescriptionsByUserId(userId: string): Promise<Prescription[]> {
    const snapshot = await adminDb.collection('prescriptions').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
  }

  async getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]> {
    const snapshot = await adminDb.collection('prescriptions').where('doctorId', '==', doctorId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription));
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const docRef = await adminDb.collection('prescriptions').add(prescription);
    return { id: docRef.id, ...prescription };
  }

  // Hospital operations
  async getHospital(id: string): Promise<Hospital | undefined> {
    const doc = await adminDb.collection('hospitals').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Hospital : undefined;
  }

  async getHospitals(filters?: { city?: string; specialties?: string[] }): Promise<Hospital[]> {
    let query = adminDb.collection('hospitals') as any;
    
    if (filters?.city && typeof filters.city === 'string') {
      const cityLower = filters.city.toLowerCase();
      query = query.where('city', '>=', cityLower)
                  .where('city', '<=', cityLower + '\uf8ff');
    }
    
    const snapshot = await query.get();
    let results = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Hospital));
    
    // Filter by specialties in memory
    if (filters?.specialties?.length) {
      results = results.filter(hospital => 
        filters.specialties!.some(spec => hospital.specialties.includes(spec))
      );
    }
    
    return results;
  }

  async createHospital(hospital: InsertHospital): Promise<Hospital> {
    const docRef = await adminDb.collection('hospitals').add(hospital);
    return { id: docRef.id, ...hospital };
  }

  // Pharmacy operations
  async getPharmacy(id: string): Promise<Pharmacy | undefined> {
    const doc = await adminDb.collection('pharmacies').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Pharmacy : undefined;
  }

  async getPharmacies(filters?: { city?: string; deliveryAvailable?: boolean }): Promise<Pharmacy[]> {
    let query = adminDb.collection('pharmacies') as any;
    
    if (filters?.city && typeof filters.city === 'string') {
      const cityLower = filters.city.toLowerCase();
      query = query.where('city', '>=', cityLower)
                  .where('city', '<=', cityLower + '\uf8ff');
    }
    
    if (filters?.deliveryAvailable !== undefined) {
      query = query.where('deliveryAvailable', '==', filters.deliveryAvailable);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Pharmacy));
  }

  async createPharmacy(pharmacy: InsertPharmacy): Promise<Pharmacy> {
    const docRef = await adminDb.collection('pharmacies').add(pharmacy);
    return { id: docRef.id, ...pharmacy };
  }

  // Donor Profile operations
  async getDonorProfile(userId: string): Promise<DonorProfile | undefined> {
    const doc = await adminDb.collection('donorProfiles').doc(userId).get();
    return doc.exists ? { userId: doc.id, ...doc.data() } as DonorProfile : undefined;
  }

  async getDonorProfiles(filters?: { bloodGroup?: string; city?: string; isAvailable?: boolean }): Promise<DonorProfile[]> {
    let query = adminDb.collection('donorProfiles') as any;
    
    if (filters?.bloodGroup) {
      query = query.where('bloodGroup', '==', filters.bloodGroup);
    }
    
    if (filters?.city && typeof filters.city === 'string') {
      const cityLower = filters.city.toLowerCase();
      query = query.where('city', '>=', cityLower)
                  .where('city', '<=', cityLower + '\uf8ff');
    }
    
    if (filters?.isAvailable !== undefined) {
      query = query.where('isAvailable', '==', filters.isAvailable);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ userId: doc.id, ...doc.data() } as DonorProfile));
  }

  async createDonorProfile(profile: InsertDonorProfile): Promise<DonorProfile> {
    const profileData = {
      ...profile,
      id: profile.userId,
      registeredAt: new Date()
    };
    await adminDb.collection('donorProfiles').doc(profile.userId).set(profileData);
    return profileData;
  }

  async updateDonorProfile(userId: string, updates: Partial<DonorProfile>): Promise<DonorProfile | undefined> {
    const docRef = adminDb.collection('donorProfiles').doc(userId);
    const doc = await docRef.get();
    
    if (!doc.exists) return undefined;

    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return { userId: updatedDoc.id, ...updatedDoc.data() } as DonorProfile;
  }

  // Donation operations
  async getDonation(id: string): Promise<Donation | undefined> {
    const doc = await adminDb.collection('donations').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Donation : undefined;
  }

  async getDonationsByDonorId(donorId: string): Promise<Donation[]> {
    const snapshot = await adminDb.collection('donations').where('donorId', '==', donorId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const docRef = await adminDb.collection('donations').add(donation);
    return { id: docRef.id, ...donation };
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation | undefined> {
    const docRef = adminDb.collection('donations').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return undefined;

    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Donation;
  }

  // Donation Request operations
  async getDonationRequest(id: string): Promise<DonationRequest | undefined> {
    const doc = await adminDb.collection('donationRequests').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as DonationRequest : undefined;
  }

  async getDonationRequests(filters?: { bloodGroup?: string; city?: string; urgencyLevel?: string }): Promise<DonationRequest[]> {
    let query = adminDb.collection('donationRequests') as any;
    
    if (filters?.bloodGroup) {
      query = query.where('bloodGroup', '==', filters.bloodGroup);
    }
    
    if (filters?.urgencyLevel) {
      query = query.where('urgencyLevel', '==', filters.urgencyLevel);
    }
    
    if (filters?.city && typeof filters.city === 'string') {
      const cityLower = filters.city.toLowerCase();
      query = query.where('city', '>=', cityLower)
                  .where('city', '<=', cityLower + '\uf8ff');
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as DonationRequest));
  }

  async createDonationRequest(request: InsertDonationRequest): Promise<DonationRequest> {
    const requestData = {
      ...request,
      createdAt: new Date()
    };
    const docRef = await adminDb.collection('donationRequests').add(requestData);
    return { id: docRef.id, ...requestData };
  }

  async updateDonationRequest(id: string, updates: Partial<DonationRequest>): Promise<DonationRequest | undefined> {
    const docRef = adminDb.collection('donationRequests').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return undefined;

    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as DonationRequest;
  }

  // Hospital Rating operations
  async getHospitalRating(id: string): Promise<HospitalRating | undefined> {
    const doc = await adminDb.collection('hospitalRatings').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as HospitalRating : undefined;
  }

  async getHospitalRatingsByHospitalId(hospitalId: string): Promise<HospitalRating[]> {
    const snapshot = await adminDb.collection('hospitalRatings').where('hospitalId', '==', hospitalId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HospitalRating));
  }

  async createHospitalRating(rating: InsertHospitalRating): Promise<HospitalRating> {
    const ratingData = {
      ...rating,
      createdAt: new Date()
    };
    const docRef = await adminDb.collection('hospitalRatings').add(ratingData);
    return { id: docRef.id, ...ratingData };
  }

  // Doctor Rating operations
  async getDoctorRating(id: string): Promise<DoctorRating | undefined> {
    const doc = await adminDb.collection('doctorRatings').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as DoctorRating : undefined;
  }

  async getDoctorRatingsByDoctorId(doctorId: string): Promise<DoctorRating[]> {
    const snapshot = await adminDb.collection('doctorRatings').where('doctorId', '==', doctorId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DoctorRating));
  }

  async createDoctorRating(rating: InsertDoctorRating): Promise<DoctorRating> {
    const ratingData = {
      ...rating,
      createdAt: new Date()
    };
    const docRef = await adminDb.collection('doctorRatings').add(ratingData);
    return { id: docRef.id, ...ratingData };
  }

  // Vital Signs operations
  async getVitalSigns(id: string): Promise<VitalSigns | undefined> {
    const doc = await adminDb.collection('vitalSigns').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as VitalSigns : undefined;
  }

  async getVitalSignsByUserId(userId: string, limit?: number): Promise<VitalSigns[]> {
    let query = adminDb.collection('vitalSigns').where('userId', '==', userId).orderBy('timestamp', 'desc') as any;
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as VitalSigns));
  }

  async createVitalSigns(vitals: InsertVitalSigns): Promise<VitalSigns> {
    const docRef = await adminDb.collection('vitalSigns').add(vitals);
    return { id: docRef.id, ...vitals };
  }

  // Health Analysis operations
  async getHealthAnalysis(id: string): Promise<HealthAnalysis | undefined> {
    const doc = await adminDb.collection('healthAnalyses').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as HealthAnalysis : undefined;
  }

  async getHealthAnalysesByUserId(userId: string): Promise<HealthAnalysis[]> {
    const snapshot = await adminDb.collection('healthAnalyses').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HealthAnalysis));
  }

  async createHealthAnalysis(analysis: InsertHealthAnalysis): Promise<HealthAnalysis> {
    const docRef = await adminDb.collection('healthAnalyses').add(analysis);
    return { id: docRef.id, ...analysis };
  }
}