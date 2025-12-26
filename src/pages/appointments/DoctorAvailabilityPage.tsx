import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const DoctorAvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', user.id);

      if (error) {
        console.error('Error fetching availability:', error);
      } else if (data) {
        // Initialize all days if not present
        const slots: AvailabilitySlot[] = DAYS.map((_, index) => {
          const existing = data.find((d) => d.day_of_week === index);
          return existing || {
            day_of_week: index,
            start_time: '09:00',
            end_time: '17:00',
            is_available: false,
          };
        });
        setAvailability(slots);
      }
      setIsLoading(false);
    };

    fetchAvailability();
  }, [user?.id]);

  const updateSlot = (dayIndex: number, field: keyof AvailabilitySlot, value: string | boolean) => {
    setAvailability((prev) =>
      prev.map((slot) =>
        slot.day_of_week === dayIndex ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);

    try {
      // Delete existing and insert new
      await supabase.from('doctor_availability').delete().eq('doctor_id', user.id);

      const { error } = await supabase.from('doctor_availability').insert(
        availability
          .filter((slot) => slot.is_available)
          .map((slot) => ({
            doctor_id: user.id,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_available: slot.is_available,
          }))
      );

      if (error) throw error;
      toast.success('Availability saved successfully');
    } catch (error) {
      toast.error('Failed to save availability');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Availability Settings</h1>
            <p className="text-muted-foreground">Configure your weekly availability</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {availability.map((slot) => (
                  <div
                    key={slot.day_of_week}
                    className="flex items-center gap-4 border-b pb-4 last:border-0"
                  >
                    <div className="w-28">
                      <Label>{DAYS[slot.day_of_week]}</Label>
                    </div>
                    <Switch
                      checked={slot.is_available}
                      onCheckedChange={(checked) =>
                        updateSlot(slot.day_of_week, 'is_available', checked)
                      }
                    />
                    {slot.is_available && (
                      <>
                        <div className="flex items-center gap-2">
                          <Label>From</Label>
                          <Input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) =>
                              updateSlot(slot.day_of_week, 'start_time', e.target.value)
                            }
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label>To</Label>
                          <Input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) =>
                              updateSlot(slot.day_of_week, 'end_time', e.target.value)
                            }
                            className="w-32"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};
