import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Brain,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Upload,
  X,
  Eye,
  Trash2,
  FileImage,
  FilePlus,
  Apple,
  Dumbbell,
  Video,
  Heart,
  Activity
} from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { useHealthData } from '@/hooks/use-health-data';
import { useAuth } from '@/hooks/use-auth';
import { mockHealthService } from '@/services/mock-health-data';

interface HealthReport {
  id: string;
  type: 'weekly' | 'monthly' | 'custom' | 'ai-prediction';
  title: string;
  generatedDate: Date;
  content: string;
  summary: string;
  recommendations: string[];
  riskFactors: string[];
  status: 'generated' | 'sent_to_doctor' | 'reviewed';
}

interface MedicalFile {
  id: string;
  fileName: string;
  originalFileName: string;
  fileType: 'pdf' | 'jpeg' | 'png';
  reportType: 'lab_report' | 'xray' | 'prescription' | 'medical_record' | 'other';
  fileSize: number;
  uploadedAt: string;
  isAnalyzed: boolean;
  analysis?: {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    dietPlan?: { breakfast: string[]; lunch: string[]; dinner: string[]; snacks: string[] };
    exercisePlan?: { cardio: string[]; strength: string[]; flexibility: string[] };
    youtubeVideos?: { title: string; searchTerm: string }[];
    lifestyleChanges?: string[];
    actionPlan?: { immediate: string[]; shortTerm: string[]; longTerm: string[] };
    followUpNeeded: boolean;
  };
}

export function ReportsPage() {
  const { t } = useTranslation();
  const { historicalData } = useHealthData();
  const { user } = useAuth();
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'1week' | '2week' | '1month'>('1week');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  
  // File upload state
  const [medicalFiles, setMedicalFiles] = useState<MedicalFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileAnalysis, setSelectedFileAnalysis] = useState<MedicalFile | null>(null);

  useEffect(() => {
    fetchDoctors();
    generateSampleReports();
    fetchMedicalFiles();
  }, []);

  const fetchMedicalFiles = async () => {
    try {
      const response = await fetch('/api/uploads', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMedicalFiles(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching medical files:', error);
    }
  };

  const handleFileUpload = async (file: File, reportType: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportType', reportType);

    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setMedicalFiles(prev => [data.report, ...prev]);
        setUploadProgress(100);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`❌ Sorry, I encountered an error while uploading and analyzing your document. Please try again or contact support if the issue persists.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const response = await fetch(`/api/uploads/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setMedicalFiles(prev => prev.filter(f => f.id !== fileId));
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string, reportType: string) => {
    if (reportType === 'xray') return <FileImage className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const getReportTypeBadge = (reportType: string) => {
    const colors = {
      lab_report: 'bg-blue-100 text-blue-800',
      xray: 'bg-purple-100 text-purple-800', 
      prescription: 'bg-green-100 text-green-800',
      medical_record: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[reportType as keyof typeof colors] || colors.other;
  };

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

  const generateSampleReports = () => {
    // Get current health insights from mock service
    const healthInsights = mockHealthService.getHealthInsights();
    const vitalsSummary = mockHealthService.getVitalsSummary();
    
    const sampleReports: HealthReport[] = [
      {
        id: '1',
        type: 'weekly',
        title: 'Hourly Vitals Analysis - Past Week',
        generatedDate: new Date(),
        content: `# Comprehensive Hourly Health Monitoring Report
        
## Data Overview
- **Total Data Points**: ${vitalsSummary.dataPoints}
- **Monitoring Period**: Continuous hourly tracking
- **Health Score**: ${healthInsights.score}/100
- **Data Quality**: Excellent (98.5% reliability)

## Key Findings
Based on ${vitalsSummary.dataPoints} hourly measurements over the past week:

### Heart Rate Analysis
- **Average**: ${vitalsSummary.averages.heartRate || 72} BPM
- **Trend**: ${healthInsights.trends.heartRate}
- **Circadian Pattern**: Normal variation observed (lower at night, higher during activity)

### Blood Pressure Analysis  
- **Average**: ${vitalsSummary.averages.systolic || 120}/${vitalsSummary.averages.diastolic || 80} mmHg
- **Trend**: ${healthInsights.trends.bloodPressure}
- **Risk Assessment**: ${healthInsights.alerts.length > 0 ? 'Attention needed' : 'Within normal range'}

### Oxygen Saturation
- **Average**: ${vitalsSummary.averages.oxygenSaturation || 98}%
- **Consistency**: High (excellent respiratory function)

### Temperature Regulation
- **Average**: ${vitalsSummary.averages.temperature || 98.6}°F
- **Circadian Rhythm**: Normal pattern detected

## Continuous Monitoring Benefits
- **Early Detection**: 24/7 monitoring enables early detection of health changes
- **Trend Analysis**: Hour-by-hour data reveals patterns invisible in single measurements
- **Personalized Baselines**: Your unique health patterns are being established
- **Predictive Insights**: AI analysis of continuous data provides future health predictions`,
        summary: `Continuous hourly monitoring shows ${healthInsights.score >= 85 ? 'excellent' : healthInsights.score >= 70 ? 'good' : 'concerning'} health patterns with ${vitalsSummary.dataPoints} data points analyzed`,
        recommendations: healthInsights.recommendations,
        riskFactors: healthInsights.alerts,
        status: 'generated'
      },
      {
        id: '2',
        type: 'ai-prediction',
        title: 'Predictive Health Analysis - Hourly Data Trends',
        generatedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        content: `# AI-Powered Predictive Health Analysis

## Trend Analysis Summary
Based on continuous hourly vital signs monitoring, our AI has identified the following patterns:

### Heart Rate Trends
- **Current Trend**: ${healthInsights.trends.heartRate}
- **Prediction**: ${healthInsights.trends.heartRate === 'stable' ? 'Continued healthy heart rate patterns expected' : 'Heart rate trend requires monitoring'}

### Blood Pressure Outlook
- **Current Trend**: ${healthInsights.trends.bloodPressure}
- **Risk Level**: ${healthInsights.alerts.length > 0 ? 'Elevated - requires attention' : 'Low - maintaining healthy levels'}

### Sleep & Recovery Patterns
- **Sleep Quality**: Good (based on night-time vital signs)
- **Recovery Rate**: Normal physiological recovery observed

### Weekly Health Score Trend
- **Current Score**: ${healthInsights.score}/100
- **7-Day Average**: ${Math.max(75, healthInsights.score - 5)}/100
- **Trend**: ${healthInsights.score >= 80 ? 'Improving' : 'Stable'}

## Personalized Recommendations
The following recommendations are based on YOUR specific hourly data patterns:

### Immediate Actions (Next 24-48 hours)
${healthInsights.recommendations.slice(0, 2).map(rec => `- ${rec}`).join('\n')}

### Weekly Goals
- Maintain current positive health trends
- Continue hourly monitoring for comprehensive health tracking
- Focus on consistency in daily routines

### Long-term Health Optimization
- Build upon identified healthy patterns
- Address any emerging trends early
- Leverage continuous data for preventive care`,
        summary: `AI analysis of hourly vitals data reveals ${healthInsights.trends.heartRate === 'stable' && healthInsights.trends.bloodPressure === 'stable' ? 'stable, healthy patterns' : 'trends requiring attention'} with personalized optimization opportunities`,
        recommendations: [
          ...healthInsights.recommendations,
          'Continue hourly monitoring for comprehensive health insights',
          'Review trends weekly to identify early health changes',
          'Share continuous data with healthcare provider for better care'
        ],
        riskFactors: healthInsights.alerts.length > 0 ? healthInsights.alerts : ['No significant risk factors detected with current monitoring'],
        status: 'generated'
      }
    ];
    setReports(sampleReports);
  };

  const generateNewReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/health/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          period: selectedPeriod,
          historicalData: historicalData.slice(-30), // Last 30 readings
          userProfile: {
            age: 30,
            gender: 'male',
            medicalHistory: 'No significant medical history'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newReport: HealthReport = {
          id: Date.now().toString(),
          type: 'ai-prediction',
          title: `${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Health Prediction`,
          generatedDate: new Date(),
          content: data.prediction.analysis,
          summary: data.prediction.analysis.substring(0, 100) + '...',
          recommendations: data.prediction.recommendedActions,
          riskFactors: data.prediction.riskFactors,
          status: 'generated'
        };
        setReports(prev => [newReport, ...prev]);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendReportToDoctor = async (reportId: string) => {
    if (!selectedDoctor) return;

    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    try {
      const response = await fetch('/api/doctors/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          doctorId: selectedDoctor,
          report: report.content,
          patientData: {
            name: user?.email || 'User',
            age: 30,
            gender: 'male'
          }
        })
      });

      if (response.ok) {
        setReports(prev => prev.map(r => 
          r.id === reportId 
            ? { ...r, status: 'sent_to_doctor' as const }
            : r
        ));
      }
    } catch (error) {
      console.error('Error sending report:', error);
    }
  };

  const downloadReport = (report: HealthReport) => {
    const reportContent = `
# ${report.title}
Generated: ${report.generatedDate.toLocaleDateString()}

## Summary
${report.summary}

## Detailed Analysis
${report.content}

## Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Risk Factors
${report.riskFactors.map(risk => `- ${risk}`).join('\n')}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}_${report.generatedDate.toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Generated</Badge>;
      case 'sent_to_doctor':
        return <Badge className="bg-blue-100 text-blue-800"><Send className="w-3 h-3 mr-1" />Sent to Doctor</Badge>;
      case 'reviewed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Reviewed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskLevelColor = (riskFactors: string[]) => {
    if (riskFactors.length === 0) return 'text-green-600';
    if (riskFactors.length <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Health Reports & Medical Files</h1>

          <Tabs defaultValue="reports" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reports">AI Reports</TabsTrigger>
              <TabsTrigger value="uploads">Medical Files</TabsTrigger>
              <TabsTrigger value="lab-booking">Lab Booking</TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-6">
              {/* Hourly Data Analytics Dashboard */}
              {historicalData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Hourly Monitoring Analytics
                    </CardTitle>
                    <CardDescription>
                      Real-time analysis of your continuous health monitoring data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {mockHealthService.getVitalsSummary().dataPoints}
                        </div>
                        <div className="text-sm text-blue-600">Total Data Points</div>
                        <div className="text-xs text-muted-foreground">
                          Hourly recordings
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {mockHealthService.getHealthInsights().score}
                        </div>
                        <div className="text-sm text-green-600">Health Score</div>
                        <div className="text-xs text-muted-foreground">
                          Out of 100
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          24/7
                        </div>
                        <div className="text-sm text-purple-600">Monitoring</div>
                        <div className="text-xs text-muted-foreground">
                          Continuous tracking
                        </div>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {mockHealthService.getHealthInsights().trends.heartRate === 'stable' ? '✓' : '⚠'}
                        </div>
                        <div className="text-sm text-orange-600">Trends</div>
                        <div className="text-xs text-muted-foreground">
                          {mockHealthService.getHealthInsights().trends.heartRate} patterns
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Current Averages (24h)
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Heart Rate:</span>
                            <span className="font-medium">{mockHealthService.getVitalsSummary().averages.heartRate || 72} BPM</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Blood Pressure:</span>
                            <span className="font-medium">{mockHealthService.getVitalsSummary().averages.systolic || 120}/{mockHealthService.getVitalsSummary().averages.diastolic || 80} mmHg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Oxygen Saturation:</span>
                            <span className="font-medium">{mockHealthService.getVitalsSummary().averages.oxygenSaturation || 98}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Temperature:</span>
                            <span className="font-medium">{mockHealthService.getVitalsSummary().averages.temperature || 98.6}°F</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          Trend Analysis
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Heart Rate Trend:</span>
                            <Badge variant={mockHealthService.getHealthInsights().trends.heartRate === 'stable' ? 'default' : 'destructive'}>
                              {mockHealthService.getHealthInsights().trends.heartRate}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Blood Pressure Trend:</span>
                            <Badge variant={mockHealthService.getHealthInsights().trends.bloodPressure === 'stable' ? 'default' : 'destructive'}>
                              {mockHealthService.getHealthInsights().trends.bloodPressure}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Data Quality:</span>
                            <Badge variant="default">Excellent</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Monitoring Status:</span>
                            <Badge variant="default">Active</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {mockHealthService.getHealthInsights().alerts.length > 0 && (
                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Health Alerts:</strong> {mockHealthService.getHealthInsights().alerts.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Report Generation */}
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Generate AI Health Report
              </CardTitle>
              <CardDescription>
                Create predictive health analysis based on your recent data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Prediction Period</label>
                  <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1week">1 Week Prediction</SelectItem>
                      <SelectItem value="2week">2 Week Prediction</SelectItem>
                      <SelectItem value="1month">1 Month Prediction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex items-end">
                  <Button 
                    onClick={generateNewReport} 
                    disabled={isGenerating || historicalData.length < 5}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Brain className="w-4 h-4 mr-2 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate AI Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {historicalData.length < 5 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You need at least 5 health data points to generate meaningful predictions. 
                    Please record more vitals in the Vitals section.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="grid grid-cols-1 gap-6">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {report.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {report.generatedDate.toLocaleDateString()}
                        </span>
                        {getStatusBadge(report.status)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => downloadReport(report)}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">{report.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Recommendations ({report.recommendations.length})
                      </h4>
                      <ul className="text-sm space-y-1">
                        {report.recommendations.slice(0, 3).map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                        {report.recommendations.length > 3 && (
                          <li className="text-muted-foreground">
                            +{report.recommendations.length - 3} more recommendations
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${getRiskLevelColor(report.riskFactors)}`} />
                        Risk Factors ({report.riskFactors.length})
                      </h4>
                      {report.riskFactors.length > 0 ? (
                        <ul className="text-sm space-y-1">
                          {report.riskFactors.slice(0, 3).map((risk, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-600">•</span>
                              <span>{risk}</span>
                            </li>
                          ))}
                          {report.riskFactors.length > 3 && (
                            <li className="text-muted-foreground">
                              +{report.riskFactors.length - 3} more risk factors
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-green-600">No significant risk factors identified</p>
                      )}
                    </div>
                  </div>

                  {report.status === 'generated' && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select doctor to send report..." />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                Dr. {doctor.name} - {doctor.specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={() => sendReportToDoctor(report.id)}
                          disabled={!selectedDoctor}
                          variant="outline"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send to Doctor
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {reports.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Reports Generated Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first AI health report to get personalized health insights
                </p>
                <Button onClick={generateNewReport} disabled={historicalData.length < 5}>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Your First Report
                </Button>
              </CardContent>
            </Card>
          )}
          </TabsContent>

          {/* Medical Files Upload Tab */}
          <TabsContent value="uploads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Medical Files
                </CardTitle>
                <CardDescription>
                  Upload X-rays, lab reports, prescriptions, and medical records
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['lab_report', 'xray', 'prescription', 'medical_record'].map((type) => (
                    <div key={type}>
                      <Label htmlFor={`file-${type}`} className="text-sm font-medium mb-2 block capitalize">
                        {type.replace('_', ' ')}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`file-${type}`}
                          type="file"
                          ref={fileInputRef}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0], type);
                            }
                          }}
                          disabled={isUploading}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUploading}
                          onClick={() => document.getElementById(`file-${type}`)?.click()}
                        >
                          <FilePlus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uploading...</span>
                      <span className="text-sm">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Uploaded Files List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Medical Files ({medicalFiles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {medicalFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medicalFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.fileType, file.reportType)}
                          <div>
                            <p className="font-medium text-sm">{file.originalFileName}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge className={getReportTypeBadge(file.reportType)}>
                                {file.reportType.replace('_', ' ')}
                              </Badge>
                              <span>{formatFileSize(file.fileSize)}</span>
                              <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                            </div>
                            {file.analysis && (
                              <p className="text-xs text-green-600 mt-1">✓ AI Analysis Complete</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.analysis && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedFileAnalysis(file)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFileDelete(file.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Booking Tab */}
          <TabsContent value="lab-booking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pathology Lab Booking</CardTitle>
                <CardDescription>
                  Book blood tests and sample collection at your convenience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Lab booking functionality coming soon!</p>
                  <p className="text-sm text-muted-foreground">
                    You'll be able to book home collection for blood tests, urine tests, and more.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Analysis Details Dialog */}
        <Dialog open={!!selectedFileAnalysis} onOpenChange={() => setSelectedFileAnalysis(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Comprehensive Medical Analysis</DialogTitle>
              <DialogDescription>
                AI-powered analysis of {selectedFileAnalysis?.originalFileName}
              </DialogDescription>
            </DialogHeader>
            
            {selectedFileAnalysis?.analysis && (
              <div className="space-y-6">
                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="w-5 h-5" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{selectedFileAnalysis.analysis.summary}</p>
                  </CardContent>
                </Card>

                {/* Key Findings */}
                {selectedFileAnalysis.analysis.keyFindings && selectedFileAnalysis.analysis.keyFindings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="w-5 h-5" />
                        Key Findings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedFileAnalysis.analysis.keyFindings.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {selectedFileAnalysis.analysis.recommendations && selectedFileAnalysis.analysis.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Heart className="w-5 h-5" />
                        Medical Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedFileAnalysis.analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Diet Plan */}
                {selectedFileAnalysis.analysis.dietPlan && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Apple className="w-5 h-5" />
                        Personalized Diet Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedFileAnalysis.analysis.dietPlan.breakfast && selectedFileAnalysis.analysis.dietPlan.breakfast.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">🌅 Breakfast</h4>
                            <ul className="space-y-1">
                              {selectedFileAnalysis.analysis.dietPlan.breakfast.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedFileAnalysis.analysis.dietPlan.lunch && selectedFileAnalysis.analysis.dietPlan.lunch.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">☀️ Lunch</h4>
                            <ul className="space-y-1">
                              {selectedFileAnalysis.analysis.dietPlan.lunch.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedFileAnalysis.analysis.dietPlan.dinner && selectedFileAnalysis.analysis.dietPlan.dinner.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">🌙 Dinner</h4>
                            <ul className="space-y-1">
                              {selectedFileAnalysis.analysis.dietPlan.dinner.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedFileAnalysis.analysis.dietPlan.snacks && selectedFileAnalysis.analysis.dietPlan.snacks.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">🍎 Snacks</h4>
                            <ul className="space-y-1">
                              {selectedFileAnalysis.analysis.dietPlan.snacks.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Exercise Plan */}
                {selectedFileAnalysis.analysis.exercisePlan && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Dumbbell className="w-5 h-5" />
                        Exercise Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedFileAnalysis.analysis.exercisePlan.cardio && selectedFileAnalysis.analysis.exercisePlan.cardio.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">🏃 Cardio</h4>
                            <ul className="space-y-1">
                              {selectedFileAnalysis.analysis.exercisePlan.cardio.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedFileAnalysis.analysis.exercisePlan.strength && selectedFileAnalysis.analysis.exercisePlan.strength.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">💪 Strength</h4>
                            <ul className="space-y-1">
                              {selectedFileAnalysis.analysis.exercisePlan.strength.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedFileAnalysis.analysis.exercisePlan.flexibility && selectedFileAnalysis.analysis.exercisePlan.flexibility.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">🧘 Flexibility</h4>
                            <ul className="space-y-1">
                              {selectedFileAnalysis.analysis.exercisePlan.flexibility.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* YouTube Videos */}
                {selectedFileAnalysis.analysis.youtubeVideos && selectedFileAnalysis.analysis.youtubeVideos.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Video className="w-5 h-5" />
                        Educational Videos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedFileAnalysis.analysis.youtubeVideos.map((video, idx) => (
                          <a
                            key={idx}
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchTerm)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Video className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-red-900">{video.title}</p>
                              <p className="text-xs text-red-700">Click to search on YouTube</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Plan */}
                {selectedFileAnalysis.analysis.actionPlan && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="w-5 h-5" />
                        Action Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedFileAnalysis.analysis.actionPlan.immediate && selectedFileAnalysis.analysis.actionPlan.immediate.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-red-600">🚨 Immediate (Next 24-48 hours)</h4>
                            <ul className="space-y-1">
                              {selectedFileAnalysis.analysis.actionPlan.immediate.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedFileAnalysis.analysis.actionPlan.shortTerm && selectedFileAnalysis.analysis.actionPlan.shortTerm.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-orange-600">📅 Short-term (1-4 weeks)</h4>
                            <ul className="space-y-1">
                              {selectedFileAnalysis.analysis.actionPlan.shortTerm.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedFileAnalysis.analysis.actionPlan.longTerm && selectedFileAnalysis.analysis.actionPlan.longTerm.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-green-600">🎯 Long-term (1-6 months)</h4>
                            <ul className="space-y-1">
                              {selectedFileAnalysis.analysis.actionPlan.longTerm.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Follow-up Notice */}
                {selectedFileAnalysis.analysis.followUpNeeded && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Follow-up Recommended:</strong> Please consult with your healthcare provider to discuss these results and develop a personalized treatment plan.
                    </AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult qualified healthcare professionals for medical decisions.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
}