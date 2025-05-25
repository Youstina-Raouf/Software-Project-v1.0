import React from 'react';
import { useAuth } from '../../AuthContext';

const OrganizerProfile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-container">
      <h2>Welcome, {user?.firstName}!</h2>
      <div className="profile-content">
        <div className="profile-info">
          <h3>Organizer Profile</h3>
          <p>Name: {user?.firstName} {user?.lastName}</p>
          <p>Email: {user?.email}</p>
          <p>Username: {user?.username}</p>
        </div>
        
        <div className="profile-actions">
          <h3>Event Management</h3>
          <button onClick={() => window.location.href = '/my-events/new'}>Create New Event</button>
          <button onClick={() => window.location.href = '/my-events'}>Manage Events</button>
          <button onClick={() => window.location.href = '/my-events/analytics'}>View Analytics</button>
        </div>

        <div className="event-stats">
          <h3>Event Statistics</h3>
          {/* Add event statistics component here */}
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile; 