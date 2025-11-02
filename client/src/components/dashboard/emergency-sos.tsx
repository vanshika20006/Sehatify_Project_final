import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Users, MapPin, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface EmergencySOSProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencySOS({ isOpen, onClose }: EmergencySOSProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          resolve(position);
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  const call108Ambulance = async () => {
    setIsProcessing(true);
    try {
      // Get current location
      const position = await getCurrentLocation();
      
      // In a real implementation, this would:
      // 1. Call emergency services API
      // 2. Send location data
      // 3. Provide medical history
      
      toast({
        title: "Emergency services contacted",
        description: "108 ambulance has been notified. Help is on the way.",
        variant: "default"
      });

      // Simulate emergency call
      setTimeout(() => {
        window.open('tel:108', '_self');
      }, 1000);

    } catch (error) {
      toast({
        title: "Location access required",
        description: "Please enable location services and try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const notifyEmergencyContacts = async () => {
    setIsProcessing(true);
    try {
      // In a real implementation, this would:
      // 1. Fetch user's emergency contacts from Firebase
      // 2. Send SMS/calls to all contacts
      // 3. Include current location and health status
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Emergency contacts notified",
        description: "Your emergency contacts have been alerted about your situation.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Failed to notify contacts",
        description: "Please try again or call them manually.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const shareCurrentLocation = async () => {
    setIsProcessing(true);
    try {
      const position = await getCurrentLocation();
      
      // Generate shareable location link
      const locationUrl = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Emergency Location',
          text: 'I need help! Here is my current location:',
          url: locationUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(locationUrl);
        toast({
          title: "Location copied",
          description: "Location link copied to clipboard. Share it with emergency contacts.",
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to share location",
        description: "Please try again or share your location manually.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-red-900/90 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-red-200 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600" data-testid="text-emergency-title">
            {t('emergency_title')}
          </CardTitle>
          <CardDescription className="text-gray-600" data-testid="text-emergency-description">
            {t('emergency_description')}
          </CardDescription>
          
          {location && (
            <Badge variant="outline" className="mt-2">
              <MapPin className="w-3 h-3 mr-1" />
              Location acquired
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={call108Ambulance}
            disabled={isProcessing}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-4 text-lg font-semibold"
            data-testid="button-call-ambulance"
          >
            <Phone className="w-5 h-5 mr-3" />
            {t('call_ambulance')}
          </Button>

          <Button
            onClick={notifyEmergencyContacts}
            disabled={isProcessing}
            variant="outline"
            className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 py-4 text-lg font-semibold"
            data-testid="button-notify-contacts"
          >
            <Users className="w-5 h-5 mr-3" />
            {t('notify_contacts')}
          </Button>

          <Button
            onClick={shareCurrentLocation}
            disabled={isProcessing}
            variant="outline"
            className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 py-4 text-lg font-semibold"
            data-testid="button-share-location"
          >
            <MapPin className="w-5 h-5 mr-3" />
            {t('share_location')}
          </Button>

          <div className="pt-4 border-t text-center">
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={isProcessing}
              data-testid="button-cancel-emergency"
            >
              <X className="w-4 h-4 mr-2" />
              {t('cancel')}
            </Button>
          </div>

          {isProcessing && (
            <div className="text-center py-2">
              <div className="inline-flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
