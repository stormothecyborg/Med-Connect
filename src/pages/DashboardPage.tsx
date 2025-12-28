import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/config/routes';
import { patientService } from '@/services/patientService';
import { appointmentService } from '@/services/appointmentService';
import { format } from 'date-fns';
import { 
  Users, 
  Calendar, 
  FileText, 
  Clock, 
  Activity,
  TrendingUp,
  UserPlus,
  CalendarPlus,
  ClipboardList,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  pendingRecords: number;
}

interface TodayAppointment {
  id: string;
  patient_name: string;
  time: string;
  type: string;
  status: string;
}

export const DashboardPage: React.FC = () => {
  const { profile, hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalPatients: 0, appointmentsToday: 0, pendingRecords: 0 });
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch patients count
        const patients = await patientService.getAll();
        
        // Fetch today's appointments
        const today = format(new Date(), 'yyyy-MM-dd');
        const appointments = await appointmentService.getAll({ date: today });
        
        // Get patient names for appointments
        const appointmentsWithNames: TodayAppointment[] = await Promise.all(
          appointments.map(async (apt) => {
            const patient = await patientService.getById(apt.patient_id);
            return {
              id: apt.id,
              patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient',
              time: apt.appointment_time.substring(0, 5),
              type: apt.appointment_type,
              status: apt.status,
            };
          })
        );

        setStats({
          totalPatients: patients.length,
          appointmentsToday: appointments.length,
          pendingRecords: 0, // Would need medical records service
        });
        setTodayAppointments(appointmentsWithNames);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Total Patients', value: stats.totalPatients.toLocaleString(), icon: Users, color: 'text-primary' },
    { label: 'Appointments Today', value: stats.appointmentsToday.toString(), icon: Calendar, color: 'text-secondary' },
    { label: 'Pending Records', value: stats.pendingRecords.toString(), icon: FileText, color: 'text-warning' },
    { label: 'Avg. Wait Time', value: '12 min', icon: Clock, color: 'text-success' },
  ];

  const quickActions = [
    { label: 'Register Patient', icon: UserPlus, path: ROUTES.PATIENT_NEW, roles: ['receptionist', 'admin'] as const },
    { label: 'New Appointment', icon: CalendarPlus, path: ROUTES.APPOINTMENT_NEW, roles: ['receptionist', 'admin'] as const },
    { label: 'View Schedule', icon: ClipboardList, path: ROUTES.DOCTOR_SCHEDULE, roles: ['doctor'] as const },
    { label: 'Medical Records', icon: FileText, path: ROUTES.MEDICAL_RECORDS, roles: ['doctor', 'nurse'] as const },
  ].filter(action => hasRole([...action.roles]));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="capitalize">{status}</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="capitalize">{status}</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.first_name || 'User'}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your hospital management system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for your role</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {quickActions.map((action) => (
                  <Link key={action.path} to={action.path}>
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Today's Appointments */}
          <Card className="border-2 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Appointments</CardTitle>
                <CardDescription>Your scheduled appointments for today</CardDescription>
              </div>
              <Link to={ROUTES.APPOINTMENTS}>
                <Button variant="ghost" size="sm" className="gap-1">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : todayAppointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No appointments scheduled for today
                </p>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{apt.patient_name}</p>
                          <p className="text-sm text-muted-foreground">{apt.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{apt.time}</p>
                        {getStatusBadge(apt.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Role-specific content */}
        {hasRole(['admin']) && (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                System Overview
              </CardTitle>
              <CardDescription>Administrative dashboard metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 rounded-lg bg-card">
                  <p className="text-3xl font-bold text-primary">5</p>
                  <p className="text-sm text-muted-foreground">Active Staff</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card">
                  <p className="text-3xl font-bold text-secondary">3</p>
                  <p className="text-sm text-muted-foreground">Departments</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-card">
                  <p className="text-3xl font-bold text-success">99.9%</p>
                  <p className="text-sm text-muted-foreground">System Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};
