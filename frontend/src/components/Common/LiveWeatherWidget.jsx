import React, { useState } from 'react';

export default function LiveWeatherWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {/* Header Weather Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="header-control-pill"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: 20,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
          transition: 'all 0.2s',
        }}
        title="Debre Markos Highlands Live Weather & Choke Forecast"
      >
        <span style={{ fontSize: 14 }}>🌤️</span>
        <span style={{ color: '#f0a500' }}>21°C</span>
        <span style={{ color: '#94a3b8', fontSize: 11 }}>Debre Markos</span>
      </button>

      {/* Expandable Forecast Card */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            background: 'linear-gradient(135deg, #0e172a 0%, #0b1329 100%)',
            border: '1.5px solid rgba(212, 175, 55, 0.5)',
            borderRadius: 18,
            padding: '18px 20px',
            width: 300,
            color: '#ffffff',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            zIndex: 1000,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>🏔️</span>
              <strong style={{ fontSize: 13, color: '#f0a500' }}>Highlands Weather</strong>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 16, cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 36 }}>🌤️</span>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#ffffff' }}>21°C</div>
              <div style={{ fontSize: 12, color: '#cbd5e1' }}>Partly Sunny · Crisp Mountain Air</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 12px', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Mount Choke Trekking:</span>
              <span style={{ color: '#2ecc71', fontWeight: 700 }}>✓ Excellent Trails</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Elevation:</span>
              <span>2,446 m (Highlands)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Humidity &amp; Wind:</span>
              <span>48% · 12 km/h NE</span>
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
            Ideal weather for terrace dining and outdoor pool relaxing.
          </div>
        </div>
      )}
    </div>
  );
}

