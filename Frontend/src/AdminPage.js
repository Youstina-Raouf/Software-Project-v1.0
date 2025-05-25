import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';
import './AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const fetchAdminData = useCallback(async () => {
    try {
      console.log('=== Fetching Admin Data ===');
      setLoading(true);
      setError('');

      // Get the auth token
      const token = localStorage.getItem('token');
      console.log('Auth token present:', !!token);

      // Fetch events
      console.log('Fetching events...');
      const eventsResponse = await api.get('/events/all');
      console.log('Events response:', eventsResponse.data);
      setEvents(eventsResponse.data);

      // Fetch users
      console.log('Fetching users...');
      const usersResponse = await api.get('/users');
      console.log('Users response:', usersResponse.data);
      setUsers(usersResponse.data);

    } catch (err) {
      console.error('Admin data fetch error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to access the admin dashboard.');
        navigate('/unauthorized');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch admin data. Please try again.');
      }
    } finally {
      setLoading(false);
      console.log('=== Admin Data Fetch Complete ===');
    }
  }, [navigate]);

  useEffect(() => {
    console.log('=== AdminPage Mounted ===');
    console.log('Current user:', user);
    
    if (!user || user.role.toLowerCase() !== 'admin') {
      console.log('User is not admin, redirecting to unauthorized');
      navigate('/unauthorized');
      return;
    }

    fetchAdminData();
  }, [user, navigate, fetchAdminData]);

  const handleEventStatusUpdate = async (eventId, newStatus) => {
    try {
      const response = await api.put(`/events/${eventId}/status`, { status: newStatus });
      setEvents(events.map(event => 
        event._id === eventId ? response.data : event
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event status');
    }
  };

  const handleEventEdit = async (eventId, updatedData) => {
    try {
      const response = await api.put(`/events/${eventId}`, updatedData);
      setEvents(events.map(event => 
        event._id === eventId ? response.data : event
      ));
      setEditingEvent(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
    }
  };

  const handleEventDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${eventId}`);
        setEvents(events.filter(event => event._id !== eventId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const handleUserEdit = async (userId, updatedData) => {
    try {
      const response = await api.put(`/users/${userId}`, updatedData);
      setUsers(users.map(user => 
        user._id === userId ? response.data : user
      ));
      setEditingUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Loading admin data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="error-message">{error}</div>
        <button onClick={fetchAdminData} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      
      <section className="admin-section">
        <h2>Events Management</h2>
        <div className="events-list">
          {events.length === 0 ? (
            <div className="no-data">No events found.</div>
          ) : (
            events.map(event => (
              <div key={event._id} className="event-card">
                {editingEvent?._id === event._id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editingEvent.title}
                      onChange={e => setEditingEvent({...editingEvent, title: e.target.value})}
                      placeholder="Event Title"
                    />
                    <textarea
                      value={editingEvent.description}
                      onChange={e => setEditingEvent({...editingEvent, description: e.target.value})}
                      placeholder="Event Description"
                    />
                    <div className="edit-actions">
                      <button onClick={() => handleEventEdit(event._id, editingEvent)}>Save</button>
                      <button onClick={() => setEditingEvent(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{event.title}</h3>
                    <p>Status: {event.status}</p>
                    <p>Description: {event.description}</p>
                    <div className="event-actions">
                      <button 
                        onClick={() => handleEventStatusUpdate(event._id, 'approved')}
                        disabled={event.status === 'approved'}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleEventStatusUpdate(event._id, 'rejected')}
                        disabled={event.status === 'rejected'}
                      >
                        Reject
                      </button>
                      <button onClick={() => setEditingEvent(event)}>Edit</button>
                      <button onClick={() => handleEventDelete(event._id)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="admin-section">
        <h2>Users Management</h2>
        <div className="users-list">
          {users.length === 0 ? (
            <div className="no-data">No users found.</div>
          ) : (
            users.map(user => (
              <div key={user._id} className="user-card">
                {editingUser?._id === user._id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                      placeholder="Username"
                    />
                    <select
                      value={editingUser.role}
                      onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                    >
                      <option value="user">User</option>
                      <option value="organizer">Organizer</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="edit-actions">
                      <button onClick={() => handleUserEdit(user._id, editingUser)}>Save</button>
                      <button onClick={() => setEditingUser(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{user.username}</h3>
                    <p>Role: {user.role}</p>
                    <p>Email: {user.email}</p>
                    <div className="user-actions">
                      <button onClick={() => setEditingUser(user)}>Edit</button>
                      <button onClick={() => handleUserDelete(user._id)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
} 