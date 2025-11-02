import { z } from 'zod';

export const VitalSignsSchema = z.object({
  heartRate: z.number().min(30).max(220),
  bloodPressureSystolic: z.number().min(70).max(250),
  bloodPressureDiastolic: z.number().min(40).max(150),
  oxygenSaturation: z.number().min(70).max(100),
  bodyTemperature: z.number().min(90).max(110),
  timestamp: z.coerce.date().refine(d => !isNaN(d.getTime()), { 
    message: 'Invalid timestamp - must be a valid date string or Date object' 
  })
});

export const UserProfileSchema = z.object({
  age: z.number().min(0).max(150),
  gender: z.string().min(1),
  medicalHistory: z.string().optional()
});

export const HealthAnalysisRequestSchema = z.object({
  vitals: VitalSignsSchema,
  userProfile: UserProfileSchema
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  language: z.string().optional(),
  healthContext: VitalSignsSchema.optional(),
  userProfile: UserProfileSchema.optional()
});

export const MedicalFileUploadSchema = z.object({
  reportType: z.enum(['blood_test', 'lab_report', 'xray', 'mri', 'ct_scan', 'ecg', 'prescription', 'discharge_summary', 'medical_record', 'other']).default('other'),
  sourceType: z.enum(['appointment', 'lab_booking', 'user_upload']).optional(),
  sourceId: z.string().optional(),
  description: z.string().max(500).optional()
});

export const FileAccessParamsSchema = z.object({
  filename: z.string().min(1).regex(/^[a-zA-Z0-9\-_\.]+$/, 'Invalid filename format')
});

export const ReportIdParamsSchema = z.object({
  id: z.string().uuid('Invalid report ID format')
});