import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={{ background: '#142b5f', padding: '10px 20px', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
          Golden Ticket
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
            {user.role === 'Organizer' && <Link to="/my-events" style={{ color: 'white', marginRight: '15px' }}>My Events</Link>}
            {user.role === 'Admin' && <Link to="/admin/users" style={{ color: 'white', marginRight: '15px' }}>Admin</Link>}
            <Link to="/profile" style={{ color: 'white', marginRight: '15px' }}>Profile</Link>
            <button onClick={logout} style={{ background: 'none', color: 'white', border: 'none', cursor: 'pointer' }}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
