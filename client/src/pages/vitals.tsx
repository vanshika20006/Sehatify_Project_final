import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Droplets, 
  Zap,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useHealthData } from '@/hooks/use-health-data';
import { Sidebar } from '@/components/layout/sidebar';

interface VitalSignsInput {
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  bodyTemperature: number;
  steps: number;
  sleepHours: number;
}

export function VitalsPage() {
  const { t } = useTranslation();
  const { currentVitals, historicalData, addVitalSigns, isLoading } = useHealthData();
  const [newVitals, setNewVitals] = useState<VitalSignsInput>({
    heartRate: 75,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    oxygenSaturation: 98,
    bodyTemperature: 98.6,
    steps: 8000,
    sleepHours: 7.5
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInputChange = (field: keyof VitalSignsInput, value: number) => {
    setNewVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveVitals = async () => {
    setIsSaving(true);
    try {
      await addVitalSigns({
        ...newVitals,
        timestamp: new Date(),
        deviceInfo: {
          deviceId: 'manual-input',
          deviceType: 'manual_entry' as const,
          manufacturer: 'Manual Entry',
          model: 'User Input',
          isMedicalGrade: false
        },
        dataQuality: {
          confidence: 0.8,
          signalQuality: 'good' as const,
          artifactsDetected: false
        }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save vitals:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getVitalStatus = (value: number, normal: [number, number], label: string) => {
    if (value >= normal[0] && value <= normal[1]) {
      return { status: 'normal', color: 'text-green-600', icon: CheckCircle };
    }
    return { status: 'abnormal', color: 'text-red-600', icon: AlertCircle };
  };

  const calculateTrend = (current: number, historical: number[]) => {
    if (historical.length < 2) return null;
    const recent = historical.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    const older = historical.slice(-6, -3).reduce((sum, val) => sum + val, 0) / 3;
    return recent > older ? 'up' : recent < older ? 'down' : 'stable';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Health Vitals Management</h1>
          
          {saveSuccess && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Vitals saved successfully! Analysis is being processed.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input New Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Record New Vitals
                </CardTitle>
                <CardDescription>
                  Manually input your current health measurements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      value={newVitals.heartRate}
                      onChange={(e) => handleInputChange('heartRate', parseInt(e.target.value))}
                      min="40"
                      max="200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
                    <Input
                      id="oxygenSaturation"
                      type="number"
                      value={newVitals.oxygenSaturation}
                      onChange={(e) => handleInputChange('oxygenSaturation', parseInt(e.target.value))}
                      min="80"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bloodPressureSystolic">Systolic BP (mmHg)</Label>
                    <Input
                      id="bloodPressureSystolic"
                      type="number"
                      value={newVitals.bloodPressureSystolic}
                      onChange={(e) => handleInputChange('bloodPressureSystolic', parseInt(e.target.value))}
                      min="80"
                      max="200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bloodPressureDiastolic">Diastolic BP (mmHg)</Label>
                    <Input
                      id="bloodPressureDiastolic"
                      type="number"
                      value={newVitals.bloodPressureDiastolic}
                      onChange={(e) => handleInputChange('bloodPressureDiastolic', parseInt(e.target.value))}
                      min="50"
                      max="120"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bodyTemperature">Temperature (°F)</Label>
                    <Input
                      id="bodyTemperature"
                      type="number"
                      step="0.1"
                      value={newVitals.bodyTemperature}
                      onChange={(e) => handleInputChange('bodyTemperature', parseFloat(e.target.value))}
                      min="95"
                      max="110"
                    />
                  </div>
                  <div>
                    <Label htmlFor="steps">Steps Today</Label>
                    <Input
                      id="steps"
                      type="number"
                      value={newVitals.steps}
                      onChange={(e) => handleInputChange('steps', parseInt(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="sleepHours">Sleep Hours</Label>
                    <Input
                      id="sleepHours"
                      type="number"
                      step="0.1"
                      value={newVitals.sleepHours}
                      onChange={(e) => handleInputChange('sleepHours', parseFloat(e.target.value))}
                      min="0"
                      max="24"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveVitals} disabled={isSaving} className="w-full">
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Vitals
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Current Vitals Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Current Vitals Status
                </CardTitle>
                <CardDescription>
                  Latest recorded measurements with health indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentVitals ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Heart Rate</p>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{currentVitals.heartRate} BPM</p>
                          {(() => {
                            const status = getVitalStatus(currentVitals.heartRate, [60, 100], 'Heart Rate');
                            const StatusIcon = status.icon;
                            return <StatusIcon className={`w-4 h-4 ${status.color}`} />;
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Blood Pressure</p>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {currentVitals.bloodPressureSystolic}/{currentVitals.bloodPressureDiastolic}
                          </p>
                          {(() => {
                            const status = getVitalStatus(currentVitals.bloodPressureSystolic, [90, 140], 'BP Systolic');
                            const StatusIcon = status.icon;
                            return <StatusIcon className={`w-4 h-4 ${status.color}`} />;
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Droplets className="w-5 h-5 text-cyan-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">SpO₂</p>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{currentVitals.oxygenSaturation}%</p>
                          {(() => {
                            const status = getVitalStatus(currentVitals.oxygenSaturation, [95, 100], 'SpO2');
                            const StatusIcon = status.icon;
                            return <StatusIcon className={`w-4 h-4 ${status.color}`} />;
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Thermometer className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Temperature</p>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{currentVitals.bodyTemperature}°F</p>
                          {(() => {
                            const status = getVitalStatus(currentVitals.bodyTemperature, [97, 99], 'Temperature');
                            const StatusIcon = status.icon;
                            return <StatusIcon className={`w-4 h-4 ${status.color}`} />;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No vitals recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historical Data */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Historical Trends
                </CardTitle>
                <CardDescription>
                  Track your health measurements over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historicalData.length > 0 ? (
                  <div className="space-y-4">
                    {historicalData.slice(0, 10).map((vital, index) => (
                      <div key={vital.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{new Date(vital.timestamp).toLocaleDateString()}</Badge>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <span>HR: {vital.heartRate} BPM</span>
                            <span>BP: {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}</span>
                            <span>SpO₂: {vital.oxygenSaturation}%</span>
                            <span>Temp: {vital.bodyTemperature}°F</span>
                          </div>
                        </div>
                        {index === 0 && <Badge>Latest</Badge>}
                      </div>
                    ))}
                    {historicalData.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Showing 10 most recent entries of {historicalData.length} total
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No historical data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}