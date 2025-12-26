import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, FileText, Calendar, Pill, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type MedicalRecord = Tables<'medical_records'>;
type Appointment = Tables<'appointments'>;

export const PatientPortalPage: React.FC = () => {
  const { profile } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // For now, show empty state - patient portal would need patient-user linking
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Patient Portal</h1>
          <p className="text-muted-foreground">View your health information</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile ? (
                <div className="space-y-2">
                  <p><span className="text-muted-foreground">Name:</span> {profile.first_name} {profile.last_name}</p>
                  <p><span className="text-muted-foreground">Email:</span> {profile.email}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading profile...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No upcoming appointments</p>
              ) : (
                <div className="space-y-2">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{new Date(apt.appointment_date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{apt.appointment_time}</p>
                      </div>
                      <Badge>{apt.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Medical Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : records.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No medical records available</p>
              ) : (
                <div className="space-y-4">
                  {records.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(record.visit_date).toLocaleDateString()}</span>
                        <Badge variant="outline">{record.visit_type}</Badge>
                      </div>
                      {record.diagnosis && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Diagnosis: </span>
                          {record.diagnosis}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
