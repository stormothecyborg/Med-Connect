import { UserRole, RouteConfig } from '@/types';

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Dashboard
  DASHBOARD: '/',
  
  // Patient routes
  PATIENTS: '/patients',
  PATIENT_NEW: '/patients/new',
  PATIENT_DETAIL: '/patients/:id',
  PATIENT_EDIT: '/patients/:id/edit',
  
  // Appointment routes
  APPOINTMENTS: '/appointments',
  APPOINTMENT_NEW: '/appointments/new',
  DOCTOR_SCHEDULE: '/schedule',
  DOCTOR_AVAILABILITY: '/availability',
  
  // EHR routes
  MEDICAL_RECORDS: '/medical-records',
  MEDICAL_RECORD_NEW: '/medical-records/new',
  MEDICAL_RECORD_DETAIL: '/medical-records/:id',
  PATIENT_PORTAL: '/my-records',
  
  // Admin routes
  USER_MANAGEMENT: '/admin/users',
  ROLE_MANAGEMENT: '/admin/roles',
} as const;

// Route access configuration
export const ROUTE_ACCESS: RouteConfig[] = [
  { path: ROUTES.DASHBOARD, allowedRoles: ['doctor', 'nurse', 'admin', 'receptionist', 'pharmacist'] },
  { path: ROUTES.PATIENTS, allowedRoles: ['doctor', 'nurse', 'admin', 'receptionist'] },
  { path: ROUTES.PATIENT_NEW, allowedRoles: ['receptionist', 'admin'] },
  { path: ROUTES.PATIENT_DETAIL, allowedRoles: ['doctor', 'nurse', 'admin', 'receptionist'] },
  { path: ROUTES.PATIENT_EDIT, allowedRoles: ['doctor', 'nurse', 'admin', 'receptionist'] },
  { path: ROUTES.APPOINTMENTS, allowedRoles: ['doctor', 'nurse', 'admin', 'receptionist'] },
  { path: ROUTES.APPOINTMENT_NEW, allowedRoles: ['receptionist', 'admin'] },
  { path: ROUTES.DOCTOR_SCHEDULE, allowedRoles: ['doctor', 'nurse', 'admin', 'receptionist'] },
  { path: ROUTES.DOCTOR_AVAILABILITY, allowedRoles: ['doctor', 'admin'] },
  { path: ROUTES.MEDICAL_RECORDS, allowedRoles: ['doctor', 'nurse', 'receptionist'] },
  { path: ROUTES.MEDICAL_RECORD_NEW, allowedRoles: ['doctor'] },
  { path: ROUTES.MEDICAL_RECORD_DETAIL, allowedRoles: ['doctor', 'nurse', 'receptionist'] },
  { path: ROUTES.USER_MANAGEMENT, allowedRoles: ['admin'] },
  { path: ROUTES.ROLE_MANAGEMENT, allowedRoles: ['admin'] },
];

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    doctor: 'Doctor',
    nurse: 'Nurse',
    admin: 'Administrator',
    receptionist: 'Receptionist',
    pharmacist: 'Pharmacist',
  };
  return labels[role];
};

export const getAllRoles = (): UserRole[] => {
  return ['doctor', 'nurse', 'admin', 'receptionist', 'pharmacist'];
};
