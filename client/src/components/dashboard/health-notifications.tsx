import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Send,
  User,
  Calendar,
  FileText,
  Stethoscope
} from 'lucide-react';

interface HealthNotification {
  id: string;
  type: 'improvement' | 'decline' | 'anomaly' | 'emergency';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  consultationFee: number;
}

export function HealthNotifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<HealthNotification[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    // Simulate health notifications
    setNotifications([
      {
        id: '1',
        type: 'anomaly',
        message: 'Blood pressure readings have been consistently elevated over the past 3 days',
        severity: 'warning',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        acknowledged: false,
        actionRequired: true
      },
      {
        id: '2',
        type: 'improvement',
        message: 'Your sleep quality has improved by 25% this week',
        severity: 'info',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        acknowledged: false,
        actionRequired: false
      },
      {
        id: '3',
        type: 'decline',
        message: 'Heart rate variability shows signs of increased stress levels',
        severity: 'warning',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        acknowledged: false,
        actionRequired: true
      }
    ]);

    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const acknowledgeNotification = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, acknowledged: true } : notif
    ));
  };

  const generateAndSendReport = async () => {
    if (!selectedDoctor) return;

    setIsGeneratingReport(true);
    try {
      // Generate health prediction report
      const predictionResponse = await fetch('/api/health/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          period: '1week',
          historicalData: [], // Would be populated with actual data
          userProfile: { age: 30, gender: 'male' } // Would be from user profile
        })
      });

      if (predictionResponse.ok) {
        const predictionData = await predictionResponse.json();
        
        // Generate doctor report
        const reportResponse = await fetch('/api/health/doctor-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            patientData: {
              name: 'User',
              age: 30,
              gender: 'male',
              medicalHistory: 'No significant medical history'
            },
            healthPrediction: predictionData.prediction,
            recentVitals: [],
            labReports: []
          })
        });

        if (reportResponse.ok) {
          const reportData = await reportResponse.json();
          
          // Send report to doctor
          const sendResponse = await fetch('/api/doctors/send-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              doctorId: selectedDoctor,
              report: reportData.report,
              patientData: { name: 'User', age: 30 }
            })
          });

          if (sendResponse.ok) {
            setReportSent(true);
            setTimeout(() => setReportSent(false), 3000);
          }
        }
      }
    } catch (error) {
      console.error('Error generating/sending report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const unacknowledgedNotifications = notifications.filter(n => !n.acknowledged);
  const actionRequiredNotifications = notifications.filter(n => n.actionRequired && !n.acknowledged);

  return (
    <div className="space-y-6">
      {/* Notifications Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Health Notifications
            {unacknowledgedNotifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unacknowledgedNotifications.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            AI-powered health change detection and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">No health notifications at this time</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  notification.acknowledged 
                    ? 'border-gray-200 bg-gray-50 opacity-60' 
                    : getSeverityColor(notification.severity)
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getSeverityIcon(notification.severity)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp.toLocaleString()}
                      </p>
                      {notification.actionRequired && !notification.acknowledged && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Action Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!notification.acknowledged && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => acknowledgeNotification(notification.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Doctor Report Generation */}
      {actionRequiredNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Consult Doctor
            </CardTitle>
            <CardDescription>
              Send your health data and AI analysis to a preferred doctor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportSent && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Health report sent successfully! Your doctor will review it and respond within 24 hours.
                </AlertDescription>
              </Alert>
            )}
            
            <div>
              <label className="text-sm font-medium mb-2 block">Select Doctor</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Choose a doctor...</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty} ({doctor.hospital}) - ₹{doctor.consultationFee}
                  </option>
                ))}
              </select>
            </div>

            {selectedDoctor && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Report will include:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AI health prediction analysis (1-week forecast)</li>
                  <li>• Current health concerns and anomalies</li>
                  <li>• Recent vital signs trends</li>
                  <li>• Recommended actions and tests</li>
                  <li>• Emergency contact information if needed</li>
                </ul>
              </div>
            )}

            <Button
              onClick={generateAndSendReport}
              disabled={!selectedDoctor || isGeneratingReport}
              className="w-full"
            >
              {isGeneratingReport ? (
                <>
                  <FileText className="w-4 h-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate & Send Health Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}