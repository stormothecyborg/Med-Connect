import { User, LoginCredentials, AuthState } from '@/types';
import { mockUsers } from './mockData';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Store for current auth state (in real app, this would be server-side)
let currentSession: { user: User | null; token: string | null } = {
  user: null,
  token: null,
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; mfaRequired?: boolean; error?: string }> {
    await delay(800);
    
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // For demo, password is "password123"
    if (credentials.password !== 'password123') {
      return { success: false, error: 'Invalid email or password' };
    }
    
    if (!user.isActive) {
      return { success: false, error: 'Account is deactivated. Contact administrator.' };
    }
    
    // Check if MFA is required
    if (user.mfaEnabled) {
      currentSession = { user, token: null };
      return { success: true, mfaRequired: true, user };
    }
    
    // No MFA required, complete login
    currentSession = { user, token: 'mock-jwt-token-' + Date.now() };
    return { success: true, user };
  },

  async verifyMFA(code: string): Promise<{ success: boolean; error?: string }> {
    await delay(500);
    
    // For demo, valid code is "123456"
    if (code !== '123456') {
      return { success: false, error: 'Invalid verification code' };
    }
    
    currentSession.token = 'mock-jwt-token-' + Date.now();
    return { success: true };
  },

  async logout(): Promise<void> {
    await delay(300);
    currentSession = { user: null, token: null };
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(200);
    return currentSession.user;
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    await delay(800);
    
    const user = mockUsers.find(u => u.email === email);
    
    // Always return success to prevent email enumeration
    return { 
      success: true, 
      message: 'If an account exists with this email, you will receive password reset instructions.' 
    };
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    await delay(800);
    
    // For demo, valid token is "valid-reset-token"
    if (token !== 'valid-reset-token') {
      return { success: false, error: 'Invalid or expired reset token' };
    }
    
    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }
    
    return { success: true };
  },

  getAuthState(): AuthState {
    return {
      user: currentSession.user,
      isAuthenticated: !!currentSession.token,
      mfaRequired: !!currentSession.user && !currentSession.token,
      mfaVerified: !!currentSession.token,
    };
  },
};
