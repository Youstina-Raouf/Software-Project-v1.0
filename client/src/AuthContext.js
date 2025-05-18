
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the AuthContext
export const AuthContext = createContext();

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Fetch user profile on app load
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get('/api/users/profile', { withCredentials: true });
      setUser(res.data.user);
    } catch (error) {
      setUser(null); // Not logged in
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Login function
  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
    setUser(res.data.user);
    return res;
  };

  // Logout function
  const logout = async () => {
    await axios.get('/api/auth/logOut', { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
