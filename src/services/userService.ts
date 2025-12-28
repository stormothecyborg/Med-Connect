import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Database } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type UserRole = Tables<'user_roles'>;
type AppRole = Database['public']['Enums']['app_role'];

export interface UserWithRole extends Profile {
  role: AppRole;
}

export interface AllowedUser {
  id: string;
  email: string;
  role: AppRole;
  created_at: string;
  created_by: string | null;
}

export const userService = {
  async getAll(): Promise<UserWithRole[]> {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profileError) throw profileError;
    
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('*');
    
    if (roleError) throw roleError;
    
    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
    
    return (profiles || []).map(profile => ({
      ...profile,
      role: roleMap.get(profile.id) || 'receptionist',
    }));
  },

  async getById(id: string): Promise<UserWithRole | null> {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (profileError) throw profileError;
    if (!profile) return null;
    
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', id)
      .maybeSingle();
    
    return {
      ...profile,
      role: role?.role || 'receptionist',
    };
  },

  async update(id: string, data: Partial<Profile>): Promise<Profile | null> {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  async updateRole(userId: string, role: AppRole): Promise<UserRole | null> {
    const { data: updated, error } = await supabase
      .from('user_roles')
      .update({ role })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  async toggleActive(id: string): Promise<Profile | null> {
    const { data: current } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', id)
      .single();
    
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({ is_active: !current?.is_active })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updated;
  },

  async getDoctors(): Promise<UserWithRole[]> {
    const { data: doctorRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'doctor');
    
    if (roleError) throw roleError;
    
    const doctorIds = doctorRoles?.map(r => r.user_id) || [];
    
    if (doctorIds.length === 0) return [];
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', doctorIds)
      .eq('is_active', true);
    
    if (profileError) throw profileError;
    
    return (profiles || []).map(profile => ({
      ...profile,
      role: 'doctor' as AppRole,
    }));
  },

  // Allowed Users (Pre-registration) CRUD
  async getAllowedUsers(): Promise<AllowedUser[]> {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as AllowedUser[];
  },

  async addAllowedUser(email: string, role: AppRole): Promise<AllowedUser> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('allowed_users')
      .insert({ email: email.toLowerCase(), role, created_by: user?.id })
      .select()
      .single();
    
    if (error) throw error;
    return data as AllowedUser;
  },

  async updateAllowedUserRole(id: string, role: AppRole): Promise<AllowedUser> {
    const { data, error } = await supabase
      .from('allowed_users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as AllowedUser;
  },

  async deleteAllowedUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('allowed_users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
