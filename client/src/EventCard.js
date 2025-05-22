import './EventCard.css';          

import React from 'react';
import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
    }}>
      <h3>{event.title}</h3>
      <p>Date: {new Date(event.date).toLocaleDateString()}</p>
      <p>Location: {event.location}</p>
      <p>Price: ${event.price}</p>
      <Link to={`/events/${event._id}`}>View Details</Link>
    </div>
  );
}
