import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Activity,
  Calendar,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  X,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const getRoleLabel = (role: AppRole): string => {
  const labels: Record<AppRole, string> = {
    doctor: 'Doctor',
    nurse: 'Nurse',
    admin: 'Administrator',
    receptionist: 'Receptionist',
    pharmacist: 'Pharmacist',
  };
  return labels[role];
};

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { profile, role, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: Home,
      roles: ['doctor', 'nurse', 'admin', 'receptionist', 'pharmacist'] as AppRole[],
    },
    {
      label: 'Patients',
      path: ROUTES.PATIENTS,
      icon: Users,
      roles: ['doctor', 'nurse', 'admin', 'receptionist'] as AppRole[],
    },
    {
      label: 'Appointments',
      path: ROUTES.APPOINTMENTS,
      icon: Calendar,
      roles: ['doctor', 'nurse', 'admin', 'receptionist'] as AppRole[],
    },
    {
      label: 'My Schedule',
      path: ROUTES.DOCTOR_SCHEDULE,
      icon: Clock,
      roles: ['doctor'] as AppRole[],
    },
    {
      label: 'Availability',
      path: ROUTES.DOCTOR_AVAILABILITY,
      icon: ClipboardList,
      roles: ['doctor', 'admin'] as AppRole[],
    },
    {
      label: 'Medical Records',
      path: ROUTES.MEDICAL_RECORDS,
      icon: FileText,
      roles: ['doctor', 'nurse'] as AppRole[],
    },
    {
      label: 'My Records',
      path: ROUTES.PATIENT_PORTAL,
      icon: Activity,
      roles: ['doctor', 'nurse', 'admin', 'receptionist', 'pharmacist'] as AppRole[],
    },
    {
      label: 'User Management',
      path: ROUTES.USER_MANAGEMENT,
      icon: Shield,
      roles: ['admin'] as AppRole[],
    },
    {
      label: 'Role Management',
      path: ROUTES.ROLE_MANAGEMENT,
      icon: Settings,
      roles: ['admin'] as AppRole[],
    },
  ];

  const filteredNavItems = navItems.filter(item => hasRole(item.roles));

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-4',
          isActive
            ? 'bg-accent text-accent-foreground border-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'
        )}
      >
        <item.icon className="h-5 w-5" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-lg font-bold text-foreground">HMS</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col py-4">
          {filteredNavItems.map(item => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {role ? getRoleLabel(role) : ''}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.first_name} {profile?.last_name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
