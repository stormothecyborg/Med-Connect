import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MedicalRecord, Prescription, LabResult } from '@/types';
import { medicalRecordService } from '@/services/medicalRecordService';
import { useToast } from '@/hooks/use-toast';
import { Calendar, FileText, Pill, FlaskConical, Loader2, Activity, Clock, Heart, Thermometer, Lock, Eye } from 'lucide-react';

// For demo, show records for patient pat-1
const DEMO_PATIENT_ID = 'pat-1';

export const PatientPortalPage: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const historyData = await medicalRecordService.getPatientHistory(DEMO_PATIENT_ID);
      setRecords(historyData.records);
      setPrescriptions(historyData.prescriptions);
      setLabResults(historyData.labResults);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load your records', variant: 'destructive' });
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Health Records</h1>
            <p className="text-muted-foreground">View your medical history (read-only)</p>
          </div>
          <Badge variant="secondary" className="gap-1"><Lock className="h-3 w-3" />Read Only</Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-2">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{records.length}</p>
                <p className="text-sm text-muted-foreground">Total Visits</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Pill className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{prescriptions.length}</p>
                <p className="text-sm text-muted-foreground">Prescriptions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <FlaskConical className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{labResults.length}</p>
                <p className="text-sm text-muted-foreground">Lab Tests</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="visits" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visits" className="gap-2"><Calendar className="h-4 w-4" />My Visits</TabsTrigger>
            <TabsTrigger value="medications" className="gap-2"><Pill className="h-4 w-4" />Medications</TabsTrigger>
            <TabsTrigger value="labs" className="gap-2"><FlaskConical className="h-4 w-4" />Lab Results</TabsTrigger>
          </TabsList>

          <TabsContent value="visits">
            <div className="space-y-4">
              {records.length === 0 ? (
                <Card className="border-2">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No visit records found
                  </CardContent>
                </Card>
              ) : (
                records.map((record) => (
                  <Card key={record.id} className="border-2 hover:border-primary/30 transition-colors">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            {record.visitType}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4" />
                            {new Date(record.visitDate).toLocaleDateString()} • {record.doctorName}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{record.recordId}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Chief Complaint</p>
                        <p>{record.chiefComplaint}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                        <p>{record.diagnosis}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Treatment Plan</p>
                        <p>{record.treatmentPlan}</p>
                      </div>
                      {record.vitalSigns && (
                        <div className="grid grid-cols-4 gap-2">
                          <div className="p-2 rounded bg-muted/50 text-center">
                            <Heart className="h-4 w-4 text-destructive mx-auto" />
                            <p className="text-xs text-muted-foreground">BP</p>
                            <p className="font-medium text-sm">{record.vitalSigns.bloodPressure || '-'}</p>
                          </div>
                          <div className="p-2 rounded bg-muted/50 text-center">
                            <Activity className="h-4 w-4 text-primary mx-auto" />
                            <p className="text-xs text-muted-foreground">HR</p>
                            <p className="font-medium text-sm">{record.vitalSigns.heartRate || '-'}</p>
                          </div>
                          <div className="p-2 rounded bg-muted/50 text-center">
                            <Thermometer className="h-4 w-4 text-warning mx-auto" />
                            <p className="text-xs text-muted-foreground">Temp</p>
                            <p className="font-medium text-sm">{record.vitalSigns.temperature ? `${record.vitalSigns.temperature}°` : '-'}</p>
                          </div>
                          <div className="p-2 rounded bg-muted/50 text-center">
                            <Eye className="h-4 w-4 text-secondary mx-auto" />
                            <p className="text-xs text-muted-foreground">O2</p>
                            <p className="font-medium text-sm">{record.vitalSigns.oxygenSaturation ? `${record.vitalSigns.oxygenSaturation}%` : '-'}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="medications">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>My Medications</CardTitle>
                <CardDescription>Current and past prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                {prescriptions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No medications found</p>
                ) : (
                  <div className="space-y-3">
                    {prescriptions.map((presc) => (
                      <div key={presc.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">{presc.medicationName}</p>
                          <Badge>{presc.dosage}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {presc.frequency} for {presc.duration}
                        </p>
                        {presc.instructions && (
                          <p className="text-sm mt-2 p-2 bg-muted/50 rounded italic">"{presc.instructions}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labs">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>My Lab Results</CardTitle>
                <CardDescription>Test results and reports</CardDescription>
              </CardHeader>
              <CardContent>
                {labResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No lab results found</p>
                ) : (
                  <div className="space-y-3">
                    {labResults.map((lab) => (
                      <div key={lab.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">{lab.testName}</p>
                          <Badge variant="outline">{new Date(lab.testDate).toLocaleDateString()}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{lab.labName}</p>
                        <div className="bg-muted/50 p-3 rounded font-mono text-sm">{lab.testResult}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};
