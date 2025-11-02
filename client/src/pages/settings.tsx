import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Smartphone,
  Heart,
  Save,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Key,
  Database,
  Clock
} from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuth } from '@/hooks/use-auth';

interface UserSettings {
  profile: {
    name: string;
    age: number;
    gender: string;
    phone: string;
    medicalHistory: string;
    allergies: string[];
    medications: string[];
    emergencyContact: {
      name: string;
      phone: string;
      relation: string;
    };
  };
  notifications: {
    healthAlerts: boolean;
    medicineReminders: boolean;
    doctorAppointments: boolean;
    emergencyContacts: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  privacy: {
    shareWithDoctors: boolean;
    shareForResearch: boolean;
    dataRetentionYears: number;
    marketingConsent: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    units: 'metric' | 'imperial';
    theme: 'light' | 'dark' | 'system';
  };
  wearable: {
    syncFrequency: string;
    autoSync: boolean;
    batteryAlerts: boolean;
    deviceName: string;
  };
}

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, userProfile } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: userProfile?.name || '',
      age: userProfile?.age || 30,
      gender: userProfile?.gender || '',
      phone: userProfile?.phone || '',
      medicalHistory: userProfile?.medicalHistory || '',
      allergies: userProfile?.allergies || [],
      medications: userProfile?.medications || [],
      emergencyContact: {
        name: '',
        phone: '',
        relation: ''
      }
    },
    notifications: {
      healthAlerts: true,
      medicineReminders: true,
      doctorAppointments: true,
      emergencyContacts: true,
      emailNotifications: true,
      smsNotifications: false
    },
    privacy: {
      shareWithDoctors: true,
      shareForResearch: false,
      dataRetentionYears: 5,
      marketingConsent: false
    },
    preferences: {
      language: i18n.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      units: 'metric',
      theme: 'light'
    },
    wearable: {
      syncFrequency: 'realtime',
      autoSync: true,
      batteryAlerts: true,
      deviceName: 'HealthBand Pro'
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateSettings = (section: keyof UserSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = () => {
    const dataExport = {
      profile: settings.profile,
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteAllData = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    // Simulate data deletion
    console.log('Deleting all user data...');
    setShowDeleteConfirm(false);
  };

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    updateSettings('preferences', 'language', language);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Settings & Preferences</h1>

          {saveSuccess && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <Save className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Settings saved successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Manage your personal and medical information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) => updateSettings('profile', 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={settings.profile.age}
                      onChange={(e) => updateSettings('profile', 'age', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={settings.profile.gender} 
                      onValueChange={(value) => updateSettings('profile', 'gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={settings.profile.phone}
                      onChange={(e) => updateSettings('profile', 'phone', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea
                    id="medicalHistory"
                    value={settings.profile.medicalHistory}
                    onChange={(e) => updateSettings('profile', 'medicalHistory', e.target.value)}
                    placeholder="Enter your medical history, chronic conditions, surgeries, etc."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyName"
                      value={settings.profile.emergencyContact.name}
                      onChange={(e) => updateSettings('profile', 'emergencyContact', {
                        ...settings.profile.emergencyContact,
                        name: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      value={settings.profile.emergencyContact.phone}
                      onChange={(e) => updateSettings('profile', 'emergencyContact', {
                        ...settings.profile.emergencyContact,
                        phone: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyRelation">Relation</Label>
                    <Input
                      id="emergencyRelation"
                      value={settings.profile.emergencyContact.relation}
                      onChange={(e) => updateSettings('profile', 'emergencyContact', {
                        ...settings.profile.emergencyContact,
                        relation: e.target.value
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure how you want to receive health alerts and reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="healthAlerts">Health Alerts</Label>
                        <p className="text-sm text-muted-foreground">Critical health changes and anomalies</p>
                      </div>
                      <Switch
                        id="healthAlerts"
                        checked={settings.notifications.healthAlerts}
                        onCheckedChange={(checked) => updateSettings('notifications', 'healthAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="medicineReminders">Medicine Reminders</Label>
                        <p className="text-sm text-muted-foreground">Medication schedule notifications</p>
                      </div>
                      <Switch
                        id="medicineReminders"
                        checked={settings.notifications.medicineReminders}
                        onCheckedChange={(checked) => updateSettings('notifications', 'medicineReminders', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="doctorAppointments">Doctor Appointments</Label>
                        <p className="text-sm text-muted-foreground">Appointment reminders and updates</p>
                      </div>
                      <Switch
                        id="doctorAppointments"
                        checked={settings.notifications.doctorAppointments}
                        onCheckedChange={(checked) => updateSettings('notifications', 'doctorAppointments', checked)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                      </div>
                      <Switch
                        id="smsNotifications"
                        checked={settings.notifications.smsNotifications}
                        onCheckedChange={(checked) => updateSettings('notifications', 'smsNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emergencyContacts">Emergency Contacts</Label>
                        <p className="text-sm text-muted-foreground">Notify emergency contacts</p>
                      </div>
                      <Switch
                        id="emergencyContacts"
                        checked={settings.notifications.emergencyContacts}
                        onCheckedChange={(checked) => updateSettings('notifications', 'emergencyContacts', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Data Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Data Control
                </CardTitle>
                <CardDescription>
                  Manage how your health data is used and shared
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="shareWithDoctors">Share with Doctors</Label>
                        <p className="text-sm text-muted-foreground">Allow doctors to access your health data</p>
                      </div>
                      <Switch
                        id="shareWithDoctors"
                        checked={settings.privacy.shareWithDoctors}
                        onCheckedChange={(checked) => updateSettings('privacy', 'shareWithDoctors', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="shareForResearch">Research Participation</Label>
                        <p className="text-sm text-muted-foreground">Anonymized data for medical research</p>
                      </div>
                      <Switch
                        id="shareForResearch"
                        checked={settings.privacy.shareForResearch}
                        onCheckedChange={(checked) => updateSettings('privacy', 'shareForResearch', checked)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dataRetention">Data Retention (Years)</Label>
                      <Select 
                        value={settings.privacy.dataRetentionYears.toString()} 
                        onValueChange={(value) => updateSettings('privacy', 'dataRetentionYears', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Year</SelectItem>
                          <SelectItem value="3">3 Years</SelectItem>
                          <SelectItem value="5">5 Years</SelectItem>
                          <SelectItem value="10">10 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketingConsent">Marketing Communications</Label>
                        <p className="text-sm text-muted-foreground">Receive health tips and product updates</p>
                      </div>
                      <Switch
                        id="marketingConsent"
                        checked={settings.privacy.marketingConsent}
                        onCheckedChange={(checked) => updateSettings('privacy', 'marketingConsent', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wearable Device Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Wearable Device
                </CardTitle>
                <CardDescription>
                  Configure your health monitoring device settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deviceName">Device Name</Label>
                    <Input
                      id="deviceName"
                      value={settings.wearable.deviceName}
                      onChange={(e) => updateSettings('wearable', 'deviceName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="syncFrequency">Sync Frequency</Label>
                    <Select 
                      value={settings.wearable.syncFrequency} 
                      onValueChange={(value) => updateSettings('wearable', 'syncFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoSync">Auto Sync</Label>
                    <p className="text-sm text-muted-foreground">Automatically sync health data</p>
                  </div>
                  <Switch
                    id="autoSync"
                    checked={settings.wearable.autoSync}
                    onCheckedChange={(checked) => updateSettings('wearable', 'autoSync', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="batteryAlerts">Battery Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when battery is low</p>
                  </div>
                  <Switch
                    id="batteryAlerts"
                    checked={settings.wearable.batteryAlerts}
                    onCheckedChange={(checked) => updateSettings('wearable', 'batteryAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* App Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  App Preferences
                </CardTitle>
                <CardDescription>
                  Language, theme, and display preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.preferences.language} onValueChange={changeLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी</SelectItem>
                        <SelectItem value="ta">தமிழ்</SelectItem>
                        <SelectItem value="te">తెలుగు</SelectItem>
                        <SelectItem value="bn">বাংলা</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="units">Units</Label>
                    <Select 
                      value={settings.preferences.units} 
                      onValueChange={(value: any) => updateSettings('preferences', 'units', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric">Metric (kg, cm, °C)</SelectItem>
                        <SelectItem value="imperial">Imperial (lbs, ft, °F)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select 
                      value={settings.preferences.theme} 
                      onValueChange={(value: any) => updateSettings('preferences', 'theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={settings.preferences.timezone}
                      onChange={(e) => updateSettings('preferences', 'timezone', e.target.value)}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Export, backup, or delete your health data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" onClick={exportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={deleteAllData}
                    disabled={showDeleteConfirm}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {showDeleteConfirm ? 'Confirm Delete' : 'Delete All Data'}
                  </Button>
                </div>
                {showDeleteConfirm && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      <strong>Warning:</strong> This will permanently delete all your health data, settings, and account information. This action cannot be undone.
                      <div className="mt-2">
                        <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} className="mr-2">
                          Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={deleteAllData}>
                          I understand, delete everything
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Save Settings */}
            <div className="flex justify-end gap-4">
              <Button variant="outline">
                Reset to Defaults
              </Button>
              <Button onClick={saveSettings} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}