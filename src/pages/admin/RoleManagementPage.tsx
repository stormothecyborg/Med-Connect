import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Stethoscope, UserCog, Users, Pill } from 'lucide-react';

const roles = [
  {
    name: 'Admin',
    value: 'admin',
    icon: Shield,
    description: 'Full system access including user management',
    permissions: ['User Management', 'Role Management', 'System Settings', 'All Data Access'],
  },
  {
    name: 'Doctor',
    value: 'doctor',
    icon: Stethoscope,
    description: 'Medical staff with patient treatment access',
    permissions: ['View Patients', 'Create Medical Records', 'Prescriptions', 'Appointments'],
  },
  {
    name: 'Nurse',
    value: 'nurse',
    icon: UserCog,
    description: 'Support medical staff',
    permissions: ['View Patients', 'View Medical Records', 'Update Vitals', 'Appointments'],
  },
  {
    name: 'Receptionist',
    value: 'receptionist',
    icon: Users,
    description: 'Front desk and appointment management',
    permissions: ['Patient Registration', 'Appointment Booking', 'View Patients'],
  },
  {
    name: 'Pharmacist',
    value: 'pharmacist',
    icon: Pill,
    description: 'Medication and prescription management',
    permissions: ['View Prescriptions', 'Dispense Medications', 'Inventory Management'],
  },
];

export const RoleManagementPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">View and understand system roles and permissions</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.value}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <Badge key={permission} variant="secondary">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};
