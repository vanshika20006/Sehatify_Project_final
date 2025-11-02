import { Router } from 'express';
import { DbStorage } from '../db-storage';
import { z } from 'zod';
import {
  insertInsurancePolicySchema,
  insertPolicyApplicationSchema,
  insertComprehensiveInsuranceClaimSchema,
  insertPremiumQuoteSchema,
  insertEligibilityCheckSchema
} from '@shared/schema';

const router = Router();
const dbStorage = new DbStorage();

// Eligibility check schema
const eligibilityCheckRequestSchema = z.object({
  policyId: z.string(),
  personalInfo: z.object({
    age: z.number().min(1).max(120),
    gender: z.string(),
    occupation: z.string(),
    annualIncome: z.number().optional(),
    location: z.object({
      state: z.string(),
      district: z.string().optional(),
      pincode: z.string().optional()
    })
  }),
  governmentIds: z.object({
    aadhar: z.string().optional(),
    rationCard: z.string().optional(),
    seccId: z.string().optional(),
    pmjayId: z.string().optional(),
    abhaId: z.string().optional()
  }).optional(),
  familyDetails: z.array(z.object({
    relation: z.string(),
    age: z.number(),
    gender: z.string()
  })).optional(),
  medicalInfo: z.object({
    preExistingConditions: z.array(z.string()).optional(),
    currentTreatments: z.array(z.string()).optional(),
    familyMedicalHistory: z.array(z.string()).optional()
  }).optional()
});

// Premium quote request schema
const premiumQuoteRequestSchema = z.object({
  policyId: z.string(),
  age: z.number().min(1).max(120),
  gender: z.string(),
  location: z.object({
    city: z.string(),
    state: z.string(),
    pincode: z.string()
  }),
  familyMembers: z.array(z.object({
    age: z.number(),
    gender: z.string(),
    relation: z.string()
  })),
  sumInsured: z.number(),
  occupation: z.string(),
  smokingStatus: z.boolean(),
  preExistingConditions: z.array(z.string()).optional(),
  addOns: z.array(z.string()).optional()
});

// Claim submission schema
const claimSubmissionSchema = z.object({
  policyId: z.string(),
  applicationId: z.string().optional(),
  claimType: z.enum(['cashless', 'reimbursement', 'emergency']),
  treatmentType: z.enum(['hospitalization', 'outpatient', 'emergency', 'maternity', 'dental', 'other']),
  medicalDetails: z.object({
    diagnosis: z.string(),
    treatmentDescription: z.string(),
    hospitalName: z.string(),
    hospitalId: z.string().optional(),
    doctorName: z.string(),
    admissionDate: z.string().optional(),
    dischargeDate: z.string().optional(),
    isEmergency: z.boolean().default(false),
    estimatedAmount: z.number(),
    finalBillAmount: z.number().optional()
  }),
  supportingDocuments: z.array(z.object({
    type: z.enum(['hospital_bills', 'discharge_summary', 'diagnostic_reports', 'prescription', 'identity_proof', 'other']),
    fileName: z.string(),
    documentId: z.string()
  })).optional()
});

// GET /api/insurance/policies - List all available insurance policies
router.get('/policies', async (req, res) => {
  try {
    const { type, category, state } = req.query;
    
    // Mock data for comprehensive government and private insurance policies
    const mockPolicies = [
      {
        id: 'pmjay-2024',
        name: 'Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
        type: 'government',
        provider: 'National Health Authority',
        sumInsured: 500000,
        premium: 0,
        currency: 'INR',
        coverageType: 'family',
        category: 'health',
        eligibility: {
          incomeRange: { max: 10000 },
          geographicRestrictions: [],
          seccRequired: true,
          aadharRequired: true
        },
        coverage: {
          hospitalization: true,
          outpatient: false,
          maternity: true,
          emergencyAmbulance: true,
          preExistingDiseases: true
        },
        waitingPeriods: {
          initial: 0,
          preExistingDiseases: 0,
          maternity: 9
        },
        networkInfo: {
          totalHospitals: 25000,
          emergencyServices: true
        },
        isActive: true
      },
      {
        id: 'esis-scheme',
        name: 'Employees State Insurance Scheme (ESIS)',
        type: 'government',
        provider: 'Employees State Insurance Corporation',
        sumInsured: 10000,
        premium: 0,
        currency: 'INR',
        coverageType: 'family',
        category: 'health',
        eligibility: {
          incomeRange: { max: 25000 },
          occupationalRestrictions: ['employee'],
          customCriteria: { employment: 'formal_sector' }
        },
        coverage: {
          hospitalization: true,
          outpatient: true,
          maternity: true,
          emergencyAmbulance: true
        },
        waitingPeriods: {
          initial: 0,
          preExistingDiseases: 6,
          maternity: 9
        },
        networkInfo: {
          totalHospitals: 3000,
          emergencyServices: true
        },
        isActive: true
      },
      {
        id: 'hdfc-health-plus',
        name: 'HDFC ERGO Health Plus',
        type: 'private',
        provider: 'HDFC ERGO General Insurance',
        sumInsured: 300000,
        premium: 8500,
        currency: 'INR',
        coverageType: 'individual',
        category: 'health',
        eligibility: {
          minAge: 18,
          maxAge: 65,
          incomeRange: { min: 100000 }
        },
        coverage: {
          hospitalization: true,
          outpatient: false,
          maternity: true,
          dental: false,
          emergencyAmbulance: true,
          healthCheckup: true
        },
        waitingPeriods: {
          initial: 30,
          preExistingDiseases: 24,
          maternity: 9
        },
        networkInfo: {
          totalHospitals: 7000,
          emergencyServices: true
        },
        claimProcess: {
          cashlessAvailable: true,
          reimbursementAvailable: true,
          claimSettlementRatio: 96.5,
          averageSettlementTime: 7
        },
        isActive: true
      },
      {
        id: 'star-health-comprehensive',
        name: 'Star Comprehensive Insurance Policy',
        type: 'private',
        provider: 'Star Health and Allied Insurance',
        sumInsured: 500000,
        premium: 15000,
        currency: 'INR',
        coverageType: 'family_floater',
        category: 'health',
        eligibility: {
          minAge: 18,
          maxAge: 75,
          incomeRange: { min: 150000 }
        },
        coverage: {
          hospitalization: true,
          outpatient: true,
          maternity: true,
          dental: true,
          mentalHealth: true,
          emergencyAmbulance: true,
          healthCheckup: true
        },
        waitingPeriods: {
          initial: 30,
          preExistingDiseases: 24,
          maternity: 36
        },
        networkInfo: {
          totalHospitals: 9500,
          emergencyServices: true
        },
        claimProcess: {
          cashlessAvailable: true,
          reimbursementAvailable: true,
          claimSettlementRatio: 98.2,
          averageSettlementTime: 5
        },
        isActive: true
      }
    ];

    let filteredPolicies = mockPolicies;

    // Apply filters
    if (type) {
      filteredPolicies = filteredPolicies.filter(policy => policy.type === type);
    }
    
    if (category) {
      filteredPolicies = filteredPolicies.filter(policy => policy.category === category);
    }

    res.json({
      success: true,
      data: filteredPolicies,
      total: filteredPolicies.length,
      filters: { type, category, state }
    });
  } catch (error) {
    console.error('Error fetching insurance policies:', error);
    res.status(500).json({ error: 'Failed to fetch insurance policies' });
  }
});

// GET /api/insurance/policies/:id - Get specific policy details
router.get('/policies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock detailed policy data (in real implementation, fetch from database)
    const mockPolicyDetails = {
      id: id,
      name: id === 'pmjay-2024' ? 'Pradhan Mantri Jan Arogya Yojana (PM-JAY)' : 'HDFC ERGO Health Plus',
      type: id === 'pmjay-2024' ? 'government' : 'private',
      provider: id === 'pmjay-2024' ? 'National Health Authority' : 'HDFC ERGO General Insurance',
      sumInsured: id === 'pmjay-2024' ? 500000 : 300000,
      premium: id === 'pmjay-2024' ? 0 : 8500,
      eligibility: {
        criteria: id === 'pmjay-2024' 
          ? ['Must be listed in SECC database', 'Family income below ₹10,000/month', 'Must have Aadhaar card']
          : ['Age between 18-65 years', 'Annual income above ₹1,00,000', 'Medical examination required'],
        documents: ['Aadhaar Card', 'Income Proof', 'Address Proof', 'Medical Reports (if applicable)']
      },
      coverage: {
        hospitalization: { covered: true, limit: 'Full sum insured' },
        outpatient: { covered: id !== 'pmjay-2024', limit: id !== 'pmjay-2024' ? '₹10,000/year' : 'Not covered' },
        maternity: { covered: true, limit: '₹50,000', waitingPeriod: '9 months' },
        emergencyAmbulance: { covered: true, limit: '₹2,000 per incident' }
      },
      exclusions: [
        'Pre-existing diseases (waiting period applies)',
        'Cosmetic surgery',
        'Self-inflicted injuries',
        'War and nuclear risks',
        'Experimental treatments'
      ],
      claimProcess: {
        cashless: {
          available: true,
          process: ['Visit network hospital', 'Show insurance card', 'Get pre-authorization', 'Receive treatment'],
          documents: ['Insurance card', 'ID proof', 'Medical reports']
        },
        reimbursement: {
          available: true,
          process: ['Get treatment', 'Submit claim form with bills', 'Wait for processing', 'Receive settlement'],
          documents: ['Claim form', 'Original bills', 'Discharge summary', 'ID proof']
        }
      },
      networkHospitals: {
        total: id === 'pmjay-2024' ? 25000 : 7000,
        nearbyCount: 45,
        searchUrl: `/api/insurance/network-hospitals?policyId=${id}`
      }
    };

    res.json({
      success: true,
      data: mockPolicyDetails
    });
  } catch (error) {
    console.error('Error fetching policy details:', error);
    res.status(500).json({ error: 'Failed to fetch policy details' });
  }
});

// POST /api/insurance/eligibility - Check eligibility for a policy
router.post('/eligibility', async (req, res) => {
  try {
    const validationResult = eligibilityCheckRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid eligibility check data', 
        details: validationResult.error.issues 
      });
    }
    
    const checkData = validationResult.data;
    
    // Get demo user
    const demoUser = await dbStorage.getUserByEmail('demo@sehatify.com');
    if (!demoUser) {
      return res.status(400).json({ error: 'Demo user not found' });
    }

    // Mock eligibility logic (in real implementation, use actual eligibility rules)
    const eligibilityResult = {
      isEligible: true,
      eligibilityScore: 85,
      criteriaResults: [
        { criterion: 'Age requirement', passed: true, details: 'Age 30 meets requirement (18-65)' },
        { criterion: 'Income requirement', passed: true, details: 'Income meets policy criteria' },
        { criterion: 'Geographic location', passed: true, details: 'Available in your location' },
        { criterion: 'Medical history', passed: true, details: 'No disqualifying conditions found' }
      ],
      recommendations: [
        'Consider adding family members for better coverage',
        'Review optional add-ons for enhanced protection'
      ],
      nextSteps: [
        'Submit required documents',
        'Complete medical examination if required',
        'Review and accept terms and conditions'
      ]
    };

    // Save eligibility check to database (placeholder - would use actual storage)
    const eligibilityCheck = {
      id: `eli_${Date.now()}`,
      userId: demoUser.id,
      policyId: checkData.policyId,
      checkInputs: checkData,
      eligibilityResult,
      verificationStatus: 'verified' as const,
      checkedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    res.json({
      success: true,
      data: eligibilityCheck
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

// POST /api/insurance/quotes - Generate premium quote
router.post('/quotes', async (req, res) => {
  try {
    const validationResult = premiumQuoteRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid quote request data', 
        details: validationResult.error.issues 
      });
    }
    
    const quoteData = validationResult.data;
    
    // Mock premium calculation (in real implementation, use actual pricing engine)
    const basePremium = quoteData.sumInsured * 0.02; // 2% of sum insured
    const ageLoading = quoteData.age > 45 ? basePremium * 0.1 : 0;
    const smokingLoading = quoteData.smokingStatus ? basePremium * 0.15 : 0;
    const familyDiscount = quoteData.familyMembers.length > 2 ? basePremium * 0.05 : 0;
    const gst = (basePremium + ageLoading + smokingLoading - familyDiscount) * 0.18;
    
    const premiumBreakdown = {
      basePremium: Math.round(basePremium),
      ageLoading: Math.round(ageLoading),
      locationLoading: 0,
      occupationLoading: 0,
      smokingLoading: Math.round(smokingLoading),
      addOnPremiums: 0,
      familyDiscount: Math.round(familyDiscount),
      onlineDiscount: Math.round(basePremium * 0.02),
      gst: Math.round(gst),
      totalPremium: Math.round(basePremium + ageLoading + smokingLoading - familyDiscount + gst)
    };

    const quote = {
      id: `quote_${Date.now()}`,
      userId: null, // Anonymous quote
      policyId: quoteData.policyId,
      quoteInputs: quoteData,
      premiumBreakdown,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      termsAndConditions: 'Standard terms and conditions apply. Premium calculation is indicative and subject to underwriting.',
      quoteReference: `QT${Date.now()}`,
      createdAt: new Date()
    };

    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Error generating quote:', error);
    res.status(500).json({ error: 'Failed to generate quote' });
  }
});

// POST /api/insurance/applications - Submit policy application
router.post('/applications', async (req, res) => {
  try {
    // Get demo user
    const demoUser = await dbStorage.getUserByEmail('demo@sehatify.com');
    if (!demoUser) {
      return res.status(400).json({ error: 'Demo user not found' });
    }

    const applicationData = {
      id: `app_${Date.now()}`,
      userId: demoUser.id,
      policyId: req.body.policyId,
      applicationType: 'new' as const,
      applicationData: req.body,
      status: 'submitted' as const,
      submittedAt: new Date()
    };

    res.json({
      success: true,
      data: applicationData,
      message: 'Application submitted successfully. You will receive updates on your application status.'
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// GET /api/insurance/applications - Get user applications
router.get('/applications', async (req, res) => {
  try {
    // Get demo user
    const demoUser = await dbStorage.getUserByEmail('demo@sehatify.com');
    if (!demoUser) {
      return res.status(400).json({ error: 'Demo user not found' });
    }

    // Mock applications data
    const mockApplications = [
      {
        id: 'app_1',
        policyId: 'pmjay-2024',
        policyName: 'PM-JAY Health Insurance',
        applicationType: 'new',
        status: 'approved',
        submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        policyDetails: {
          policyNumber: 'PMJAY2024001',
          effectiveDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 345 * 24 * 60 * 60 * 1000)
        }
      }
    ];

    res.json({
      success: true,
      data: mockApplications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// POST /api/insurance/claims - Submit insurance claim
router.post('/claims', async (req, res) => {
  try {
    const validationResult = claimSubmissionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid claim data', 
        details: validationResult.error.issues 
      });
    }
    
    const claimData = validationResult.data;
    
    // Get demo user
    const demoUser = await dbStorage.getUserByEmail('demo@sehatify.com');
    if (!demoUser) {
      return res.status(400).json({ error: 'Demo user not found' });
    }

    const claim = {
      id: `claim_${Date.now()}`,
      userId: demoUser.id,
      policyId: claimData.policyId,
      applicationId: claimData.applicationId,
      claimType: claimData.claimType,
      treatmentType: claimData.treatmentType,
      medicalDetails: claimData.medicalDetails,
      supportingDocuments: claimData.supportingDocuments || [],
      claimStatus: 'initiated' as const,
      claimNumber: `CLM${Date.now()}`,
      submittedAt: new Date()
    };

    res.json({
      success: true,
      data: claim,
      message: 'Claim submitted successfully. You will receive updates on claim processing.'
    });
  } catch (error) {
    console.error('Error submitting claim:', error);
    res.status(500).json({ error: 'Failed to submit claim' });
  }
});

// GET /api/insurance/claims - Get user claims
router.get('/claims', async (req, res) => {
  try {
    // Get demo user
    const demoUser = await dbStorage.getUserByEmail('demo@sehatify.com');
    if (!demoUser) {
      return res.status(400).json({ error: 'Demo user not found' });
    }

    // Mock claims data
    const mockClaims = [
      {
        id: 'claim_1',
        policyId: 'pmjay-2024',
        claimNumber: 'CLM2024001',
        claimType: 'cashless',
        treatmentType: 'hospitalization',
        medicalDetails: {
          diagnosis: 'Appendectomy',
          hospitalName: 'City General Hospital',
          doctorName: 'Dr. Sarah Johnson',
          estimatedAmount: 25000,
          approvedAmount: 23000
        },
        claimStatus: 'approved',
        submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        settlementDetails: {
          approvedAmount: 23000,
          settlementDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      }
    ];

    res.json({
      success: true,
      data: mockClaims
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// GET /api/insurance/network-hospitals - Get network hospitals for a policy
router.get('/network-hospitals', async (req, res) => {
  try {
    const { policyId, city, state, speciality } = req.query;
    
    // Mock network hospitals data
    const mockNetworkHospitals = [
      {
        id: 'hosp_1',
        policyId: policyId || 'pmjay-2024',
        hospitalInfo: {
          name: 'Apollo Hospitals',
          type: 'private',
          address: {
            street: 'Greams Lane',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600006'
          },
          contact: {
            phone: '+91-44-2829-3333',
            email: 'info@apollohospitals.com'
          }
        },
        services: {
          specializations: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology'],
          emergencyServices: true,
          iCUAvailable: true,
          bedCapacity: 500
        },
        networkDetails: {
          cashlessAvailable: true,
          preAuthRequired: true,
          claimApprovalRate: 96,
          patientSatisfactionRating: 4.5
        },
        isActive: true
      },
      {
        id: 'hosp_2',
        policyId: policyId || 'pmjay-2024',
        hospitalInfo: {
          name: 'Fortis Healthcare',
          type: 'private',
          address: {
            street: 'Sector 62',
            city: 'Noida',
            state: 'Uttar Pradesh',
            pincode: '201301'
          },
          contact: {
            phone: '+91-120-500-2424',
            email: 'contact@fortishealthcare.com'
          }
        },
        services: {
          specializations: ['Cardiology', 'Gastroenterology', 'Nephrology', 'Pediatrics'],
          emergencyServices: true,
          iCUAvailable: true,
          bedCapacity: 300
        },
        networkDetails: {
          cashlessAvailable: true,
          preAuthRequired: true,
          claimApprovalRate: 94,
          patientSatisfactionRating: 4.3
        },
        isActive: true
      }
    ];

    let filteredHospitals = mockNetworkHospitals;

    // Apply filters
    if (city) {
      filteredHospitals = filteredHospitals.filter(hospital => 
        hospital.hospitalInfo.address.city.toLowerCase().includes((city as string).toLowerCase())
      );
    }

    if (state) {
      filteredHospitals = filteredHospitals.filter(hospital => 
        hospital.hospitalInfo.address.state.toLowerCase().includes((state as string).toLowerCase())
      );
    }

    if (speciality) {
      filteredHospitals = filteredHospitals.filter(hospital => 
        hospital.services.specializations.some(spec => 
          spec.toLowerCase().includes((speciality as string).toLowerCase())
        )
      );
    }

    res.json({
      success: true,
      data: filteredHospitals,
      total: filteredHospitals.length,
      filters: { policyId, city, state, speciality }
    });
  } catch (error) {
    console.error('Error fetching network hospitals:', error);
    res.status(500).json({ error: 'Failed to fetch network hospitals' });
  }
});

export default router;