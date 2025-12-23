import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { medicalRecordService } from '@/services/medicalRecordService';
import { patientService } from '@/services/patientService';
import { Patient } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Heart, Thermometer, Activity, Wind, Scale, Ruler, Droplets, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const recordSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  visitDate: z.string().min(1, 'Visit date is required'),
  visitType: z.string().min(1, 'Visit type is required'),
  chiefComplaint: z.string().min(1, 'Chief complaint is required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  treatmentPlan: z.string().min(1, 'Treatment plan is required'),
  notes: z.string().optional(),
  bloodPressure: z.string().optional(),
  heartRate: z.coerce.number().optional(),
  temperature: z.coerce.number().optional(),
  respiratoryRate: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  oxygenSaturation: z.coerce.number().optional(),
});

type RecordFormData = z.infer<typeof recordSchema>;

interface PrescriptionInput {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const MedicalRecordFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionInput[]>([]);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      visitDate: new Date().toISOString().split('T')[0],
      visitType: 'Consultation',
    },
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load patients', variant: 'destructive' });
    }
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: keyof PrescriptionInput, value: string) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const onSubmit = async (data: RecordFormData) => {
    setIsLoading(true);
    try {
      const record = await medicalRecordService.create({
        patientId: data.patientId,
        doctorId: user?.id || '',
        doctorName: `${user?.firstName} ${user?.lastName}`,
        visitDate: data.visitDate,
        visitType: data.visitType,
        chiefComplaint: data.chiefComplaint,
        diagnosis: data.diagnosis,
        treatmentPlan: data.treatmentPlan,
        notes: data.notes || '',
        vitalSigns: {
          bloodPressure: data.bloodPressure || '',
          heartRate: data.heartRate || 0,
          temperature: data.temperature || 0,
          respiratoryRate: data.respiratoryRate || 0,
          weight: data.weight || 0,
          height: data.height || 0,
          oxygenSaturation: data.oxygenSaturation || 0,
        },
        createdBy: user?.id || '',
      });

      // Add prescriptions
      for (const presc of prescriptions) {
        if (presc.medicationName) {
          await medicalRecordService.addPrescription({
            medicalRecordId: record.id,
            ...presc,
            prescribedBy: user?.id || '',
            prescribedDate: new Date().toISOString().split('T')[0],
          });
        }
      }

      toast({ title: 'Success', description: 'Medical record created successfully' });
      navigate('/medical-records');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create medical record', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/medical-records"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Medical Record</h1>
            <p className="text-muted-foreground">Document patient visit and treatment</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Visit Information */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Visit Information</CardTitle>
                <CardDescription>Basic visit details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <Select onValueChange={(v) => setValue('patientId', v)}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {patients.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientId})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.patientId && <p className="text-sm text-destructive">{errors.patientId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Visit Date *</Label>
                  <Input type="date" {...register('visitDate')} />
                  {errors.visitDate && <p className="text-sm text-destructive">{errors.visitDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Visit Type *</Label>
                  <Select defaultValue="Consultation" onValueChange={(v) => setValue('visitType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Routine Checkup">Routine Checkup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Chief Complaint *</Label>
                  <Textarea {...register('chiefComplaint')} placeholder="Patient's main concern..." />
                  {errors.chiefComplaint && <p className="text-sm text-destructive">{errors.chiefComplaint.message}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Vital Signs */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Vital Signs</CardTitle>
                <CardDescription>Record patient vitals</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Heart className="h-4 w-4 text-destructive" />Blood Pressure</Label>
                  <Input {...register('bloodPressure')} placeholder="120/80" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Activity className="h-4 w-4 text-primary" />Heart Rate (bpm)</Label>
                  <Input type="number" {...register('heartRate')} placeholder="72" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Thermometer className="h-4 w-4 text-warning" />Temperature (°F)</Label>
                  <Input type="number" step="0.1" {...register('temperature')} placeholder="98.6" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Wind className="h-4 w-4 text-secondary" />Resp. Rate</Label>
                  <Input type="number" {...register('respiratoryRate')} placeholder="16" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Scale className="h-4 w-4 text-muted-foreground" />Weight (lbs)</Label>
                  <Input type="number" {...register('weight')} placeholder="150" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Ruler className="h-4 w-4 text-muted-foreground" />Height (in)</Label>
                  <Input type="number" {...register('height')} placeholder="68" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Droplets className="h-4 w-4 text-primary" />O2 Saturation (%)</Label>
                  <Input type="number" {...register('oxygenSaturation')} placeholder="98" />
                </div>
              </CardContent>
            </Card>

            {/* Diagnosis & Treatment */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Diagnosis & Treatment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Diagnosis *</Label>
                  <Textarea {...register('diagnosis')} placeholder="Clinical diagnosis..." />
                  {errors.diagnosis && <p className="text-sm text-destructive">{errors.diagnosis.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Treatment Plan *</Label>
                  <Textarea {...register('treatmentPlan')} placeholder="Recommended treatment..." />
                  {errors.treatmentPlan && <p className="text-sm text-destructive">{errors.treatmentPlan.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea {...register('notes')} placeholder="Any additional observations..." />
                </div>
              </CardContent>
            </Card>

            {/* Prescriptions */}
            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Prescriptions</CardTitle>
                  <CardDescription>Add medications for this visit</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addPrescription}>
                  <Plus className="h-4 w-4 mr-1" />Add Medication
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {prescriptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No prescriptions added yet</p>
                ) : (
                  prescriptions.map((presc, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Medication #{index + 1}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removePrescription(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input placeholder="Medication name" value={presc.medicationName} onChange={(e) => updatePrescription(index, 'medicationName', e.target.value)} />
                        <Input placeholder="Dosage (e.g., 500mg)" value={presc.dosage} onChange={(e) => updatePrescription(index, 'dosage', e.target.value)} />
                        <Input placeholder="Frequency (e.g., Twice daily)" value={presc.frequency} onChange={(e) => updatePrescription(index, 'frequency', e.target.value)} />
                        <Input placeholder="Duration (e.g., 7 days)" value={presc.duration} onChange={(e) => updatePrescription(index, 'duration', e.target.value)} />
                      </div>
                      <Input placeholder="Special instructions" value={presc.instructions} onChange={(e) => updatePrescription(index, 'instructions', e.target.value)} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Link to="/medical-records"><Button variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Record
              </Button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
