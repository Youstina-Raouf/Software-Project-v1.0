import React from 'react';

export default function Loader() {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div
        className="spinner"
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #ccc',
          borderTop: '4px solid #ff4081',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      ></div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
