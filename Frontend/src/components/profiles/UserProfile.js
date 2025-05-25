import React from 'react';
import { useAuth } from '../../AuthContext';

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-container">
      <h2>Welcome, {user?.firstName}!</h2>
      <div className="profile-content">
        <div className="profile-info">
          <h3>Your Profile</h3>
          <p>Name: {user?.firstName} {user?.lastName}</p>
          <p>Email: {user?.email}</p>
          <p>Username: {user?.username}</p>
        </div>
        
        <div className="profile-actions">
          <h3>Quick Actions</h3>
          <button onClick={() => window.location.href = '/events'}>Browse Events</button>
          <button onClick={() => window.location.href = '/bookings'}>View My Bookings</button>
        </div>

        <div className="featured-events">
          <h3>Hot Concerts</h3>
          {/* Add featured events component here */}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 