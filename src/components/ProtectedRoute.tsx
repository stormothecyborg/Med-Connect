import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { ROUTES } from '@/config/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, mfaRequired, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated && !mfaRequired) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (mfaRequired && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ mfaStep: true }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
