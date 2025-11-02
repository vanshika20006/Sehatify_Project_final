import { useState, useEffect } from 'react';
import { Search, Heart, AlertTriangle, Activity, Users, Filter, Eye } from 'lucide-react';
import { useAdmin } from '@/context/admin-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'wouter';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  currentVitals: {
    heartRate: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    oxygenSaturation: number;
    bodyTemperature: number;
  };
  isEmergency: boolean;
  emergencyType: string | null;
  wristbandStatus: string;
  lastUpdated: Date;
}

export function AdminDashboard() {
  const { adminUser, patients, logout } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'emergency' | 'normal'>('all');
  const [, setLocation] = useLocation();

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'emergency' && patient.isEmergency) ||
      (filterStatus === 'normal' && !patient.isEmergency);
    
    return matchesSearch && matchesFilter;
  });

  const emergencyPatients = patients.filter(p => p.isEmergency);
  const connectedDevices = patients.filter(p => p.wristbandStatus === 'connected');

  const getVitalStatus = (patient: Patient) => {
    const { currentVitals } = patient;
    
    if (patient.isEmergency) return 'critical';
    
    // Check for concerning vitals
    if (currentVitals.heartRate > 100 || currentVitals.heartRate < 60 ||
        currentVitals.bloodPressureSystolic > 140 || currentVitals.bloodPressureSystolic < 90 ||
        currentVitals.oxygenSaturation < 95 ||
        currentVitals.bodyTemperature > 100 || currentVitals.bodyTemperature < 97) {
      return 'warning';
    }
    
    return 'normal';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return <Badge variant="default" className="bg-green-100 text-green-800">Normal</Badge>;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Healthcare Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {adminUser?.name}</p>
            </div>
            <Button onClick={logout} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Emergency Cases</p>
                  <p className="text-2xl font-bold text-red-600">{emergencyPatients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Connected Devices</p>
                  <p className="text-2xl font-bold text-green-600">{connectedDevices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-pink-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Heart Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(patients.reduce((sum, p) => sum + p.currentVitals.heartRate, 0) / (patients.length || 1))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Alerts */}
        {emergencyPatients.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Emergency Alerts
              </CardTitle>
              <CardDescription className="text-red-600">
                Patients requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emergencyPatients.map(patient => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-red-600">{patient.emergencyType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Last update: {formatTime(patient.lastUpdated)}</p>
                      <Button 
                        size="sm" 
                        className="mt-1"
                        onClick={() => setLocation(`/admin/patient/${patient.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Monitoring</CardTitle>
            <CardDescription>
              Real-time patient vitals and status (updates every 3 seconds)
            </CardDescription>
            
            {/* Search and Filter Controls */}
            <div className="flex space-x-4 mt-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="emergency">Emergency Only</SelectItem>
                  <SelectItem value="normal">Normal Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Heart Rate</TableHead>
                  <TableHead>Blood Pressure</TableHead>
                  <TableHead>Oxygen</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map(patient => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-500">{patient.age}y, {patient.gender}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(getVitalStatus(patient))}
                    </TableCell>
                    <TableCell>
                      <span className={patient.currentVitals.heartRate > 100 || patient.currentVitals.heartRate < 60 ? 'text-red-600 font-medium' : ''}>
                        {Math.round(patient.currentVitals.heartRate)} bpm
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={patient.currentVitals.bloodPressureSystolic > 140 || patient.currentVitals.bloodPressureSystolic < 90 ? 'text-red-600 font-medium' : ''}>
                        {Math.round(patient.currentVitals.bloodPressureSystolic)}/{Math.round(patient.currentVitals.bloodPressureDiastolic)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={patient.currentVitals.oxygenSaturation < 95 ? 'text-red-600 font-medium' : ''}>
                        {Math.round(patient.currentVitals.oxygenSaturation)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={patient.currentVitals.bodyTemperature > 100 || patient.currentVitals.bodyTemperature < 97 ? 'text-red-600 font-medium' : ''}>
                        {patient.currentVitals.bodyTemperature.toFixed(1)}°F
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={patient.wristbandStatus === 'connected' ? 'default' : 'secondary'}>
                        {patient.wristbandStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatTime(patient.lastUpdated)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setLocation(`/admin/patient/${patient.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}