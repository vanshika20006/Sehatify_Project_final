import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Layers, 
  Filter, 
  Play, 
  Pause, 
  Calendar, 
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
  Shield,
  Info,
  ChevronDown,
  ChevronRight,
  Settings,
  Download,
  Share,
  Bell,
  Plus,
  X,
  MapPinIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import 'leaflet/dist/leaflet.css';

// Import Leaflet CSS and fix default marker icons
import L from 'leaflet';

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Heatmap Effect Component using Circles
function HeatmapEffect({ diseaseData, opacity }: { diseaseData: DiseaseData[], opacity: number }) {
  return (
    <>
      {diseaseData.map((disease) => (
        <Circle
          key={`heatmap-${disease.id}`}
          center={[disease.latitude, disease.longitude]}
          radius={Math.sqrt(disease.cases) * 200} // Increased radius for better visibility
          pathOptions={{
            fillColor: disease.color,
            color: disease.color,
            weight: 3,
            opacity: Math.max(opacity, 0.8), // Ensure minimum visibility
            fillOpacity: Math.max(opacity * 0.5, 0.3), // Increased fill opacity
          }}
        />
      ))}
    </>
  );
}

interface DiseaseData {
  id: string;
  disease: string;
  name: string;
  cases: number;
  incidenceRate: number;
  change7d: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  color: string;
  latitude: number;
  longitude: number;
  lastUpdated: string;
  area: string;
  population: number;
  sources: Array<{
    type: 'hospital' | 'lab' | 'user_report' | 'official';
    confidence: number;
    count: number;
  }>;
  symptoms: string[];
  timeline: Array<{
    date: string;
    cases: number;
  }>;
}

interface DiseaseApiResponse {
  data: DiseaseData[];
  summary: {
    totalCases: number;
    newToday: number;
    activeHotspots: number;
    lastUpdated: string;
  };
  hotspots: Array<{
    id: string;
    latitude: number;
    longitude: number;
    radius: number;
    cases: number;
    severity: string;
    diseases: string[];
    detectedAt: string;
    riskScore: number;
  }>;
}

interface SearchResult {
  id: string;
  name: string;
  area: string;
  cases: number;
  severity: string;
}

interface ReportCaseData {
  disease: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  source: 'hospital' | 'lab' | 'user_report' | 'official';
  description?: string;
}

interface MapLayerConfig {
  id: string;
  name: string;
  type: 'choropleth' | 'heatmap' | 'pins';
  enabled: boolean;
  opacity: number;
}

export function DiseaseMapPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Fetch disease data from backend
  const { data: diseaseResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/disease-surveillance/data'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Extract disease data and summary from response
  const backendDiseaseData = (diseaseResponse as DiseaseApiResponse)?.data || [];
  const summary = (diseaseResponse as DiseaseApiResponse)?.summary || {
    totalCases: 0,
    newToday: 0,
    activeHotspots: 0,
    lastUpdated: new Date().toISOString()
  };
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>(['covid19', 'dengue']);
  const [timeRange, setTimeRange] = useState<string>('last_7_days');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [selectedArea, setSelectedArea] = useState<DiseaseData | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportFormData, setReportFormData] = useState<ReportCaseData>({
    disease: '',
    latitude: 0,
    longitude: 0,
    severity: 'low',
    symptoms: [],
    source: 'user_report',
    description: ''
  });
  
  const [mapLayers, setMapLayers] = useState<MapLayerConfig[]>([
    { id: 'choropleth', name: 'Area Rates', type: 'choropleth', enabled: true, opacity: 0.7 },
    { id: 'heatmap', name: 'Density Heatmap', type: 'heatmap', enabled: true, opacity: 0.6 },
    { id: 'pins', name: 'Individual Reports', type: 'pins', enabled: true, opacity: 1.0 },
  ]);

  // Use backend data or fallback to empty array
  const diseaseData = backendDiseaseData;

  // Debounced search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search API integration with debouncing
  const { data: searchResponse } = useQuery({
    queryKey: ['/api/disease-surveillance/search', { q: debouncedSearchQuery }],
    enabled: debouncedSearchQuery.length > 2, // Only search if query is longer than 2 characters
  });

  // Update search results when searchResponse changes
  useEffect(() => {
    if (searchResponse && debouncedSearchQuery.length > 2) {
      // Handle both direct array response and wrapped response
      const results = Array.isArray(searchResponse) ? searchResponse : (searchResponse as any)?.results || (searchResponse as any)?.diseases || [];
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchResponse, debouncedSearchQuery]);

  const availableDiseases = [
    { id: 'covid19', name: 'COVID-19', color: '#dc2626' },
    { id: 'dengue', name: 'Dengue Fever', color: '#f59e0b' },
    { id: 'malaria', name: 'Malaria', color: '#059669' },
    { id: 'typhoid', name: 'Typhoid', color: '#7c3aed' },
    { id: 'chikungunya', name: 'Chikungunya', color: '#e11d48' },
  ];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Location Found",
            description: "Your location has been detected successfully.",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Delhi, India if location access denied
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    }
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'lab': return '🔬';
      case 'official': return '🏛️';
      case 'user_report': return '👤';
      default: return '📊';
    }
  };

  const toggleDiseaseSelection = (diseaseId: string) => {
    setSelectedDiseases(prev => 
      prev.includes(diseaseId) 
        ? prev.filter(id => id !== diseaseId)
        : [...prev, diseaseId]
    );
  };

  const toggleLayerVisibility = (layerId: string) => {
    setMapLayers(prev => 
      prev.map(layer => 
        layer.id === layerId 
          ? { ...layer, enabled: !layer.enabled }
          : layer
      )
    );
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setMapLayers(prev => 
      prev.map(layer => 
        layer.id === layerId 
          ? { ...layer, opacity: opacity / 100 }
          : layer
      )
    );
  };

  // Report case mutation
  const reportCaseMutation = useMutation({
    mutationFn: async (data: ReportCaseData) => {
      const response = await fetch('/api/disease-surveillance/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to report case');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Case Reported",
        description: "Your case report has been submitted successfully.",
      });
      refetch(); // Refresh the disease data
    },
    onError: (error) => {
      console.error('Error reporting case:', error);
      toast({
        title: "Error",
        description: "Failed to submit case report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleReportCase = (data: ReportCaseData) => {
    reportCaseMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Top Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-purple-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section - Disease Selector */}
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-800">Disease Surveillance Map</h1>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex flex-wrap gap-2">
                {availableDiseases.map((disease) => (
                  <Toggle
                    key={disease.id}
                    pressed={selectedDiseases.includes(disease.id)}
                    onPressedChange={() => toggleDiseaseSelection(disease.id)}
                    className="data-[state=on]:bg-purple-100 data-[state=on]:text-purple-700 hover:bg-purple-50 border-purple-200 rounded-xl transition-all duration-300"
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: disease.color }}
                    />
                    {disease.name}
                  </Toggle>
                ))}
              </div>
            </div>

            {/* Center Section - Last 7 Days Stats */}
            <div className="flex items-center space-x-4">
              <Card className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-md rounded-xl">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg text-purple-600">{summary.totalCases.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Total Cases</div>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-center">
                    <div className="font-bold text-lg text-green-600">+{summary.newToday}</div>
                    <div className="text-xs text-gray-600">New Today</div>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="text-center">
                    <div className="font-bold text-lg text-orange-600">{summary.activeHotspots}</div>
                    <div className="text-xs text-gray-600">Active Hotspots</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Section - Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by disease, symptom, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          // Focus on the disease location on map
                          const matchingDisease = diseaseData.find((d: DiseaseData) => d.id === result.id);
                          if (matchingDisease) {
                            setUserLocation({
                              lat: matchingDisease.latitude,
                              lng: matchingDisease.longitude
                            });
                          }
                          setSearchQuery('');
                          setShowSearchResults(false);
                          toast({
                            title: "Focused on location",
                            description: `Map centered on ${result.name} in ${result.area}`,
                          });
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{result.name}</div>
                            <div className="text-sm text-gray-600">{result.area}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{result.cases} cases</div>
                            <Badge variant={
                              result.severity === 'critical' ? 'destructive' :
                              result.severity === 'high' ? 'secondary' : 'outline'
                            }>
                              {result.severity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Time Range & Actions */}
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_24h">Last 24h</SelectItem>
                  <SelectItem value="last_7_days">Last 7 days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 days</SelectItem>
                  <SelectItem value="last_3_months">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 p-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bell className="w-4 h-4 mr-2" />
                    Alerts
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-3">
                    <h4 className="font-medium">Alert Settings</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">New hotspot alerts</span>
                        <Toggle size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Case increase alerts</span>
                        <Toggle size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Risk level changes</span>
                        <Toggle size="sm" />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <div className={`${leftPanelCollapsed ? 'w-16' : 'w-96'} transition-all duration-300 bg-white/95 backdrop-blur-sm border-r border-purple-200 shadow-md`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              {!leftPanelCollapsed && <h3 className="font-semibold text-gray-800">Disease Overview</h3>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                className="h-8 w-8 p-0"
              >
                {leftPanelCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {!leftPanelCollapsed && (
              <div className="space-y-4">
                {/* Quick Stats */}
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-md rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-700 font-semibold">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Cases</span>
                        <span className="font-bold text-purple-600">{summary.totalCases.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">New Today</span>
                        <span className="font-bold text-green-600">+{summary.newToday}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active Hotspots</span>
                        <span className="font-bold text-orange-600">{summary.activeHotspots}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Layer Controls */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-600">Map Layers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mapLayers.map((layer) => (
                        <div key={layer.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Toggle
                              pressed={layer.enabled}
                              onPressedChange={() => toggleLayerVisibility(layer.id)}
                              size="sm"
                              className="text-xs"
                            >
                              {layer.name}
                            </Toggle>
                          </div>
                          {layer.enabled && (
                            <div className="ml-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">Opacity</span>
                                <Slider
                                  value={[layer.opacity * 100]}
                                  onValueChange={(value) => updateLayerOpacity(layer.id, value[0])}
                                  max={100}
                                  step={10}
                                  className="flex-1"
                                />
                                <span className="text-xs text-gray-500 w-8">
                                  {Math.round(layer.opacity * 100)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Disease Data */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-600">Active Diseases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {diseaseData.filter(d => selectedDiseases.includes(d.id)).map((disease) => (
                        <div
                          key={disease.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setSelectedArea(disease)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: disease.color }}
                              />
                              <span className="font-medium text-sm">{disease.name}</span>
                            </div>
                            <Badge className={getSeverityColor(disease.severity)}>
                              {disease.severity}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Cases</span>
                              <span className="font-medium">{disease.cases.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Rate per 1K</span>
                              <span className="font-medium">{disease.incidenceRate}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">7-day change</span>
                              <span className={`font-medium ${disease.change7d >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {disease.change7d >= 0 ? '+' : ''}{disease.change7d}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Report Case Button */}
                <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Report a Case
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Report a Disease Case</DialogTitle>
                    </DialogHeader>
                    <ReportCaseForm 
                      userLocation={userLocation}
                      onSubmit={(data) => {
                        handleReportCase(data);
                        setShowReportDialog(false);
                      }}
                      onCancel={() => setShowReportDialog(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>

        {/* Main Map Container */}
        <div className="flex-1 relative">
          {userLocation && (
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={10}
              className="w-full h-full"
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {/* Disease Pins Layer */}
              {mapLayers.find(l => l.id === 'pins')?.enabled && diseaseData.map((disease) => (
                <Marker
                  key={disease.id}
                  position={[disease.latitude, disease.longitude]}
                >
                  <Popup>
                    <div className="p-2 min-w-64">
                      <h3 className="font-semibold text-lg mb-2">{disease.name}</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Cases:</strong> {disease.cases.toLocaleString()}</p>
                        <p><strong>Incidence Rate:</strong> {disease.incidenceRate} per 1000</p>
                        <p><strong>Severity:</strong> 
                          <span className={`ml-1 px-2 py-1 rounded text-xs ${
                            disease.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            disease.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            disease.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {disease.severity}
                          </span>
                        </p>
                        <p><strong>7-day Change:</strong> 
                          <span className={`ml-1 ${disease.change7d >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {disease.change7d >= 0 ? '+' : ''}{disease.change7d}%
                          </span>
                        </p>
                        <div className="mt-2">
                          <p className="font-medium">Common Symptoms:</p>
                          <p className="text-gray-600">{disease.symptoms.join(', ')}</p>
                        </div>
                        <div className="mt-2">
                          <p className="font-medium">Data Sources:</p>
                          {disease.sources.map((source, idx) => (
                            <p key={idx} className="text-xs text-gray-600">
                              {source.type}: {source.count} reports (confidence: {(source.confidence * 100).toFixed(0)}%)
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Simple Heatmap Layer using Circles */}
              {mapLayers.find(l => l.id === 'heatmap')?.enabled && (
                <HeatmapEffect diseaseData={diseaseData} opacity={mapLayers.find(l => l.id === 'heatmap')?.opacity || 0.6} />
              )}
            </MapContainer>
          )}

          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2 z-[1000]">
            <Card className="p-2">
              <div className="flex flex-col space-y-1">
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <Layers className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Time Slider (when playing animation) */}
          {isPlaying && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
              <Card className="p-4 min-w-96">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPlaying(false)}
                    className="w-8 h-8 p-0"
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                  <Slider
                    value={[50]}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">
                    {currentTime.toLocaleDateString()}
                  </span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Selected Area Modal */}
      {selectedArea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedArea.color }}
                  />
                  <CardTitle>{selectedArea.name} Details</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedArea(null)}
                  className="w-8 h-8 p-0"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-lg text-purple-600">{selectedArea.cases}</div>
                    <div className="text-sm text-gray-600">Total Cases</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-lg text-purple-600">{selectedArea.incidenceRate}</div>
                    <div className="text-sm text-gray-600">Per 1,000 people</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`font-semibold text-lg ${selectedArea.change7d >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedArea.change7d >= 0 ? '+' : ''}{selectedArea.change7d}%
                    </div>
                    <div className="text-sm text-gray-600">7-day change</div>
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <h4 className="font-medium mb-2">Common Symptoms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArea.symptoms.map((symptom) => (
                      <Badge key={symptom} variant="secondary">{symptom}</Badge>
                    ))}
                  </div>
                </div>

                {/* Sources & Confidence */}
                <div>
                  <h4 className="font-medium mb-2">Data Sources & Confidence</h4>
                  <div className="space-y-2">
                    {selectedArea.sources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span>{getSourceIcon(source.type)}</span>
                          <span className="text-sm capitalize">{source.type.replace('_', ' ')}</span>
                          <Badge variant="outline">{source.count} reports</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${source.confidence > 0.9 ? 'bg-green-500' : source.confidence > 0.8 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                          <span className="text-sm font-medium">{Math.round(source.confidence * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Report Case Here
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Bell className="w-4 h-4 mr-2" />
                    Set Alert
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Report Case Form Component
interface ReportCaseFormProps {
  userLocation: { lat: number; lng: number } | null;
  onSubmit: (data: ReportCaseData) => void;
  onCancel: () => void;
}

function ReportCaseForm({ userLocation, onSubmit, onCancel }: ReportCaseFormProps) {
  const [formData, setFormData] = useState<ReportCaseData>({
    disease: '',
    latitude: userLocation?.lat || 28.6139, // Default to Delhi if no location
    longitude: userLocation?.lng || 77.2090,
    severity: 'low',
    symptoms: [],
    source: 'user_report',
    description: ''
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Update coordinates when userLocation changes
  useEffect(() => {
    if (userLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: userLocation.lat,
        longitude: userLocation.lng
      }));
    }
  }, [userLocation]);
  const availableSymptoms = [
    'Fever', 'Cough', 'Fatigue', 'Body aches', 'Headache', 'Sore throat',
    'Shortness of breath', 'Nausea', 'Vomiting', 'Diarrhea', 'Chills',
    'Joint pain', 'Rash', 'High fever', 'Severe headache', 'Sweats'
  ];

  const availableDiseases = [
    { id: 'covid19', name: 'COVID-19' },
    { id: 'dengue', name: 'Dengue Fever' },
    { id: 'malaria', name: 'Malaria' },
    { id: 'typhoid', name: 'Typhoid' },
    { id: 'chikungunya', name: 'Chikungunya' }
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => {
      const newSymptoms = prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom];
      setFormData(current => ({ ...current, symptoms: newSymptoms }));
      return newSymptoms;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.disease) {
      alert('Please select a disease');
      return;
    }
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom');
      return;
    }
    if (formData.latitude === 0 && formData.longitude === 0) {
      alert('Please provide a valid location');
      return;
    }
    onSubmit({ ...formData, symptoms: selectedSymptoms });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Disease Selection */}
      <div>
        <Label htmlFor="disease">Disease</Label>
        <Select 
          value={formData.disease} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, disease: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a disease" />
          </SelectTrigger>
          <SelectContent>
            {availableDiseases.map((disease) => (
              <SelectItem key={disease.id} value={disease.id}>
                {disease.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Severity */}
      <div>
        <Label htmlFor="severity">Severity</Label>
        <Select 
          value={formData.severity} 
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Symptoms */}
      <div>
        <Label>Symptoms (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
          {availableSymptoms.map((symptom) => (
            <div key={symptom} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={symptom}
                checked={selectedSymptoms.includes(symptom)}
                onChange={() => handleSymptomToggle(symptom)}
                className="rounded"
              />
              <Label htmlFor={symptom} className="text-sm">{symptom}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Additional Details (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Describe any additional symptoms or context..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1"
        />
      </div>

      {/* Location */}
      <div>
        <Label>Location</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <Label htmlFor="latitude" className="text-xs">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.0001"
              value={formData.latitude}
              onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
              className="text-sm"
              placeholder="28.6139"
            />
          </div>
          <div>
            <Label htmlFor="longitude" className="text-xs">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.0001"
              value={formData.longitude}
              onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
              className="text-sm"
              placeholder="77.2090"
            />
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {userLocation ? 'Auto-detected your location. You can edit coordinates above.' : 'Please enter coordinates or allow location access.'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
          Submit Report
        </Button>
      </div>
    </form>
  );
}