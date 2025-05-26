import './EventDetails.css';       // In EventDetails.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        console.log('Fetching event:', id);
        const response = await api.get(`/api/v1/events/${id}`);
        console.log('Event data:', response.data);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is an organizer
    if (user.role === 'organizer') {
      setError('Organizers cannot book events. Please use a regular user account.');
      return;
    }

    try {
      setBookingInProgress(true);
      const response = await api.post(`/api/v1/bookings`, {
        eventId: event._id,
        ticketsBooked: bookingQuantity
      });
      
      // Update the event's remaining tickets
      setEvent(prev => ({
        ...prev,
        remainingTickets: prev.remainingTickets - bookingQuantity
      }));

      // Show success message and redirect to bookings page
      alert('Booking successful!');
      navigate('/my-bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book tickets');
      console.error('Error booking tickets:', err);
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!event) return <div className="error">Event not found</div>;

  const isOrganizer = user && user.role === 'organizer' && event.organizer === user._id;
  console.log('User check:', {
    userId: user?._id,
    eventOrganizer: event.organizer,
    userRole: user?.role,
    isOrganizer
  });
  const canBook = event.status === 'approved' && event.remainingTickets > 0 && user?.role === 'user';

  return (
    <div className="event-details-container">
      <div className="event-header">
        <h2>{event.title}</h2>
        {isOrganizer && (
          <Link 
            to={`/my-events/${event._id}/edit`} 
            className="edit-button"
            onClick={() => {
              console.log('Edit button clicked for event:', event._id);
              console.log('Navigating to:', `/my-events/${event._id}/edit`);
            }}
          >
            Edit Event
          </Link>
        )}
      </div>

      {event.image && (
        <div className="event-image">
          <img src={event.image} alt={event.title} />
        </div>
      )}

      <div className="event-info">
        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Price:</strong> ${event.price}</p>
        <p><strong>Tickets Available:</strong> {event.remainingTickets} of {event.totalTickets}</p>
      </div>

      <div className="event-description">
        <h3>Description</h3>
        <p>{event.description}</p>
      </div>

      <div className="event-actions">
        {canBook && (
          <div className="booking-section">
            <h3>Book Tickets</h3>
            <div className="booking-controls">
              <label>
                Number of Tickets:
                <input
                  type="number"
                  min="1"
                  max={event.remainingTickets}
                  value={bookingQuantity}
                  onChange={(e) => setBookingQuantity(Math.min(parseInt(e.target.value) || 1, event.remainingTickets))}
                />
              </label>
              <p>Total Price: ${(event.price * bookingQuantity).toFixed(2)}</p>
              <button 
                onClick={handleBooking}
                disabled={bookingInProgress || !user}
              >
                {bookingInProgress ? 'Booking...' : user ? 'Book Now' : 'Login to Book'}
              </button>
            </div>
          </div>
        )}

        {!canBook && (
          <div className="booking-message">
            {!user ? (
              <p>Please log in to book tickets.</p>
            ) : user.role === 'organizer' ? (
              <p>Organizers cannot book events. Please use a regular user account.</p>
            ) : event.status !== 'approved' ? (
              <p>This event is not available for booking yet.</p>
            ) : (
              <p>Sorry, this event is sold out.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
