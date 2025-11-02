import { type Request, Response } from "express";
import { z } from "zod";

// Disease surveillance schemas
const diseaseReportSchema = z.object({
  disease: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  symptoms: z.array(z.string()),
  source: z.enum(['hospital', 'lab', 'user_report', 'official']),
  confidence: z.number().min(0).max(1).optional().default(0.8),
  reportedBy: z.string().optional(),
  description: z.string().optional(),
});

const diseaseQuerySchema = z.object({
  diseases: z.string().optional(), // comma-separated disease IDs
  bounds: z.string().optional(), // "lat1,lng1,lat2,lng2"
  timeRange: z.enum(['last_24h', 'last_7_days', 'last_30_days', 'last_3_months']).optional(),
  minSeverity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  sources: z.string().optional(), // comma-separated source types
});

// Mock data - replace with database operations
const mockDiseaseData = [
  {
    id: 'covid19-delhi',
    disease: 'covid19',
    name: 'COVID-19',
    latitude: 28.6139,
    longitude: 77.2090,
    cases: 1247,
    incidenceRate: 12.5,
    change7d: -8.2,
    severity: 'medium' as const,
    color: '#dc2626',
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    area: 'New Delhi',
    population: 100000,
    sources: [
      { type: 'hospital' as const, confidence: 0.95, count: 890 },
      { type: 'lab' as const, confidence: 0.98, count: 290 },
      { type: 'official' as const, confidence: 1.0, count: 67 }
    ],
    symptoms: ['Fever', 'Cough', 'Fatigue', 'Body aches'],
    timeline: [
      { date: '2025-09-15', cases: 1180 },
      { date: '2025-09-16', cases: 1195 },
      { date: '2025-09-17', cases: 1230 },
      { date: '2025-09-18', cases: 1247 }
    ]
  },
  {
    id: 'dengue-mumbai',
    disease: 'dengue',
    name: 'Dengue Fever',
    latitude: 19.0760,
    longitude: 72.8777,
    cases: 823,
    incidenceRate: 8.3,
    change7d: 15.4,
    severity: 'high' as const,
    color: '#f59e0b',
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    area: 'Mumbai',
    population: 120000,
    sources: [
      { type: 'hospital' as const, confidence: 0.92, count: 620 },
      { type: 'lab' as const, confidence: 0.96, count: 180 },
      { type: 'user_report' as const, confidence: 0.75, count: 23 }
    ],
    symptoms: ['High fever', 'Severe headache', 'Joint pain', 'Rash'],
    timeline: [
      { date: '2025-09-15', cases: 710 },
      { date: '2025-09-16', cases: 745 },
      { date: '2025-09-17', cases: 785 },
      { date: '2025-09-18', cases: 823 }
    ]
  },
  {
    id: 'malaria-bangalore',
    disease: 'malaria',
    name: 'Malaria',
    latitude: 12.9716,
    longitude: 77.5946,
    cases: 456,
    incidenceRate: 4.6,
    change7d: -2.1,
    severity: 'medium' as const,
    color: '#059669',
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    area: 'Bangalore',
    population: 95000,
    sources: [
      { type: 'hospital' as const, confidence: 0.90, count: 340 },
      { type: 'lab' as const, confidence: 0.94, count: 116 }
    ],
    symptoms: ['Fever', 'Chills', 'Sweats', 'Headache'],
    timeline: [
      { date: '2025-09-15', cases: 465 },
      { date: '2025-09-16', cases: 460 },
      { date: '2025-09-17', cases: 458 },
      { date: '2025-09-18', cases: 456 }
    ]
  },
  {
    id: 'typhoid-chennai',
    disease: 'typhoid',
    name: 'Typhoid Fever',
    latitude: 13.0827,
    longitude: 80.2707,
    cases: 234,
    incidenceRate: 2.8,
    change7d: 12.3,
    severity: 'high' as const,
    color: '#7c3aed',
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    area: 'Chennai',
    population: 85000,
    sources: [
      { type: 'hospital' as const, confidence: 0.88, count: 180 },
      { type: 'lab' as const, confidence: 0.92, count: 54 }
    ],
    symptoms: ['Prolonged fever', 'Headache', 'Nausea', 'Abdominal pain'],
    timeline: [
      { date: '2025-09-15', cases: 210 },
      { date: '2025-09-16', cases: 218 },
      { date: '2025-09-17', cases: 226 },
      { date: '2025-09-18', cases: 234 }
    ]
  },
  {
    id: 'chikungunya-hyderabad',
    disease: 'chikungunya',
    name: 'Chikungunya',
    latitude: 17.3850,
    longitude: 78.4867,
    cases: 189,
    incidenceRate: 1.9,
    change7d: 8.7,
    severity: 'medium' as const,
    color: '#e11d48',
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    area: 'Hyderabad',
    population: 78000,
    sources: [
      { type: 'hospital' as const, confidence: 0.85, count: 145 },
      { type: 'user_report' as const, confidence: 0.70, count: 44 }
    ],
    symptoms: ['Joint pain', 'Muscle pain', 'Fever', 'Swelling'],
    timeline: [
      { date: '2025-09-15', cases: 175 },
      { date: '2025-09-16', cases: 180 },
      { date: '2025-09-17', cases: 184 },
      { date: '2025-09-18', cases: 189 }
    ]
  },
  {
    id: 'covid19-pune',
    disease: 'covid19',
    name: 'COVID-19',
    latitude: 18.5204,
    longitude: 73.8567,
    cases: 678,
    incidenceRate: 7.8,
    change7d: -5.4,
    severity: 'medium' as const,
    color: '#dc2626',
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    area: 'Pune',
    population: 87000,
    sources: [
      { type: 'hospital' as const, confidence: 0.93, count: 520 },
      { type: 'lab' as const, confidence: 0.97, count: 158 }
    ],
    symptoms: ['Fever', 'Cough', 'Fatigue', 'Loss of taste'],
    timeline: [
      { date: '2025-09-15', cases: 715 },
      { date: '2025-09-16', cases: 698 },
      { date: '2025-09-17', cases: 685 },
      { date: '2025-09-18', cases: 678 }
    ]
  },
  {
    id: 'dengue-jaipur',
    disease: 'dengue',
    name: 'Dengue Fever',
    latitude: 26.9124,
    longitude: 75.7873,
    cases: 345,
    incidenceRate: 4.2,
    change7d: 18.5,
    severity: 'critical' as const,
    color: '#f59e0b',
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    area: 'Jaipur',
    population: 82000,
    sources: [
      { type: 'hospital' as const, confidence: 0.91, count: 268 },
      { type: 'official' as const, confidence: 1.0, count: 77 }
    ],
    symptoms: ['High fever', 'Severe headache', 'Eye pain', 'Joint pain'],
    timeline: [
      { date: '2025-09-15', cases: 290 },
      { date: '2025-09-16', cases: 308 },
      { date: '2025-09-17', cases: 325 },
      { date: '2025-09-18', cases: 345 }
    ]
  }
];

const mockHotspots = [
  {
    id: 'hotspot-1',
    latitude: 28.6500,
    longitude: 77.2300,
    radius: 2000, // meters
    cases: 145,
    severity: 'high',
    diseases: ['covid19', 'dengue'],
    detectedAt: new Date().toISOString(),
    riskScore: 0.85
  },
  {
    id: 'hotspot-2',
    latitude: 19.1000,
    longitude: 72.9000,
    radius: 1500,
    cases: 89,
    severity: 'medium',
    diseases: ['dengue'],
    detectedAt: new Date().toISOString(),
    riskScore: 0.72
  }
];

// Get disease surveillance data
export async function getDiseaseData(req: Request, res: Response) {
  try {
    const query = diseaseQuerySchema.parse(req.query);
    
    let filteredData = [...mockDiseaseData];

    // Filter by diseases
    if (query.diseases) {
      const diseaseIds = query.diseases.split(',');
      filteredData = filteredData.filter(d => diseaseIds.includes(d.disease));
    }

    // Filter by bounds (geographic bounding box)
    if (query.bounds) {
      const [lat1, lng1, lat2, lng2] = query.bounds.split(',').map(Number);
      filteredData = filteredData.filter(d => 
        d.latitude >= lat1 && d.latitude <= lat2 &&
        d.longitude >= lng1 && d.longitude <= lng2
      );
    }

    // Filter by severity
    if (query.minSeverity) {
      const severityLevels = { low: 0, medium: 1, high: 2, critical: 3 };
      const minLevel = severityLevels[query.minSeverity];
      filteredData = filteredData.filter(d => severityLevels[d.severity] >= minLevel);
    }

    // Calculate summary statistics
    const totalCases = filteredData.reduce((sum, d) => sum + d.cases, 0);
    const newToday = Math.floor(totalCases * 0.02); // Mock calculation
    const activeHotspots = mockHotspots.length;
    
    res.json({
      data: filteredData,
      summary: {
        totalCases,
        newToday,
        activeHotspots,
        lastUpdated: new Date().toISOString()
      },
      hotspots: mockHotspots
    });
  } catch (error) {
    console.error('Error fetching disease data:', error);
    res.status(400).json({ error: 'Invalid query parameters' });
  }
}

// Get disease details by ID
export async function getDiseaseDetails(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const disease = mockDiseaseData.find(d => d.id === id);
    
    if (!disease) {
      return res.status(404).json({ error: 'Disease data not found' });
    }

    // Add additional details
    const detailedDisease = {
      ...disease,
      nearbyHospitals: [
        { id: 'h1', name: 'City General Hospital', distance: '2.1 km', speciality: 'Infectious Diseases' },
        { id: 'h2', name: 'Metro Medical Center', distance: '3.4 km', speciality: 'Internal Medicine' }
      ],
      guidelines: [
        'Seek immediate medical attention if symptoms worsen',
        'Maintain isolation until cleared by healthcare provider',
        'Follow prescribed medication schedule',
        'Monitor temperature twice daily'
      ],
      preventionTips: [
        'Wash hands frequently with soap and water',
        'Wear mask in crowded places',
        'Maintain social distancing',
        'Get vaccinated if available'
      ]
    };

    res.json(detailedDisease);
  } catch (error) {
    console.error('Error fetching disease details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Report a new case
export async function reportDiseaseCase(req: Request, res: Response) {
  try {
    const reportData = diseaseReportSchema.parse(req.body);
    
    // In a real implementation, save to database
    const newReport = {
      id: `report-${Date.now()}`,
      ...reportData,
      reportedAt: new Date().toISOString(),
      status: 'pending_verification',
      userId: (req as any).user?.uid || 'anonymous'
    };

    // Mock response
    res.status(201).json({
      message: 'Disease case reported successfully',
      reportId: newReport.id,
      status: 'submitted'
    });
  } catch (error) {
    console.error('Error reporting disease case:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid report data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Search diseases and locations
export async function searchDiseases(req: Request, res: Response) {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const query = q.toLowerCase();
    
    // Search in disease names, symptoms, and locations
    const diseaseResults = mockDiseaseData.filter(d => 
      d.name.toLowerCase().includes(query) ||
      d.area.toLowerCase().includes(query) ||
      d.symptoms.some(symptom => symptom.toLowerCase().includes(query))
    );

    // Mock location search results
    const locationResults = [
      { type: 'city', name: 'New Delhi', latitude: 28.6139, longitude: 77.2090 },
      { type: 'city', name: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
      { type: 'city', name: 'Bangalore', latitude: 12.9716, longitude: 77.5946 }
    ].filter(loc => loc.name.toLowerCase().includes(query));

    res.json({
      diseases: diseaseResults.map(d => ({
        id: d.id,
        name: d.name,
        area: d.area,
        cases: d.cases,
        severity: d.severity
      })),
      locations: locationResults,
      total: diseaseResults.length + locationResults.length
    });
  } catch (error) {
    console.error('Error searching diseases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get alert configuration
export async function getAlertSettings(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.uid;
    
    // Mock alert settings
    const settings = {
      userId,
      newHotspotAlerts: true,
      caseIncreaseAlerts: true,
      riskLevelChangeAlerts: false,
      diseases: ['covid19', 'dengue'],
      locations: [
        { latitude: 28.6139, longitude: 77.2090, radius: 5000, name: 'New Delhi' }
      ]
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching alert settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update alert configuration
export async function updateAlertSettings(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.uid;
    const settings = req.body;
    
    // In a real implementation, save to database
    // mockAlertSettings[userId] = settings;
    
    res.json({
      message: 'Alert settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating alert settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}