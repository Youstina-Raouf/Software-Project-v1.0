import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute check:', {
    user,
    loading,
    allowedRoles,
    hasAccess: user && (!allowedRoles.length || allowedRoles.includes(user.role))
  });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    console.log('User role not allowed:', user.role);
    return <Navigate to="/" />;
  }

  return children;
}
