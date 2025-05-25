
import './ProfilePage.css';        // In ProfilePage.js
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get('/api/users/profile', { withCredentials: true });
        setProfile(res.data.user);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
      <h2>Profile</h2>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Full Name:</strong> {profile.firstName} {profile.lastName}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {profile.role}</p>

      <Link to="/profile/edit" style={{ marginTop: '20px', display: 'inline-block', color: '#ff4081' }}>
        Edit Profile
      </Link>
    </div>
  );
}
