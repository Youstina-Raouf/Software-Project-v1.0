import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; // Reuse your login styles

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/v1/auth/forgetPassword', { email });
      setMessage(res.data.message || 'Check your email for reset instructions.');
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || 'Something went wrong'));
    }
  };

  return (
    <div className="login-container">
      <h2>Forgot Password</h2>
      {message && <div className="error-message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
