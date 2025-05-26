import './EventCard.css';          

import React from 'react';
import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  console.log('EventCard rendering:', {
    title: event.title,
    image: event.image,
    hasImage: !!event.image
  });

  return (
    <div className="event-card">
      {event.image ? (
        <div className="event-image">
          <img 
            src={event.image} 
            alt={event.title}
            onError={(e) => {
              console.error('Image failed to load:', event.image);
              e.target.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="event-image placeholder">
          <div className="no-image">No Image Available</div>
        </div>
      )}
      <div className="event-content">
        <h3>{event.title}</h3>
        <p>Date: {new Date(event.date).toLocaleDateString()}</p>
        <p>Location: {event.location}</p>
        <p>Price: ${event.price}</p>
        <Link to={`/events/${event._id}`}>View Details</Link>
      </div>
    </div>
  );
}
