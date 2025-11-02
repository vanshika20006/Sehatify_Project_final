import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHealthData } from '@/hooks/use-health-data';
import { format, subDays } from 'date-fns';

export function VitalCharts() {
  const { t } = useTranslation();
  const { historicalData, isLoading } = useHealthData();

  // Generate sample data for demonstration
  const chartData = useMemo(() => {
    if (historicalData && historicalData.length > 0) {
      return historicalData.map(vital => {
        // Ensure timestamp is a valid Date object with proper validation
        let timestamp: Date;
        
        if (vital.timestamp instanceof Date) {
          timestamp = vital.timestamp;
        } else if (vital.timestamp) {
          const dateAttempt = new Date(vital.timestamp);
          // Check if the date is valid
          timestamp = isNaN(dateAttempt.getTime()) ? new Date() : dateAttempt;
        } else {
          // Fallback to current date if timestamp is null/undefined
          timestamp = new Date();
        }
        
        return {
          date: format(timestamp, 'MMM dd'),
          time: format(timestamp, 'HH:mm'),
          heartRate: vital.heartRate,
          systolic: vital.bloodPressureSystolic,
          diastolic: vital.bloodPressureDiastolic,
          oxygenSaturation: vital.oxygenSaturation,
          temperature: vital.bodyTemperature
        };
      });
    }

    // Fallback sample data for last 7 days
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'MMM dd'),
        time: format(date, 'HH:mm'),
        heartRate: 65 + Math.floor(Math.random() * 20),
        systolic: 115 + Math.floor(Math.random() * 15),
        diastolic: 75 + Math.floor(Math.random() * 10),
        oxygenSaturation: 96 + Math.floor(Math.random() * 4),
        temperature: 98.0 + Math.random() * 1.4
      };
    });
  }, [historicalData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card data-testid="card-health-trends">
        <CardHeader>
          <CardTitle>Health Trends</CardTitle>
          <CardDescription>Your vital signs over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="heartRate" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="heartRate" data-testid="tab-heart-rate">Heart Rate</TabsTrigger>
              <TabsTrigger value="bloodPressure" data-testid="tab-blood-pressure">Blood Pressure</TabsTrigger>
              <TabsTrigger value="oxygen" data-testid="tab-oxygen">SpO₂</TabsTrigger>
              <TabsTrigger value="temperature" data-testid="tab-temperature">Temperature</TabsTrigger>
            </TabsList>

            <TabsContent value="heartRate" className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[50, 120]} />
                    <Tooltip 
                      labelStyle={{ color: '#000' }}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-muted-foreground">
                Normal range: 60-100 BPM
              </div>
            </TabsContent>

            <TabsContent value="bloodPressure" className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[60, 160]} />
                    <Tooltip 
                      labelStyle={{ color: '#000' }}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="systolic" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Systolic"
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="diastolic" 
                      stroke="#06b6d4" 
                      strokeWidth={2}
                      name="Diastolic"
                      dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-muted-foreground">
                Normal range: 120/80 mmHg or lower
              </div>
            </TabsContent>

            <TabsContent value="oxygen" className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[90, 100]} />
                    <Tooltip 
                      labelStyle={{ color: '#000' }}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="oxygenSaturation" 
                      stroke="#10b981" 
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-muted-foreground">
                Normal range: 95-100%
              </div>
            </TabsContent>

            <TabsContent value="temperature" className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[96, 101]} />
                    <Tooltip 
                      labelStyle={{ color: '#000' }}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-muted-foreground">
                Normal range: 97.0-99.5°F
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card data-testid="card-activity-summary">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your health activities and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">✓</span>
              </div>
              <div>
                <p className="font-medium text-sm" data-testid="text-activity-medication">Morning medication taken</p>
                <p className="text-xs text-muted-foreground">8:00 AM</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                <span className="text-sm">👟</span>
              </div>
              <div>
                <p className="font-medium text-sm" data-testid="text-activity-steps">Daily step goal achieved</p>
                <p className="text-xs text-muted-foreground">10,000 steps</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center">
                <span className="text-sm">📊</span>
              </div>
              <div>
                <p className="font-medium text-sm" data-testid="text-activity-report">Weekly report generated</p>
                <p className="text-xs text-muted-foreground">Shared with Dr. Smith</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
