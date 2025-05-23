import React, { createContext, useState, useEffect } from 'react';
import api from './api';

// Create the AuthContext
export const AuthContext = createContext();

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile on app load
  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setUser(res.data.user);
    } catch (error) {
      setUser(null); // Not logged in
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await api.post('/login', { email, password });
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/register', userData);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.get('/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
