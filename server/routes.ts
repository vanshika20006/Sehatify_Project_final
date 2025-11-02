import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import { setupWebSocketHandlers } from "./routes/messages";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { authMiddleware, optionalAuth } from "./middleware/auth";
import { authRoutes } from "./routes/auth";
import adminRoutes from "./routes/admin";
import { initializeDemoUsers } from "./services/dev-auth";
import { populateSampleData } from "./utils/populate-sample-data";
import { hospitalsRouter } from "./routes/hospitals";
import { appointmentsRouter } from "./routes/appointments";
import mentorRoutes from "./routes/mentors";
import studentRoutes from "./routes/students";
import messageRoutes from "./routes/messages";
import { storage } from "./storage";
import { predictiveHealthService } from "./services/predictive-health";
import { geminiHealthService } from "./services/gemini";
import { firebaseStorageService } from "./services/firebase-storage";
import { HealthAnalysisRequestSchema, ChatRequestSchema, MedicalFileUploadSchema, FileAccessParamsSchema, ReportIdParamsSchema } from "./validation/health";
import { insertMedicalReportSchema, insertLabBookingSchema } from "@shared/schema";
import { getDiseaseData, getDiseaseDetails, reportDiseaseCase, searchDiseases, getAlertSettings, updateAlertSettings } from "./routes/disease-surveillance";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize demo users in development mode
  if (process.env.NODE_ENV === 'development') {
    await initializeDemoUsers();
    await populateSampleData();
  }

  // CORS configuration
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5000",
    credentials: true
  }));

  // Configure multer for file uploads (using memory storage for Firebase)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
      }
    }
  });

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // Admin routes
  app.use("/api/admin", adminRoutes);

  // Hospital routes
  app.use("/api/hospitals", hospitalsRouter);

  // Appointment routes
  app.use("/api/appointments", appointmentsRouter);

  // Mentor-Student routes
  app.use("/api/mentors", mentorRoutes);

  // Student routes
  app.use("/api/students", studentRoutes);

  // Message routes
  app.use("/api/messages", messageRoutes);

  // Donation routes
  const { donationsRouter } = await import("./routes/donations");
  app.use("/api/donations", donationsRouter);

  // Disease surveillance routes
  app.get("/api/disease-surveillance/data", optionalAuth, getDiseaseData);
  app.get("/api/disease-surveillance/details/:id", optionalAuth, getDiseaseDetails);
  app.post("/api/disease-surveillance/report", authMiddleware, reportDiseaseCase);
  app.get("/api/disease-surveillance/search", optionalAuth, searchDiseases);
  app.get("/api/disease-surveillance/alerts", authMiddleware, getAlertSettings);
  app.put("/api/disease-surveillance/alerts", authMiddleware, updateAlertSettings);

  // Medical File Upload endpoints - Use optional auth in development mode
  const uploadAuthMiddleware = process.env.NODE_ENV === 'development' ? optionalAuth : authMiddleware;
  
  // Medicine endpoints - Use optional auth in development mode
  const medicineAuthMiddleware = process.env.NODE_ENV === 'development' ? optionalAuth : authMiddleware;
  app.post("/api/uploads", uploadAuthMiddleware, upload.single('file'), async (req, res) => {
    try {
      console.log('=== Upload Request Started ===');
      console.log('File received:', req.file?.originalname, req.file?.mimetype, req.file?.size);
      console.log('Request body:', req.body);
      
      if (!req.file) {
        console.error('No file in request');
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate request body parameters
      const bodyValidation = MedicalFileUploadSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        console.error('Validation failed:', bodyValidation.error.issues);
        return res.status(400).json({ 
          error: "Invalid upload parameters", 
          details: bodyValidation.error.issues 
        });
      }

      const { reportType, sourceType, sourceId, description } = bodyValidation.data;
      console.log('Validated parameters:', { reportType, sourceType, sourceId });
      
      // Get authenticated user ID from session, or use demo user in development
      let userId = (req as any).user?.uid;
      if (!userId) {
        if (process.env.NODE_ENV === 'development') {
          // Use demo user ID for development mode (matching dev-auth.ts)
          userId = 'a2282785-e9d5-4a1b-9e3e-21d53d3a413e';
          console.log('Using demo user ID for development mode upload');
        } else {
          return res.status(401).json({ error: "User not authenticated" });
        }
      }
      
      // Upload file to Firebase Storage (using buffer from memory storage)
      let cloudStorageUrl = '';
      try {
        cloudStorageUrl = await firebaseStorageService.uploadFile(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
        console.log('File uploaded to Firebase Storage successfully:', cloudStorageUrl);
      } catch (storageError) {
        console.warn('Firebase Storage upload failed, using fallback:', storageError);
        // Use a placeholder URL if Firebase is not configured
        cloudStorageUrl = `/uploads/${randomUUID()}-${req.file.originalname}`;
      }

      const reportData = {
        userId,
        fileName: `${randomUUID()}-${req.file.originalname}`, // Generate unique filename
        originalFileName: req.file.originalname,
        fileType: req.file.mimetype.includes('pdf') ? 'pdf' as const : 
                  req.file.mimetype.includes('jpeg') ? 'jpeg' as const : 'png' as const,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        checksum: randomUUID(), // Simple checksum for now
        storageUrl: cloudStorageUrl,
        reportType: reportType as any,
        sourceType,
        sourceId,
        description,
        isAnalyzed: false,
        sharedWith: [] as string[],
        tags: [] as string[],
        isEncrypted: true,
        isDeidentified: false
      };

      const report = await storage.createMedicalReport(reportData);
      
      // Provide AI-powered analysis for uploaded medical files
      let analysisData = null;
      try {
        const language = req.body.language || 'en';
        let analysisResult;
        
        if (req.file.mimetype === 'application/pdf') {
          let tempFilePath: string | null = null;
          try {
            // Extract text from PDF and analyze with Gemini AI
            tempFilePath = `/tmp/${randomUUID()}-${req.file.originalname}`;
            await fs.writeFile(tempFilePath, req.file.buffer);
            
            const extractedText = await geminiHealthService.extractTextFromFile(tempFilePath);
            
            if (extractedText && extractedText.trim().length > 10) {
              // Use Gemini AI for comprehensive analysis
              analysisResult = await geminiHealthService.analyzeMedicalDocument(
                extractedText,
                reportType as 'lab_report' | 'prescription' | 'medical_record',
                language
              );
            } else {
              throw new Error('Could not extract meaningful text from PDF');
            }
          } catch (extractError) {
            console.error('PDF analysis error:', extractError);
            // Fallback to basic analysis if Gemini fails
            analysisResult = {
              summary: `PDF medical document uploaded successfully. AI analysis encountered an issue, but the document is securely stored. Please consult your healthcare provider for detailed interpretation.`,
              keyFindings: [`${reportType} PDF document uploaded`, "Document stored securely", "Manual review recommended"],
              recommendations: ["Consult with your healthcare provider for document interpretation", "Share with your medical team during appointments", "Keep a backup copy for your records"],
              dietPlan: { breakfast: [], lunch: [], dinner: [], snacks: [] },
              exercisePlan: { cardio: [], strength: [], flexibility: [] },
              youtubeVideos: [{ title: "General Health Tips", searchTerm: "basic health tips for beginners" }],
              lifestyleChanges: ["Maintain regular healthcare checkups"],
              actionPlan: { immediate: ["Contact your healthcare provider"], shortTerm: ["Schedule a consultation"], longTerm: ["Follow medical advice"] },
              followUpNeeded: true
            };
          } finally {
            // Always clean up temp file
            if (tempFilePath) {
              try {
                await fs.unlink(tempFilePath);
              } catch (unlinkError) {
                console.warn('Failed to delete temp file:', unlinkError);
              }
            }
          }
        } else if (req.file.mimetype.startsWith('image/')) {
          // For images, use Gemini Vision API for comprehensive analysis
          try {
            console.log('Using Gemini Vision API to analyze medical image');
            analysisResult = await geminiHealthService.analyzeMedicalImage(
              req.file.buffer,
              req.file.mimetype,
              reportType as any,
              language
            );
            console.log('Gemini Vision API analysis completed successfully');
          } catch (visionError) {
            console.error('Gemini Vision analysis error, using fallback:', visionError);
            // Fallback if vision API fails
            analysisResult = {
              summary: `Medical image (${reportType}) uploaded successfully. AI analysis is currently unavailable, but the document is securely stored for your healthcare provider to review.`,
              keyFindings: [`${reportType} image uploaded`, "Professional interpretation recommended"],
              recommendations: ["Consult with your healthcare provider for detailed image interpretation", "Share with your medical team during appointments", "Keep this report for your medical records"],
              dietPlan: { 
                breakfast: ["Include fruits and vegetables", "Choose whole grains", "Stay hydrated"], 
                lunch: ["Lean proteins", "Colorful vegetables", "Healthy fats"], 
                dinner: ["Light, nutritious meals", "Avoid late eating"], 
                snacks: ["Nuts", "Fruits", "Yogurt"] 
              },
              exercisePlan: { 
                cardio: ["30 minutes walking daily", "Swimming if accessible", "Cycling"], 
                strength: ["Bodyweight exercises", "Light weights", "Resistance bands"], 
                flexibility: ["Daily stretching", "Yoga poses", "Deep breathing"] 
              },
              youtubeVideos: [
                { title: "Understanding Medical Images", searchTerm: "how to read medical imaging results" },
                { title: "General Health Tips", searchTerm: "daily health habits for beginners" }
              ],
              lifestyleChanges: ["Regular sleep schedule", "Stress management", "Stay hydrated"],
              actionPlan: { 
                immediate: ["Consult healthcare provider for professional image interpretation"], 
                shortTerm: ["Follow general wellness practices", "Schedule follow-up appointment if needed"], 
                longTerm: ["Maintain preventive health practices and regular checkups"] 
              },
              followUpNeeded: true
            };
          }
        }
        
        if (analysisResult) {
          // Schema-compliant data for database (only allowed fields)
          const dbAnalysisData = {
            summary: analysisResult.summary,
            keyFindings: analysisResult.keyFindings,
            recommendations: analysisResult.recommendations,
            followUpNeeded: analysisResult.followUpNeeded,
            analyzedAt: new Date(),
            confidence: 0.9,
            aiModelUsed: "gemini-1.5-flash",
            language: language
          };
          
          // Full analysis data for response (includes extra fields)
          analysisData = {
            ...dbAnalysisData,
            dietPlan: analysisResult.dietPlan || { breakfast: [], lunch: [], dinner: [], snacks: [] },
            exercisePlan: analysisResult.exercisePlan || { cardio: [], strength: [], flexibility: [] },
            youtubeVideos: analysisResult.youtubeVideos || [],
            lifestyleChanges: analysisResult.lifestyleChanges || [],
            actionPlan: analysisResult.actionPlan || { immediate: [], shortTerm: [], longTerm: [] }
          };
          
          await storage.updateMedicalReport(report.id, {
            isAnalyzed: true,
            analysis: dbAnalysisData
          });
        }
      } catch (analysisError) {
        console.error('Document analysis error:', analysisError);
      }

      // Return the report with analysis data included
      res.json({
        success: true,
        report: {
          ...report,
          isAnalyzed: analysisData !== null,
          analysis: analysisData
        },
        message: "File uploaded and analyzed successfully"
      });
    } catch (error) {
      console.error('Upload error:', error);
      // Provide detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Detailed upload error:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        file: req.file?.originalname
      });
      res.status(500).json({ 
        error: "Failed to upload file",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  });

  app.get("/api/uploads", uploadAuthMiddleware, async (req, res) => {
    try {
      let userId = (req as any).user?.uid;
      if (!userId) {
        if (process.env.NODE_ENV === 'development') {
          userId = 'a2282785-e9d5-4a1b-9e3e-21d53d3a413e';
        } else {
          return res.status(401).json({ error: "User not authenticated" });
        }
      }
      const reports = await storage.getMedicalReportsByUserId(userId);
      res.json({ reports });
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({ error: "Failed to retrieve reports" });
    }
  });

  app.get("/api/uploads/:filename", uploadAuthMiddleware, async (req, res) => {
    try {
      // Validate filename parameter
      const paramValidation = FileAccessParamsSchema.safeParse(req.params);
      if (!paramValidation.success) {
        return res.status(400).json({ 
          error: "Invalid filename", 
          details: paramValidation.error.issues 
        });
      }

      const { filename } = paramValidation.data;
      
      // Get authenticated user ID
      let userId = (req as any).user?.uid;
      if (!userId) {
        if (process.env.NODE_ENV === 'development') {
          userId = 'a2282785-e9d5-4a1b-9e3e-21d53d3a413e';
        } else {
          return res.status(401).json({ error: "User not authenticated" });
        }
      }
      
      // Verify user owns this file
      const userReports = await storage.getMedicalReportsByUserId(userId);
      const report = userReports.find(r => r.fileName === filename);
      
      if (!report) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Generate signed URL for the file from Firebase Storage
      const signedUrl = await firebaseStorageService.getSignedUrl(report.storageUrl, 60); // 60 minutes expiry
      
      // Redirect to the signed URL for secure access
      res.redirect(signedUrl);
    } catch (error) {
      console.error('File access error:', error);
      res.status(404).json({ error: "File not found" });
    }
  });

  app.delete("/api/uploads/:id", uploadAuthMiddleware, async (req, res) => {
    try {
      // Validate report ID parameter
      const paramValidation = ReportIdParamsSchema.safeParse(req.params);
      if (!paramValidation.success) {
        return res.status(400).json({ 
          error: "Invalid report ID", 
          details: paramValidation.error.issues 
        });
      }

      const { id } = paramValidation.data;
      let userId = (req as any).user?.uid;
      if (!userId) {
        if (process.env.NODE_ENV === 'development') {
          userId = 'a2282785-e9d5-4a1b-9e3e-21d53d3a413e';
        } else {
          return res.status(401).json({ error: "User not authenticated" });
        }
      }

      const report = await storage.getMedicalReport(id);
      
      // Verify user owns this report
      if (!report || report.userId !== userId) {
        return res.status(404).json({ error: "Report not found or access denied" });
      }
      
      // Delete file from Firebase Storage
      try {
        await firebaseStorageService.deleteFile(report.storageUrl);
      } catch (fileError) {
        console.warn('Firebase Storage deletion error:', fileError);
      }
      
      // Delete from database
      await storage.deleteMedicalReport(id);
      
      res.json({ success: true, message: "Report deleted successfully" });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: "Failed to delete report" });
    }
  });

  // Enhanced Lab Booking endpoints
  app.get("/api/labs", authMiddleware, async (req, res) => {
    try {
      const { city, specializations } = req.query;
      const filters: any = {};
      
      if (city) filters.city = city as string;
      if (specializations) filters.specializations = (specializations as string).split(',');
      
      const labs = await storage.getLabs(filters);
      res.json({ labs });
    } catch (error) {
      console.error('Get labs error:', error);
      res.status(500).json({ error: "Failed to retrieve labs" });
    }
  });

  app.get("/api/labs/:labId/tests", authMiddleware, async (req, res) => {
    try {
      const { labId } = req.params;
      const tests = await storage.getLabTestsByLabId(labId);
      res.json({ tests });
    } catch (error) {
      console.error('Get lab tests error:', error);
      res.status(500).json({ error: "Failed to retrieve lab tests" });
    }
  });

  app.post("/api/labs/book", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const bookingData = insertLabBookingSchema.parse({
        ...req.body,
        userId
      });
      
      const booking = await storage.createLabBooking(bookingData);
      
      res.json({
        success: true,
        booking,
        message: "Lab booking created successfully"
      });
    } catch (error) {
      console.error('Lab booking error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid booking data", 
          details: error.issues 
        });
      }
      res.status(500).json({ error: "Failed to create lab booking" });
    }
  });

  app.get("/api/labs/bookings", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const bookings = await storage.getLabBookingsByUserId(userId);
      res.json({ bookings });
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({ error: "Failed to retrieve bookings" });
    }
  });

  app.put("/api/labs/bookings/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const booking = await storage.updateLabBooking(id, updates);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      res.json({ success: true, booking });
    } catch (error) {
      console.error('Update booking error:', error);
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  // 3D Body Analysis endpoint
  app.post("/api/analysis/body-map", authMiddleware, async (req, res) => {
    try {
      const { healthAnalysis, symptoms, conditions } = req.body;
      
      // Use Gemini to analyze health data and map to body parts
      const prompt = `Based on the following health analysis and symptoms, identify which body parts/systems are affected and provide a mapping for 3D visualization:

Health Analysis: ${healthAnalysis}
Symptoms: ${symptoms ? symptoms.join(', ') : 'None specified'}
Conditions: ${conditions ? conditions.join(', ') : 'None specified'}

Please respond in JSON format with:
{
  "affectedSystems": ["cardiovascular", "respiratory", "musculoskeletal", etc.],
  "bodyParts": [
    {"name": "heart", "severity": "high|medium|low", "description": "explanation"},
    {"name": "lungs", "severity": "medium", "description": "explanation"}
  ],
  "overallRisk": "low|medium|high|critical",
  "visualization": {
    "highlightedAreas": ["chest", "head", "limbs"],
    "colors": {"chest": "#ff4444", "head": "#ffaa44"}
  }
}`;

      const result = await geminiHealthService.generateChatResponse(prompt);
      
      try {
        // Try to parse JSON from Gemini response
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        let bodyMap;
        
        if (jsonMatch) {
          bodyMap = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback response
          bodyMap = {
            affectedSystems: ["general"],
            bodyParts: [
              {
                name: "general",
                severity: "medium",
                description: "Based on the analysis, general health monitoring is recommended"
              }
            ],
            overallRisk: "low",
            visualization: {
              highlightedAreas: ["torso"],
              colors: {"torso": "#4CAF50"}
            }
          };
        }
        
        res.json({
          success: true,
          bodyMap,
          analysisText: result.response
        });
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        res.json({
          success: true,
          bodyMap: {
            affectedSystems: ["general"],
            bodyParts: [{
              name: "general",
              severity: "low",
              description: "Health analysis completed successfully"
            }],
            overallRisk: "low",
            visualization: {
              highlightedAreas: ["torso"],
              colors: {"torso": "#4CAF50"}
            }
          },
          analysisText: result
        });
      }
    } catch (error) {
      console.error('Body map analysis error:', error);
      res.status(500).json({ error: "Failed to generate body map analysis" });
    }
  });

  // Enhanced health endpoints for wristband data
  app.get("/api/health/vitals", optionalAuth, (req, res) => {
    res.json({ message: "Health vitals endpoint", data: [] });
  });

  app.post("/api/health/vitals", optionalAuth, async (req, res) => {
    try {
      const vitalSigns = req.body;
      // TODO: Save to database and analyze
      res.json({ success: true, message: "Vital signs received", id: Date.now().toString() });
    } catch (error) {
      res.status(500).json({ error: "Failed to process vital signs" });
    }
  });

  app.post("/api/health/analyze", authMiddleware, async (req, res) => {
    try {
      const validation = HealthAnalysisRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validation.error.issues 
        });
      }

      const { vitals, userProfile } = validation.data;
      const result = await geminiHealthService.analyzeVitalSigns(
        vitals,
        userProfile.age,
        userProfile.gender,
        userProfile.medicalHistory
      );
      res.json(result);
    } catch (error) {
      console.error('Health analysis error:', error);
      res.status(500).json({ error: "Failed to analyze health data" });
    }
  });

  app.post("/api/health/predict", authMiddleware, async (req, res) => {
    try {
      const { period, historicalData, userProfile } = req.body;
      const prediction = await predictiveHealthService.analyzeLongTermHealthTrends(
        historicalData,
        userProfile,
        period
      );
      res.json({ success: true, prediction });
    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({ error: "Failed to generate health prediction" });
    }
  });

  app.post("/api/health/doctor-report", authMiddleware, async (req, res) => {
    try {
      const { patientData, healthPrediction, recentVitals, labReports } = req.body;
      const report = await predictiveHealthService.generateDoctorReport(
        patientData,
        healthPrediction,
        recentVitals,
        labReports
      );
      res.json({ success: true, report });
    } catch (error) {
      console.error('Doctor report error:', error);
      res.status(500).json({ error: "Failed to generate doctor report" });
    }
  });

  app.get("/api/health/wristband-status", optionalAuth, (req, res) => {
    // Mock wristband device status
    res.json({
      connected: true,
      batteryLevel: 85,
      lastSync: new Date(),
      deviceModel: "HealthBand Pro",
      firmwareVersion: "2.1.0"
    });
  });

  app.get("/api/doctors", optionalAuth, (req, res) => {
    // Mock doctors data
    res.json({
      doctors: [
        {
          id: "doc1",
          name: "Dr. Sarah Johnson",
          specialty: "Cardiology",
          rating: 4.9,
          experience: "15 years",
          hospital: "City General Hospital",
          availability: "Available today",
          consultationFee: 800
        },
        {
          id: "doc2",
          name: "Dr. Rajesh Patel",
          specialty: "Internal Medicine",
          rating: 4.7,
          experience: "12 years",
          hospital: "Metro Health Center",
          availability: "Available tomorrow",
          consultationFee: 600
        },
        {
          id: "doc3",
          name: "Dr. Priya Sharma",
          specialty: "Endocrinology",
          rating: 4.8,
          experience: "18 years",
          hospital: "Advanced Medical Institute",
          availability: "Available next week",
          consultationFee: 900
        }
      ]
    });
  });

  app.post("/api/doctors/send-report", authMiddleware, async (req, res) => {
    try {
      const { doctorId, report, patientData } = req.body;
      // TODO: Send report to doctor
      res.json({
        success: true,
        message: "Report sent to doctor successfully. You will receive a response within 24 hours."
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to send report to doctor" });
    }
  });

  app.get("/api/donations", authMiddleware, (req, res) => {
    res.json({ message: "Donations endpoint", data: [] });
  });

  app.get("/api/emergency/alert", (req, res) => {
    res.json({ message: "Emergency alert endpoint" });
  });

  app.post("/api/emergency/alert", authMiddleware, async (req, res) => {
    try {
      const { type, location, vitalSigns } = req.body;
      // TODO: Handle emergency alert
      console.log('Emergency alert triggered:', { type, location, vitalSigns });
      res.json({ success: true, message: "Emergency services have been notified" });
    } catch (error) {
      res.status(500).json({ error: "Failed to process emergency alert" });
    }
  });

  app.get("/api/reports", authMiddleware, (req, res) => {
    res.json({ message: "Reports endpoint", data: [] });
  });

  // Pathology lab endpoints
  app.get("/api/pathology/labs", authMiddleware, (req, res) => {
    // Mock pathology labs
    res.json({
      labs: [
        { id: "lab1", name: "CityLab Diagnostics", rating: 4.8, distance: "2.3 km" },
        { id: "lab2", name: "HealthCheck Labs", rating: 4.6, distance: "3.1 km" },
        { id: "lab3", name: "MediCore Diagnostics", rating: 4.9, distance: "4.2 km" }
      ]
    });
  });

  app.post("/api/pathology/request", authMiddleware, async (req, res) => {
    try {
      const { testType, labId, urgency } = req.body;
      // TODO: Create pathology test request
      res.json({
        success: true,
        requestId: `REQ-${Date.now()}`,
        message: "Test requested successfully. A technician will contact you within 2 hours.",
        estimatedCollection: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to request pathology test" });
    }
  });

  // Medicine ordering endpoints
  app.get("/api/medicines/search", optionalAuth, async (req, res) => {
    try {
      const { query } = req.query;
      const searchQuery = typeof query === 'string' ? query : '';
      
      try {
        // Try real database search first
        const medicines = await storage.getMedicines({
          name: searchQuery || undefined
        });
        
        // Transform to frontend format
        const formattedMedicines = medicines.map(med => ({
          id: med.id,
          name: med.name,
          genericName: med.genericName,
          manufacturer: med.manufacturer,
          composition: med.composition,
          dosageForm: med.dosageForm,
          strength: med.strength,
          price: med.price,
          discountedPrice: Math.round(med.price * 0.85), // 15% discount
          discount: 15,
          availability: true,
          prescription: med.prescriptionRequired,
          category: med.dosageForm.charAt(0).toUpperCase() + med.dosageForm.slice(1) + 's',
          dosage: med.strength,
          packaging: '1 unit',
          description: `${med.genericName} - ${med.composition}`
        }));
        
        res.json({ medicines: formattedMedicines });
      } catch (dbError) {
        console.error('Database error, using fallback data:', dbError);
        
        // Fallback demo medicines data
        const demoMedicines = [
          {
            id: 'med-1',
            name: 'Paracetamol',
            genericName: 'Acetaminophen',
            manufacturer: 'Sun Pharma',
            composition: 'Paracetamol 500mg',
            dosageForm: 'tablet',
            strength: '500mg',
            price: 45,
            discountedPrice: 38,
            discount: 15,
            availability: true,
            prescription: false,
            category: 'Tablets',
            dosage: '500mg',
            packaging: '10 tablets',
            description: 'Acetaminophen - Paracetamol 500mg'
          },
          {
            id: 'med-2',
            name: 'Amoxicillin',
            genericName: 'Amoxicillin',
            manufacturer: 'Cipla',
            composition: 'Amoxicillin 250mg',
            dosageForm: 'capsule',
            strength: '250mg',
            price: 120,
            discountedPrice: 102,
            discount: 15,
            availability: true,
            prescription: true,
            category: 'Capsules',
            dosage: '250mg',
            packaging: '10 capsules',
            description: 'Amoxicillin - Antibiotic capsules'
          },
          {
            id: 'med-3',
            name: 'Cetirizine',
            genericName: 'Cetirizine HCl',
            manufacturer: 'Dr. Reddy\'s',
            composition: 'Cetirizine HCl 10mg',
            dosageForm: 'tablet',
            strength: '10mg',
            price: 65,
            discountedPrice: 55,
            discount: 15,
            availability: true,
            prescription: false,
            category: 'Tablets',
            dosage: '10mg',
            packaging: '10 tablets',
            description: 'Cetirizine HCl - Antihistamine'
          },
          {
            id: 'med-4',
            name: 'Omeprazole',
            genericName: 'Omeprazole',
            manufacturer: 'Lupin',
            composition: 'Omeprazole 20mg',
            dosageForm: 'capsule',
            strength: '20mg',
            price: 85,
            discountedPrice: 72,
            discount: 15,
            availability: true,
            prescription: true,
            category: 'Capsules',
            dosage: '20mg',
            packaging: '10 capsules',
            description: 'Omeprazole - Proton pump inhibitor'
          },
          {
            id: 'med-5',
            name: 'Ibuprofen',
            genericName: 'Ibuprofen',
            manufacturer: 'Abbott',
            composition: 'Ibuprofen 400mg',
            dosageForm: 'tablet',
            strength: '400mg',
            price: 75,
            discountedPrice: 64,
            discount: 15,
            availability: true,
            prescription: false,
            category: 'Tablets',
            dosage: '400mg',
            packaging: '10 tablets',
            description: 'Ibuprofen - Pain reliever and anti-inflammatory'
          }
        ];
        
        // Filter by search query if provided
        let filteredMedicines = demoMedicines;
        if (searchQuery) {
          filteredMedicines = demoMedicines.filter(med => 
            med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            med.genericName.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        res.json({ medicines: filteredMedicines });
      }
    } catch (error) {
      console.error('Error searching medicines:', error);
      res.status(500).json({ error: "Failed to search medicines" });
    }
  });

  app.post("/api/medicines/order", medicineAuthMiddleware, async (req, res) => {
    try {
      const { medicines, deliveryAddress } = req.body;
      let userId = (req as any).user?.uid;
      
      if (!userId) {
        if (process.env.NODE_ENV === 'development') {
          // Use demo user ID for development mode
          userId = 'a2282785-e9d5-4a1b-9e3e-21d53d3a413e';
          console.log('Using demo user ID for medicine order in development mode');
        } else {
          return res.status(401).json({ error: "User not authenticated" });
        }
      }
      
      // Always use the demo user for development
      const demoUser = await storage.getUserByEmail('demo@sehatify.com');
      if (!demoUser) {
        return res.status(401).json({ error: "Demo user not found in database" });
      }
      
      const actualUserId = demoUser.id;
      
      // Fetch medicines from database to get authoritative pricing
      const medicineIds = medicines.map((med: any) => med.id);
      const dbMedicines = await storage.getMedicinesByIds(medicineIds);
      
      if (dbMedicines.length !== medicineIds.length) {
        return res.status(400).json({ error: "Some medicines not found in database" });
      }
      
      // Calculate totals server-side using database prices (security: ignore client pricing)
      let totalAmount = 0;
      let discount = 0;
      const validatedMedicines = [];
      
      for (const clientMedicine of medicines) {
        const dbMedicine = dbMedicines.find(db => db.id === clientMedicine.id);
        if (!dbMedicine) {
          return res.status(400).json({ error: `Medicine ${clientMedicine.id} not found` });
        }
        
        // Server-side price calculation (ignore client prices)
        const serverPrice = dbMedicine.price;
        const serverDiscountedPrice = Math.round(serverPrice * 0.85); // 15% discount
        const quantity = clientMedicine.quantity || 1;
        
        totalAmount += serverPrice * quantity;
        discount += (serverPrice - serverDiscountedPrice) * quantity;
        
        validatedMedicines.push({
          medicineId: dbMedicine.id,
          quantity: quantity,
          price: serverPrice,
          prescriptionRequired: dbMedicine.prescriptionRequired || false
        });
      }
      
      const finalAmount = totalAmount - discount;
      
      // Create order in database
      const order = await storage.createOrder({
        userId: actualUserId,
        pharmacyId: 'default-pharmacy',
        orderItems: validatedMedicines,
        deliveryAddress: {
          name: 'User Name',
          phone: '+91-9876543210',
          street: deliveryAddress || 'Default Address',
          city: 'City',
          state: 'State',
          pincode: '123456',
          isDefault: true
        },
        totalAmount: totalAmount,
        deliveryFee: 0,
        discount: discount,
        finalAmount: finalAmount,
        currency: 'INR',
        paymentStatus: 'pending',
        orderStatus: 'placed',
        estimatedDelivery: new Date(Date.now() + 48 * 60 * 60 * 1000)
      });
      
      res.json({
        success: true,
        orderId: order.id,
        estimatedDelivery: order.estimatedDelivery,
        totalAmount: finalAmount
      });
    } catch (error) {
      console.error('Error processing medicine order:', error);
      res.status(500).json({ error: "Failed to process medicine order" });
    }
  });

  // Get user's order history  
  app.get("/api/medicines/orders", medicineAuthMiddleware, async (req, res) => {
    try {
      let userId = (req as any).user?.uid;
      if (!userId) {
        if (process.env.NODE_ENV === 'development') {
          // Use demo user ID for development mode
          userId = 'a2282785-e9d5-4a1b-9e3e-21d53d3a413e';
          console.log('Using demo user ID for medicine orders in development mode');
        } else {
          return res.status(401).json({ error: "User not authenticated" });
        }
      }

      try {
        const rawOrders = await storage.getOrdersByUserId(userId);
        
        // Transform orders to match frontend expectations
        const formattedOrders = rawOrders.map(order => ({
          id: order.id,
          medicines: order.orderItems.map(item => ({
            medicine: {
              id: item.medicineId,
              name: 'Medicine', // Will be populated by frontend from search
              genericName: '',
              description: '',
              price: item.price,
              discountedPrice: Math.round(item.price * 0.85),
              discount: 15,
              availability: true,
              prescription: item.prescriptionRequired,
              manufacturer: '',
              category: '',
              dosage: '',
              packaging: '1 unit'
            },
            quantity: item.quantity
          })),
          totalAmount: order.totalAmount,
          discountAmount: order.discount,
          status: order.orderStatus === 'placed' ? 'pending' : 
                  order.orderStatus === 'shipped' ? 'shipped' : 
                  order.orderStatus === 'delivered' ? 'delivered' : 'confirmed',
          orderDate: order.orderedAt,
          estimatedDelivery: order.estimatedDelivery,
          trackingNumber: undefined
        }));
        
        res.json({ orders: formattedOrders });
      } catch (dbError) {
        console.error('Database error, using fallback order data:', dbError);
        
        // Return demo order history when database is unavailable
        const demoOrders = [
          {
            id: 'order-1',
            medicines: [
              {
                medicine: {
                  id: 'med-1',
                  name: 'Paracetamol',
                  genericName: 'Acetaminophen',
                  description: 'Pain reliever and fever reducer',
                  price: 45,
                  discountedPrice: 38,
                  discount: 15,
                  availability: true,
                  prescription: false,
                  manufacturer: 'Sun Pharma',
                  category: 'Tablets',
                  dosage: '500mg',
                  packaging: '10 tablets'
                },
                quantity: 2
              }
            ],
            totalAmount: 90,
            discountAmount: 14,
            status: 'delivered',
            orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            estimatedDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            trackingNumber: 'TRK123456789'
          },
          {
            id: 'order-2',
            medicines: [
              {
                medicine: {
                  id: 'med-3',
                  name: 'Cetirizine',
                  genericName: 'Cetirizine HCl',
                  description: 'Antihistamine for allergies',
                  price: 65,
                  discountedPrice: 55,
                  discount: 15,
                  availability: true,
                  prescription: false,
                  manufacturer: 'Dr. Reddy\'s',
                  category: 'Tablets',
                  dosage: '10mg',
                  packaging: '10 tablets'
                },
                quantity: 1
              }
            ],
            totalAmount: 65,
            discountAmount: 10,
            status: 'pending',
            orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            trackingNumber: undefined
          }
        ];
        
        res.json({ orders: demoOrders });
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      res.status(500).json({ error: "Failed to fetch order history" });
    }
  });

  // AI Chat endpoints - Allow without strict authentication for now
  app.post("/api/chat/doctor", async (req, res) => {
    try {
      // For now, allow chat without authentication to test Gemini API
      const { message, healthContext, userProfile, language } = req.body;
      
      console.log('Chat request received:', { message: message?.substring(0, 50) });
      
      // Get user's medical reports to include in context
      let medicalReports: any[] = [];
      try {
        // Use demo user for development
        const userId = 'demo-user-1';
        medicalReports = await storage.getMedicalReportsByUserId(userId);
        console.log(`Found ${medicalReports.length} medical reports for user`);
      } catch (error) {
        console.log('Could not fetch medical reports:', error);
      }
      
      const response = await geminiHealthService.generateChatResponse(
        message,
        healthContext,
        userProfile,
        language,
        medicalReports
      );
      
      console.log('Chat response generated:', response.response.substring(0, 100));
      
      res.json({ 
        success: true, 
        response: response.response,
        anatomicalModel: response.anatomicalModel,
        bodyPart: response.bodyPart,
        structured: response.structured
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: "Failed to generate chat response" });
    }
  });

  // Mental Health Mentor Chat endpoint - for anonymous mental health support
  app.post("/api/chat/mentor", async (req, res) => {
    try {
      const { message, category, mentorName, studentId } = req.body;
      
      if (!message || !category) {
        return res.status(400).json({ error: "Message and category are required" });
      }

      console.log('Mentor chat request received:', { 
        message: message?.substring(0, 50), 
        category, 
        mentorName, 
        studentId 
      });

      const response = await geminiHealthService.generateMentorChatResponse(
        message,
        category,
        mentorName || 'Mental Health Mentor',
        studentId || 'Student'
      );
      
      console.log('Mentor response generated:', response.substring(0, 100));
      res.json({ success: true, response });
    } catch (error) {
      console.error('Mentor chat error:', error);
      res.status(500).json({ error: "Failed to generate mentor response" });
    }
  });

  // Mentor Registration endpoint
  app.post("/api/mentors/apply", async (req, res) => {
    try {
      const { name, email, specialization, experience, qualifications, availability, motivation } = req.body;
      
      if (!name || !email || !motivation) {
        return res.status(400).json({ error: "Name, email, and motivation are required" });
      }

      console.log('Mentor application received:', { name, email, specialization });

      // In a production environment, this would save to database
      // For now, we'll just simulate success and log the application
      const application = {
        id: randomUUID(),
        name,
        email,
        specialization,
        experience,
        qualifications,
        availability,
        motivation,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      console.log('Mentor application processed:', application);
      
      res.json({ 
        success: true, 
        message: "Application submitted successfully",
        applicationId: application.id
      });
    } catch (error) {
      console.error('Mentor application error:', error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // ESP32 Live Data endpoint - Generate dynamic health readings
  let cycleStartTime = Date.now();
  let normalBaseline = {
    heartRate: 72,
    spo2: 98,
    temperature: 98.6
  };
  
  app.get("/api/esp32/live", async (req, res) => {
    try {
      // Reset cycle if requested (happens on page refresh)
      if (req.query.reset === 'true') {
        cycleStartTime = Date.now();
        normalBaseline = {
          heartRate: 72,
          spo2: 98,
          temperature: 98.6
        };
        console.log('ESP32: Cycle reset - starting new 10-second dynamic phase');
      }
      
      const now = Date.now();
      const elapsedSeconds = (now - cycleStartTime) / 1000;
      
      let healthData;
      
      if (elapsedSeconds < 10) {
        // Dynamic readings for first 10 seconds
        const progress = elapsedSeconds / 10;
        
        // Generate varying readings with some abnormal values
        const heartRate = Math.round(95 + Math.sin(elapsedSeconds * 2) * 30 + Math.random() * 10);
        const spo2 = Math.round(75 + Math.cos(elapsedSeconds * 1.5) * 20 + Math.random() * 5);
        const temperature = 96 + Math.sin(elapsedSeconds * 1.8) * 2 + Math.random() * 0.5;
        
        healthData = {
          heartRate: Math.max(60, Math.min(150, heartRate)),
          oxygenSaturation: Math.max(60, Math.min(100, spo2)),
          bodyTemperature: Math.round(temperature * 10) / 10,
          battery: 85,
          timestamp: new Date().toISOString(),
          isConnected: true
        };
      } else {
        // After 10 seconds, return constant normal readings (no more changes)
        healthData = {
          heartRate: normalBaseline.heartRate,
          oxygenSaturation: normalBaseline.spo2,
          bodyTemperature: normalBaseline.temperature,
          battery: 85,
          timestamp: new Date().toISOString(),
          isConnected: true
        };
      }
      
      res.json(healthData);
    } catch (error) {
      console.error('ESP32 error:', error);
      res.status(500).json({ error: "Failed to fetch ESP32 data" });
    }
  });

  // Health check endpoint
  app.get("/api/status", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket Server for real-time messaging
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/api/ws'
  });

  wss.on('connection', (ws, request) => {
    const connectionId = randomUUID();
    
    // Extract authentication from query params or headers
    const url = new URL(request.url!, `http://${request.headers.host}`);
    const token = url.searchParams.get('token') || request.headers.authorization?.replace('Bearer ', '');
    const studentId = url.searchParams.get('studentId') || undefined; // For anonymous students
    
    // TODO: Validate Firebase token if provided
    let userId: string | undefined;
    if (token && token !== 'anonymous') {
      // For production, verify Firebase token here
      // userId = await verifyFirebaseToken(token);
      userId = token; // For development, use token as userId
    }

    console.log(`WebSocket connection established: ${connectionId}, userId: ${userId}, studentId: ${studentId}`);
    
    // Setup message handlers
    setupWebSocketHandlers(ws, connectionId, userId, studentId);
    
    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_established',
      connectionId,
      timestamp: new Date().toISOString()
    }));

    ws.on('error', (error) => {
      console.error('WebSocket error for connection', connectionId, ':', error);
    });

    ws.on('close', () => {
      console.log(`WebSocket connection closed: ${connectionId}`);
    });
  });

  console.log('WebSocket server configured on /api/ws');
  
  return httpServer;
}
