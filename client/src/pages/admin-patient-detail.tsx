import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Heart, Activity, Thermometer, Droplets, Phone, User, Calendar, AlertTriangle, Pill, FileText } from 'lucide-react';
import { useAdmin } from '@/context/admin-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AdminPatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { getPatientById } = useAdmin();
  const [newPrescription, setNewPrescription] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: ''
  });
  const [doctorNotes, setDoctorNotes] = useState('');

  const patient = getPatientById(id!);

  useEffect(() => {
    if (patient) {
      setDoctorNotes(patient.doctorNotes || '');
    }
  }, [patient]);

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Patient not found</p>
            <Button onClick={() => setLocation('/admin/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getVitalStatus = (value: number, normal: [number, number]) => {
    if (value < normal[0] || value > normal[1]) return 'abnormal';
    return 'normal';
  };

  const handleAddPrescription = () => {
    if (newPrescription.medication && newPrescription.dosage) {
      // In a real app, this would make an API call
      console.log('Adding prescription:', newPrescription);
      setNewPrescription({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
      });
    }
  };

  const handleSaveNotes = () => {
    // In a real app, this would make an API call
    console.log('Saving doctor notes:', doctorNotes);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/admin/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-sm text-gray-500">Patient ID: {patient.id}</p>
            </div>
            {patient.isEmergency && (
              <Badge variant="destructive" className="ml-auto">
                <AlertTriangle className="h-4 w-4 mr-1" />
                EMERGENCY: {patient.emergencyType}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Age:</span>
                <span className="font-medium">{patient.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gender:</span>
                <span className="font-medium capitalize">{patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Blood Group:</span>
                <span className="font-medium">{patient.bloodGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium text-sm">{patient.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="font-medium">{patient.phone}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{patient.emergencyContact.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Relation:</span>
                <span className="font-medium">{patient.emergencyContact.relation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="font-medium">{patient.emergencyContact.phone}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Device Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Wristband:</span>
                <Badge variant={patient.wristbandStatus === 'connected' ? 'default' : 'secondary'}>
                  {patient.wristbandStatus}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Update:</span>
                <span className="font-medium text-sm">{formatDate(patient.lastUpdated)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Checkup:</span>
                <span className="font-medium text-sm">{formatDate(patient.lastCheckup)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Vitals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Current Vital Signs
            </CardTitle>
            <CardDescription>Real-time monitoring data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-gray-500">Heart Rate</p>
                <p className={`text-2xl font-bold ${getVitalStatus(patient.currentVitals.heartRate, [60, 100]) === 'abnormal' ? 'text-red-600' : 'text-green-600'}`}>
                  {Math.round(patient.currentVitals.heartRate)}
                </p>
                <p className="text-xs text-gray-500">bpm</p>
              </div>
              
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-gray-500">Blood Pressure</p>
                <p className={`text-2xl font-bold ${getVitalStatus(patient.currentVitals.bloodPressureSystolic, [90, 140]) === 'abnormal' ? 'text-red-600' : 'text-green-600'}`}>
                  {Math.round(patient.currentVitals.bloodPressureSystolic)}/{Math.round(patient.currentVitals.bloodPressureDiastolic)}
                </p>
                <p className="text-xs text-gray-500">mmHg</p>
              </div>
              
              <div className="text-center">
                <Droplets className="h-8 w-8 mx-auto mb-2 text-cyan-500" />
                <p className="text-sm text-gray-500">Oxygen Saturation</p>
                <p className={`text-2xl font-bold ${getVitalStatus(patient.currentVitals.oxygenSaturation, [95, 100]) === 'abnormal' ? 'text-red-600' : 'text-green-600'}`}>
                  {Math.round(patient.currentVitals.oxygenSaturation)}
                </p>
                <p className="text-xs text-gray-500">%</p>
              </div>
              
              <div className="text-center">
                <Thermometer className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-sm text-gray-500">Temperature</p>
                <p className={`text-2xl font-bold ${getVitalStatus(patient.currentVitals.bodyTemperature, [97, 100]) === 'abnormal' ? 'text-red-600' : 'text-green-600'}`}>
                  {patient.currentVitals.bodyTemperature.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">°F</p>
              </div>
              
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-sm text-gray-500">Daily Steps</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(patient.currentVitals.steps)}
                </p>
                <p className="text-xs text-gray-500">steps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for detailed information */}
        <Tabs defaultValue="medical-history" className="space-y-6">
          <TabsList>
            <TabsTrigger value="medical-history">Medical History</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="doctor-notes">Doctor Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="medical-history">
            <Card>
              <CardHeader>
                <CardTitle>Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Medical Conditions</Label>
                    <p className="mt-1 text-gray-900">{patient.medicalHistory}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Sleep Pattern</Label>
                    <p className="mt-1 text-gray-900">{patient.currentVitals.sleepHours.toFixed(1)} hours last night</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions">
            <div className="space-y-6">
              {/* Current Prescriptions */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patient.prescriptions.map((prescription, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{prescription.name}</TableCell>
                          <TableCell>{prescription.dosage}</TableCell>
                          <TableCell>{prescription.frequency}</TableCell>
                          <TableCell>{prescription.duration}</TableCell>
                          <TableCell>
                            <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                              {prescription.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Add New Prescription */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Prescription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medication">Medication</Label>
                      <Input
                        id="medication"
                        value={newPrescription.medication}
                        onChange={(e) => setNewPrescription({...newPrescription, medication: e.target.value})}
                        placeholder="Enter medication name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        value={newPrescription.dosage}
                        onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                        placeholder="e.g., 500mg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select 
                        value={newPrescription.frequency}
                        onValueChange={(value) => setNewPrescription({...newPrescription, frequency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once-daily">Once daily</SelectItem>
                          <SelectItem value="twice-daily">Twice daily</SelectItem>
                          <SelectItem value="three-times-daily">Three times daily</SelectItem>
                          <SelectItem value="as-needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={newPrescription.duration}
                        onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                        placeholder="e.g., 7 days"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newPrescription.notes}
                      onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                      placeholder="Additional instructions"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleAddPrescription} className="mt-4">
                    <Pill className="h-4 w-4 mr-2" />
                    Add Prescription
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="doctor-notes">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Notes</CardTitle>
                <CardDescription>Clinical observations and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Enter clinical observations, recommendations, and notes..."
                  rows={10}
                  className="mb-4"
                />
                <Button onClick={handleSaveNotes}>
                  <FileText className="h-4 w-4 mr-2" />
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}