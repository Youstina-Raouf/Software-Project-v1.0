import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useContext(AuthContext);

  console.log('=== Protected Route Check ===');
  console.log('Current User:', user);
  console.log('Allowed Roles:', allowedRoles);
  console.log('Loading State:', loading);

  // Show loading state while checking authentication
  if (loading) {
    console.log('Still loading user data...');
    return <div>Loading...</div>;
  }

  // If no user is logged in, redirect to login
  if (!user) {
    console.log('No user found - redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user's role is allowed
  if (allowedRoles.length > 0) {
    const userRole = user.role.toLowerCase();
    console.log('Checking role access. User role:', userRole);
    console.log('Required roles:', allowedRoles);
    
    if (!allowedRoles.includes(userRole)) {
      console.log('Access denied - user role not allowed');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If all checks pass, render the protected content
  console.log('Access granted - rendering protected content');
  return children;
}
