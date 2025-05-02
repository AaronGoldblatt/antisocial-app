import React from 'react';

export function Banner() {
  return (
    <div className="banner-container" style={{ width: '220px', height: '40px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        <div style={{ 
          position: 'relative', 
          marginRight: '5px',
          width: '30px',
          height: '30px',
          backgroundColor: '#FF6600',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderLeft: '2px solid #000',
            borderRight: '2px solid #000',
            transform: 'rotate(45deg)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '1px',
              width: '8px',
              height: '2px',
              backgroundColor: '#000',
            }}></div>
          </div>
        </div>
        <span style={{ 
          color: '#FF6600', 
          fontSize: '28px', 
          fontFamily: 'Creepster, cursive',
          letterSpacing: '1px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
        }}>AntiSocial</span>
      </div>
    </div>
  );
} 