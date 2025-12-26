import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type MedicalRecord = Tables<'medical_records'>;
type Prescription = Tables<'prescriptions'>;
type LabResult = Tables<'lab_results'>;

export const medicalRecordService = {
  async getAll(filters?: { patientId?: string; doctorId?: string }): Promise<MedicalRecord[]> {
    let query = supabase.from('medical_records').select('*');
    
    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }
    
    if (filters?.doctorId) {
      query = query.eq('doctor_id', filters.doctorId);
    }
    
    const { data, error } = await query.order('visit_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<MedicalRecord | null> {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(data: Omit<TablesInsert<'medical_records'>, 'record_id'>): Promise<MedicalRecord> {
    const { data: newRecord, error } = await supabase
      .from('medical_records')
      .insert({
        ...data,
        record_id: 'TEMP', // Will be replaced by trigger
      })
      .select()
      .single();
    
    if (error) throw error;
    return newRecord;
  },

  async update(id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord | null> {
    // Get current version
    const { data: current } = await supabase
      .from('medical_records')
      .select('version')
      .eq('id', id)
      .single();
    
    const { data: updated, error } = await supabase
      .from('medical_records')
      .update({
        ...data,
        version: (current?.version || 0) + 1,
        previous_version_id: id,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  async getPrescriptions(medicalRecordId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('medical_record_id', medicalRecordId);
    
    if (error) throw error;
    return data || [];
  },

  async addPrescription(data: TablesInsert<'prescriptions'>): Promise<Prescription> {
    const { data: newPrescription, error } = await supabase
      .from('prescriptions')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return newPrescription;
  },

  async getLabResults(medicalRecordId: string): Promise<LabResult[]> {
    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('medical_record_id', medicalRecordId);
    
    if (error) throw error;
    return data || [];
  },

  async addLabResult(data: TablesInsert<'lab_results'>): Promise<LabResult> {
    const { data: newLabResult, error } = await supabase
      .from('lab_results')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return newLabResult;
  },

  async getPatientHistory(patientId: string): Promise<{
    records: MedicalRecord[];
    prescriptions: Prescription[];
    labResults: LabResult[];
  }> {
    const { data: records } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('visit_date', { ascending: false });
    
    const recordIds = records?.map(r => r.id) || [];
    
    let prescriptions: Prescription[] = [];
    let labResults: LabResult[] = [];
    
    if (recordIds.length > 0) {
      const { data: prescs } = await supabase
        .from('prescriptions')
        .select('*')
        .in('medical_record_id', recordIds);
      prescriptions = prescs || [];
      
      const { data: labs } = await supabase
        .from('lab_results')
        .select('*')
        .in('medical_record_id', recordIds);
      labResults = labs || [];
    }
    
    return {
      records: records || [],
      prescriptions,
      labResults,
    };
  },
};
