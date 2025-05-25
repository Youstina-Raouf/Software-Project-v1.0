import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from './api';
import './BookTicketForm.css';

const BookTicketForm = ({ event, onBookingSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= event.remainingTickets) {
      setQuantity(value);
    }
  };

  const calculateTotal = () => {
    return (event.price * quantity).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/v1/bookings', {
        eventId: event._id,
        quantity,
        totalPrice: calculateTotal()
      });

      toast.success('Tickets booked successfully!');
      if (onBookingSuccess) {
        onBookingSuccess(response.data);
      }
      navigate('/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book tickets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-ticket-form">
      <h3>Book Tickets</h3>
      <div className="ticket-info">
        <p>Price per ticket: ${event.price}</p>
        <p>Available tickets: {event.remainingTickets}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="quantity">Number of Tickets:</label>
          <input
            type="number"
            id="quantity"
            min="1"
            max={event.remainingTickets}
            value={quantity}
            onChange={handleQuantityChange}
            required
          />
        </div>

        <div className="total-price">
          <h4>Total Price: ${calculateTotal()}</h4>
        </div>

        <button 
          type="submit" 
          className="book-button"
          disabled={loading || event.remainingTickets === 0}
        >
          {loading ? 'Processing...' : 'Book Tickets'}
        </button>

        {event.remainingTickets === 0 && (
          <p className="sold-out">Sold Out!</p>
        )}
      </form>
    </div>
  );
};

export default BookTicketForm;
