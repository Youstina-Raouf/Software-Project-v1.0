import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';
import './EventForm.css';

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(id ? true : false);
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

  // Function to process URLs and convert to direct image URLs
  const processImageUrl = (url) => {
    try {
      console.log('Processing URL:', url);
      
      // Handle Google redirect URLs
      if (url.includes('google.com/url')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const actualUrl = urlParams.get('url');
        console.log('Extracted URL from Google redirect:', actualUrl);
        
        if (actualUrl) {
          // If it's an IMDB URL, use a default image
          if (actualUrl.includes('imdb.com')) {
            console.log('IMDB URL detected, using default image');
            return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4';
          }
          return actualUrl;
        }
      }
      
      // Handle Google search URLs
      if (url.includes('google.com/search')) {
        console.log('Google search URL detected, using default image');
        return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4';
      }

      // Handle IMDB URLs directly
      if (url.includes('imdb.com')) {
        console.log('IMDB URL detected, using default image');
        return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4';
      }

      // If it's already a direct image URL, return as is
      if (url.match(/\.(jpeg|jpg|gif|png)$/)) {
        console.log('Direct image URL detected');
        return url;
      }

      // Default fallback image
      console.log('Using default image');
      return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4';
    } catch (err) {
      console.error('Error processing URL:', err);
      return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4';
    }
  };

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;

      try {
        console.log('Fetching event for edit:', id);
        const response = await api.get(`/api/v1/events/${id}`);
        console.log('Event data for edit:', response.data);
        const event = response.data;
        
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
    console.log('Form field changed:', name, value);
    
    if (name === 'image') {
      const processedUrl = processImageUrl(value);
      console.log('Processed image URL:', processedUrl);
      setFormData(prev => ({
        ...prev,
        [name]: processedUrl
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const processedFormData = {
        ...formData,
        image: processImageUrl(formData.image)
      };

      console.log('Submitting form with data:', processedFormData);

      if (id) {
        // Update existing event
        console.log('Updating event:', id, processedFormData);
        const response = await api.put(`/api/v1/events/${id}`, processedFormData);
        console.log('Event updated successfully:', response.data);
      } else {
        // Create new event
        console.log('Creating new event:', processedFormData);
        const response = await api.post('/api/v1/events', processedFormData);
        console.log('Event created successfully:', response.data);
      }
      navigate('/my-events');
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.response?.data?.message || 'Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="event-form-container">
      <h2>{id ? 'Edit Event' : 'Create New Event'}</h2>
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
            placeholder="Paste Google image URL here"
          />
          <small className="form-text">
            Paste any Google image URL - we'll convert it automatically
          </small>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Saving...' : (id ? 'Update Event' : 'Create Event')}
        </button>
      </form>
    </div>
  );
} 