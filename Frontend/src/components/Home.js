import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to Event Ticketing</h1>
        <p>Your one-stop platform for event management and ticket booking</p>
        {!user && (
          <div className="cta-buttons">
            <Link to="/register" className="cta-button primary">Get Started</Link>
            <Link to="/login" className="cta-button secondary">Login</Link>
          </div>
        )}
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Easy Booking</h3>
            <p>Book tickets for your favorite events with just a few clicks</p>
          </div>
          <div className="feature-card">
            <h3>Event Management</h3>
            <p>Create and manage your events with our powerful tools</p>
          </div>
          <div className="feature-card">
            <h3>Secure Payments</h3>
            <p>Safe and secure payment processing for all transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 