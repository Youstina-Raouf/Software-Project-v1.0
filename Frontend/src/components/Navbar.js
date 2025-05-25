import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Event Ticketing</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/events" className="navbar-item">Events</Link>
        
        {user ? (
          <>
            <Link to="/profile" className="navbar-item">Profile</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="navbar-item">Admin Dashboard</Link>
            )}
            {user.role === 'organizer' && (
              <Link to="/my-events" className="navbar-item">My Events</Link>
            )}
            <button onClick={handleLogout} className="navbar-item logout-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-item">Login</Link>
            <Link to="/register" className="navbar-item">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 