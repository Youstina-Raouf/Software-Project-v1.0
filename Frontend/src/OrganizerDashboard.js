import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from './api';
import './AdminPage.css'; // We can reuse the admin page styles for now

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  const fetchOrganizerEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/events/organizer');
      setEvents(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-page">
      <h1>Organizer Dashboard</h1>
      
      <section className="admin-section">
        <h2>My Events</h2>
        <div className="events-list">
          {events.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', padding: '2rem' }}>
              No events found.
            </div>
          ) : (
            events.map(event => (
              <div key={event._id} className="event-card">
                <h3>{event.title}</h3>
                <p>Status: {event.status}</p>
                <p>Description: {event.description}</p>
                <div className="event-actions">
                  <button onClick={() => window.location.href = `/events/${event._id}/edit`}>
                    Edit Event
                  </button>
                  <button onClick={() => window.location.href = `/events/${event._id}/bookings`}>
                    View Bookings
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default OrganizerDashboard;