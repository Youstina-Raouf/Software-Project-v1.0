import React from 'react';
import { useAuth } from '../../AuthContext';

const AdminProfile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-container">
      <h2>Welcome, {user?.firstName}!</h2>
      <div className="profile-content">
        <div className="profile-info">
          <h3>Admin Profile</h3>
          <p>Name: {user?.firstName} {user?.lastName}</p>
          <p>Email: {user?.email}</p>
          <p>Username: {user?.username}</p>
        </div>
        
        <div className="profile-actions">
          <h3>User Management</h3>
          <button onClick={() => window.location.href = '/admin/users'}>Manage Users</button>
          <button onClick={() => window.location.href = '/admin/organizers'}>Manage Organizers</button>
          
          <h3>Event Management</h3>
          <button onClick={() => window.location.href = '/admin/events'}>Manage Events</button>
          <button onClick={() => window.location.href = '/admin/analytics'}>View Analytics</button>
        </div>

        <div className="admin-stats">
          <h3>System Statistics</h3>
          {/* Add system statistics component here */}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile; 