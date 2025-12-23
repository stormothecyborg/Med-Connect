import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { appointmentService } from '@/services/appointmentService';
import { patientService } from '@/services/patientService';
import { userService } from '@/services/userService';
import { Patient, User } from '@/types';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, CalendarIcon, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  appointmentDate: z.date({ required_error: 'Date is required' }),
  appointmentTime: z.string().min(1, 'Time slot is required'),
  appointmentType: z.string().min(1, 'Type is required'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const AppointmentBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  const selectedDoctor = watch('doctorId');
  const selectedDate = watch('appointmentDate');
  const selectedTime = watch('appointmentTime');

  useEffect(() => {
    const loadData = async () => {
      const [patientsData, doctorsData] = await Promise.all([
        patientService.getAll(),
        userService.getDoctors(),
      ]);
      setPatients(patientsData);
      setDoctors(doctorsData);
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDoctor || !selectedDate) {
        setAvailableSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const slots = await appointmentService.getAvailableSlots(selectedDoctor, dateStr);
        setAvailableSlots(slots);
        if (selectedTime && !slots.includes(selectedTime)) {
          setValue('appointmentTime', '');
        }
      } catch (error) {
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [selectedDoctor, selectedDate]);

  const onSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true);
    try {
      const patient = patients.find(p => p.id === data.patientId);
      const doctor = doctors.find(d => d.id === data.doctorId);
      
      await appointmentService.create({
        patientId: data.patientId,
        doctorId: data.doctorId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : '',
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : '',
        appointmentDate: format(data.appointmentDate, 'yyyy-MM-dd'),
        appointmentTime: data.appointmentTime,
        duration: 30,
        status: 'scheduled',
        appointmentType: data.appointmentType,
        reason: data.reason,
        notes: data.notes || '',
      });
      toast({ title: 'Success', description: 'Appointment booked successfully' });
      navigate(ROUTES.APPOINTMENTS);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to book appointment', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const appointmentTypes = ['Consultation', 'Follow-up', 'Check-up', 'Emergency', 'Procedure'];

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to={ROUTES.APPOINTMENTS}><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-3xl font-bold">Book Appointment</h1>
            <p className="text-muted-foreground">Schedule a new patient appointment</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Patient & Doctor Selection */}
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Patient & Doctor</CardTitle>
                  <CardDescription>Select the patient and attending doctor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Patient *</Label>
                    <Select onValueChange={(v) => setValue('patientId', v)}>
                      <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                      <SelectContent>
                        {patients.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.firstName} {p.lastName} ({p.patientId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.patientId && <p className="text-sm text-destructive">{errors.patientId.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Doctor *</Label>
                    <Select onValueChange={(v) => setValue('doctorId', v)}>
                      <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                      <SelectContent>
                        {doctors.map(d => (
                          <SelectItem key={d.id} value={d.id}>
                            Dr. {d.firstName} {d.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.doctorId && <p className="text-sm text-destructive">{errors.doctorId.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Appointment Type *</Label>
                    <Select onValueChange={(v) => setValue('appointmentType', v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.appointmentType && <p className="text-sm text-destructive">{errors.appointmentType.message}</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Appointment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reason for Visit *</Label>
                    <Textarea {...register('reason')} placeholder="Describe the reason for this appointment" />
                    {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea {...register('notes')} placeholder="Any special instructions or notes" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Date & Time Selection */}
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                  <CardDescription>Choose an available date</CardDescription>
                </CardHeader>
                <CardContent>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setValue('appointmentDate', date)}
                        disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.appointmentDate && <p className="text-sm text-destructive mt-2">{errors.appointmentDate.message}</p>}
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Available Time Slots
                  </CardTitle>
                  <CardDescription>
                    {selectedDoctor && selectedDate 
                      ? `Slots for ${format(selectedDate, 'MMMM d, yyyy')}`
                      : 'Select a doctor and date first'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingSlots ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          type="button"
                          variant={selectedTime === slot ? "default" : "outline"}
                          size="sm"
                          onClick={() => setValue('appointmentTime', slot)}
                          className="text-sm"
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  ) : selectedDoctor && selectedDate ? (
                    <p className="text-center text-muted-foreground py-4">No available slots for this date</p>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Select a doctor and date to see available slots</p>
                  )}
                  {errors.appointmentTime && <p className="text-sm text-destructive mt-2">{errors.appointmentTime.message}</p>}
                </CardContent>
              </Card>

              {/* Summary */}
              {selectedTime && selectedDate && (
                <Card className="border-2 border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <Badge variant="secondary">{selectedTime}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>30 minutes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-6">
            <Link to={ROUTES.APPOINTMENTS}><Button variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Book Appointment
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
