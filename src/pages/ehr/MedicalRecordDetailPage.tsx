import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MedicalRecord, Prescription, LabResult } from '@/types';
import { medicalRecordService } from '@/services/medicalRecordService';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, User, Activity, Heart, Thermometer, Wind, Scale, Ruler, Droplets, Pill, FlaskConical, Loader2, FileText, Edit } from 'lucide-react';

export const MedicalRecordDetailPage: React.FC = () => {
  const { id } = useParams();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) loadRecord();
  }, [id]);

  const loadRecord = async () => {
    setIsLoading(true);
    try {
      const [recordData, prescData, labData] = await Promise.all([
        medicalRecordService.getById(id!),
        medicalRecordService.getPrescriptions(id!),
        medicalRecordService.getLabResults(id!),
      ]);
      setRecord(recordData);
      setPrescriptions(prescData);
      setLabResults(labData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load medical record', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </MainLayout>
    );
  }

  if (!record) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Record not found</p>
          <Link to="/medical-records"><Button variant="link">Back to records</Button></Link>
        </div>
      </MainLayout>
    );
  }

  const vitals = record.vitalSigns;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/medical-records"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <div>
              <h1 className="text-3xl font-bold">{record.recordId}</h1>
              <p className="text-muted-foreground">Medical Record Details</p>
            </div>
          </div>
          <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit Record</Button>
        </div>

        {/* Visit Info */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Visit Information</CardTitle>
                <CardDescription>Recorded on {new Date(record.createdAt).toLocaleString()}</CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">{record.visitType}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Visit Date</p>
                <p className="font-medium">{new Date(record.visitDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Attending Physician</p>
                <p className="font-medium">{record.doctorName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Vital Signs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Heart className="h-5 w-5 text-destructive mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Blood Pressure</p>
                <p className="font-bold">{vitals.bloodPressure || '-'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Activity className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Heart Rate</p>
                <p className="font-bold">{vitals.heartRate ? `${vitals.heartRate} bpm` : '-'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Thermometer className="h-5 w-5 text-warning mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Temperature</p>
                <p className="font-bold">{vitals.temperature ? `${vitals.temperature}°F` : '-'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Wind className="h-5 w-5 text-secondary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Resp. Rate</p>
                <p className="font-bold">{vitals.respiratoryRate || '-'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Droplets className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">O2 Saturation</p>
                <p className="font-bold">{vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : '-'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Scale className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="font-bold">{vitals.weight ? `${vitals.weight} lbs` : '-'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <Ruler className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Height</p>
                <p className="font-bold">{vitals.height ? `${vitals.height} in` : '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Notes */}
        <Card className="border-2">
          <CardHeader><CardTitle>Clinical Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Chief Complaint</p>
              <p className="bg-muted/50 p-3 rounded-lg">{record.chiefComplaint}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Diagnosis</p>
              <p className="bg-muted/50 p-3 rounded-lg">{record.diagnosis}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Treatment Plan</p>
              <p className="bg-muted/50 p-3 rounded-lg">{record.treatmentPlan}</p>
            </div>
            {record.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Additional Notes</p>
                  <p className="bg-muted/50 p-3 rounded-lg">{record.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Prescriptions */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5 text-secondary" />Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No prescriptions for this visit</p>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((presc) => (
                  <div key={presc.id} className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{presc.medicationName}</p>
                      <Badge variant="outline">{presc.dosage}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <p>Frequency: {presc.frequency}</p>
                      <p>Duration: {presc.duration}</p>
                    </div>
                    {presc.instructions && (
                      <p className="text-sm mt-2 italic">"{presc.instructions}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lab Results */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FlaskConical className="h-5 w-5 text-primary" />Lab Results</CardTitle>
          </CardHeader>
          <CardContent>
            {labResults.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No lab results attached</p>
            ) : (
              <div className="space-y-3">
                {labResults.map((lab) => (
                  <div key={lab.id} className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{lab.testName}</p>
                        <p className="text-sm text-muted-foreground">{lab.labName}</p>
                      </div>
                      <Badge>{new Date(lab.testDate).toLocaleDateString()}</Badge>
                    </div>
                    <p className="mt-2 font-mono text-sm bg-background p-2 rounded">{lab.testResult}</p>
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
