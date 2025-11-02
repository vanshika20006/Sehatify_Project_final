import { geminiHealthService } from './gemini';
import { saveHealthAnalysis, saveVitalSigns } from './firebase-admin';

interface VitalSigns {
  userId: string;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  ecgData?: string;
  steps?: number;
  sleepHours?: number;
}

interface UserProfile {
  age: number;
  gender: string;
  medicalHistory?: string;
}

export class HealthAnalyzer {
  async processVitalSigns(vitals: VitalSigns, userProfile: UserProfile) {
    try {
      // Save vital signs to database
      const savedVitals = await saveVitalSigns({
        ...vitals,
        timestamp: new Date()
      });

      // Analyze with Gemini AI
      const analysis = await geminiHealthService.analyzeVitalSigns(
        {
          heartRate: vitals.heartRate,
          bloodPressureSystolic: vitals.bloodPressureSystolic,
          bloodPressureDiastolic: vitals.bloodPressureDiastolic,
          oxygenSaturation: vitals.oxygenSaturation,
          bodyTemperature: vitals.bodyTemperature,
          timestamp: new Date()
        },
        userProfile.age,
        userProfile.gender,
        userProfile.medicalHistory
      );

      // Save analysis to database
      const savedAnalysis = await saveHealthAnalysis({
        userId: vitals.userId,
        vitalSignsId: savedVitals.id,
        analysis: analysis.analysis,
        riskLevel: analysis.riskLevel,
        recommendations: analysis.recommendations,
        anomalies: analysis.anomalies,
        aiConfidence: analysis.confidence
      });

      // Check for critical conditions
      if (analysis.riskLevel === 'critical') {
        await this.triggerEmergencyAlert(vitals.userId, analysis, vitals);
      }

      return {
        vitals: savedVitals,
        analysis: savedAnalysis
      };
    } catch (error) {
      console.error('Error processing vital signs:', error);
      throw error;
    }
  }

  private async triggerEmergencyAlert(userId: string, analysis: any, vitals: VitalSigns) {
    // TODO: Implement emergency alert logic
    // This would notify emergency contacts, healthcare providers, etc.
    console.log('CRITICAL ALERT for user:', userId, 'Analysis:', analysis);
    
    // In production, this would:
    // 1. Send notifications to emergency contacts
    // 2. Alert healthcare providers
    // 3. Potentially contact emergency services
    // 4. Log the emergency event
  }

  async detectAnomalies(userId: string, currentVitals: VitalSigns, historicalVitals: any[]) {
    // Implement anomaly detection logic
    const anomalies: string[] = [];

    // Check for sudden changes in heart rate
    if (historicalVitals.length > 0) {
      const avgHeartRate = historicalVitals.reduce((sum, v) => sum + v.heartRate, 0) / historicalVitals.length;
      const heartRateChange = Math.abs(currentVitals.heartRate - avgHeartRate);
      
      if (heartRateChange > 30) {
        anomalies.push(`Significant heart rate change detected: ${currentVitals.heartRate} BPM (average: ${avgHeartRate.toFixed(1)} BPM)`);
      }
    }

    // Check for blood pressure spikes
    if (currentVitals.bloodPressureSystolic > 180 || currentVitals.bloodPressureDiastolic > 120) {
      anomalies.push('Hypertensive crisis detected - immediate medical attention required');
    }

    // Check for low oxygen saturation
    if (currentVitals.oxygenSaturation < 90) {
      anomalies.push('Critically low oxygen saturation detected');
    }

    // Check for fever
    if (currentVitals.bodyTemperature > 103) {
      anomalies.push('High fever detected');
    }

    return anomalies;
  }

  async generatePersonalizedRecommendations(userId: string, analysis: any, userProfile: UserProfile) {
    const baseRecommendations = analysis.recommendations || [];
    
    // Add personalized recommendations based on user profile
    const personalizedRecommendations = [...baseRecommendations];

    // Age-specific recommendations
    if (userProfile.age > 60) {
      personalizedRecommendations.push('Consider regular cardiac monitoring given your age group');
    }

    // Gender-specific recommendations
    if (userProfile.gender === 'female' && userProfile.age > 50) {
      personalizedRecommendations.push('Discuss bone health and hormonal changes with your healthcare provider');
    }

    // Medical history-specific recommendations
    if (userProfile.medicalHistory?.toLowerCase().includes('diabetes')) {
      personalizedRecommendations.push('Monitor blood glucose levels regularly and maintain medication schedule');
    }

    if (userProfile.medicalHistory?.toLowerCase().includes('hypertension')) {
      personalizedRecommendations.push('Continue monitoring blood pressure and follow prescribed medication regimen');
    }

    return personalizedRecommendations;
  }

  async calculateHealthScore(userId: string, vitals: VitalSigns, userProfile: UserProfile) {
    let score = 100;

    // Heart rate scoring
    const targetHeartRate = userProfile.age < 60 ? 70 : 75;
    const heartRateDeviation = Math.abs(vitals.heartRate - targetHeartRate);
    score -= Math.min(heartRateDeviation * 0.5, 20);

    // Blood pressure scoring
    if (vitals.bloodPressureSystolic > 140 || vitals.bloodPressureDiastolic > 90) {
      score -= 15;
    } else if (vitals.bloodPressureSystolic > 130 || vitals.bloodPressureDiastolic > 80) {
      score -= 10;
    }

    // Oxygen saturation scoring
    if (vitals.oxygenSaturation < 95) {
      score -= 20;
    } else if (vitals.oxygenSaturation < 98) {
      score -= 5;
    }

    // Temperature scoring
    if (vitals.bodyTemperature > 100.4 || vitals.bodyTemperature < 97) {
      score -= 10;
    }

    return Math.max(score, 0);
  }
}

export const healthAnalyzer = new HealthAnalyzer();
