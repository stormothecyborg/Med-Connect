import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Appointment } from '@/types';
import { appointmentService } from '@/services/appointmentService';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Search, CalendarPlus, Loader2, Clock, X, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export const AppointmentsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appointment: Appointment | null }>({ open: false, appointment: null });
  const { toast } = useToast();

  useEffect(() => { loadAppointments(); }, [statusFilter]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setAppointments(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load appointments', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelDialog.appointment) return;
    try {
      await appointmentService.cancel(cancelDialog.appointment.id);
      toast({ title: 'Success', description: 'Appointment cancelled' });
      loadAppointments();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to cancel appointment', variant: 'destructive' });
    } finally {
      setCancelDialog({ open: false, appointment: null });
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await appointmentService.update(id, { status: 'confirmed' });
      toast({ title: 'Success', description: 'Appointment confirmed' });
      loadAppointments();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to confirm appointment', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      scheduled: 'outline', confirmed: 'default', completed: 'secondary', cancelled: 'destructive', no_show: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'} className="capitalize">{status.replace('_', ' ')}</Badge>;
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.appointmentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">Manage patient appointments</p>
          </div>
          {hasRole(['receptionist', 'admin']) && (
            <Link to={ROUTES.APPOINTMENT_NEW}>
              <Button><CalendarPlus className="h-4 w-4 mr-2" />New Appointment</Button>
            </Link>
          )}
        </div>

        <Card className="border-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search appointments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-mono text-sm">{apt.appointmentId}</TableCell>
                      <TableCell className="font-medium">{apt.patientName}</TableCell>
                      <TableCell>{apt.doctorName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p>{format(new Date(apt.appointmentDate), 'MMM d, yyyy')}</p>
                            <p className="text-sm text-muted-foreground">{apt.appointmentTime}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{apt.appointmentType}</Badge></TableCell>
                      <TableCell>{getStatusBadge(apt.status)}</TableCell>
                      <TableCell className="text-right">
                        {apt.status === 'scheduled' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleConfirm(apt.id)}>
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setCancelDialog({ open: true, appointment: apt })}>
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, appointment: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel the appointment for {cancelDialog.appointment?.patientName}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialog({ open: false, appointment: null })}>Keep</Button>
              <Button variant="destructive" onClick={handleCancel}>Cancel Appointment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};
