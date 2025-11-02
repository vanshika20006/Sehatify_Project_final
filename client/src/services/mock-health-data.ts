import { VitalSigns } from '@shared/schema';

export interface MockVitalSigns {
  id: string;
  userId: string;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  ecgData?: string;
  steps?: number;
  sleepHours?: number;
  deviceInfo: {
    deviceId: string;
    deviceType: 'wristband' | 'smartwatch' | 'medical_device' | 'manual_entry';
    manufacturer: string;
    model: string;
    isMedicalGrade: boolean;
    certifications?: string[];
    firmwareVersion?: string;
  };
  dataQuality: {
    confidence: number;
    signalQuality: 'excellent' | 'good' | 'fair' | 'poor';
    artifactsDetected: boolean;
  };
  timestamp: Date;
  syncedAt?: Date;
}

export class MockHealthDataService {
  private static instance: MockHealthDataService;
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Set<(data: MockVitalSigns) => void> = new Set();
  private currentData: MockVitalSigns | null = null;
  private historicalData: MockVitalSigns[] = [];
  private trendData: { [key: string]: number[] } = {};
  private lastHealthScore: number = 85;
  private anomalyDetection: boolean = true;
  private isAutoGenerating: boolean = false;

  static getInstance(): MockHealthDataService {
    if (!MockHealthDataService.instance) {
      MockHealthDataService.instance = new MockHealthDataService();
    }
    return MockHealthDataService.instance;
  }

  private generateRealisticVitals(): MockVitalSigns {
    const now = new Date();
    const timeOfDay = now.getHours();
    
    // Simulate circadian rhythm effects
    const isNight = timeOfDay >= 22 || timeOfDay <= 6;
    const isEvening = timeOfDay >= 18 && timeOfDay < 22;
    
    // Base values with time-of-day variations
    let baseHeartRate = 72;
    let baseSystolic = 120;
    let baseDiastolic = 80;
    let baseTemp = 98.6;
    let baseSteps = Math.floor((timeOfDay / 24) * 12000); // Accumulate steps throughout day
    
    if (isNight) {
      baseHeartRate -= 10; // Lower at night
      baseSystolic -= 5;
      baseDiastolic -= 3;
      baseTemp -= 0.5;
    } else if (isEvening) {
      baseHeartRate += 5; // Slightly higher in evening
      baseTemp += 0.3;
    }
    
    // Add realistic variations
    const heartRate = Math.max(50, Math.min(120, baseHeartRate + (Math.random() - 0.5) * 20));
    const systolic = Math.max(90, Math.min(180, baseSystolic + (Math.random() - 0.5) * 30));
    const diastolic = Math.max(60, Math.min(110, baseDiastolic + (Math.random() - 0.5) * 20));
    const oxygenSaturation = Math.max(92, Math.min(100, 98 + (Math.random() - 0.5) * 6));
    const bodyTemperature = Math.max(96.5, Math.min(100.5, baseTemp + (Math.random() - 0.5) * 2));
    
    // Sleep hours calculation
    const sleepHours = isNight ? Math.random() * 2 + 6 : Math.random() * 1 + 7; // More sleep at night
    
    // Generate ECG pattern
    const ecgPattern = this.generateECGPattern();
    
    return {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'demo-user-1',
      heartRate: Math.round(heartRate),
      bloodPressureSystolic: Math.round(systolic),
      bloodPressureDiastolic: Math.round(diastolic),
      oxygenSaturation: Math.round(oxygenSaturation),
      bodyTemperature: Math.round(bodyTemperature * 10) / 10,
      ecgData: ecgPattern,
      steps: baseSteps + Math.floor(Math.random() * 1000),
      sleepHours: Math.round(sleepHours * 10) / 10,
      deviceInfo: {
        deviceId: 'SH-WB-001',
        deviceType: 'wristband',
        manufacturer: 'SehatifyTech',
        model: 'HealthBand Pro',
        isMedicalGrade: true,
        certifications: ['FDA', 'CE', 'ISO_13485'],
        firmwareVersion: '2.4.1'
      },
      dataQuality: {
        confidence: 0.85 + Math.random() * 0.15,
        signalQuality: this.getRandomSignalQuality(),
        artifactsDetected: Math.random() < 0.05 // 5% chance of artifacts
      },
      timestamp: now,
      syncedAt: now
    };
  }

  private generateECGPattern(): string {
    // Generate a realistic ECG pattern (simplified)
    const pattern = [];
    const basePattern = [0.1, 0.2, 0.8, 1.2, 0.4, 0.0, -0.3, 0.1, 0.1];
    
    for (let i = 0; i < basePattern.length; i++) {
      const variation = (Math.random() - 0.5) * 0.1;
      pattern.push((basePattern[i] + variation).toFixed(2));
    }
    
    return pattern.join(',');
  }

  private getRandomSignalQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
    const rand = Math.random();
    if (rand < 0.7) return 'excellent';
    if (rand < 0.9) return 'good';
    if (rand < 0.98) return 'fair';
    return 'poor';
  }

  startRealTimeUpdates(intervalMs: number = 3600000): void { // Default to 1 hour (3600000ms)
    console.log('MockHealthDataService: Starting automatic hourly vitals generation with interval:', intervalMs, 'ms');
    this.stopRealTimeUpdates();
    this.isAutoGenerating = true;
    
    // Generate initial data and populate historical data if empty
    if (this.historicalData.length === 0) {
      console.log('MockHealthDataService: Generating initial historical data for past 24 hours');
      this.generateInitialHistoricalData();
    }
    
    this.currentData = this.generateRealisticVitals();
    this.addToHistoricalData(this.currentData);
    console.log('MockHealthDataService: Generated initial current data:', this.currentData);
    this.notifyListeners(this.currentData);
    
    // Set up interval for hourly updates
    this.intervalId = setInterval(() => {
      this.currentData = this.generateRealisticVitals();
      this.addToHistoricalData(this.currentData);
      
      // Analyze trends and detect anomalies
      this.updateTrends();
      this.detectAnomalies();
      
      console.log('MockHealthDataService: Generated new hourly data:', {
        heartRate: this.currentData.heartRate,
        bloodPressure: `${this.currentData.bloodPressureSystolic}/${this.currentData.bloodPressureDiastolic}`,
        oxygenSaturation: this.currentData.oxygenSaturation,
        temperature: this.currentData.bodyTemperature,
        timestamp: this.currentData.timestamp.toLocaleTimeString(),
        healthScore: this.calculateHealthScore(this.currentData)
      });
      this.notifyListeners(this.currentData);
    }, intervalMs);
  }

  stopRealTimeUpdates(): void {
    console.log('MockHealthDataService: Stopping real-time updates');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(listener: (data: MockVitalSigns) => void): () => void {
    console.log('MockHealthDataService: New subscriber added. Current listeners:', this.listeners.size + 1);
    this.listeners.add(listener);
    
    // Send current data immediately if available
    if (this.currentData) {
      console.log('MockHealthDataService: Sending current data to new subscriber');
      listener(this.currentData);
    }
    
    return () => {
      console.log('MockHealthDataService: Subscriber removed');
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(data: MockVitalSigns): void {
    console.log('MockHealthDataService: Notifying', this.listeners.size, 'listeners');
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('MockHealthDataService: Error notifying listener:', error);
      }
    });
  }

  getCurrentVitals(): MockVitalSigns | null {
    return this.currentData;
  }

  getHistoricalData(limit: number = 20): MockVitalSigns[] {
    return this.historicalData.slice(0, limit);
  }

  // Generate comprehensive historical data for charts
  generateHistoricalData(days: number = 7): MockVitalSigns[] {
    const data: MockVitalSigns[] = [];
    const now = new Date();
    
    for (let i = days * 24; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)); // Go back hour by hour
      
      // More consistent data - only skip 10% of hours for realistic gaps
      if (Math.random() < 0.1) continue;
      
      const vitals = this.generateRealisticVitals();
      vitals.timestamp = timestamp;
      vitals.syncedAt = timestamp;
      vitals.id = `historical-${timestamp.getTime()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Add some realistic variations for historical data
      if (i > 168) { // Older than a week
        vitals.dataQuality.confidence *= 0.9; // Slightly lower confidence for older data
      }
      
      data.push(vitals);
    }
    
    return data.reverse(); // Oldest first
  }

  // Generate initial 24 hours of historical data
  private generateInitialHistoricalData(): void {
    const data = this.generateHistoricalData(1); // Last 24 hours
    this.historicalData = data;
    console.log(`MockHealthDataService: Generated ${data.length} historical data points for the last 24 hours`);
  }

  // Add data to historical collection with smart management
  private addToHistoricalData(vitals: MockVitalSigns): void {
    this.historicalData.unshift(vitals);
    
    // Keep data for the last 30 days (720 hours max)
    if (this.historicalData.length > 720) {
      this.historicalData = this.historicalData.slice(0, 720);
    }
  }

  // Update trend analysis
  private updateTrends(): void {
    if (this.historicalData.length < 5) return;

    const recent5 = this.historicalData.slice(0, 5);
    
    this.trendData = {
      heartRate: recent5.map(d => d.heartRate),
      systolic: recent5.map(d => d.bloodPressureSystolic),
      diastolic: recent5.map(d => d.bloodPressureDiastolic),
      oxygenSaturation: recent5.map(d => d.oxygenSaturation),
      temperature: recent5.map(d => d.bodyTemperature)
    };

    console.log('MockHealthDataService: Updated trends:', {
      heartRateTrend: this.calculateTrend(this.trendData.heartRate),
      bloodPressureTrend: this.calculateTrend(this.trendData.systolic),
      oxygenTrend: this.calculateTrend(this.trendData.oxygenSaturation)
    });
  }

  // Calculate trend direction (positive = increasing, negative = decreasing)
  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 3) return 'stable';
    
    const first = values[values.length - 1];
    const last = values[0];
    const change = (last - first) / first;
    
    if (change > 0.05) return 'increasing';
    if (change < -0.05) return 'decreasing';
    return 'stable';
  }

  // Detect health anomalies
  private detectAnomalies(): void {
    if (!this.currentData || !this.anomalyDetection) return;

    const anomalies: string[] = [];
    
    // Heart rate anomalies
    if (this.currentData.heartRate > 100) {
      anomalies.push('Elevated heart rate detected');
    } else if (this.currentData.heartRate < 50) {
      anomalies.push('Low heart rate detected');
    }
    
    // Blood pressure anomalies
    if (this.currentData.bloodPressureSystolic > 140 || this.currentData.bloodPressureDiastolic > 90) {
      anomalies.push('High blood pressure detected');
    }
    
    // Oxygen saturation anomalies
    if (this.currentData.oxygenSaturation < 95) {
      anomalies.push('Low oxygen saturation detected');
    }
    
    // Temperature anomalies
    if (this.currentData.bodyTemperature > 99.5) {
      anomalies.push('Elevated body temperature detected');
    } else if (this.currentData.bodyTemperature < 97.0) {
      anomalies.push('Low body temperature detected');
    }

    if (anomalies.length > 0) {
      console.warn('MockHealthDataService: Health anomalies detected:', anomalies);
    }
  }

  // Simulate device status
  getDeviceStatus() {
    return {
      connected: Math.random() > 0.1, // 90% chance of being connected
      batteryLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
      lastSync: new Date(Date.now() - Math.random() * 300000), // Last 5 minutes
      deviceModel: 'HealthBand Pro',
      firmwareVersion: '2.4.1'
    };
  }

  // Simulate health emergencies (rare)
  simulateEmergency(): boolean {
    return Math.random() < 0.001; // 0.1% chance
  }

  // Enhanced health score calculation with trend analysis
  calculateHealthScore(vitals: MockVitalSigns): number {
    let score = 0;
    const weights = { 
      heartRate: 0.20, 
      bloodPressure: 0.25, 
      oxygen: 0.20, 
      temperature: 0.15,
      consistency: 0.10,
      trend: 0.10
    };
    
    // Heart rate scoring (60-100 BPM is optimal)
    if (vitals.heartRate >= 60 && vitals.heartRate <= 100) {
      score += 100 * weights.heartRate;
    } else if (vitals.heartRate >= 50 && vitals.heartRate <= 120) {
      score += 70 * weights.heartRate;
    } else {
      score += 40 * weights.heartRate;
    }

    // Blood pressure scoring (120/80 or lower is optimal)
    if (vitals.bloodPressureSystolic <= 120 && vitals.bloodPressureDiastolic <= 80) {
      score += 100 * weights.bloodPressure;
    } else if (vitals.bloodPressureSystolic <= 140 && vitals.bloodPressureDiastolic <= 90) {
      score += 70 * weights.bloodPressure;
    } else {
      score += 40 * weights.bloodPressure;
    }

    // Oxygen saturation scoring (95% or higher is optimal)
    if (vitals.oxygenSaturation >= 95) {
      score += 100 * weights.oxygen;
    } else if (vitals.oxygenSaturation >= 90) {
      score += 70 * weights.oxygen;
    } else {
      score += 40 * weights.oxygen;
    }

    // Temperature scoring (97-99.5°F is optimal)
    if (vitals.bodyTemperature >= 97 && vitals.bodyTemperature <= 99.5) {
      score += 100 * weights.temperature;
    } else {
      score += 60 * weights.temperature;
    }

    // Data quality and consistency scoring
    score += vitals.dataQuality.confidence * 100 * weights.consistency;

    // Trend scoring (stable trends are good)
    if (this.trendData.heartRate && this.trendData.heartRate.length >= 3) {
      const heartTrend = this.calculateTrend(this.trendData.heartRate);
      const bpTrend = this.calculateTrend(this.trendData.systolic);
      
      if (heartTrend === 'stable' && bpTrend === 'stable') {
        score += 100 * weights.trend;
      } else if (heartTrend !== 'stable' || bpTrend !== 'stable') {
        score += 70 * weights.trend;
      } else {
        score += 50 * weights.trend;
      }
    } else {
      score += 80 * weights.trend; // Default for insufficient data
    }

    const finalScore = Math.round(score);
    this.lastHealthScore = finalScore;
    return finalScore;
  }

  // Get health insights based on current data and trends
  getHealthInsights(): {
    score: number;
    trends: { [key: string]: string };
    recommendations: string[];
    alerts: string[];
  } {
    if (!this.currentData) {
      return {
        score: 0,
        trends: {},
        recommendations: ['Connect your wristband to start monitoring'],
        alerts: []
      };
    }

    const insights = {
      score: this.calculateHealthScore(this.currentData),
      trends: {
        heartRate: this.trendData.heartRate ? this.calculateTrend(this.trendData.heartRate) : 'stable',
        bloodPressure: this.trendData.systolic ? this.calculateTrend(this.trendData.systolic) : 'stable',
        oxygenSaturation: this.trendData.oxygenSaturation ? this.calculateTrend(this.trendData.oxygenSaturation) : 'stable'
      },
      recommendations: this.generateRecommendations(),
      alerts: this.generateAlerts()
    };

    return insights;
  }

  // Generate personalized health recommendations
  private generateRecommendations(): string[] {
    if (!this.currentData) return [];

    const recommendations: string[] = [];
    
    if (this.currentData.heartRate > 90) {
      recommendations.push('Consider relaxation techniques to lower heart rate');
    }
    
    if (this.currentData.bloodPressureSystolic > 130) {
      recommendations.push('Monitor sodium intake and consider light exercise');
    }
    
    if (this.currentData.steps && this.currentData.steps < 8000) {
      recommendations.push('Try to increase daily steps for better cardiovascular health');
    }
    
    if (this.currentData.sleepHours && this.currentData.sleepHours < 7) {
      recommendations.push('Aim for 7-8 hours of sleep for optimal recovery');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Your vitals are looking healthy');
      recommendations.push('Continue your current healthy lifestyle');
    }
    
    return recommendations;
  }

  // Generate health alerts
  private generateAlerts(): string[] {
    if (!this.currentData) return [];

    const alerts: string[] = [];
    
    if (this.currentData.heartRate > 120) {
      alerts.push('High heart rate detected - consider consulting a healthcare provider');
    }
    
    if (this.currentData.bloodPressureSystolic > 140 || this.currentData.bloodPressureDiastolic > 90) {
      alerts.push('High blood pressure detected - please monitor closely');
    }
    
    if (this.currentData.oxygenSaturation < 92) {
      alerts.push('Low oxygen saturation - seek immediate medical attention if persistent');
    }
    
    return alerts;
  }

  // Get detailed vitals summary
  getVitalsSummary(): {
    current: MockVitalSigns | null;
    last24Hours: MockVitalSigns[];
    averages: { [key: string]: number };
    dataPoints: number;
  } {
    const last24Hours = this.historicalData.slice(0, 24);
    
    const averages: { [key: string]: number } = last24Hours.length > 0 ? {
      heartRate: Math.round(last24Hours.reduce((sum, v) => sum + v.heartRate, 0) / last24Hours.length),
      systolic: Math.round(last24Hours.reduce((sum, v) => sum + v.bloodPressureSystolic, 0) / last24Hours.length),
      diastolic: Math.round(last24Hours.reduce((sum, v) => sum + v.bloodPressureDiastolic, 0) / last24Hours.length),
      oxygenSaturation: Math.round(last24Hours.reduce((sum, v) => sum + v.oxygenSaturation, 0) / last24Hours.length),
      temperature: Math.round((last24Hours.reduce((sum, v) => sum + v.bodyTemperature, 0) / last24Hours.length) * 10) / 10
    } : {};

    return {
      current: this.currentData,
      last24Hours,
      averages,
      dataPoints: this.historicalData.length
    };
  }

  // Control auto-generation
  setAutoGeneration(enabled: boolean): void {
    this.isAutoGenerating = enabled;
    console.log(`MockHealthDataService: Auto-generation ${enabled ? 'enabled' : 'disabled'}`);
    if (!enabled && this.intervalId) {
      this.stopRealTimeUpdates();
    }
  }

  // Manual data generation (for testing)
  generateManualReading(): MockVitalSigns {
    const vitals = this.generateRealisticVitals();
    this.currentData = vitals;
    this.addToHistoricalData(vitals);
    this.updateTrends();
    this.detectAnomalies();
    this.notifyListeners(vitals);
    console.log('MockHealthDataService: Manual reading generated:', vitals);
    return vitals;
  }
}

// Export singleton instance
export const mockHealthService = MockHealthDataService.getInstance();