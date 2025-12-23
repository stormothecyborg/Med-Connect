import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MedicalRecord, Prescription, LabResult, Patient } from '@/types';
import { medicalRecordService } from '@/services/medicalRecordService';
import { patientService } from '@/services/patientService';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, FileText, Pill, FlaskConical, Loader2, Activity, Clock, ChevronRight, User, Phone, Mail, AlertTriangle, Droplet } from 'lucide-react';

export const PatientHistoryPage: React.FC = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (patientId) loadData();
  }, [patientId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [patientData, historyData] = await Promise.all([
        patientService.getById(patientId!),
        medicalRecordService.getPatientHistory(patientId!),
      ]);
      setPatient(patientData);
      setRecords(historyData.records);
      setPrescriptions(historyData.prescriptions);
      setLabResults(historyData.labResults);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load patient history', variant: 'destructive' });
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

  if (!patient) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Patient not found</p>
          <Link to="/patients"><Button variant="link">Back to patients</Button></Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/patients"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-3xl font-bold">Patient History</h1>
            <p className="text-muted-foreground">Complete medical timeline</p>
          </div>
        </div>

        {/* Patient Overview Card */}
        <Card className="border-2 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-20 w-20 mx-auto md:mx-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {patient.firstName[0]}{patient.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">{patient.firstName} {patient.lastName}</h2>
                <p className="text-muted-foreground font-mono">{patient.patientId}</p>
                <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(patient.dateOfBirth).toLocaleDateString()} ({new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} yrs)
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {patient.email}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  <Badge variant="outline" className="gap-1"><Droplet className="h-3 w-3" />{patient.bloodGroup}</Badge>
                  {patient.allergies && patient.allergies !== 'None known' && (
                    <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />{patient.allergies}</Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-card">
                  <p className="text-2xl font-bold text-primary">{records.length}</p>
                  <p className="text-xs text-muted-foreground">Visits</p>
                </div>
                <div className="p-3 rounded-lg bg-card">
                  <p className="text-2xl font-bold text-secondary">{prescriptions.length}</p>
                  <p className="text-xs text-muted-foreground">Prescriptions</p>
                </div>
                <div className="p-3 rounded-lg bg-card">
                  <p className="text-2xl font-bold text-warning">{labResults.length}</p>
                  <p className="text-xs text-muted-foreground">Lab Tests</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different views */}
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="timeline" className="gap-2"><Clock className="h-4 w-4" />Timeline</TabsTrigger>
            <TabsTrigger value="prescriptions" className="gap-2"><Pill className="h-4 w-4" />Medications</TabsTrigger>
            <TabsTrigger value="labs" className="gap-2"><FlaskConical className="h-4 w-4" />Lab Results</TabsTrigger>
          </TabsList>

          {/* Timeline View */}
          <TabsContent value="timeline">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Visit Timeline</CardTitle>
                <CardDescription>Chronological view of all patient visits</CardDescription>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No medical records found</p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-6">
                      {records.map((record, index) => (
                        <div key={record.id} className="relative pl-10">
                          <div className="absolute left-2 top-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Activity className="h-3 w-3 text-primary-foreground" />
                          </div>
                          <Card className="border hover:border-primary/50 transition-colors">
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-medium">{record.visitType}</p>
                                  <p className="text-sm text-muted-foreground">{new Date(record.visitDate).toLocaleDateString()} • {record.doctorName}</p>
                                </div>
                                <Badge variant="outline">{record.recordId}</Badge>
                              </div>
                              <p className="text-sm mb-2"><span className="font-medium">Chief Complaint:</span> {record.chiefComplaint}</p>
                              <p className="text-sm mb-3"><span className="font-medium">Diagnosis:</span> {record.diagnosis}</p>
                              <Link to={`/medical-records/${record.id}`}>
                                <Button variant="ghost" size="sm" className="gap-1">
                                  View Details<ChevronRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions View */}
          <TabsContent value="prescriptions">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Medication History</CardTitle>
                <CardDescription>All prescribed medications</CardDescription>
              </CardHeader>
              <CardContent>
                {prescriptions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No prescriptions found</p>
                ) : (
                  <div className="space-y-3">
                    {prescriptions.map((presc) => (
                      <div key={presc.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Pill className="h-5 w-5 text-secondary" />
                            <p className="font-medium">{presc.medicationName}</p>
                          </div>
                          <Badge>{presc.dosage}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <p>Frequency: {presc.frequency}</p>
                          <p>Duration: {presc.duration}</p>
                          <p>Date: {new Date(presc.prescribedDate).toLocaleDateString()}</p>
                        </div>
                        {presc.instructions && (
                          <p className="text-sm mt-2 italic text-muted-foreground">"{presc.instructions}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Results View */}
          <TabsContent value="labs">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Laboratory Results</CardTitle>
                <CardDescription>All lab tests and results</CardDescription>
              </CardHeader>
              <CardContent>
                {labResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No lab results found</p>
                ) : (
                  <div className="space-y-3">
                    {labResults.map((lab) => (
                      <div key={lab.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <FlaskConical className="h-5 w-5 text-primary" />
                            <p className="font-medium">{lab.testName}</p>
                          </div>
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
