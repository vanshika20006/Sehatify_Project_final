import { useTranslation } from 'react-i18next';
import { Heart, Droplets, Thermometer, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useHealthData } from '@/hooks/use-health-data';

interface HealthCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  status: 'normal' | 'warning' | 'critical';
  progress?: number;
  trend?: 'up' | 'down' | 'stable';
}

function HealthCard({ title, value, unit, icon, status, progress, trend }: HealthCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(status)}`}>
            {icon}
          </div>
          <Badge variant="secondary" className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold" data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
            <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
          </h3>
          <p className="text-sm text-muted-foreground" data-testid={`text-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {title}
          </p>
          
          {progress !== undefined && (
            <div className="mt-4">
              <Progress 
                value={progress} 
                className="h-2"
                style={{
                  '--progress-background': getProgressColor(status)
                } as React.CSSProperties}
              />
            </div>
          )}
          
          {trend && (
            <div className="flex items-center text-xs text-muted-foreground">
              <span className={`mr-1 ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
              </span>
              {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function HealthCards() {
  const { t } = useTranslation();
  const { currentVitals, isLoading, error } = useHealthData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-20 h-8 bg-gray-200 rounded"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load health data</p>
      </div>
    );
  }

  if (!currentVitals) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No health data available</p>
      </div>
    );
  }

  const getHeartRateStatus = (hr: number) => {
    if (hr >= 60 && hr <= 100) return 'normal';
    if (hr >= 50 && hr < 60 || hr > 100 && hr <= 120) return 'warning';
    return 'critical';
  };

  const getBloodPressureStatus = (systolic: number, diastolic: number) => {
    if (systolic <= 120 && diastolic <= 80) return 'normal';
    if (systolic <= 140 && diastolic <= 90) return 'warning';
    return 'critical';
  };

  const getOxygenStatus = (spo2: number) => {
    if (spo2 >= 95) return 'normal';
    if (spo2 >= 90) return 'warning';
    return 'critical';
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp >= 97 && temp <= 99.5) return 'normal';
    if (temp >= 99.6 && temp <= 100.4 || temp >= 96 && temp < 97) return 'warning';
    return 'critical';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <HealthCard
        title={t('heart_rate')}
        value={currentVitals.heartRate.toString()}
        unit="BPM"
        icon={<Heart className="w-6 h-6 animate-pulse" />}
        status={getHeartRateStatus(currentVitals.heartRate)}
        progress={(currentVitals.heartRate / 120) * 100}
        trend="stable"
      />
      
      <HealthCard
        title={t('blood_pressure')}
        value={`${currentVitals.bloodPressureSystolic}/${currentVitals.bloodPressureDiastolic}`}
        unit="mmHg"
        icon={<Droplets className="w-6 h-6" />}
        status={getBloodPressureStatus(currentVitals.bloodPressureSystolic, currentVitals.bloodPressureDiastolic)}
        progress={(currentVitals.bloodPressureSystolic / 160) * 100}
        trend="stable"
      />
      
      <HealthCard
        title={t('oxygen_saturation')}
        value={currentVitals.oxygenSaturation.toString()}
        unit="%"
        icon={<Activity className="w-6 h-6" />}
        status={getOxygenStatus(currentVitals.oxygenSaturation)}
        progress={currentVitals.oxygenSaturation}
        trend="stable"
      />
      
      <HealthCard
        title={t('body_temperature')}
        value={currentVitals.bodyTemperature.toFixed(1)}
        unit="°F"
        icon={<Thermometer className="w-6 h-6" />}
        status={getTemperatureStatus(currentVitals.bodyTemperature)}
        progress={((currentVitals.bodyTemperature - 95) / 10) * 100}
        trend="stable"
      />
    </div>
  );
}
