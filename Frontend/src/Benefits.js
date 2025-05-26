
// src/BenefitsSection.js
import React from 'react';
import './BenefitsSection.css'; // We'll style it next

const BenefitsSection = () => {
  return (
    <div className="benefits-container">
      <h2>Login or Signup to gain additional benefits</h2>
      <p>
        Get your own personal profile, follow artists you love, and more when you sign up for a Golden Ticket account.
      </p>
      <div className="benefits-buttons">
        <a href="/login" className="benefit-btn">Login</a>
        <a href="/register" className="benefit-btn">Sign Up</a>
      </div>
    </div>
  );
};

export default BenefitsSection;
