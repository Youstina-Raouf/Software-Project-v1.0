import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';
import './EventForm.css';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    totalTickets: '',
    price: '',
    image: ''
  });

  useEffect(() => {
    async function fetchEvent() {
      try {
        console.log('Fetching event:', id);
        const response = await api.get(`/api/v1/events/${id}`);
        console.log('Event data:', response.data);
        const event = response.data;
        
        // Format date for input field (YYYY-MM-DD)
        const formattedDate = new Date(event.date).toISOString().split('T')[0];
        
        setFormData({
          title: event.title,
          description: event.description,
          date: formattedDate,
          location: event.location,
          totalTickets: event.totalTickets,
          price: event.price,
          image: event.image || ''
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating event with data:', formData);
      await api.put(`/api/v1/events/${id}`, formData);
      console.log('Event updated successfully');
      navigate(`/events/${id}`);
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
    }
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="event-form-container">
      <h2>Edit Event</h2>
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title">Event Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="totalTickets">Total Tickets</label>
          <input
            type="number"
            id="totalTickets"
            name="totalTickets"
            value={formData.totalTickets}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price ($)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/photo-..."
          />
          <small className="form-text">
            Enter a direct image URL (e.g., from Unsplash or Pexels)
          </small>
        </div>

        <button type="submit" className="submit-button">Update Event</button>
      </form>
    </div>
  );
} 