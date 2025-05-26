import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (!user) return;
    
    const userRole = user.role.toLowerCase();
    switch (userRole) {
      case 'admin':
        navigate('/admin');
        break;
      case 'organizer':
        navigate('/organizer-dashboard');
        break;
      case 'user':
        navigate('/profile');
        break;
      default:
        navigate('/profile');
    }
  };

  const handleAdminDashboardClick = () => {
    if (user && user.role.toLowerCase() === 'admin') {
      navigate('/admin');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav style={{ background: '#142b5f', padding: '10px 20px', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/png_.jpeg" alt="Golden Ticket Logo" style={{ height: '40px', marginRight: '10px' }} />
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>Golden Ticket</span>
        </Link>
      </div>
      <div>
        {!user && (
          <>
            <Link to="/login" style={{ color: 'white', marginRight: '15px' }}>Login</Link>
            <Link to="/register" style={{ color: 'white' }}>Register</Link>
          </>
        )}
        {user && (
          <>
            {user.role.toLowerCase() === 'organizer' && (
              <Link to="/organizer-dashboard" style={{ color: 'white', marginRight: '15px' }}>My Events</Link>
            )}
            {user.role.toLowerCase() === 'admin' && (
              <button 
                onClick={handleAdminDashboardClick}
                style={{ 
                  color: 'white', 
                  marginRight: '15px',
                  textDecoration: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  backgroundColor: '#ff4081',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Admin Dashboard
              </button>
            )}
            <button 
              onClick={handleProfileClick}
              style={{ 
                background: 'none', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer',
                marginRight: '15px',
                fontSize: '1rem'
              }}
            >
              Profile
            </button>
            <button 
              onClick={handleLogout} 
              style={{ 
                background: 'none', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
