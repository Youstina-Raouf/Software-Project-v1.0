import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Initial token check:', token ? 'Present' : 'Missing');
    
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile...');
      const response = await api.get('/api/v1/auth/profile');
      console.log('Profile response:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Profile fetch error:', error.response?.data || error.message);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, credential, method = 'password') => {
    try {
      console.log('Attempting login...');
      let response;
      
      if (method === 'password') {
        response = await api.post('/api/v1/auth/login', { 
          email, 
          password: credential 
        });
      } else {
        response = await api.post('/api/v1/auth/login', { 
          email, 
          otp: credential 
        });
      }

      console.log('Login response:', response.data);
      
      const { user } = response.data;
      if (!user || !user.token) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', user.token);
      // Remove token from user object before storing in state
      const { token, ...userWithoutToken } = user;
      setUser(userWithoutToken);
      return { success: true, user: userWithoutToken };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration...');
      const response = await api.post('/api/v1/auth/register', userData);
      console.log('Registration response:', response.data);
      
      const { user } = response.data;
      if (!user || !user.token) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', user.token);
      // Remove token from user object before storing in state
      const { token, ...userWithoutToken } = user;
      setUser(userWithoutToken);
      return { success: true, user: userWithoutToken };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    console.log('Updating user:', updatedUser);
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
