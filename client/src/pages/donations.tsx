import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, MapPin, Award, Calendar, Plus, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { donationsService, Donation, Hospital, DonorProfile } from '@/services/donations';

export function DonationsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userProfile, getAuthHeaders } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get user location
        const location = await donationsService.getCurrentLocation();
        setUserLocation(location);

        // Get auth headers
        const authHeaders = getAuthHeaders();
        
        // Fetch donor profile
        const profile = await donationsService.getDonorProfile(authHeaders);
        setDonorProfile(profile);

        // Fetch user's donations
        const userDonations = await donationsService.getMyDonations(authHeaders);
        setDonations(userDonations);

        // Fetch nearby hospitals
        const hospitals = await donationsService.getNearbyHospitals(
          location.latitude,
          location.longitude,
          50, // 50km radius
          authHeaders
        );
        setNearbyHospitals(hospitals);
      } catch (error) {
        console.error('Error fetching donation data:', error);
        toast({
          title: "Error",
          description: "Failed to load donation data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userProfile) {
      fetchData();
    }
  }, [userProfile, toast]);

  const handleDonateTo = async (hospitalId: string, donationType: string) => {
    try {
      if (!donorProfile) {
        toast({
          title: "Profile Required",
          description: "Please create a donor profile first to schedule donations.",
          variant: "destructive"
        });
        return;
      }

      // Calculate next available donation date (2 weeks from now for demo)
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 14);

      const authHeaders = getAuthHeaders();
      
      const donation = await donationsService.scheduleDonation({
        recipientHospitalId: hospitalId,
        donationType,
        bloodGroup: donorProfile.bloodGroup,
        quantity: donationType === 'blood' ? 450 : 250,
        scheduledDate
      }, authHeaders);

      // Refresh donations list
      const updatedDonations = await donationsService.getMyDonations(authHeaders);
      setDonations(updatedDonations);

      toast({
        title: "Donation Scheduled",
        description: `${donationType} donation scheduled for ${scheduledDate.toLocaleDateString()}. You will earn ${donation.rewardCoins} coins!`,
      });
    } catch (error: any) {
      console.error('Error scheduling donation:', error);
      toast({
        title: "Scheduling Failed",
        description: error.message || "Failed to schedule donation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getDonationTypeColor = (type: string) => {
    switch (type) {
      case 'blood': return 'bg-red-100 text-red-800';
      case 'plasma': return 'bg-yellow-100 text-yellow-800';
      case 'platelets': return 'bg-blue-100 text-blue-800';
      case 'wbc': return 'bg-green-100 text-green-800';
      case 'rbc': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-200 rounded"></div>
                    <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-donations-title">
            Community Donations
          </h1>
          <p className="text-muted-foreground" data-testid="text-donations-subtitle">
            Save lives through blood and plasma donations. Earn reward coins for your generosity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-total-donations">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{donorProfile?.totalDonations || donations.filter(d => d.status === 'completed').length}</div>
              <div className="text-sm text-muted-foreground">Total Donations</div>
            </CardContent>
          </Card>

          <Card data-testid="card-lives-saved">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{(donorProfile?.totalDonations || donations.filter(d => d.status === 'completed').length) * 3}</div>
              <div className="text-sm text-muted-foreground">Lives Potentially Saved</div>
            </CardContent>
          </Card>

          <Card data-testid="card-reward-coins">
            <CardContent className="p-6 text-center">
              <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{donorProfile?.rewardCoins || 0}</div>
              <div className="text-sm text-muted-foreground">Reward Coins</div>
            </CardContent>
          </Card>

          <Card data-testid="card-next-donation">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {donorProfile?.lastDonationDate ? 
                  donationsService.calculateDaysUntilNext(donorProfile.lastDonationDate, 'blood') :
                  0
                }
              </div>
              <div className="text-sm text-muted-foreground">Days Until Next</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="donate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="donate" data-testid="tab-donate">
              <Plus className="w-4 h-4 mr-2" />
              Donate Now
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <Heart className="w-4 h-4 mr-2" />
              My Donations
            </TabsTrigger>
            <TabsTrigger value="rewards" data-testid="tab-rewards">
              <Coins className="w-4 h-4 mr-2" />
              Rewards
            </TabsTrigger>
          </TabsList>

          {/* Donate Now Tab */}
          <TabsContent value="donate">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nearby Hospitals & Blood Banks</CardTitle>
                  <CardDescription>
                    Find hospitals near you that need blood donations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nearbyHospitals.map((hospital) => (
                      <Card key={hospital.id} className="hover:shadow-lg transition-shadow" data-testid={`card-hospital-${hospital.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg" data-testid={`text-hospital-name-${hospital.id}`}>
                                {hospital.name}
                              </CardTitle>
                              <CardDescription>
                                <div className="flex items-center text-sm">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {hospital.address}
                                </div>
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {hospital.rating}★
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Current Needs:</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>O+ Blood</span>
                                <Badge variant="destructive" className="text-xs">High</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Plasma</span>
                                <Badge variant="outline" className="text-xs">Medium</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Platelets</span>
                                <Badge variant="secondary" className="text-xs">Low</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>A+ Blood</span>
                                <Badge variant="outline" className="text-xs">Medium</Badge>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Select>
                              <SelectTrigger data-testid={`select-donation-type-${hospital.id}`}>
                                <SelectValue placeholder="Select donation type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="blood">Whole Blood</SelectItem>
                                <SelectItem value="plasma">Plasma</SelectItem>
                                <SelectItem value="platelets">Platelets</SelectItem>
                                <SelectItem value="wbc">White Blood Cells</SelectItem>
                                <SelectItem value="rbc">Red Blood Cells</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button 
                              className="w-full" 
                              onClick={() => handleDonateTo(hospital.id, 'blood')}
                              data-testid={`button-donate-${hospital.id}`}
                            >
                              Schedule Donation
                            </Button>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            <div>Reward: 50-100 coins per donation</div>
                            <div>Distance: ~2.5 km</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Donation History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>My Donation History</CardTitle>
                <CardDescription>
                  Track your contribution to saving lives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`donation-${donation.id}`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <Heart className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium" data-testid={`text-donation-type-${donation.id}`}>
                            {donation.donationType.charAt(0).toUpperCase() + donation.donationType.slice(1)} Donation
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {donation.quantity}ml • {donation.bloodGroup} • {donation.scheduledDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getDonationTypeColor(donation.donationType)}>
                          {donation.donationType}
                        </Badge>
                        <Badge className={getStatusColor(donation.status)}>
                          {donation.status}
                        </Badge>
                        <div className="text-sm font-medium text-yellow-600">
                          +{donation.rewardCoins} coins
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reward Coins Balance</CardTitle>
                  <CardDescription>
                    Use your coins for healthcare discounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                      <Coins className="w-10 h-10 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-yellow-600" data-testid="text-coin-balance">
                        {donorProfile?.rewardCoins || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Available Coins</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">Next milestone: 250 coins</div>
                      <Progress value={((donorProfile?.rewardCoins || 0) / 250) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Redeem Rewards</CardTitle>
                  <CardDescription>
                    Exchange coins for valuable benefits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Health Checkup Discount</div>
                        <div className="text-sm text-muted-foreground">20% off full body checkup</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">100 coins</div>
                        <Button size="sm" variant="outline" disabled={(donorProfile?.rewardCoins || 0) < 100} data-testid="button-redeem-checkup">
                          Redeem
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Medicine Discount</div>
                        <div className="text-sm text-muted-foreground">15% off medicine purchases</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">75 coins</div>
                        <Button size="sm" variant="outline" disabled={(donorProfile?.rewardCoins || 0) < 75} data-testid="button-redeem-medicine">
                          Redeem
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Cash Conversion</div>
                        <div className="text-sm text-muted-foreground">Convert to wallet balance</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">50 coins = ₹10</div>
                        <Button size="sm" variant="outline" disabled={(donorProfile?.rewardCoins || 0) < 50} data-testid="button-redeem-cash">
                          Convert
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
