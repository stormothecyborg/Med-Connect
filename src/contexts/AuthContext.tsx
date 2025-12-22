import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, UserRole } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; mfaRequired?: boolean; error?: string }>;
  verifyMFA: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('hms_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);
        setMfaVerified(true);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    
    if (result.success && result.user) {
      setUser(result.user);
      
      if (result.mfaRequired) {
        setMfaRequired(true);
        return { success: true, mfaRequired: true };
      }
      
      // No MFA required, complete login
      setIsAuthenticated(true);
      setMfaVerified(true);
      localStorage.setItem('hms_user', JSON.stringify(result.user));
      return { success: true };
    }
    
    return { success: false, error: result.error };
  };

  const verifyMFA = async (code: string) => {
    const result = await authService.verifyMFA(code);
    
    if (result.success) {
      setIsAuthenticated(true);
      setMfaVerified(true);
      setMfaRequired(false);
      if (user) {
        localStorage.setItem('hms_user', JSON.stringify(user));
      }
      return { success: true };
    }
    
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setMfaRequired(false);
    setMfaVerified(false);
    localStorage.removeItem('hms_user');
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      mfaRequired,
      mfaVerified,
      login,
      verifyMFA,
      logout,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
