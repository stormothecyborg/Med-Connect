import { MedicalRecord, Prescription, LabResult } from '@/types';
import { mockMedicalRecords, mockPrescriptions, mockLabResults } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let records = [...mockMedicalRecords];
let prescriptions = [...mockPrescriptions];
let labResults = [...mockLabResults];

export const medicalRecordService = {
  async getAll(filters?: { patientId?: string; doctorId?: string }): Promise<MedicalRecord[]> {
    await delay(400);
    
    let result = [...records];
    
    if (filters?.patientId) {
      result = result.filter(r => r.patientId === filters.patientId);
    }
    
    if (filters?.doctorId) {
      result = result.filter(r => r.doctorId === filters.doctorId);
    }
    
    return result.sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  },

  async getById(id: string): Promise<MedicalRecord | null> {
    await delay(300);
    return records.find(r => r.id === id) || null;
  },

  async create(data: Omit<MedicalRecord, 'id' | 'recordId' | 'version' | 'createdAt' | 'updatedAt'>): Promise<MedicalRecord> {
    await delay(800);
    
    const newRecord: MedicalRecord = {
      ...data,
      id: 'rec-' + Date.now(),
      recordId: 'MR-2025-' + String(records.length + 1).padStart(3, '0'),
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    records.push(newRecord);
    return newRecord;
  },

  async update(id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord | null> {
    await delay(600);
    
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    // Create new version
    const currentRecord = records[index];
    const updatedRecord: MedicalRecord = {
      ...currentRecord,
      ...data,
      version: currentRecord.version + 1,
      previousVersionId: currentRecord.id,
      updatedAt: new Date().toISOString(),
    };
    
    records[index] = updatedRecord;
    return updatedRecord;
  },

  async getPrescriptions(medicalRecordId: string): Promise<Prescription[]> {
    await delay(300);
    return prescriptions.filter(p => p.medicalRecordId === medicalRecordId);
  },

  async addPrescription(data: Omit<Prescription, 'id'>): Promise<Prescription> {
    await delay(500);
    
    const newPrescription: Prescription = {
      ...data,
      id: 'presc-' + Date.now(),
    };
    
    prescriptions.push(newPrescription);
    return newPrescription;
  },

  async getLabResults(medicalRecordId: string): Promise<LabResult[]> {
    await delay(300);
    return labResults.filter(l => l.medicalRecordId === medicalRecordId);
  },

  async addLabResult(data: Omit<LabResult, 'id' | 'uploadedAt'>): Promise<LabResult> {
    await delay(500);
    
    const newLabResult: LabResult = {
      ...data,
      id: 'lab-' + Date.now(),
      uploadedAt: new Date().toISOString(),
    };
    
    labResults.push(newLabResult);
    return newLabResult;
  },

  async getPatientHistory(patientId: string): Promise<{
    records: MedicalRecord[];
    prescriptions: Prescription[];
    labResults: LabResult[];
  }> {
    await delay(500);
    
    const patientRecords = records.filter(r => r.patientId === patientId);
    const recordIds = patientRecords.map(r => r.id);
    
    return {
      records: patientRecords.sort((a, b) => b.visitDate.localeCompare(a.visitDate)),
      prescriptions: prescriptions.filter(p => recordIds.includes(p.medicalRecordId)),
      labResults: labResults.filter(l => recordIds.includes(l.medicalRecordId)),
    };
  },
};
