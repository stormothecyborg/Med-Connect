import { Patient } from '@/types';
import { mockPatients } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let patients = [...mockPatients];

export const patientService = {
  async getAll(filters?: { search?: string; status?: string }): Promise<Patient[]> {
    await delay(500);
    
    let result = [...patients];
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p => 
        p.firstName.toLowerCase().includes(searchLower) ||
        p.lastName.toLowerCase().includes(searchLower) ||
        p.patientId.toLowerCase().includes(searchLower) ||
        p.phone.includes(filters.search!) ||
        p.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters?.status) {
      result = result.filter(p => p.status === filters.status);
    }
    
    return result;
  },

  async getById(id: string): Promise<Patient | null> {
    await delay(300);
    return patients.find(p => p.id === id) || null;
  },

  async create(data: Omit<Patient, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    await delay(800);
    
    const newPatient: Patient = {
      ...data,
      id: 'pat-' + Date.now(),
      patientId: 'P-2025-' + String(patients.length + 1).padStart(3, '0'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    patients.push(newPatient);
    return newPatient;
  },

  async update(id: string, data: Partial<Patient>): Promise<Patient | null> {
    await delay(600);
    
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    patients[index] = {
      ...patients[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return patients[index];
  },

  async delete(id: string): Promise<boolean> {
    await delay(500);
    
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    patients.splice(index, 1);
    return true;
  },
};
