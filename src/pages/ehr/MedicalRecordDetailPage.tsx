import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Activity, Stethoscope, Pill } from 'lucide-react';
import { medicalRecordService } from '@/services/medicalRecordService';
import { ROUTES } from '@/config/routes';
import { Tables } from '@/integrations/supabase/types';

type MedicalRecord = Tables<'medical_records'>;

export const MedicalRecordDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) return;
      try {
        const data = await medicalRecordService.getById(id);
        setRecord(data);
      } catch (error) {
        console.error('Error fetching record:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </MainLayout>
    );
  }

  if (!record) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Record not found</p>
          <Button onClick={() => navigate(ROUTES.MEDICAL_RECORDS)} className="mt-4">
            Back to Records
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(ROUTES.MEDICAL_RECORDS)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              {record.record_id}
            </h1>
            <p className="text-muted-foreground">
              Visit Date: {new Date(record.visit_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Visit Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Visit Type</p>
                <Badge>{record.visit_type}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chief Complaint</p>
                <p>{record.chief_complaint || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diagnosis</p>
                <p>{record.diagnosis || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Treatment Plan</p>
                <p>{record.treatment_plan || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="text-lg font-medium">
                    {record.vital_temperature ? `${record.vital_temperature}°F` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Pressure</p>
                  <p className="text-lg font-medium">{record.vital_blood_pressure || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Heart Rate</p>
                  <p className="text-lg font-medium">
                    {record.vital_heart_rate ? `${record.vital_heart_rate} bpm` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">O2 Saturation</p>
                  <p className="text-lg font-medium">
                    {record.vital_oxygen_saturation ? `${record.vital_oxygen_saturation}%` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Respiratory Rate</p>
                  <p className="text-lg font-medium">
                    {record.vital_respiratory_rate ? `${record.vital_respiratory_rate}/min` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="text-lg font-medium">
                    {record.vital_weight ? `${record.vital_weight} kg` : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{record.notes || 'No additional notes.'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
