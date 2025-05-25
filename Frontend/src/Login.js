import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log('=== Login Process Started ===');
      console.log('Attempting login with email:', email);
      
      const response = await login(email, password);
      console.log('Login API Response:', response);
      
      if (!response.user) {
        console.error('No user data in response');
        throw new Error('Login failed - no user data received');
      }

      const userRole = response.user.role.toLowerCase();
      console.log('User Role:', userRole);
      console.log('Full User Data:', response.user);
      
      if (userRole === 'admin') {
        console.log('Admin detected - redirecting to admin dashboard...');
        navigate('/admin', { replace: true });
      } else if (userRole === 'organizer') {
        console.log('Organizer detected - redirecting to organizer dashboard...');
        navigate('/organizer-dashboard', { replace: true });
      } else {
        console.log('Standard user - redirecting to home...');
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Login Error:', err);
      console.error('Error Details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
      console.log('=== Login Process Completed ===');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        {/* Forgot password link */}
        <div className="forgot-password-link">
          <Link to="/forgot-password">Forgot your password?</Link>
        </div>
      </form>

      <p className="signup-text">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
}
