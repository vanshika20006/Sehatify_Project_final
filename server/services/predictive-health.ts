import { GoogleGenerativeAI } from "@google/genai/dist/node/index.cjs";

import { geminiHealthService } from './gemini';

export interface WristbandVitalSigns {
  heartRate: number;
  pulseRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  ecgData?: string;
  ecgRhythm?: 'normal' | 'irregular' | 'atrial_fibrillation' | 'tachycardia' | 'bradycardia';
  steps?: number;
  sleepHours?: number;
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'vigorous';
  radiationExposure?: number;
  fallDetected?: boolean;
  stressLevel?: 'low' | 'medium' | 'high' | 'critical';
  hydrationLevel?: number;
  caloriesBurned?: number;
  timestamp: Date;
}

export interface HealthPrediction {
  predictionType: '1week' | '2week' | '1month';
  analysis: string;
  predictedConditions: string[];
  riskFactors: string[];
  confidence: number;
  recommendedActions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  shouldConsultDoctor: boolean;
  doctorSpecialty?: string;
}

export interface HealthTrend {
  parameter: string;
  trend: 'improving' | 'declining' | 'stable' | 'concerning';
  changePercentage: number;
  significance: 'minor' | 'moderate' | 'significant' | 'critical';
}

export class PredictiveHealthService {
  private genAI: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY not set. Using development mode with stub responses.');
      this.genAI = null as any;
    } else {
      this.genAI = new GoogleGenAI({ apiKey });
    }
  }

  async analyzeLongTermHealthTrends(
    historicalData: WristbandVitalSigns[],
    userProfile: { age: number; gender: string; medicalHistory?: string },
    predictionPeriod: '1week' | '2week' | '1month'
  ): Promise<HealthPrediction> {
    const prompt = `You are an advanced AI health analyst specializing in predictive medicine using wearable device data. Analyze the following health data trends for a ${userProfile.age}-year-old ${userProfile.gender} over the past ${this.getPeriodDays(predictionPeriod)} days to predict potential health changes for the next ${predictionPeriod}.

Historical Health Data (${historicalData.length} readings):
${historicalData.slice(-50).map((data, index) => `
Day ${index + 1} (${data.timestamp.toLocaleDateString()}):
- Heart Rate: ${data.heartRate} BPM, Pulse: ${data.pulseRate} BPM
- Blood Pressure: ${data.bloodPressureSystolic}/${data.bloodPressureDiastolic} mmHg
- Oxygen Saturation: ${data.oxygenSaturation}%
- Body Temperature: ${data.bodyTemperature}°F
- ECG Rhythm: ${data.ecgRhythm || 'normal'}
- Sleep: ${data.sleepHours || 0}h (${data.sleepQuality || 'unknown'})
- Activity: ${data.activityLevel || 'unknown'}, Steps: ${data.steps || 0}
- Stress Level: ${data.stressLevel || 'normal'}
- Radiation Exposure: ${data.radiationExposure || 0} μSv
- Falls: ${data.fallDetected ? 'Yes' : 'No'}
- Hydration: ${data.hydrationLevel || 0}%
- Calories Burned: ${data.caloriesBurned || 0}`).join('')}

${userProfile.medicalHistory ? `Medical History: ${userProfile.medicalHistory}` : ''}

Analyze patterns, trends, and anomalies. Predict potential health issues that might develop in the next ${predictionPeriod} based on:
1. Cardiovascular patterns (heart rate variability, blood pressure trends)
2. Sleep quality and patterns
3. Activity levels and fitness trends
4. Stress indicators
5. Any concerning patterns in vital signs
6. Environmental factors (radiation exposure)
7. Risk of falls or injuries

Provide predictions with confidence levels and specify if doctor consultation is needed.

Respond in JSON format with:
{
  "analysis": "detailed analysis of trends and patterns",
  "predictedConditions": ["array of potential conditions"],
  "riskFactors": ["identified risk factors"],
  "confidence": 0.85,
  "recommendedActions": ["specific actionable recommendations"],
  "urgencyLevel": "low|medium|high|critical",
  "shouldConsultDoctor": true/false,
  "doctorSpecialty": "cardiology|internal_medicine|endocrinology|etc"
}`;

    // Return stub data if Gemini API is not available
    if (!this.genAI) {
      console.log('Using development stub for health prediction analysis');
      return this.getFallbackPrediction(predictionPeriod, historicalData);
    }

    try {
      const result = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = result.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const prediction = JSON.parse(jsonMatch[0]);
        return {
          predictionType: predictionPeriod,
          analysis: prediction.analysis || 'Health prediction analysis completed',
          predictedConditions: Array.isArray(prediction.predictedConditions) ? prediction.predictedConditions : [],
          riskFactors: Array.isArray(prediction.riskFactors) ? prediction.riskFactors : [],
          confidence: typeof prediction.confidence === 'number' ? prediction.confidence : 0.75,
          recommendedActions: Array.isArray(prediction.recommendedActions) ? prediction.recommendedActions : [],
          urgencyLevel: prediction.urgencyLevel || 'low',
          shouldConsultDoctor: prediction.shouldConsultDoctor || false,
          doctorSpecialty: prediction.doctorSpecialty
        };
      }

      throw new Error('Invalid response format from Gemini');
    } catch (error) {
      console.error('Error in predictive analysis:', error);
      return this.getFallbackPrediction(predictionPeriod, historicalData);
    }
  }

  async detectHealthChanges(
    currentVitals: WristbandVitalSigns,
    historicalAverage: any,
    threshold: number = 0.15
  ): Promise<HealthTrend[]> {
    const trends: HealthTrend[] = [];

    // Heart rate trends
    const heartRateChange = (currentVitals.heartRate - historicalAverage.heartRate) / historicalAverage.heartRate;
    if (Math.abs(heartRateChange) > threshold) {
      trends.push({
        parameter: 'Heart Rate',
        trend: heartRateChange > 0 ? 'concerning' : 'improving',
        changePercentage: Math.abs(heartRateChange * 100),
        significance: Math.abs(heartRateChange) > 0.3 ? 'critical' : 'moderate'
      });
    }

    // Blood pressure trends
    const bpSysChange = (currentVitals.bloodPressureSystolic - historicalAverage.bloodPressureSystolic) / historicalAverage.bloodPressureSystolic;
    if (Math.abs(bpSysChange) > threshold) {
      trends.push({
        parameter: 'Blood Pressure Systolic',
        trend: bpSysChange > 0 ? 'concerning' : 'improving',
        changePercentage: Math.abs(bpSysChange * 100),
        significance: Math.abs(bpSysChange) > 0.25 ? 'significant' : 'moderate'
      });
    }

    // Oxygen saturation trends
    const o2Change = (currentVitals.oxygenSaturation - historicalAverage.oxygenSaturation) / historicalAverage.oxygenSaturation;
    if (Math.abs(o2Change) > 0.05) {
      trends.push({
        parameter: 'Oxygen Saturation',
        trend: o2Change > 0 ? 'improving' : 'concerning',
        changePercentage: Math.abs(o2Change * 100),
        significance: Math.abs(o2Change) > 0.1 ? 'critical' : 'significant'
      });
    }

    return trends;
  }

  async generateDoctorReport(
    patientData: {
      name: string;
      age: number;
      gender: string;
      medicalHistory?: string;
    },
    healthPrediction: HealthPrediction,
    recentVitals: WristbandVitalSigns[],
    labReports?: string[]
  ): Promise<string> {
    const prompt = `Generate a comprehensive medical report for Dr. consultation:

Patient Information:
- Name: ${patientData.name}
- Age: ${patientData.age}
- Gender: ${patientData.gender}
- Medical History: ${patientData.medicalHistory || 'None reported'}

AI Health Prediction Analysis (${healthPrediction.predictionType}):
- Analysis: ${healthPrediction.analysis}
- Predicted Conditions: ${healthPrediction.predictedConditions.join(', ')}
- Risk Factors: ${healthPrediction.riskFactors.join(', ')}
- Urgency Level: ${healthPrediction.urgencyLevel}
- AI Confidence: ${(healthPrediction.confidence * 100).toFixed(1)}%

Recent Vital Signs (Last 7 days):
${recentVitals.slice(-7).map((vital, index) => `
Day ${index + 1}:
- Vital Signs: HR ${vital.heartRate}, BP ${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic}, SpO2 ${vital.oxygenSaturation}%, Temp ${vital.bodyTemperature}°F
- Activity: ${vital.steps || 0} steps, ${vital.sleepHours || 0}h sleep (${vital.sleepQuality || 'unknown'})
- ECG: ${vital.ecgRhythm || 'normal'}, Stress: ${vital.stressLevel || 'normal'}
${vital.fallDetected ? '- FALL DETECTED' : ''}
${vital.radiationExposure ? `- Radiation: ${vital.radiationExposure}μSv` : ''}`).join('')}

${labReports && labReports.length > 0 ? `Lab Reports:\n${labReports.join('\n')}` : ''}

Please provide a professional medical summary suitable for doctor review, including:
1. Clinical overview of patient status
2. Key findings from wearable data
3. Correlation with predicted conditions
4. Recommended diagnostic tests or evaluations
5. Suggested follow-up care or monitoring
6. Any immediate concerns requiring attention

Format as a professional medical report.`;

    try {
      const result = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return result.text || 'Unable to generate medical report at this time.';
    } catch (error) {
      console.error('Error generating doctor report:', error);
      return 'Error generating medical report. Please consult with healthcare provider directly.';
    }
  }

  private getPeriodDays(period: '1week' | '2week' | '1month'): number {
    switch (period) {
      case '1week': return 7;
      case '2week': return 14;
      case '1month': return 30;
      default: return 7;
    }
  }

  private getFallbackPrediction(
    predictionType: '1week' | '2week' | '1month',
    historicalData: WristbandVitalSigns[]
  ): HealthPrediction {
    // Simple fallback analysis based on recent vital signs
    const recentData = historicalData.slice(-7);
    const avgHeartRate = recentData.reduce((sum, d) => sum + d.heartRate, 0) / recentData.length;
    const avgBP = recentData.reduce((sum, d) => sum + d.bloodPressureSystolic, 0) / recentData.length;

    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const riskFactors: string[] = [];
    const recommendedActions: string[] = ['Continue regular monitoring', 'Maintain healthy lifestyle'];

    if (avgHeartRate > 100) {
      riskFactors.push('Elevated resting heart rate');
      urgencyLevel = 'medium';
    }
    if (avgBP > 140) {
      riskFactors.push('Elevated blood pressure');
      urgencyLevel = 'medium';
    }

    return {
      predictionType,
      analysis: `Based on ${recentData.length} recent readings, your health metrics show ${riskFactors.length > 0 ? 'some areas for attention' : 'generally stable patterns'}.`,
      predictedConditions: riskFactors.length > 0 ? ['Cardiovascular monitoring recommended'] : [],
      riskFactors,
      confidence: 0.75,
      recommendedActions,
      urgencyLevel,
      shouldConsultDoctor: urgencyLevel !== 'low',
      doctorSpecialty: urgencyLevel !== 'low' ? 'internal_medicine' : undefined
    };
  }
}

export const predictiveHealthService = new PredictiveHealthService();