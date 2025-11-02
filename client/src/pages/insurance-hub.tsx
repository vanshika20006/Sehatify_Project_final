import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Heart, Shield, Calculator, FileText, Users, MapPin, CheckCircle, Phone, Mail, Download } from 'lucide-react';

interface InsurancePolicy {
  id: string;
  name: string;
  type: 'government' | 'private';
  provider: string;
  sumInsured: number;
  premium?: number;
  coverageType: string;
  eligibility: string[];
  keyFeatures: string[];
  waitingPeriod?: string;
  claimSettlementRatio?: number;
  networkHospitals: number;
  description: string;
}

const mockGovernmentSchemes: InsurancePolicy[] = [
  {
    id: 'pmjay-1',
    name: 'Ayushman Bharat PM-JAY',
    type: 'government',
    provider: 'Government of India',
    sumInsured: 500000,
    coverageType: 'Family Floater',
    eligibility: ['SECC 2011 listed families', 'Rural families below poverty line', 'Urban occupational category'],
    keyFeatures: [
      'Cashless treatment at empanelled hospitals',
      'Pre and post hospitalization coverage',
      'No age limit',
      'Coverage for pre-existing conditions'
    ],
    networkHospitals: 25000,
    description: 'World\'s largest health insurance scheme providing coverage of ₹5 lakh per family per year'
  },
  {
    id: 'cghs-1',
    name: 'Central Government Health Scheme',
    type: 'government',
    provider: 'Government of India',
    sumInsured: 1000000,
    coverageType: 'Individual',
    eligibility: ['Central Government employees', 'Pensioners', 'Dependent family members'],
    keyFeatures: [
      'OPD and IPD coverage',
      'Specialist consultation',
      'Diagnostic services',
      'Medicine coverage'
    ],
    networkHospitals: 2000,
    description: 'Comprehensive health care scheme for central government employees and pensioners'
  }
];

const mockPrivatePolicies: InsurancePolicy[] = [
  {
    id: 'hdfc-1',
    name: 'HDFC ERGO Health Suraksha Gold',
    type: 'private',
    provider: 'HDFC ERGO',
    sumInsured: 1000000,
    premium: 12000,
    coverageType: 'Individual',
    eligibility: ['Age 18-65 years', 'Medical screening required'],
    keyFeatures: [
      'Cashless hospitalization',
      'Pre and post hospitalization',
      'Day care procedures',
      'Ambulance coverage'
    ],
    waitingPeriod: '2 years for pre-existing diseases',
    claimSettlementRatio: 96.8,
    networkHospitals: 7200,
    description: 'Comprehensive health insurance with extensive coverage and cashless facilities'
  },
  {
    id: 'star-1',
    name: 'Star Health Red Carpet',
    type: 'private',
    provider: 'Star Health Insurance',
    sumInsured: 2500000,
    premium: 18500,
    coverageType: 'Individual',
    eligibility: ['Age 18-75 years'],
    keyFeatures: [
      'No room rent restriction',
      'Coverage for modern treatments',
      'Health check-up benefits',
      'Emergency ambulance'
    ],
    waitingPeriod: '48 months for pre-existing diseases',
    claimSettlementRatio: 93.2,
    networkHospitals: 9800,
    description: 'Premium health insurance with no room rent restrictions and modern treatment coverage'
  }
];

export function InsuranceHubPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [premiumForm, setPremiumForm] = useState({
    age: '',
    city: '',
    members: '',
    sumInsured: ''
  });
  const [eligibilityForm, setEligibilityForm] = useState({
    cardNumber: '',
    state: '',
    income: ''
  });
  const [claimForm, setClaimForm] = useState({
    policyNumber: '',
    claimType: '',
    description: '',
    amount: ''
  });

  const allPolicies = [...mockGovernmentSchemes, ...mockPrivatePolicies];
  
  const filteredPolicies = allPolicies.filter(policy => 
    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePolicySelection = (policyId: string) => {
    setSelectedPolicies(prev => 
      prev.includes(policyId) 
        ? prev.filter(id => id !== policyId)
        : prev.length < 4 ? [...prev, policyId] : prev
    );
  };

  const calculatePremium = () => {
    if (!premiumForm.age || !premiumForm.city || !premiumForm.members || !premiumForm.sumInsured) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields to calculate premium.",
        variant: "destructive"
      });
      return;
    }
    
    // Mock calculation
    const baseAmount = parseInt(premiumForm.sumInsured) * 0.05;
    const ageMultiplier = parseInt(premiumForm.age) > 45 ? 1.3 : 1.0;
    const memberMultiplier = parseInt(premiumForm.members) || 1;
    const calculated = Math.round(baseAmount * ageMultiplier * memberMultiplier);
    
    toast({
      title: "Premium Calculated",
      description: `Estimated annual premium: ₹${calculated.toLocaleString()}`,
    });
  };

  const checkEligibility = () => {
    if (!eligibilityForm.cardNumber || !eligibilityForm.state) {
      toast({
        title: "Missing Information",
        description: "Please fill required fields to check eligibility.",
        variant: "destructive"
      });
      return;
    }
    
    // Mock eligibility check
    const isEligible = Math.random() > 0.3; // 70% chance eligible
    toast({
      title: isEligible ? "Eligible" : "Not Eligible",
      description: isEligible ? "You are eligible for government health schemes!" : "Please check with local authorities for more information.",
      variant: isEligible ? "default" : "destructive"
    });
  };

  const submitClaim = () => {
    if (!claimForm.policyNumber || !claimForm.claimType) {
      toast({
        title: "Missing Information",
        description: "Please fill required fields to submit claim.",
        variant: "destructive"
      });
      return;
    }
    
    const claimId = `CLM${Date.now().toString().slice(-6)}`;
    toast({
      title: "Claim Submitted",
      description: `Your claim (${claimId}) has been submitted successfully. You will receive updates via SMS/email.`,
    });
    
    // Reset form
    setClaimForm({
      policyNumber: '',
      claimType: '',
      description: '',
      amount: ''
    });
  };

  const getQuote = (policy: InsurancePolicy) => {
    toast({
      title: "Quote Request",
      description: `Quote request sent for ${policy.name}. Our team will contact you within 24 hours.`,
    });
  };

  const checkPolicyEligibility = (policy: InsurancePolicy) => {
    toast({
      title: "Eligibility Check",
      description: `Checking eligibility for ${policy.name}. Redirecting to eligibility form...`,
    });
    setActiveTab('calculators');
  };

  const PolicyCard = ({ policy }: { policy: InsurancePolicy }) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{policy.name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{policy.provider}</p>
          </div>
          <Badge variant={policy.type === 'government' ? 'default' : 'secondary'}>
            {policy.type === 'government' ? 'Government' : 'Private'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Sum Insured</p>
            <p className="text-lg font-semibold text-green-600">
              ₹{(policy.sumInsured / 100000).toFixed(1)}L
            </p>
          </div>
          {policy.premium && (
            <div>
              <p className="text-sm font-medium text-gray-700">Annual Premium</p>
              <p className="text-lg font-semibold text-blue-600">₹{policy.premium.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Key Features</p>
          <ul className="text-sm space-y-1">
            {policy.keyFeatures.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {policy.networkHospitals.toLocaleString()} hospitals
          </div>
          {policy.claimSettlementRatio && (
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              {policy.claimSettlementRatio}% settlement
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => togglePolicySelection(policy.id)}
            disabled={!selectedPolicies.includes(policy.id) && selectedPolicies.length >= 4}
            className="hover:bg-purple-50 border-purple-200"
          >
            {selectedPolicies.includes(policy.id) ? 'Remove' : 'Compare'}
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            onClick={() => policy.type === 'government' ? checkPolicyEligibility(policy) : getQuote(policy)}
          >
            {policy.type === 'government' ? 'Check Eligibility' : 'Get Quote'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const PremiumCalculator = () => (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Calculator className="w-5 h-5 text-purple-600" />
          Premium Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Age</Label>
            <Input 
              type="number" 
              placeholder="Your age"
              value={premiumForm.age}
              onChange={(e) => setPremiumForm({...premiumForm, age: e.target.value})}
              className="border-purple-200 focus:border-purple-400"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">City</Label>
            <Select value={premiumForm.city} onValueChange={(value) => setPremiumForm({...premiumForm, city: value})}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="chennai">Chennai</SelectItem>
                <SelectItem value="hyderabad">Hyderabad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Family Members</Label>
            <Input 
              type="number" 
              placeholder="Number of members"
              value={premiumForm.members}
              onChange={(e) => setPremiumForm({...premiumForm, members: e.target.value})}
              className="border-purple-200 focus:border-purple-400"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Sum Insured</Label>
            <Select value={premiumForm.sumInsured} onValueChange={(value) => setPremiumForm({...premiumForm, sumInsured: value})}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400">
                <SelectValue placeholder="Coverage amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300000">₹3 Lakhs</SelectItem>
                <SelectItem value="500000">₹5 Lakhs</SelectItem>
                <SelectItem value="1000000">₹10 Lakhs</SelectItem>
                <SelectItem value="2500000">₹25 Lakhs</SelectItem>
                <SelectItem value="5000000">₹50 Lakhs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          onClick={calculatePremium}
        >
          Calculate Premium
        </Button>
      </CardContent>
    </Card>
  );

  const EligibilityChecker = () => (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Users className="w-5 h-5 text-purple-600" />
          Government Scheme Eligibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">SECC/Ration Card Number</Label>
          <Input 
            placeholder="Enter your card number"
            value={eligibilityForm.cardNumber}
            onChange={(e) => setEligibilityForm({...eligibilityForm, cardNumber: e.target.value})}
            className="border-purple-200 focus:border-purple-400"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">State</Label>
          <Select value={eligibilityForm.state} onValueChange={(value) => setEligibilityForm({...eligibilityForm, state: value})}>
            <SelectTrigger className="border-purple-200 focus:border-purple-400">
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
              <SelectItem value="maharashtra">Maharashtra</SelectItem>
              <SelectItem value="karnataka">Karnataka</SelectItem>
              <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
              <SelectItem value="west-bengal">West Bengal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Annual Family Income</Label>
          <Input 
            placeholder="Annual income (in ₹)"
            value={eligibilityForm.income}
            onChange={(e) => setEligibilityForm({...eligibilityForm, income: e.target.value})}
            className="border-purple-200 focus:border-purple-400"
          />
        </div>
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          onClick={checkEligibility}
        >
          Check Eligibility
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Hero Section - Modern Professional Style */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-purple-600" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Trusted Insurance Partners
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                Insurance Hub
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Find the perfect health insurance plan for you and your family. Compare government schemes and private policies.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-6 h-6" />
                <Input
                  type="text"
                  placeholder="Search insurance policies, coverage, or providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-4 text-lg border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-purple-200 shadow-lg"
                />
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Government Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Instant Quotes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Expert Support</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-75"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-purple-300 rounded-full opacity-20 animate-pulse delay-150"></div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse Policies</TabsTrigger>
            <TabsTrigger value="compare">Compare ({selectedPolicies.length})</TabsTrigger>
            <TabsTrigger value="calculators">Calculators</TabsTrigger>
            <TabsTrigger value="claims">Claims & Support</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Available Insurance Policies</h2>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {/* Government Schemes */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Government Health Schemes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockGovernmentSchemes
                  .filter(policy => 
                    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    policy.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(policy => (
                    <PolicyCard key={policy.id} policy={policy} />
                  ))}
              </div>
            </div>

            {/* Private Insurance */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Private Health Insurance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockPrivatePolicies
                  .filter(policy => 
                    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    policy.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(policy => (
                    <PolicyCard key={policy.id} policy={policy} />
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Policy Comparison</h2>
              <p className="text-gray-600">Select up to 4 policies to compare</p>
            </div>

            {selectedPolicies.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No policies selected</h3>
                  <p className="text-gray-600">Go to Browse Policies and select policies to compare</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-4 text-left">Features</th>
                      {selectedPolicies.map(policyId => {
                        const policy = allPolicies.find(p => p.id === policyId);
                        return (
                          <th key={policyId} className="border border-gray-300 p-4 text-center min-w-48">
                            {policy?.name}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-4 font-medium">Provider</td>
                      {selectedPolicies.map(policyId => {
                        const policy = allPolicies.find(p => p.id === policyId);
                        return (
                          <td key={policyId} className="border border-gray-300 p-4 text-center">
                            {policy?.provider}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 p-4 font-medium">Sum Insured</td>
                      {selectedPolicies.map(policyId => {
                        const policy = allPolicies.find(p => p.id === policyId);
                        return (
                          <td key={policyId} className="border border-gray-300 p-4 text-center">
                            ₹{policy ? (policy.sumInsured / 100000).toFixed(1) : 0}L
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-4 font-medium">Annual Premium</td>
                      {selectedPolicies.map(policyId => {
                        const policy = allPolicies.find(p => p.id === policyId);
                        return (
                          <td key={policyId} className="border border-gray-300 p-4 text-center">
                            {policy?.premium ? `₹${policy.premium.toLocaleString()}` : 'Free (Govt.)'}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="calculators" className="space-y-6">
            <h2 className="text-2xl font-bold">Insurance Calculators</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PremiumCalculator />
              <EligibilityChecker />
            </div>
          </TabsContent>

          <TabsContent value="claims" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Claims & Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <FileText className="w-5 h-5 text-purple-600" />
                    File a Claim
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Policy Number</Label>
                    <Input 
                      placeholder="Enter your policy number"
                      value={claimForm.policyNumber}
                      onChange={(e) => setClaimForm({...claimForm, policyNumber: e.target.value})}
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Claim Type</Label>
                    <Select value={claimForm.claimType} onValueChange={(value) => setClaimForm({...claimForm, claimType: value})}>
                      <SelectTrigger className="border-purple-200 focus:border-purple-400">
                        <SelectValue placeholder="Select claim type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hospitalization">Hospitalization</SelectItem>
                        <SelectItem value="outpatient">Outpatient Treatment</SelectItem>
                        <SelectItem value="pharmacy">Pharmacy Bills</SelectItem>
                        <SelectItem value="emergency">Emergency Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Claim Amount</Label>
                    <Input 
                      placeholder="Claim amount (₹)"
                      value={claimForm.amount}
                      onChange={(e) => setClaimForm({...claimForm, amount: e.target.value})}
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea 
                      placeholder="Brief description of the claim"
                      value={claimForm.description}
                      onChange={(e) => setClaimForm({...claimForm, description: e.target.value})}
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    onClick={submitClaim}
                  >
                    Submit Claim
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Quick Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start border-purple-200 hover:bg-purple-50"
                      >
                        <Phone className="w-4 h-4 mr-2 text-purple-600" />
                        Request Pre-Authorization
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Pre-Authorization Request</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          For cashless treatment, please provide your policy details and hospital information.
                        </p>
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
                          onClick={() => {
                            toast({
                              title: "Pre-Authorization Requested",
                              description: "Your request has been submitted. You'll receive approval within 2-4 hours.",
                            });
                          }}
                        >
                          Submit Request
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start border-purple-200 hover:bg-purple-50"
                      >
                        <Download className="w-4 h-4 mr-2 text-purple-600" />
                        Download Policy Documents
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Policy Documents</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">Policy Certificate</Button>
                          <Button variant="outline" className="w-full justify-start">Coverage Summary</Button>
                          <Button variant="outline" className="w-full justify-start">Claim Form</Button>
                        </div>
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
                          onClick={() => {
                            toast({
                              title: "Documents Downloaded",
                              description: "Policy documents have been downloaded to your device.",
                            });
                          }}
                        >
                          Download All
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-purple-200 hover:bg-purple-50"
                    onClick={() => {
                      toast({
                        title: "Support Contact",
                        description: "Customer support: 1800-XXX-XXXX | Email: support@healthinsurance.com",
                      });
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2 text-purple-600" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Claims Table */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="text-gray-800">Recent Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 'CLM001', type: 'Hospitalization', amount: '₹45,000', status: 'Approved', date: '2025-09-15' },
                    { id: 'CLM002', type: 'Pharmacy', amount: '₹2,500', status: 'Processing', date: '2025-09-18' },
                    { id: 'CLM003', type: 'Emergency Care', amount: '₹12,000', status: 'Pending', date: '2025-09-19' },
                  ].map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                      <div>
                        <p className="font-medium text-gray-800">{claim.id}</p>
                        <p className="text-sm text-gray-600">{claim.type} • {claim.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">{claim.amount}</p>
                        <Badge variant={
                          claim.status === 'Approved' ? 'default' :
                          claim.status === 'Processing' ? 'secondary' : 'outline'
                        }>
                          {claim.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}