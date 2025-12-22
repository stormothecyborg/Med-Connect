import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES, getRoleLabel } from '@/config/routes';
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
  ArrowRight
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, hasRole } = useAuth();

  const stats = [
    { label: 'Total Patients', value: '1,234', icon: Users, change: '+12%', color: 'text-primary' },
    { label: 'Appointments Today', value: '28', icon: Calendar, change: '+5%', color: 'text-secondary' },
    { label: 'Pending Records', value: '15', icon: FileText, change: '-3%', color: 'text-warning' },
    { label: 'Avg. Wait Time', value: '12 min', icon: Clock, change: '-18%', color: 'text-success' },
  ];

  const recentAppointments = [
    { id: 1, patient: 'Alice Thompson', time: '09:00 AM', type: 'Follow-up', status: 'scheduled' },
    { id: 2, patient: 'Robert Chen', time: '10:00 AM', type: 'Consultation', status: 'confirmed' },
    { id: 3, patient: 'Maria Garcia', time: '02:30 PM', type: 'Consultation', status: 'completed' },
  ];

  const quickActions = [
    { label: 'Register Patient', icon: UserPlus, path: ROUTES.PATIENT_NEW, roles: ['receptionist', 'admin'] as const },
    { label: 'New Appointment', icon: CalendarPlus, path: ROUTES.APPOINTMENT_NEW, roles: ['receptionist', 'admin'] as const },
    { label: 'View Schedule', icon: ClipboardList, path: ROUTES.DOCTOR_SCHEDULE, roles: ['doctor'] as const },
    { label: 'Medical Records', icon: FileText, path: ROUTES.MEDICAL_RECORDS, roles: ['doctor', 'nurse'] as const },
  ].filter(action => hasRole([...action.roles]));

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your hospital management system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className={stat.change.startsWith('+') ? 'text-success' : 'text-destructive'}>
                    {stat.change}
                  </span>
                  <span>from last month</span>
                </div>
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
              <div className="space-y-4">
                {recentAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.patient}</p>
                        <p className="text-sm text-muted-foreground">{apt.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{apt.time}</p>
                      <Badge 
                        variant={apt.status === 'completed' ? 'secondary' : apt.status === 'confirmed' ? 'default' : 'outline'}
                        className="capitalize"
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
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
