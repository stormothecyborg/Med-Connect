import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, FileText, Calendar } from 'lucide-react';
import { patientService } from '@/services/patientService';
import { medicalRecordService } from '@/services/medicalRecordService';
import { ROUTES } from '@/config/routes';
import { Tables } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';

type Patient = Tables<'patients'>;
type MedicalRecord = Tables<'medical_records'>;

export const PatientHistoryPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      try {
        const [patientData, recordsData] = await Promise.all([
          patientService.getById(patientId),
          medicalRecordService.getByPatient(patientId),
        ]);
        setPatient(patientData);
        setRecords(recordsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </MainLayout>
    );
  }

  if (!patient) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Patient not found</p>
          <Button onClick={() => navigate(ROUTES.PATIENTS)} className="mt-4">
            Back to Patients
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(ROUTES.PATIENTS)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{patient.first_name} {patient.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Patient ID</p>
              <p className="font-medium">{patient.patient_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium capitalize">{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Blood Group</p>
              <p className="font-medium">{patient.blood_group || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Allergies</p>
              <p className="font-medium">{patient.allergies || 'None known'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Medical History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No medical records found</p>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {new Date(record.visit_date).toLocaleDateString()}
                        </span>
                        <Badge variant="outline">{record.visit_type}</Badge>
                      </div>
                      <Link to={`/medical-records/${record.id}`}>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </Link>
                    </div>
                    {record.diagnosis && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Diagnosis: </span>
                        {record.diagnosis}
                      </p>
                    )}
                    {record.chief_complaint && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Chief Complaint: </span>
                        {record.chief_complaint}
                      </p>
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
