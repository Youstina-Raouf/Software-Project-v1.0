import './EventList.css';          // In EventList.js

import React, { useEffect, useState } from 'react';
import api from './api';
import EventCard from './EventCard';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      try {
        console.log('Fetching events...');
        const res = await api.get('/api/v1/events');
        console.log('Events response:', res.data);
        // Debug each event's image URL
        res.data.forEach(event => {
          console.log(`Event ${event.title}:`, {
            id: event._id,
            image: event.image,
            hasImage: !!event.image
          });
        });
        setEvents(res.data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="event-list-container">
      <h2>Available Events</h2>
      {events.length === 0 ? (
        <p>No events available at the moment.</p>
      ) : (
        <div className="event-grid">
          {events.map(event => {
            console.log(`Rendering event ${event.title}:`, {
              id: event._id,
              image: event.image,
              hasImage: !!event.image
            });
            return <EventCard key={event._id} event={event} />;
          })}
        </div>
      )}
    </div>
  );
}
