interface GeminiResponse {
  analysis: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  anomalies?: string[];
  confidence: number;
}

interface VitalSigns {
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  timestamp: Date;
}

export class GeminiHealthAnalyzer {
  constructor() {
    // No more client-side API key - all calls go through secure server endpoints
  }

  // Get auth headers from localStorage
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    if (token) {
      return { 'Authorization': `Bearer ${token}` };
    }
    console.warn('No authentication token found. Please login first to use AI chat features.');
    return {};
  }

  async analyzeVitalSigns(vitals: VitalSigns, userAge: number, userGender: string, medicalHistory?: string): Promise<GeminiResponse> {
    try {
      const response = await fetch('/api/health/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({
          vitals: {
            heartRate: vitals.heartRate,
            bloodPressureSystolic: vitals.bloodPressureSystolic,
            bloodPressureDiastolic: vitals.bloodPressureDiastolic,
            oxygenSaturation: vitals.oxygenSaturation,
            bodyTemperature: vitals.bodyTemperature,
            timestamp: vitals.timestamp
          },
          userProfile: {
            age: userAge,
            gender: userGender,
            medicalHistory: medicalHistory || ''
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Health analysis API error: ${response.status}`);
      }

      const result = await response.json();
      return {
        analysis: result.analysis || 'Analysis completed',
        riskLevel: result.riskLevel || 'low',
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
        anomalies: Array.isArray(result.anomalies) ? result.anomalies : [],
        confidence: typeof result.confidence === 'number' ? result.confidence : 0.8
      };
    } catch (error) {
      console.error('Error calling health analysis API:', error);
      return this.getFallbackAnalysis(vitals);
    }
  }

  async generateChatResponse(message: string, healthContext?: VitalSigns, userProfile?: { age: number; gender: string; medicalHistory?: string }): Promise<{ response: string; anatomicalModel?: string; bodyPart?: string }> {
    try {
      const response = await fetch('/api/chat/doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({
          message,
          healthContext,
          userProfile
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login first to use the AI Medical Consultation feature.');
        }
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        response: data.response || this.getFallbackChatResponse(message),
        anatomicalModel: data.anatomicalModel,
        bodyPart: data.bodyPart
      };
    } catch (error) {
      console.error('Error calling chat API:', error);
      return {
        response: this.getFallbackChatResponse(message),
        anatomicalModel: undefined,
        bodyPart: undefined
      };
    }
  }

  private getFallbackAnalysis(vitals: VitalSigns): GeminiResponse {
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
}

export const geminiAnalyzer = new GeminiHealthAnalyzer();
