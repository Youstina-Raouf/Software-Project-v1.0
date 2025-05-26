import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the route is for editing an event
  if (location.pathname.includes('/events/') && location.pathname.includes('/edit')) {
    // Allow access if user is an organizer
    if (user.role === 'organizer') {
      return children;
    }
    // Redirect to home if not an organizer
    return <Navigate to="/" replace />;
  }

  // For other protected routes
  return children;
} 