import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Appointment } from '@/types';
import { appointmentService } from '@/services/appointmentService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Loader2, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DoctorSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { toast } = useToast();

  useEffect(() => { loadAppointments(); }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getAll({ doctorId: user?.id });
      setAppointments(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load schedule', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      apt.appointmentDate === format(date, 'yyyy-MM-dd') && apt.status !== 'cancelled'
    ).sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-primary text-primary-foreground';
      case 'scheduled': return 'bg-muted text-muted-foreground border-2 border-dashed';
      case 'completed': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted';
    }
  };

  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Schedule</h1>
            <p className="text-muted-foreground">View and manage your appointments</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-48 text-center">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 4), 'MMM d, yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Calendar Sidebar */}
          <Card className="border-2 lg:col-span-1">
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="pointer-events-auto"
              />
            </CardContent>
          </Card>

          {/* Week View */}
          <Card className="border-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    {/* Header */}
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {weekDays.map((day) => (
                        <div
                          key={day.toISOString()}
                          className={cn(
                            "text-center p-3 rounded-lg",
                            isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}
                        >
                          <p className="text-xs font-medium">{format(day, 'EEE')}</p>
                          <p className="text-lg font-bold">{format(day, 'd')}</p>
                        </div>
                      ))}
                    </div>

                    {/* Appointments Grid */}
                    <div className="grid grid-cols-5 gap-2">
                      {weekDays.map((day) => {
                        const dayAppointments = getAppointmentsForDate(day);
                        return (
                          <div key={day.toISOString()} className="space-y-2 min-h-[200px]">
                            {dayAppointments.length > 0 ? (
                              dayAppointments.map((apt) => (
                                <div
                                  key={apt.id}
                                  className={cn(
                                    "p-2 rounded-lg text-xs",
                                    getStatusColor(apt.status)
                                  )}
                                >
                                  <div className="flex items-center gap-1 font-medium">
                                    <Clock className="h-3 w-3" />
                                    {apt.appointmentTime}
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <User className="h-3 w-3" />
                                    <span className="truncate">{apt.patientName}</span>
                                  </div>
                                  <Badge variant="outline" className="mt-1 text-[10px]">
                                    {apt.appointmentType}
                                  </Badge>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-muted-foreground text-xs py-4">No appointments</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today's Details */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>
              {isSameDay(selectedDate, new Date()) ? "Today's" : format(selectedDate, 'EEEE, MMMM d')} Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getAppointmentsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getAppointmentsForDate(selectedDate).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.patientName}</p>
                        <p className="text-sm text-muted-foreground">{apt.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{apt.appointmentTime}</p>
                      <Badge variant={apt.status === 'confirmed' ? 'default' : 'outline'} className="capitalize">
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No appointments scheduled for this day</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};
