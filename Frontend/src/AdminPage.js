import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';
import './AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
      const eventsResponse = await api.get('/api/v1/events/all');
      console.log('Events response:', eventsResponse.data);
      setEvents(eventsResponse.data);

      // Fetch users
      console.log('Fetching users...');
      const usersResponse = await api.get('/api/v1/users');
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
      console.log('Updating event status:', { eventId, newStatus });
      const response = await api.put(`/api/v1/events/${eventId}/status`, { status: newStatus });
      console.log('Status update response:', response);
      
      // If we don't get the event data back, fetch it again
      if (!response.data || !response.data.title) {
        console.log('No event data in response, fetching updated event...');
        const eventResponse = await api.get(`/api/v1/events/${eventId}`);
        if (!eventResponse.data) {
          throw new Error('Failed to fetch updated event data');
        }
        console.log('Fetched updated event:', eventResponse.data);
        
        setEvents(prevEvents => {
          console.log('Previous events:', prevEvents);
          const updatedEvents = prevEvents.map(event => {
            if (event._id === eventId) {
              console.log('Updating event:', event);
              console.log('With new data:', eventResponse.data);
              return eventResponse.data;
            }
            return event;
          });
          console.log('Updated events:', updatedEvents);
          return updatedEvents;
        });
      } else {
        setEvents(prevEvents => {
          console.log('Previous events:', prevEvents);
          const updatedEvents = prevEvents.map(event => {
            if (event._id === eventId) {
              console.log('Updating event:', event);
              console.log('With new data:', response.data);
              return response.data;
            }
            return event;
          });
          console.log('Updated events:', updatedEvents);
          return updatedEvents;
        });
      }
    } catch (err) {
      console.error('Error updating event status:', err);
      setError(err.response?.data?.message || 'Failed to update event status');
    }
  };

  const handleEventEdit = async (eventId, updatedData) => {
    try {
      const response = await api.put(`/api/v1/events/${eventId}`, updatedData);
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
        await api.delete(`/api/v1/events/${eventId}`);
        setEvents(events.filter(event => event._id !== eventId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const handleUserEdit = async (userId, updatedData) => {
    try {
      if (!updatedData || !userId) {
        console.error('Invalid user data or ID');
        return;
      }
      
      // Log the data we're sending
      const updatePayload = {
        username: updatedData.username,
        role: updatedData.role,
        email: updatedData.email
      };
      console.log('Sending update request:', {
        url: `/api/v1/users/${userId}`,
        payload: updatePayload,
        originalData: updatedData
      });

      // Make the API call
      const response = await api.put(`/api/v1/users/${userId}`, updatePayload);
      console.log('Server response:', response.data);
      
      if (!response.data || !response.data.user) {
        throw new Error('No user data received from server');
      }

      // Update the users array with the new data
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.map(user => {
          if (user && user._id === userId) {
            return {
              ...user,
              ...response.data.user
            };
          }
          return user;
        });
        return updatedUsers;
      });

      // Show success message
      alert('User updated successfully!');
      
      // Clear the editing state
      setEditingUser(null);

    } catch (err) {
      console.error('Error updating user:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError(err.response?.data?.message || 'Failed to update user');
      alert('Failed to update user. Please try again.');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!userId) {
      console.error('Invalid user ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        console.log('Deleting user:', userId);
        await api.delete(`/api/v1/users/${userId}`);
        
        // Update the users array by filtering out the deleted user
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.filter(user => user && user._id !== userId);
          console.log('Updated users after delete:', updatedUsers);
          return updatedUsers;
        });
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const renderContent = () => {
    const path = location.pathname;

    switch (path) {
      case '/admin':
        return (
          <div className="dashboard-overview">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Events</h3>
                <p>{events.length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Users</h3>
                <p>{users.length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Organizers</h3>
                <p>{users.filter(u => u.role === 'organizer').length}</p>
              </div>
            </div>
          </div>
        );

      case '/admin/events':
        return (
          <section className="admin-section">
            <h2>Events Management</h2>
            <div className="events-list">
              {events.length === 0 ? (
                <div className="no-data">No events found.</div>
              ) : (
                events.filter(event => event !== null).map(event => (
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
        );

      case '/admin/users':
        return (
          <section className="admin-section">
            <h2>Users Management</h2>
            <div className="users-list">
              {!users || users.length === 0 ? (
                <div className="no-data">No users found.</div>
              ) : (
                users
                  .filter(user => user && user._id)
                  .map(user => (
                    <div key={user._id} className="user-card">
                      {editingUser?._id === user._id ? (
                        <div className="edit-form">
                          <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                              type="text"
                              id="username"
                              value={editingUser.username || ''}
                              onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                              placeholder="Username"
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                              type="email"
                              id="email"
                              value={editingUser.email || ''}
                              onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                              placeholder="Email"
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select
                              id="role"
                              value={editingUser.role || 'user'}
                              onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                            >
                              <option value="user">User</option>
                              <option value="organizer">Organizer</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          <div className="edit-actions">
                            <button onClick={() => handleUserEdit(user._id, editingUser)}>Save</button>
                            <button onClick={() => setEditingUser(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3>{user.username || 'No username'}</h3>
                          <p>Role: {user.role || 'user'}</p>
                          <p>Email: {user.email || 'No email'}</p>
                          <div className="user-actions">
                            <button onClick={() => setEditingUser({...user})}>Edit</button>
                            <button onClick={() => handleUserDelete(user._id)}>Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
              )}
            </div>
          </section>
        );

      case '/admin/organizers':
        return (
          <section className="admin-section">
            <h2>Organizers Management</h2>
            <div className="users-list">
              {!users || users.length === 0 ? (
                <div className="no-data">No organizers found.</div>
              ) : (
                users
                  .filter(user => user && user._id && user.role === 'organizer')
                  .map(user => (
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
        );

      case '/admin/analytics':
        return (
          <section className="admin-section">
            <h2>Analytics Dashboard</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Event Statistics</h3>
                <p>Total Events: {events.length}</p>
                <p>Approved Events: {events.filter(e => e.status === 'approved').length}</p>
                <p>Pending Events: {events.filter(e => e.status === 'pending').length}</p>
              </div>
              <div className="analytics-card">
                <h3>User Statistics</h3>
                <p>Total Users: {users.length}</p>
                <p>Regular Users: {users.filter(u => u.role === 'user').length}</p>
                <p>Organizers: {users.filter(u => u.role === 'organizer').length}</p>
              </div>
            </div>
          </section>
        );

      default:
        return <div>Page not found</div>;
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
      
      <nav className="admin-nav">
        <button 
          onClick={() => navigate('/admin')}
          className={location.pathname === '/admin' ? 'active' : ''}
        >
          Dashboard
        </button>
        <button 
          onClick={() => navigate('/admin/events')}
          className={location.pathname === '/admin/events' ? 'active' : ''}
        >
          Events
        </button>
        <button 
          onClick={() => navigate('/admin/users')}
          className={location.pathname === '/admin/users' ? 'active' : ''}
        >
          Users
        </button>
        <button 
          onClick={() => navigate('/admin/organizers')}
          className={location.pathname === '/admin/organizers' ? 'active' : ''}
        >
          Organizers
        </button>
        <button 
          onClick={() => navigate('/admin/analytics')}
          className={location.pathname === '/admin/analytics' ? 'active' : ''}
        >
          Analytics
        </button>
      </nav>

      {renderContent()}
    </div>
  );
} 