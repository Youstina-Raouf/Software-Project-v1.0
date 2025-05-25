import './EventList.css';          // In EventList.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EventCard from './EventCard';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await axios.get('/api/events', { withCredentials: true });
        setEvents(res.data);
      } catch (err) {
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '1rem' }}>
      <h2>Events</h2>
      {events.map(event => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}
