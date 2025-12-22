import { Appointment, DoctorAvailability } from '@/types';
import { mockAppointments, mockDoctorAvailability } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let appointments = [...mockAppointments];
let availability = [...mockDoctorAvailability];

export const appointmentService = {
  async getAll(filters?: { doctorId?: string; patientId?: string; date?: string; status?: string }): Promise<Appointment[]> {
    await delay(400);
    
    let result = [...appointments];
    
    if (filters?.doctorId) {
      result = result.filter(a => a.doctorId === filters.doctorId);
    }
    
    if (filters?.patientId) {
      result = result.filter(a => a.patientId === filters.patientId);
    }
    
    if (filters?.date) {
      result = result.filter(a => a.appointmentDate === filters.date);
    }
    
    if (filters?.status) {
      result = result.filter(a => a.status === filters.status);
    }
    
    return result.sort((a, b) => {
      const dateCompare = a.appointmentDate.localeCompare(b.appointmentDate);
      if (dateCompare !== 0) return dateCompare;
      return a.appointmentTime.localeCompare(b.appointmentTime);
    });
  },

  async getById(id: string): Promise<Appointment | null> {
    await delay(300);
    return appointments.find(a => a.id === id) || null;
  },

  async create(data: Omit<Appointment, 'id' | 'appointmentId' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    await delay(700);
    
    const newAppointment: Appointment = {
      ...data,
      id: 'apt-' + Date.now(),
      appointmentId: 'APT-2025-' + String(appointments.length + 1).padStart(3, '0'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    appointments.push(newAppointment);
    return newAppointment;
  },

  async update(id: string, data: Partial<Appointment>): Promise<Appointment | null> {
    await delay(500);
    
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    appointments[index] = {
      ...appointments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return appointments[index];
  },

  async cancel(id: string): Promise<boolean> {
    await delay(400);
    
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return false;
    
    appointments[index].status = 'cancelled';
    appointments[index].updatedAt = new Date().toISOString();
    return true;
  },

  async getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
    await delay(300);
    
    const dayOfWeek = new Date(date).getDay();
    const doctorAvail = availability.find(a => a.doctorId === doctorId && a.dayOfWeek === dayOfWeek);
    
    if (!doctorAvail || !doctorAvail.isAvailable) return [];
    
    // Generate 30-minute slots
    const slots: string[] = [];
    const [startHour] = doctorAvail.startTime.split(':').map(Number);
    const [endHour] = doctorAvail.endTime.split(':').map(Number);
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
      slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
    
    // Filter out already booked slots
    const bookedSlots = appointments
      .filter(a => a.doctorId === doctorId && a.appointmentDate === date && a.status !== 'cancelled')
      .map(a => a.appointmentTime);
    
    return slots.filter(s => !bookedSlots.includes(s));
  },

  async getDoctorAvailability(doctorId: string): Promise<DoctorAvailability[]> {
    await delay(300);
    return availability.filter(a => a.doctorId === doctorId);
  },

  async updateDoctorAvailability(doctorId: string, data: Partial<DoctorAvailability>[]): Promise<DoctorAvailability[]> {
    await delay(500);
    
    // Update existing or add new
    data.forEach(item => {
      const index = availability.findIndex(a => a.doctorId === doctorId && a.dayOfWeek === item.dayOfWeek);
      if (index !== -1) {
        availability[index] = { ...availability[index], ...item };
      } else {
        availability.push({
          id: 'avail-' + Date.now(),
          doctorId,
          dayOfWeek: item.dayOfWeek!,
          startTime: item.startTime || '09:00',
          endTime: item.endTime || '17:00',
          isAvailable: item.isAvailable ?? true,
        });
      }
    });
    
    return availability.filter(a => a.doctorId === doctorId);
  },
};
