import React from 'react';
import { Activity } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <Activity className="h-10 w-10 text-primary-foreground" />
          <span className="text-2xl font-bold text-primary-foreground">HMS</span>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
            Hospital Management System
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Streamline patient care, manage electronic health records, and optimize hospital operations with our comprehensive healthcare platform.
          </p>
        </div>

        <div className="flex items-center gap-8 text-primary-foreground/70 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-secondary" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-secondary" />
            <span>99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-secondary" />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <Activity className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-foreground">HMS</span>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};
