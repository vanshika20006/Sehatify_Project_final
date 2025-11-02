import { GoogleGenerativeAI } from "@google/genai";

import * as fs from 'fs';
import * as path from 'path';

// Import PDF parsing library
import pdfParse from 'pdf-parse';

interface VitalSigns {
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  timestamp: Date;
}

interface HealthAnalysisResult {
  analysis: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  anomalies?: string[];
  confidence: number;
}

export class GeminiHealthService {
  private genAI: GoogleGenAI | null;
  private cache: Map<string, HealthAnalysisResult> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable not found. AI analysis will use fallback responses.');
      this.genAI = null;
      return;
    }
    
    this.genAI = new GoogleGenAI({ apiKey });
  }

  private getCacheKey(vitals: VitalSigns, userAge: number, userGender: string): string {
    // Create cache key based on rounded vitals (for similar readings)
    const roundedVitals = {
      heartRate: Math.round(vitals.heartRate / 5) * 5, // Round to nearest 5
      bloodPressureSystolic: Math.round(vitals.bloodPressureSystolic / 5) * 5,
      bloodPressureDiastolic: Math.round(vitals.bloodPressureDiastolic / 5) * 5,
      oxygenSaturation: Math.round(vitals.oxygenSaturation),
      bodyTemperature: Math.round(vitals.bodyTemperature * 2) / 2 // Round to nearest 0.5
    };
    return `${JSON.stringify(roundedVitals)}-${userAge}-${userGender}`;
  }

  async analyzeVitalSigns(
    vitals: VitalSigns, 
    userAge: number, 
    userGender: string,
    medicalHistory?: string
  ): Promise<HealthAnalysisResult> {
    // Check cache first for fast response
    const cacheKey = this.getCacheKey(vitals, userAge, userGender);
    if (this.cache.has(cacheKey)) {
      console.log('Returning cached health analysis');
      return this.cache.get(cacheKey)!;
    }

    if (!this.genAI) {
      const fallback = this.getFallbackAnalysis(vitals);
      this.cache.set(cacheKey, fallback);
      return fallback;
    }
    const prompt = `As a medical AI assistant, analyze the following vital signs for a ${userAge}-year-old ${userGender}:

Vital Signs:
- Heart Rate: ${vitals.heartRate} BPM
- Blood Pressure: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg
- Oxygen Saturation: ${vitals.oxygenSaturation}%
- Body Temperature: ${vitals.bodyTemperature}°F
- Timestamp: ${vitals.timestamp.toISOString()}

${medicalHistory ? `Medical History: ${medicalHistory}` : ''}

Please provide a comprehensive analysis including:
1. Overall health assessment
2. Risk level (low/medium/high/critical)
3. Specific recommendations for the patient
4. Any anomalies or concerning patterns detected
5. Confidence level in the analysis (0-1)

Respond in JSON format with keys: analysis, riskLevel, recommendations (array), anomalies (array), confidence.

Focus on:
- Normal ranges for the patient's age and gender
- Immediate risks that require medical attention
- Preventive measures and lifestyle recommendations
- Clear explanations that a patient can understand`;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
      });
      const text = response.text || '';

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        const result = {
          analysis: analysis.analysis || 'Health analysis completed',
          riskLevel: analysis.riskLevel || 'low',
          recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
          anomalies: Array.isArray(analysis.anomalies) ? analysis.anomalies : [],
          confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.8
        };
        
        // Cache the result for faster future responses
        this.cache.set(cacheKey, result);
        console.log('Cached new health analysis result');
        
        return result;
      }

      throw new Error('Invalid response format from Gemini');
    } catch (error) {
      console.error('Error analyzing vital signs with Gemini:', error);
      // Return cached fallback and store it
      const fallback = this.getFallbackAnalysis(vitals);
      this.cache.set(cacheKey, fallback);
      return fallback;
    }
  }

  async generateChatResponse(
    message: string, 
    healthContext?: VitalSigns,
    userProfile?: { age: number; gender: string; medicalHistory?: string },
    language?: string,
    medicalReports?: any[]
  ): Promise<{ response: string; anatomicalModel?: string; bodyPart?: string; structured?: any }> {
    if (!this.genAI) {
      const anatomicalModel = this.detectAnatomicalModel(message);
      const bodyPart = this.detectBodyPart(message);
      
      const fallbackStructured = {
        summary: "AI service is currently unavailable. For health concerns, please consult with your healthcare provider.",
        dietPlan: {
          breakfast: ["Consult with a nutritionist for personalized recommendations"],
          lunch: ["Contact your healthcare provider for dietary guidance"],
          dinner: ["Seek professional medical advice for meal planning"],
          snacks: ["Professional guidance recommended"],
          hydration: ["Drink adequate water throughout the day"],
          avoid: ["Please consult medical professionals for dietary restrictions"]
        },
        exercisePlan: {
          cardio: ["Consult with a healthcare provider before starting any exercise program"],
          strength: ["Professional guidance recommended"],
          flexibility: ["Seek medical clearance for exercise routines"],
          frequency: "Please consult your healthcare provider"
        },
        youtubeVideos: [
          {"title": "General Health Tips", "channel": "Health Education", "searchTerm": "general health tips"},
          {"title": "Healthcare Guidance", "channel": "Medical Advice", "searchTerm": "when to see a doctor"}
        ],
        lifestyleChanges: ["Consult with healthcare professionals for personalized advice"],
        response: this.getFallbackChatResponse(message)
      };
      
      return { 
        response: fallbackStructured.response,
        anatomicalModel,
        bodyPart,
        structured: fallbackStructured
      };
    }
    const getLanguageInstruction = (lang: string) => {
      const languageInstructions = {
        'hi': 'Respond in Hindi (हिंदी). Use simple, clear Hindi language.',
        'es': 'Respond in Spanish (Español). Use clear, accessible Spanish.',
        'fr': 'Respond in French (Français). Use clear, accessible French.',
        'en': 'Respond in English.'
      };
      return languageInstructions[lang as keyof typeof languageInstructions] || languageInstructions['en'];
    };

    const systemPrompt = `You are Dr. AI, a compassionate virtual health assistant developed by Sehatify. You provide helpful, accurate health information while being empathetic and clear. 

IMPORTANT: Always structure your response in this exact JSON format:
{
  "summary": "Brief overview of the health concern and your assessment",
  "dietPlan": {
    "breakfast": ["specific breakfast recommendations"],
    "lunch": ["specific lunch recommendations"], 
    "dinner": ["specific dinner recommendations"],
    "snacks": ["healthy snack options"],
    "hydration": ["water intake and hydration tips"],
    "avoid": ["foods to avoid for this condition"]
  },
  "exercisePlan": {
    "cardio": ["specific cardio exercises with duration"],
    "strength": ["strength training recommendations"],
    "flexibility": ["stretching and mobility exercises"],
    "frequency": "recommended weekly schedule"
  },
  "youtubeVideos": [
    {"title": "Video Title", "channel": "Channel Name", "searchTerm": "exact search term"},
    {"title": "Another Video", "channel": "Channel Name", "searchTerm": "search term"}
  ],
  "lifestyleChanges": ["specific lifestyle modification recommendations"],
  "response": "Your complete conversational response that includes all the above information in a natural, empathetic way"
}

Your responses should be comprehensive and include:
🏃‍♂️ **EXERCISE PLANS**: Provide specific, structured workout routines
🥗 **DIET RECOMMENDATIONS**: Include detailed nutritional guidance  
📹 **YOUTUBE VIDEO SUGGESTIONS**: Recommend specific channels and videos
💪 **MOTIVATIONAL CONTENT**: Include encouraging and supportive advice

Important guidelines:
- Always recommend consulting healthcare professionals for serious concerns
- Provide practical, actionable advice when appropriate
- Be supportive and understanding
- Include specific, measurable recommendations
- Add motivational and encouraging language
- Explain medical terms in simple language
- ${getLanguageInstruction(language || 'en')}`;

    const contextInfo = healthContext ? 
      `Current vital signs context:
      - Heart Rate: ${healthContext.heartRate} BPM
      - Blood Pressure: ${healthContext.bloodPressureSystolic}/${healthContext.bloodPressureDiastolic} mmHg
      - Oxygen Saturation: ${healthContext.oxygenSaturation}%
      - Body Temperature: ${healthContext.bodyTemperature}°F` : '';

    const userInfo = userProfile ?
      `User profile: ${userProfile.age}-year-old ${userProfile.gender}${userProfile.medicalHistory ? `, Medical history: ${userProfile.medicalHistory}` : ''}` : '';

    // Include uploaded medical reports in context
    const medicalReportsContext = medicalReports && medicalReports.length > 0 ? `
📋 **UPLOADED MEDICAL REPORTS** (${medicalReports.length} report(s) available):
${medicalReports.map((report, index) => `
${index + 1}. **${report.originalFileName}** (uploaded ${new Date(report.uploadedAt).toLocaleDateString()})
   - Type: ${report.reportType}
   - Analysis Available: ${report.isAnalyzed ? 'Yes' : 'No'}
   ${report.analysis ? `- Summary: ${report.analysis.summary || 'Analysis completed'}
   - Key Findings: ${Array.isArray(report.analysis.keyFindings) ? report.analysis.keyFindings.join(', ') : 'None specified'}
   - Recommendations: ${Array.isArray(report.analysis.recommendations) ? report.analysis.recommendations.join(', ') : 'None specified'}` : ''}
`).join('')}

You can reference these reports when answering questions about the user's health.` : '';

    const prompt = `${systemPrompt}

${userInfo}
${contextInfo}
${medicalReportsContext}

User question: ${message}

Provide a helpful, empathetic response as Dr. AI. Keep your response conversational but informative.`;

    try {
      // ALWAYS detect anatomical model and body part first (regardless of API success)
      const anatomicalModel = this.detectAnatomicalModel(message);
      const bodyPart = this.detectBodyPart(message);
      console.log(`Detected anatomicalModel: ${anatomicalModel}, bodyPart: ${bodyPart} for message: "${message.substring(0, 50)}..."`);
      
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
      });
      const responseText = response.text || "I'm having trouble processing your request right now.";
      
      // Try to parse structured JSON response from Gemini
      let structuredResponse = null;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structuredResponse = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed structured response from Gemini');
        }
      } catch (parseError) {
        console.log('Could not parse structured response from Gemini:', parseError);
      }
      
      return {
        response: structuredResponse?.response || responseText,
        anatomicalModel,
        bodyPart,
        structured: structuredResponse
      };
    } catch (error) {
      console.error('Error generating chat response:', error);
      
      // Provide comprehensive fallback response
      const anatomicalModel = this.detectAnatomicalModel(message);
      const bodyPart = this.detectBodyPart(message);
      
      const fallbackStructured = {
        summary: "I'm currently experiencing technical difficulties. For immediate health concerns, please contact your healthcare provider.",
        dietPlan: {
          breakfast: ["Consult with a nutritionist for personalized recommendations"],
          lunch: ["Contact your healthcare provider for dietary guidance"],
          dinner: ["Seek professional medical advice for meal planning"],
          snacks: ["Professional guidance recommended"],
          hydration: ["Drink adequate water throughout the day"],
          avoid: ["Please consult medical professionals for dietary restrictions"]
        },
        exercisePlan: {
          cardio: ["Consult with a healthcare provider before starting any exercise program"],
          strength: ["Professional guidance recommended"],
          flexibility: ["Seek medical clearance for exercise routines"],
          frequency: "Please consult your healthcare provider"
        },
        youtubeVideos: [
          {"title": "General Health Tips", "channel": "Health Education", "searchTerm": "general health tips"}
        ],
        lifestyleChanges: ["Consult with healthcare professionals for personalized advice"],
        response: "I'm currently experiencing technical difficulties. For immediate health concerns, please contact your healthcare provider or emergency services."
      };
      
      return {
        response: fallbackStructured.response,
        anatomicalModel,
        bodyPart,
        structured: fallbackStructured
      };
    }
  }

  async generateHealthReport(
    vitals: VitalSigns[],
    userProfile: { age: number; gender: string; name: string; medicalHistory?: string },
    reportType: 'weekly' | 'monthly' | 'custom'
  ): Promise<{
    summary: string;
    recommendations: string[];
    riskFactors: string[];
    improvements: string[];
  }> {
    if (!this.genAI) {
      return this.getFallbackHealthReport(vitals, userProfile, reportType);
    }
    const prompt = `Generate a comprehensive ${reportType} health report for ${userProfile.name}, a ${userProfile.age}-year-old ${userProfile.gender}.

Vital Signs Data (${vitals.length} readings):
${vitals.slice(0, 10).map((v, i) => `
Reading ${i + 1} (${v.timestamp.toLocaleDateString()}):
- Heart Rate: ${v.heartRate} BPM
- Blood Pressure: ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg
- Oxygen Saturation: ${v.oxygenSaturation}%
- Body Temperature: ${v.bodyTemperature}°F`).join('')}

${userProfile.medicalHistory ? `Medical History: ${userProfile.medicalHistory}` : ''}

Please provide:
1. Executive summary of health status
2. Specific recommendations for improvement
3. Identified risk factors
4. Areas of improvement or positive trends

Respond in JSON format with keys: summary, recommendations (array), riskFactors (array), improvements (array).`;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
      });
      const text = response.text || '';

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const report = JSON.parse(jsonMatch[0]);
        return {
          summary: report.summary || 'Health report generated successfully',
          recommendations: Array.isArray(report.recommendations) ? report.recommendations : [],
          riskFactors: Array.isArray(report.riskFactors) ? report.riskFactors : [],
          improvements: Array.isArray(report.improvements) ? report.improvements : []
        };
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error generating health report:', error);
      throw new Error('Failed to generate health report');
    }
  }

  async extractTextFromFile(filePath: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }

      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
      } else if (ext === '.txt') {
        return fs.readFileSync(filePath, 'utf8');
      } else {
        // For other file types (images, etc.), we'll need OCR
        // For now, return a message indicating the file type
        throw new Error(`Text extraction from ${ext} files not supported yet. Please upload PDF or text files.`);
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeMedicalImage(
    imageBuffer: Buffer,
    mimeType: string,
    reportType: 'xray' | 'mri' | 'ct_scan' | 'ecg' | 'lab_report' | 'prescription' | 'medical_record' | 'other',
    language?: string
  ): Promise<{
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    dietPlan: { breakfast: string[]; lunch: string[]; dinner: string[]; snacks: string[] };
    exercisePlan: { cardio: string[]; strength: string[]; flexibility: string[] };
    youtubeVideos: { title: string; searchTerm: string }[];
    lifestyleChanges: string[];
    actionPlan: { immediate: string[]; shortTerm: string[]; longTerm: string[] };
    followUpNeeded: boolean;
  }> {
    if (!this.genAI) {
      return this.getFallbackDocumentAnalysis(reportType as any, language || 'en');
    }

    const getLanguageInstruction = (lang: string) => {
      const languageInstructions = {
        'hi': 'Provide the analysis in Hindi (हिंदी). Use simple, clear Hindi language.',
        'es': 'Provide the analysis in Spanish (Español). Use clear, accessible Spanish.',
        'fr': 'Provide the analysis in French (Français). Use clear, accessible French.',
        'de': 'Provide the analysis in German (Deutsch). Use clear, accessible German.',
        'pt': 'Provide the analysis in Portuguese (Português). Use clear, accessible Portuguese.',
        'it': 'Provide the analysis in Italian (Italiano). Use clear, accessible Italian.',
        'ja': 'Provide the analysis in Japanese (日本語). Use simple, clear Japanese.',
        'ko': 'Provide the analysis in Korean (한국어). Use simple, clear Korean.',
        'zh': 'Provide the analysis in Chinese (中文). Use simple, clear Chinese.',
        'ar': 'Provide the analysis in Arabic (العربية). Use simple, clear Arabic.',
        'ru': 'Provide the analysis in Russian (Русский). Use clear, accessible Russian.',
        'tr': 'Provide the analysis in Turkish (Türkçe). Use clear, accessible Turkish.',
        'en': 'Provide the analysis in English.'
      };
      return languageInstructions[lang as keyof typeof languageInstructions] || languageInstructions['en'];
    };

    const reportTypeDescriptions = {
      'xray': 'X-ray imaging',
      'mri': 'MRI scan',
      'ct_scan': 'CT scan',
      'ecg': 'ECG/EKG report',
      'lab_report': 'laboratory test results',
      'prescription': 'medical prescription',
      'medical_record': 'medical record',
      'other': 'medical document'
    };

    const prompt = `You are Dr. AI, an expert medical imaging and document analysis assistant. Analyze this ${reportTypeDescriptions[reportType]} image and provide a comprehensive, patient-friendly health assessment.

${getLanguageInstruction(language || 'en')}

IMPORTANT INSTRUCTIONS:
- Carefully examine all text, numbers, values, and visual elements in the image
- Identify specific test results, measurements, or findings
- Explain any abnormal values or concerning patterns
- Provide context for medical terminology
- Give practical, actionable health recommendations

Please provide a comprehensive analysis that includes:

🏥 **MEDICAL ANALYSIS**:
1. What type of medical document/image is this? (lab report, X-ray, prescription, etc.)
2. Extract and list ALL key measurements, test results, and findings from the image
3. Identify any abnormal values or areas of concern
4. Explain medical terminology in simple language
5. Overall health assessment based on the findings
6. Whether follow-up with a healthcare provider is needed

🥗 **PERSONALIZED DIET PLAN** (based on findings):
- Specific foods to include that support healing/improvement
- Foods to avoid that may worsen the condition
- Meal timing and portion suggestions
- Hydration recommendations
- Nutritional supplements if relevant

🏃‍♂️ **EXERCISE RECOMMENDATIONS** (appropriate for the condition):
- Recommended exercise types
- Intensity levels (beginner/intermediate/advanced)
- Duration and frequency
- Exercises to avoid
- Activity modifications if needed

📹 **HELPFUL YOUTUBE VIDEO SEARCH TERMS**:
Provide 3-5 specific search terms for educational videos like:
- "How to understand [condition] test results"
- "[Condition] diet and nutrition guide"
- "Safe exercises for [condition]"
- "Managing [condition] naturally"

💪 **LIFESTYLE MODIFICATIONS**:
- Sleep recommendations
- Stress management techniques
- Habit changes specific to the findings
- Environmental factors to consider

🎯 **ACTION PLAN**:
- Immediate steps (next 24-48 hours)
- Short-term goals (1-4 weeks)
- Long-term goals (1-6 months)
- Warning signs that require emergency care

Respond in JSON format with keys: 
- summary (detailed explanation of findings)
- keyFindings (array of specific test results and observations)
- recommendations (array of medical recommendations)
- dietPlan (object with breakfast, lunch, dinner, snacks arrays)
- exercisePlan (object with cardio, strength, flexibility arrays)
- youtubeVideos (array of objects with title and searchTerm)
- lifestyleChanges (array)
- actionPlan (object with immediate, shortTerm, longTerm arrays)
- followUpNeeded (boolean)

CRITICAL: This analysis is for educational purposes only. Always consult qualified healthcare professionals for medical decisions.`;

    try {
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      
      // Use Gemini's vision model for image analysis
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image
                }
              },
              {
                text: prompt
              }
            ]
          }
        ]
      });

      const text = response.text || '';
      console.log('Gemini vision response received');

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          summary: analysis.summary || 'Medical image analysis completed',
          keyFindings: Array.isArray(analysis.keyFindings) ? analysis.keyFindings : ['Image analyzed - consult healthcare provider for interpretation'],
          recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : ['Share this report with your healthcare provider'],
          dietPlan: analysis.dietPlan || { 
            breakfast: ['Balanced breakfast with fruits and whole grains'], 
            lunch: ['Lean proteins and vegetables'], 
            dinner: ['Light, nutritious dinner'], 
            snacks: ['Healthy snacks like nuts and fruits'] 
          },
          exercisePlan: analysis.exercisePlan || { 
            cardio: ['30 minutes moderate exercise daily'], 
            strength: ['Light resistance training 2-3x per week'], 
            flexibility: ['Daily stretching and flexibility exercises'] 
          },
          youtubeVideos: Array.isArray(analysis.youtubeVideos) ? analysis.youtubeVideos : [
            { title: 'Understanding Medical Test Results', searchTerm: 'how to read medical test results' },
            { title: 'General Health Tips', searchTerm: 'basic health and wellness tips' }
          ],
          lifestyleChanges: Array.isArray(analysis.lifestyleChanges) ? analysis.lifestyleChanges : ['Maintain regular health checkups', 'Follow a balanced lifestyle'],
          actionPlan: analysis.actionPlan || { 
            immediate: ['Consult with your healthcare provider about these results'], 
            shortTerm: ['Follow medical advice and treatment plans'], 
            longTerm: ['Maintain preventive health practices'] 
          },
          followUpNeeded: typeof analysis.followUpNeeded === 'boolean' ? analysis.followUpNeeded : true
        };
      }

      // If JSON parsing fails, return a basic analysis
      console.warn('Could not parse JSON from Gemini response, using fallback');
      return this.getFallbackDocumentAnalysis(reportType as any, language || 'en');
    } catch (error) {
      console.error('Error analyzing medical image with Gemini Vision:', error);
      // Return fallback analysis instead of throwing
      return this.getFallbackDocumentAnalysis(reportType as any, language || 'en');
    }
  }

  async analyzeMedicalDocument(
    documentText: string,
    documentType: 'lab_report' | 'prescription' | 'medical_record',
    language?: string
  ): Promise<{
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    dietPlan: { breakfast: string[]; lunch: string[]; dinner: string[]; snacks: string[] };
    exercisePlan: { cardio: string[]; strength: string[]; flexibility: string[] };
    youtubeVideos: { title: string; searchTerm: string }[];
    lifestyleChanges: string[];
    actionPlan: { immediate: string[]; shortTerm: string[]; longTerm: string[] };
    followUpNeeded: boolean;
  }> {
    if (!this.genAI) {
      return this.getFallbackDocumentAnalysis(documentType, language || 'en');
    }
    const getLanguageInstruction = (lang: string) => {
      const languageInstructions = {
        'hi': 'Provide the analysis in Hindi (हिंदी). Use simple, clear Hindi language.',
        'es': 'Provide the analysis in Spanish (Español). Use clear, accessible Spanish.',
        'fr': 'Provide the analysis in French (Français). Use clear, accessible French.',
        'de': 'Provide the analysis in German (Deutsch). Use clear, accessible German.',
        'pt': 'Provide the analysis in Portuguese (Português). Use clear, accessible Portuguese.',
        'it': 'Provide the analysis in Italian (Italiano). Use clear, accessible Italian.',
        'ja': 'Provide the analysis in Japanese (日本語). Use simple, clear Japanese.',
        'ko': 'Provide the analysis in Korean (한국어). Use simple, clear Korean.',
        'zh': 'Provide the analysis in Chinese (中文). Use simple, clear Chinese.',
        'ar': 'Provide the analysis in Arabic (العربية). Use simple, clear Arabic.',
        'ru': 'Provide the analysis in Russian (Русский). Use clear, accessible Russian.',
        'tr': 'Provide the analysis in Turkish (Türkçe). Use clear, accessible Turkish.',
        'en': 'Provide the analysis in English.'
      };
      return languageInstructions[lang as keyof typeof languageInstructions] || languageInstructions['en'];
    };

    const prompt = `You are Dr. AI, a comprehensive health assistant. Analyze the following ${documentType.replace('_', ' ')} and provide a complete, patient-friendly health plan.

${getLanguageInstruction(language || 'en')}

Document Content:
${documentText}

Please provide a comprehensive analysis that includes:

🏥 **MEDICAL ANALYSIS**:
1. Clear, easy-to-understand summary of the document
2. Key findings that the patient should be aware of
3. Risk factors and areas of concern
4. Follow-up recommendations

🥗 **PERSONALIZED DIET PLAN**:
- Specific foods to include/avoid based on the findings
- Meal timing and portion suggestions
- Hydration recommendations
- Nutritional supplements if needed

🏃‍♂️ **EXERCISE RECOMMENDATIONS**:
- Specific exercise types suitable for the condition
- Intensity levels (beginner/intermediate/advanced)
- Duration and frequency guidelines
- Exercises to avoid if any

📹 **YOUTUBE VIDEO RECOMMENDATIONS**:
- Search for "Heart Healthy Diet Plan" on YouTube for cardiovascular issues
- Search for "Diabetes Exercise Routine" on YouTube for diabetes-related findings
- Check out "Yoga with Adriene" for stress management and flexibility
- Look for "Fitness Blender HIIT" for general fitness improvement
- Search for "Mediterranean Diet Recipes" for anti-inflammatory benefits
- Find "Meditation for Healing" for mental wellness support

💪 **LIFESTYLE MODIFICATIONS**:
- Sleep hygiene recommendations
- Stress management techniques
- Habit formation tips
- Mental wellness support

🎯 **ACTION PLAN**:
- Immediate steps to take
- Short-term goals (1-4 weeks)
- Long-term goals (1-6 months)
- When to seek emergency care

Respond in JSON format with keys: 
- summary (string)
- keyFindings (array)
- recommendations (array)
- dietPlan (object with breakfast, lunch, dinner, snacks arrays)
- exercisePlan (object with cardio, strength, flexibility arrays)
- youtubeVideos (array of objects with title and searchTerm)
- lifestyleChanges (array)
- actionPlan (object with immediate, shortTerm, longTerm arrays)
- followUpNeeded (boolean)

Important: This analysis is for informational purposes only and should not replace professional medical advice. Always consult healthcare providers for medical decisions.`;

    // Retry mechanism for API overload errors
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const response = await this.genAI.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: prompt
        });
        const text = response.text || '';

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            summary: analysis.summary || 'Document analysis completed',
            keyFindings: Array.isArray(analysis.keyFindings) ? analysis.keyFindings : [],
            recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
            dietPlan: analysis.dietPlan || { breakfast: [], lunch: [], dinner: [], snacks: [] },
            exercisePlan: analysis.exercisePlan || { cardio: [], strength: [], flexibility: [] },
            youtubeVideos: Array.isArray(analysis.youtubeVideos) ? analysis.youtubeVideos : [],
            lifestyleChanges: Array.isArray(analysis.lifestyleChanges) ? analysis.lifestyleChanges : [],
            actionPlan: analysis.actionPlan || { immediate: [], shortTerm: [], longTerm: [] },
            followUpNeeded: typeof analysis.followUpNeeded === 'boolean' ? analysis.followUpNeeded : true
          };
        }

        throw new Error('Invalid response format');
      } catch (error: any) {
        retryCount++;
        console.error(`Document analysis attempt ${retryCount} failed:`, error);
        
        // Check if it's an API overload error
        if (error.status === 503 && retryCount < maxRetries) {
          console.log(`API overloaded, retrying in ${retryCount * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
          continue;
        }
        
        // If all retries failed or it's a different error, throw
        throw new Error('Failed to analyze medical document after retries');
      }
    }
    
    // This should never be reached due to the throw above, but TypeScript requires it
    throw new Error('Analysis failed after all retry attempts');
  }

  async generateMentorChatResponse(
    message: string, 
    category: string,
    mentorName: string,
    studentId: string
  ): Promise<string> {
    if (!this.genAI) {
      return this.getFallbackMentorResponse(message, category);
    }

    const categoryContext = {
      loneliness: 'feelings of isolation, loneliness, and emotional support',
      study: 'academic pressure, exam stress, and study-related anxiety',
      confidence: 'self-esteem issues, social anxiety, and building confidence',
      career: 'future planning, career uncertainty, and life direction',
      listen: 'emotional venting, active listening, and providing a safe space'
    };

    const systemPrompt = `You are ${mentorName}, a compassionate and experienced mental health mentor specializing in ${categoryContext[category as keyof typeof categoryContext] || 'general mental health support'}. You provide anonymous support to students who need emotional guidance.

**Your Mentor Tone & Style:**
- 🤗 **Warm & Approachable**: Use a friendly, non-judgmental tone that makes students feel safe
- 👂 **Active Listener**: Show that you've heard and understood their concerns
- 💪 **Empowering**: Help them discover their own strengths and solutions
- 🎯 **Solution-Focused**: Offer practical coping strategies and actionable advice
- 🌱 **Growth-Oriented**: Frame challenges as opportunities for personal growth

**Response Guidelines:**
1. **Validate their feelings** - Acknowledge that their emotions are completely normal and valid
2. **Ask thoughtful questions** - Help them explore their feelings and thoughts deeper
3. **Share relatable insights** - Use phrases like "Many students feel this way" to normalize their experience
4. **Offer practical strategies** - Give specific techniques they can use right away
5. **End with encouragement** - Always leave them feeling hopeful and supported

**Sample Mentor Phrases to Use:**
- "I hear you, and what you're experiencing sounds really tough..."
- "It takes courage to reach out, and that shows real strength..."
- "Many students I've worked with have felt exactly like this..."
- "Let's explore what might help you feel more supported..."
- "You're not alone in this - we'll work through it together..."

**For ${category} specifically:**
${category === 'loneliness' ? '- Focus on connection strategies, self-compassion, and building social confidence\n- Help them identify small steps to reach out to others\n- Validate that loneliness is especially common in student life' : ''}
${category === 'study' ? '- Provide stress management techniques and study strategies\n- Help them set realistic goals and manage perfectionism\n- Discuss healthy work-life balance' : ''}
${category === 'confidence' ? '- Help them identify their strengths and past successes\n- Provide techniques for positive self-talk\n- Focus on building self-acceptance and resilience' : ''}
${category === 'career' ? '- Help them explore their interests and values\n- Discuss the normalcy of uncertainty about the future\n- Break down overwhelming decisions into smaller steps' : ''}
${category === 'listen' ? '- Practice pure active listening without trying to fix everything\n- Validate their need to express emotions\n- Create a safe, non-judgmental space' : ''}

**Important:**
- Never diagnose mental health conditions
- If they mention self-harm or suicidal thoughts, gently encourage professional help
- Keep responses conversational but professional
- Use their anonymous student ID (${studentId}) to personalize when appropriate
- Maintain confidentiality and anonymity always

Remember: Your goal is to be the supportive mentor they need right now, helping them feel heard, understood, and empowered to take positive steps forward.`;

    const prompt = `${systemPrompt}

Student (${studentId}) shared: "${message}"

Respond as ${mentorName} with warmth, empathy, and practical support. Keep your response conversational, under 200 words, and focused on their immediate emotional needs.`;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });
      return response.text || this.getFallbackMentorResponse(message, category);
    } catch (error) {
      console.error('Error generating mentor response:', error);
      return this.getFallbackMentorResponse(message, category);
    }
  }

  private getFallbackMentorResponse(message: string, category: string): string {
    const responses = {
      loneliness: [
        "I hear you, and what you're feeling is completely valid. Loneliness can be really tough, especially as a student. You're not alone in feeling this way - many students experience these same feelings. Can you tell me a bit more about what's been making you feel most isolated lately? Sometimes just talking about it can help us figure out small steps to feel more connected.",
        "It takes real courage to reach out when you're feeling lonely, and that shows more strength than you might realize right now. What you're experiencing is so common among students - you're definitely not the only one feeling this way. What would feeling more connected look like for you? Even small steps toward connection can make a big difference.",
        "Thank you for trusting me with how you're feeling. Loneliness can feel overwhelming, but I want you to know that this feeling isn't permanent. Many students I've talked with have felt exactly like you do right now. What's one small thing that usually helps you feel even a little bit better when you're feeling down?"
      ],
      study: [
        "Academic pressure can feel incredibly overwhelming - you're definitely not alone in feeling stressed about studies. It sounds like you're putting a lot of pressure on yourself. Remember, your worth isn't determined by grades or exam results. What's the biggest source of stress in your studies right now? Let's see if we can break it down into more manageable pieces.",
        "I can hear how much stress you're carrying about your studies. That kind of pressure is exhausting, and it's completely understandable that you're feeling overwhelmed. Many students struggle with this exact same thing. What would it look like if you were just 10% less stressed about studying? Sometimes small changes can make a big difference.",
        "Study stress is so real and can feel suffocating sometimes. You're handling so much, and it makes complete sense that you're feeling this way. What's been your biggest challenge with studying lately? Let's talk about some strategies that might help you feel more in control of your academic life."
      ],
      confidence: [
        "Building confidence is such a journey, and it's okay to have ups and downs along the way. What you're feeling about yourself is something many students experience. You took a big step by reaching out today - that actually shows more courage than you might realize. What situations make you feel most uncertain about yourself?",
        "I want you to know that self-doubt is something almost every student deals with. You're not broken or lacking - you're human, and you're growing. What would feeling more confident mean to you? Sometimes it helps to start by recognizing the small things you do well, even if they seem minor.",
        "Thank you for being so honest about how you're feeling about yourself. Those kinds of thoughts can be really heavy to carry. You're worthy of feeling good about yourself just as you are. What's one thing you've done recently, even something small, that you can feel good about?"
      ],
      career: [
        "Thinking about the future can feel both exciting and terrifying at the same time - that's completely normal. It's okay not to have everything figured out. Most successful people changed directions multiple times before finding their path. What aspects of your future feel most unclear or overwhelming right now?",
        "Career decisions can feel like such huge pressure, but I want you to know that there's no single 'right' path for anyone. You don't have to have it all figured out right now. What are you curious about or interested in, even if it seems small or unimportant? Sometimes our interests can guide us more than we realize.",
        "It's so normal to feel uncertain about your career path - you're definitely not behind or failing in any way. The future can feel overwhelming when we try to figure it all out at once. What's one small step you could take toward exploring something that interests you? Even tiny steps count."
      ],
      listen: [
        "I'm here and I'm listening. Sometimes we just need someone to hear us without trying to fix everything, and that's completely valid. Take your time - there's no rush to say anything specific. What's been weighing on your heart lately?",
        "Thank you for trusting me with whatever you're going through. I'm here to listen for as long as you need. You don't have to carry everything alone. What would it feel like to just let some of these feelings out?",
        "I can sense you have a lot on your mind, and I want you to know this is a safe space to share whatever you're comfortable sharing. Sometimes just being heard can make a difference. What's been the hardest part of your day or week?"
      ]
    };
    
    const categoryResponses = responses[category as keyof typeof responses] || responses.listen;
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  }

  private getFallbackDocumentAnalysis(
    documentType: string,
    language: string
  ): {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    dietPlan: { breakfast: string[]; lunch: string[]; dinner: string[]; snacks: string[] };
    exercisePlan: { cardio: string[]; strength: string[]; flexibility: string[] };
    youtubeVideos: { title: string; searchTerm: string }[];
    lifestyleChanges: string[];
    actionPlan: { immediate: string[]; shortTerm: string[]; longTerm: string[] };
    followUpNeeded: boolean;
  } {
    const languageResponses = {
      'en': {
        summary: `Document uploaded successfully. AI analysis is currently unavailable, but your ${documentType.replace('_', ' ')} has been securely stored.`,
        keyFindings: ["Document successfully uploaded and stored", "AI analysis unavailable - manual review recommended"],
        recommendations: ["Consult with your healthcare provider for document interpretation", "Share this document during your next medical appointment", "Keep a copy for your personal medical records"],
        followUpNeeded: true
      },
      'hi': {
        summary: `दस्तावेज़ सफलतापूर्वक अपलोड किया गया। AI विश्लेषण वर्तमान में उपलब्ध नहीं है, लेकिन आपका ${documentType.replace('_', ' ')} सुरक्षित रूप से संग्रहीत किया गया है।`,
        keyFindings: ["दस्तावेज़ सफलतापूर्वक अपलोड और संग्रहीत", "AI विश्लेषण अनुपलब्ध - मैन्युअल समीक्षा की सिफारिश"],
        recommendations: ["दस्तावेज़ की व्याख्या के लिए अपने स्वास्थ्य सेवा प्रदाता से सलाह लें", "अपनी अगली चिकित्सा नियुक्ति के दौरान इस दस्तावेज़ को साझा करें"],
        followUpNeeded: true
      },
      'es': {
        summary: `Documento subido exitosamente. El análisis de IA no está disponible actualmente, pero su ${documentType.replace('_', ' ')} ha sido almacenado de forma segura.`,
        keyFindings: ["Documento subido y almacenado exitosamente", "Análisis de IA no disponible - se recomienda revisión manual"],
        recommendations: ["Consulte con su proveedor de atención médica para la interpretación del documento", "Comparta este documento durante su próxima cita médica"],
        followUpNeeded: true
      },
      'fr': {
        summary: `Document téléchargé avec succès. L'analyse IA n'est actuellement pas disponible, mais votre ${documentType.replace('_', ' ')} a été stocké en sécurité.`,
        keyFindings: ["Document téléchargé et stocké avec succès", "Analyse IA indisponible - examen manuel recommandé"],
        recommendations: ["Consultez votre prestataire de soins de santé pour l'interprétation du document", "Partagez ce document lors de votre prochaine consultation médicale"],
        followUpNeeded: true
      }
    };

    const baseResponse = languageResponses[language as keyof typeof languageResponses] || languageResponses['en'];
    return {
      ...baseResponse,
      dietPlan: { 
        breakfast: ["Consult your healthcare provider for personalized dietary recommendations"], 
        lunch: [], 
        dinner: [], 
        snacks: [] 
      },
      exercisePlan: { 
        cardio: ["Consult your healthcare provider for exercise recommendations"], 
        strength: [], 
        flexibility: [] 
      },
      youtubeVideos: [
        { title: "General Health Tips", searchTerm: "basic health tips for beginners" }
      ],
      lifestyleChanges: ["Maintain regular healthcare checkups", "Follow your doctor's recommendations"],
      actionPlan: { 
        immediate: ["Contact your healthcare provider"], 
        shortTerm: ["Schedule a consultation"], 
        longTerm: ["Follow medical advice"] 
      }
    };
  }

  private getFallbackChatResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('blood pressure') || lowerMessage.includes('bp')) {
      return 'Blood pressure is an important indicator of cardiovascular health. Normal blood pressure is typically around 120/80 mmHg. If you have concerns about your blood pressure, please consult with your healthcare provider for proper evaluation and guidance.';
    }
    
    if (lowerMessage.includes('heart rate') || lowerMessage.includes('pulse')) {
      return 'A normal resting heart rate for adults ranges from 60 to 100 beats per minute. Factors like fitness level, medications, and emotions can affect your heart rate. If you notice unusual changes, consider discussing them with your doctor.';
    }
    
    if (lowerMessage.includes('temperature') || lowerMessage.includes('fever')) {
      return 'Normal body temperature is around 98.6°F (37°C). A fever is generally considered 100.4°F (38°C) or higher. If you have a persistent fever or other concerning symptoms, please consult with a healthcare professional.';
    }
    
    if (lowerMessage.includes('oxygen') || lowerMessage.includes('spo2')) {
      return 'Normal oxygen saturation levels are typically 95-100%. Lower levels may indicate respiratory or circulatory issues. If you consistently see readings below 95%, please seek medical attention.';
    }
    
    return 'I understand your health concern. For personalized medical advice, please consult with your healthcare provider. I can help provide general health information and guide you to appropriate resources. Is there a specific aspect of your health you\'d like to discuss?';
  }

  private detectBodyPart(message: string): string | undefined {
    const text = (message || '').toLowerCase();
    const matches = [
      { part: 'heart', kws: ['heart', 'cardio', 'chest pain', 'angina', 'arrhythm', 'hypertension', 'bp', 'blood pressure', 'cardiovascular'] },
      { part: 'hand', kws: ['hand', 'wrist', 'finger', 'thumb', 'carpal', 'metacarp', 'hand pain', 'wrist pain'] },
      { part: 'ear', kws: ['ear', 'tinnitus', 'hearing', 'otitis', 'earache', 'ear pain', 'hearing loss'] },
      { part: 'brain', kws: ['brain', 'headache', 'migraine', 'stroke', 'seizure', 'neuro', 'dizziness', 'head pain', 'cognitive'] },
      { part: 'lungs', kws: ['lung', 'breath', 'asthma', 'copd', 'pneumon', 'dyspnea', 'shortness of breath', 'wheez', 'respiratory', 'cough'] },
      { part: 'eyes', kws: ['eye', 'vision', 'sight', 'ocular', 'optic', 'blurry vision', 'eye pain', 'vision problems'] },
      { part: 'digestive system', kws: ['stomach', 'digestive', 'nausea', 'constipation', 'diarrhea', 'acid reflux', 'gut health', 'abdominal'] },
      { part: 'kidney', kws: ['kidney', 'urinary', 'kidney stones', 'uti', 'kidney pain', 'nephrology'] },
      { part: 'pelvis', kws: ['hip pain', 'pelvic pain', 'lower back pain', 'reproductive health', 'pelvic floor'] }
    ];
    for (const m of matches) {
      if (m.kws.some(k => text.includes(k))) return m.part;
    }
    return undefined;
  }

  private detectAnatomicalModel(message: string): string | undefined {
    const part = this.detectBodyPart(message);
    const map: Record<string, string> = { 
      heart: 'heart', 
      hand: 'hand', 
      ear: 'ear', 
      brain: 'brain', 
      lungs: 'lungs', 
      eyes: 'eyes',
      'digestive system': 'digestive',
      kidney: 'kidney',
      pelvis: 'pelvis'
    };
    return part ? map[part] : undefined;
  }

  private getFallbackHealthReport(
    vitals: VitalSigns[],
    userProfile: { age: number; gender: string; name: string; medicalHistory?: string },
    reportType: 'weekly' | 'monthly' | 'custom'
  ) {
    return {
      summary: `Basic ${reportType} health report for ${userProfile.name}. Your vital signs have been monitored over this period.`,
      recommendations: [
        "Continue monitoring your vital signs regularly",
        "Maintain a healthy lifestyle with proper diet and exercise",
        "Get adequate sleep and manage stress levels",
        "Consult with your healthcare provider for comprehensive evaluation"
      ],
      riskFactors: [
        "Individual risk factors vary - consult with your doctor for personalized assessment"
      ],
      improvements: [
        "Consistent monitoring shows engagement with your health",
        "Regular check-ins demonstrate good health awareness"
      ]
    };
  }

  private getFallbackAnalysis(vitals: VitalSigns): HealthAnalysisResult {
    const { heartRate, bloodPressureSystolic, bloodPressureDiastolic, oxygenSaturation, bodyTemperature } = vitals;
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const anomalies: string[] = [];
    const recommendations: string[] = [];

    // Basic vital signs assessment
    if (heartRate < 60 || heartRate > 100) {
      anomalies.push(`Heart rate ${heartRate} BPM is outside normal range (60-100 BPM)`);
      riskLevel = heartRate < 50 || heartRate > 120 ? 'high' : 'medium';
    }

    if (bloodPressureSystolic > 140 || bloodPressureDiastolic > 90) {
      anomalies.push(`Blood pressure ${bloodPressureSystolic}/${bloodPressureDiastolic} indicates hypertension`);
      riskLevel = bloodPressureSystolic > 160 || bloodPressureDiastolic > 100 ? 'high' : 'medium';
    }

    if (oxygenSaturation < 95) {
      anomalies.push(`Oxygen saturation ${oxygenSaturation}% is below normal (95-100%)`);
      riskLevel = oxygenSaturation < 90 ? 'critical' : 'high';
    }

    if (bodyTemperature > 100.4 || bodyTemperature < 97) {
      anomalies.push(`Body temperature ${bodyTemperature}°F indicates fever or hypothermia`);
      riskLevel = bodyTemperature > 103 || bodyTemperature < 95 ? 'high' : 'medium';
    }

    // Generate recommendations
    if (anomalies.length === 0) {
      recommendations.push('All vital signs are within normal ranges. Continue maintaining healthy lifestyle habits.');
    } else {
      recommendations.push('Monitor your vital signs closely and consult with your healthcare provider.');
      recommendations.push('Ensure adequate rest, hydration, and follow prescribed medications.');
    }

    return {
      analysis: anomalies.length === 0 
        ? 'Your vital signs are within normal ranges indicating good health status.'
        : `Analysis shows ${anomalies.length} parameter(s) outside normal ranges that require attention.`,
      riskLevel,
      recommendations,
      anomalies,
      confidence: 0.85
    };
  }
}

export const geminiHealthService = new GeminiHealthService();
