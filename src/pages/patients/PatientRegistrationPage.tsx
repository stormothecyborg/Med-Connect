import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { patientService } from '@/services/patientService';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export const PatientRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: { gender: 'male' },
  });

  const onSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    try {
      await patientService.create({
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        phone: data.phone,
        email: data.email || '',
        address: data.address || '',
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactPhone: data.emergencyContactPhone || '',
        bloodGroup: data.bloodGroup || '',
        allergies: data.allergies || '',
        medicalHistory: data.medicalHistory || '',
        insuranceProvider: data.insuranceProvider || '',
        insuranceNumber: data.insuranceNumber || '',
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
      toast({ title: 'Success', description: 'Patient registered successfully' });
      navigate(ROUTES.PATIENTS);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to register patient', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to={ROUTES.PATIENTS}><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-3xl font-bold">Register New Patient</h1>
            <p className="text-muted-foreground">Enter patient information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input {...register('firstName')} />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input {...register('lastName')} />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input type="date" {...register('dateOfBirth')} />
                  {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select defaultValue="male" onValueChange={(v) => setValue('gender', v as 'male' | 'female' | 'other')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input {...register('phone')} />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" {...register('email')} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Textarea {...register('address')} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader><CardTitle>Medical Information</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select onValueChange={(v) => setValue('bloodGroup', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Allergies</Label>
                  <Input {...register('allergies')} placeholder="e.g., Penicillin, Peanuts" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Medical History</Label>
                  <Textarea {...register('medicalHistory')} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input {...register('emergencyContactName')} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input {...register('emergencyContactPhone')} />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Link to={ROUTES.PATIENTS}><Button variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Patient
              </Button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};
