// User and Role types
export type UserRole = 'doctor' | 'nurse' | 'admin' | 'receptionist' | 'pharmacist';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  departmentId: string;
  mfaEnabled: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  avatar?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  timestamp: string;
}

// Patient types
export type PatientStatus = 'active' | 'discharged' | 'deceased';
export type Gender = 'male' | 'female' | 'other';

export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  email: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodGroup: string;
  allergies: string;
  medicalHistory: string;
  insuranceProvider: string;
  insuranceNumber: string;
  registrationDate: string;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PatientDocument {
  id: string;
  patientId: string;
  documentType: string;
  filePath: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Appointment types
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  status: AppointmentStatus;
  appointmentType: string;
  reason: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  dateOverride?: string;
}

// EHR types
export interface VitalSigns {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  weight: number;
  height: number;
  oxygenSaturation: number;
}

export interface MedicalRecord {
  id: string;
  recordId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  visitDate: string;
  visitType: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentPlan: string;
  notes: string;
  vitalSigns: VitalSigns;
  version: number;
  previousVersionId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Prescription {
  id: string;
  medicalRecordId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedBy: string;
  prescribedDate: string;
}

export interface LabResult {
  id: string;
  medicalRecordId: string;
  testName: string;
  testResult: string;
  testDate: string;
  labName: string;
  filePath?: string;
  uploadedAt: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  mfaRequired: boolean;
  mfaVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface MFAVerification {
  code: string;
}

// Route config
export interface RouteConfig {
  path: string;
  allowedRoles: UserRole[];
}
