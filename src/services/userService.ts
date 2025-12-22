import { User, Role } from '@/types';
import { mockUsers, mockRoles } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let users = [...mockUsers];
let roles = [...mockRoles];

export const userService = {
  async getAll(): Promise<User[]> {
    await delay(400);
    return [...users];
  },

  async getById(id: string): Promise<User | null> {
    await delay(300);
    return users.find(u => u.id === id) || null;
  },

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await delay(500);
    
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return users[index];
  },

  async toggleActive(id: string): Promise<User | null> {
    await delay(400);
    
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index].isActive = !users[index].isActive;
    users[index].updatedAt = new Date().toISOString();
    
    return users[index];
  },

  async getRoles(): Promise<Role[]> {
    await delay(300);
    return [...roles];
  },

  async updateRole(id: string, permissions: string[]): Promise<Role | null> {
    await delay(500);
    
    const index = roles.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    roles[index] = {
      ...roles[index],
      permissions,
    };
    
    return roles[index];
  },

  async getDoctors(): Promise<User[]> {
    await delay(300);
    return users.filter(u => u.role === 'doctor' && u.isActive);
  },
};
