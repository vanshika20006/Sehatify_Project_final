import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { CalendarDays, Clock, DollarSign, User, Phone, Mail, Stethoscope, MapPin } from 'lucide-react';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { Doctor } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface AppointmentBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  hospital?: Hospital;
  onConfirm: (appointmentData: any) => Promise<void>;
}

type AppointmentType = 'video_call' | 'clinic_visit' | 'home_visit';

const AppointmentBookingDialog: React.FC<AppointmentBookingDialogProps> = ({
  isOpen,
  onClose,
  doctor,
  hospital,
  onConfirm
}) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('clinic_visit');
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    age: ''
  });

  // Generate available time slots based on doctor's availability
  const getAvailableTimeSlots = (date: Date) => {
    if (!doctor || !selectedDate) return [];
    
    const dayName = format(date, 'EEEE');
    const availability = doctor.availability.find(avail => avail.day === dayName);
    
    if (!availability) return [];
    
    const slots = [];
    const startHour = parseInt(availability.startTime.split(':')[0]);
    const endHour = parseInt(availability.endTime.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < endHour - 1) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    
    return slots;
  };

  const timeSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctor || !selectedDate || !selectedTime || !patientInfo.name || !patientInfo.phone || !patientInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const appointmentData = {
        doctorId: doctor.id,
        appointmentType,
        scheduledDateTime: appointmentDateTime.toISOString(),
        symptoms,
        patientInfo: {
          ...patientInfo,
          age: patientInfo.age ? parseInt(patientInfo.age) : undefined
        }
      };

      await onConfirm(appointmentData);
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setSymptoms('');
      setPatientInfo({ name: '', phone: '', email: '', age: '' });
      setAppointmentType('clinic_visit');
      
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30); // Allow booking up to 30 days in advance
    
    if (isBefore(date, today) || isAfter(date, maxDate)) {
      return true;
    }
    
    if (!doctor) return true;
    
    const dayName = format(date, 'EEEE');
    const hasAvailability = doctor.availability.some(avail => avail.day === dayName);
    
    return !hasAvailability;
  };

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            Book Appointment with {doctor.name}
          </DialogTitle>
          <DialogDescription>
            {doctor.specialization} • {doctor.qualification} • {doctor.experience} years experience
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Doctor & Hospital Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                <p className="text-sm text-gray-600">{doctor.specialization}</p>
                {hospital && (
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{hospital.name}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center text-lg font-semibold text-green-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ₹{doctor.consultationFee}
                </div>
                <p className="text-xs text-gray-500">Consultation Fee</p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={patientInfo.name}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={patientInfo.age}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Your age"
                min="1"
                max="120"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={patientInfo.phone}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={patientInfo.email}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          {/* Appointment Type */}
          <div>
            <Label>Appointment Type</Label>
            <Select value={appointmentType} onValueChange={(value: AppointmentType) => setAppointmentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinic_visit">Clinic Visit</SelectItem>
                {doctor.isOnline && (
                  <SelectItem value="video_call">Video Consultation</SelectItem>
                )}
                <SelectItem value="home_visit">Home Visit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Select Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Select Time *
              </Label>
              <Select 
                value={selectedTime} 
                onValueChange={setSelectedTime}
                disabled={!selectedDate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <Label htmlFor="symptoms">Symptoms / Reason for Visit</Label>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Please describe your symptoms or reason for consultation..."
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Booking...' : 'Confirm Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBookingDialog;