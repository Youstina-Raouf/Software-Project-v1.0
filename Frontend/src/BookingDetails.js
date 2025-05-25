import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from './api';
import './BookingDetails.css';

const BookingDetails = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      const response = await api.get(`/api/v1/bookings/${id}`);
      setBooking(response.data);
    } catch (error) {
      toast.error('Failed to fetch booking details');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.delete(`/api/v1/bookings/${id}`);
      toast.success('Booking cancelled successfully');
      navigate('/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading booking details...</div>;
  }

  if (!booking) {
    return <div className="error">Booking not found</div>;
  }

  return (
    <div className="booking-details-page">
      <div className="booking-details-container">
        <div className="booking-header">
          <h2>Booking Details</h2>
          <span className={`status ${booking.status.toLowerCase()}`}>
            {booking.status}
          </span>
        </div>

        <div className="event-details">
          <h3>{booking.event.title}</h3>
          <div className="details-grid">
            <div className="detail-item">
              <label>Event Date</label>
              <p>{formatDate(booking.event.date)}</p>
            </div>
            <div className="detail-item">
              <label>Location</label>
              <p>{booking.event.location}</p>
            </div>
            <div className="detail-item">
              <label>Number of Tickets</label>
              <p>{booking.quantity}</p>
            </div>
            <div className="detail-item">
              <label>Price per Ticket</label>
              <p>${booking.event.price}</p>
            </div>
            <div className="detail-item">
              <label>Total Amount</label>
              <p>${booking.totalPrice}</p>
            </div>
            <div className="detail-item">
              <label>Booking Date</label>
              <p>{formatDate(booking.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="booking-actions">
          {booking.status === 'CONFIRMED' && (
            <button onClick={handleCancelBooking} className="cancel-btn">
              Cancel Booking
            </button>
          )}
          <button onClick={() => navigate('/bookings')} className="back-btn">
            Back to Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
