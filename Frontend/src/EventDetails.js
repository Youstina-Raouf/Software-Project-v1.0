import './EventDetails.css';       // In EventDetails.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await axios.get(`/api/events/${id}`, { withCredentials: true });
        setEvent(res.data);
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  if (loading) return <p>Loading event details...</p>;
  if (error) return <p>{error}</p>;
  if (!event) return <p>No event found.</p>;

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '1rem' }}>
      <h2>{event.title}</h2>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Description:</strong> {event.description || 'No description available.'}</p>
      <p><strong>Price:</strong> ${event.price}</p>
      <p><strong>Total Tickets:</strong> {event.totalTickets}</p>
      <p><strong>Remaining Tickets:</strong> {event.remainingTickets}</p>
      {/* Add more event details as needed */}
    </div>
  );
}
