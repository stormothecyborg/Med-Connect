import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Role } from '@/types';
import { userService } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { Edit2, Loader2, Shield, Users, FileText, Calendar, Pill } from 'lucide-react';

const allPermissions = [
  { id: 'view_patients', label: 'View Patients', category: 'Patients' },
  { id: 'edit_patients', label: 'Edit Patients', category: 'Patients' },
  { id: 'register_patients', label: 'Register Patients', category: 'Patients' },
  { id: 'create_records', label: 'Create Medical Records', category: 'EHR' },
  { id: 'view_records', label: 'View Medical Records', category: 'EHR' },
  { id: 'update_vitals', label: 'Update Vitals', category: 'EHR' },
  { id: 'prescribe', label: 'Prescribe Medications', category: 'EHR' },
  { id: 'view_appointments', label: 'View Appointments', category: 'Appointments' },
  { id: 'manage_appointments', label: 'Manage Appointments', category: 'Appointments' },
  { id: 'view_schedule', label: 'View Schedule', category: 'Appointments' },
  { id: 'manage_schedule', label: 'Manage Schedule', category: 'Appointments' },
  { id: 'view_prescriptions', label: 'View Prescriptions', category: 'Pharmacy' },
  { id: 'dispense_medication', label: 'Dispense Medication', category: 'Pharmacy' },
  { id: 'manage_inventory', label: 'Manage Inventory', category: 'Pharmacy' },
  { id: 'manage_users', label: 'Manage Users', category: 'Admin' },
  { id: 'manage_roles', label: 'Manage Roles', category: 'Admin' },
  { id: 'view_reports', label: 'View Reports', category: 'Admin' },
  { id: 'system_settings', label: 'System Settings', category: 'Admin' },
  { id: 'view_audit_logs', label: 'View Audit Logs', category: 'Admin' },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Patients': return Users;
    case 'EHR': return FileText;
    case 'Appointments': return Calendar;
    case 'Pharmacy': return Pill;
    case 'Admin': return Shield;
    default: return Shield;
  }
};

export const RoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getRoles();
      setRoles(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load roles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions([...role.permissions]);
    setIsDialogOpen(true);
  };

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSaveRole = async () => {
    if (!editingRole) return;

    try {
      const updated = await userService.updateRole(editingRole.id, selectedPermissions);
      if (updated) {
        setRoles(roles.map(r => r.id === updated.id ? updated : r));
        toast({
          title: 'Success',
          description: 'Role permissions updated successfully',
        });
        setIsDialogOpen(false);
        setEditingRole(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
          <p className="text-muted-foreground">
            Configure role-based access control and permissions
          </p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>System Roles</CardTitle>
            <CardDescription>
              Click on a role to edit its permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{role.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {role.permissions.length} permissions
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {role.permissions.slice(0, 4).map(perm => (
                              <Badge key={perm} variant="outline" className="text-xs">
                                {allPermissions.find(p => p.id === perm)?.label || perm}
                              </Badge>
                            ))}
                            {role.permissions.length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{role.permissions.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRole(role)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Role Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role: {editingRole?.name}</DialogTitle>
              <DialogDescription>
                Select the permissions for this role
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {Object.entries(groupedPermissions).map(([category, permissions]) => {
                const CategoryIcon = getCategoryIcon(category);
                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <CategoryIcon className="h-4 w-4" />
                      {category}
                    </div>
                    <div className="grid grid-cols-2 gap-3 pl-6">
                      {permissions.map(perm => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={perm.id}
                            checked={selectedPermissions.includes(perm.id)}
                            onCheckedChange={() => handlePermissionChange(perm.id)}
                          />
                          <Label
                            htmlFor={perm.id}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {perm.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRole}>
                Save Permissions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};
