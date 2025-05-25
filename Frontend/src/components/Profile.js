import React from 'react';
import { useAuth } from '../AuthContext';
import UserProfile from './profiles/UserProfile';
import OrganizerProfile from './profiles/OrganizerProfile';
import AdminProfile from './profiles/AdminProfile';

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  // Render different profile components based on user role
  switch (user.role) {
    case 'admin':
      return <AdminProfile />;
    case 'organizer':
      return <OrganizerProfile />;
    case 'user':
    default:
      return <UserProfile />;
  }
};

export default Profile; 