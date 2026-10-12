import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/** Dashboard routes: send signed-out visitors to Login, remembering where they were going. */
export function RequireAuth({ children }: {children: React.ReactElement;}) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

/** Login / Sign-Up: signed-in users go straight to the dashboard. */
export function PublicOnlyRoute({ children }: {children: React.ReactElement;}) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
}