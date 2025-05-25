import React from 'react';

export default function Unauthorized() {
  return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#ff4081' }}>
      <h1>403 - Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
    </div>
  );
}
