import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DoctorAvailability } from '@/types';
import { appointmentService } from '@/services/appointmentService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Clock } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DoctorAvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadAvailability(); }, []);

  const loadAvailability = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getDoctorAvailability(user?.id || '1');
      // Initialize all days
      const fullWeek = DAYS.map((_, index) => {
        const existing = data.find(d => d.dayOfWeek === index);
        return existing || {
          id: `temp-${index}`,
          doctorId: user?.id || '1',
          dayOfWeek: index,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: index >= 1 && index <= 5, // Mon-Fri default
        };
      });
      setAvailability(fullWeek);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load availability', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (dayOfWeek: number) => {
    setAvailability(prev => prev.map(a => 
      a.dayOfWeek === dayOfWeek ? { ...a, isAvailable: !a.isAvailable } : a
    ));
  };

  const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(prev => prev.map(a => 
      a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await appointmentService.updateDoctorAvailability(user?.id || '1', availability);
      toast({ title: 'Success', description: 'Availability updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save availability', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Availability Settings</h1>
            <p className="text-muted-foreground">Configure your weekly availability for appointments</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>Set your available hours for each day of the week</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-4">
                {availability.map((day) => (
                  <div
                    key={day.dayOfWeek}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-colors ${
                      day.isAvailable ? 'bg-card border-primary/20' : 'bg-muted/30 border-transparent'
                    }`}
                  >
                    <div className="w-28">
                      <p className="font-medium">{DAYS[day.dayOfWeek]}</p>
                    </div>
                    
                    <Switch
                      checked={day.isAvailable}
                      onCheckedChange={() => handleToggle(day.dayOfWeek)}
                    />

                    {day.isAvailable ? (
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-muted-foreground">From</Label>
                          <Input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-muted-foreground">To</Label>
                          <Input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not available</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">How availability works</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Patients and receptionists can only book appointments during your available hours. 
                  Time slots are generated in 30-minute intervals within your set hours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};
