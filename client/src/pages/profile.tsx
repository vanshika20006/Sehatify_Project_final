import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { User, Shield, Heart, Phone, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { insertUserProfileSchema } from '@shared/schema';
import { z } from 'zod';

const updateProfileSchema = insertUserProfileSchema.partial();
type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export function ProfilePage() {
  const { t } = useTranslation();
  const { userProfile, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: userProfile || {}
  });

  const onSubmit = async (data: UpdateProfileData) => {
    setIsLoading(true);
    try {
      await updateUserProfile(data);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset(userProfile || {});
    setIsEditing(false);
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-2xl" data-testid="text-profile-name">
              {userProfile.name}
            </CardTitle>
            <CardDescription data-testid="text-profile-email">
              {userProfile.email}
            </CardDescription>
            <div className="flex justify-center space-x-2 mt-4">
              <Badge variant="secondary" data-testid="badge-age">
                {userProfile.age} years old
              </Badge>
              <Badge variant="secondary" data-testid="badge-gender">
                {userProfile.gender}
              </Badge>
              {userProfile.abhaId && (
                <Badge variant="outline" data-testid="badge-abha">
                  ABHA Verified
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" data-testid="tab-personal">
              <User className="w-4 h-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="medical" data-testid="tab-medical">
              <Heart className="w-4 h-4 mr-2" />
              Medical
            </TabsTrigger>
            <TabsTrigger value="emergency" data-testid="tab-emergency">
              <Phone className="w-4 h-4 mr-2" />
              Emergency
            </TabsTrigger>
            <TabsTrigger value="privacy" data-testid="tab-privacy">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Manage your basic profile information
                  </CardDescription>
                </div>
                <Button
                  variant={isEditing ? "ghost" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                  data-testid="button-edit-profile"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('full_name')}</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        disabled={!isEditing}
                        data-testid="input-name"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">{t('age')}</Label>
                      <Input
                        id="age"
                        type="number"
                        {...register('age', { valueAsNumber: true })}
                        disabled={!isEditing}
                        data-testid="input-age"
                      />
                      {errors.age && (
                        <p className="text-sm text-destructive">{errors.age.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">{t('gender')}</Label>
                      <Select 
                        onValueChange={(value) => setValue('gender', value as any)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger data-testid="select-gender">
                          <SelectValue placeholder={userProfile.gender} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t('male')}</SelectItem>
                          <SelectItem value="female">{t('female')}</SelectItem>
                          <SelectItem value="other">{t('other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('phone')}</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        disabled={!isEditing}
                        data-testid="input-phone"
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select 
                        onValueChange={(value) => setValue('language', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger data-testid="select-language">
                          <SelectValue placeholder={userProfile.language} />
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

                    <div className="space-y-2">
                      <Label htmlFor="abhaId">{t('abha_id')}</Label>
                      <Input
                        id="abhaId"
                        {...register('abhaId')}
                        disabled={!isEditing}
                        placeholder="Enter your ABHA Health ID"
                        data-testid="input-abha-id"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        data-testid="button-save-profile"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                        data-testid="button-cancel-profile"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Information */}
          <TabsContent value="medical">
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
                <CardDescription>
                  Your medical history and health information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory">{t('medical_history')}</Label>
                    <Textarea
                      id="medicalHistory"
                      {...register('medicalHistory')}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Any existing conditions, allergies, medications..."
                      data-testid="input-medical-history"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">Blood Group</h4>
                      <p className="text-blue-700">Not specified</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900">Known Allergies</h4>
                      <p className="text-green-700">None reported</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Contacts */}
          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>
                  People to contact in case of medical emergency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">No emergency contacts added</h4>
                        <p className="text-sm text-muted-foreground">
                          Add emergency contacts for faster response during emergencies
                        </p>
                      </div>
                      <Button variant="outline" data-testid="button-add-contact">
                        Add Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Security */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Manage your data privacy and security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Data Encryption</h4>
                      <p className="text-sm text-muted-foreground">
                        Your health data is encrypted end-to-end
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Enabled
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">HIPAA Compliance</h4>
                      <p className="text-sm text-muted-foreground">
                        Platform follows HIPAA data protection standards
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Compliant
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Data Sharing</h4>
                      <p className="text-sm text-muted-foreground">
                        Control who can access your health data
                      </p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-manage-sharing">
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
