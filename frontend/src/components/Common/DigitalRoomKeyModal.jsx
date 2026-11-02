import React, { useRef } from 'react';
import LuxuryLogo from './LuxuryLogo';

export default function DigitalRoomKeyModal({ isOpen, onClose, reservation, guestName }) {
  const cardRef = useRef(null);

  if (!isOpen || !reservation) return null;

  const roomNum = reservation.room_number || reservation.roomNumber || '401';
  const roomType = reservation.room_type || reservation.roomType || 'Royal Luxury Suite';
  const guest = guestName || reservation.full_name || reservation.guest_name || 'VIP Valued Guest';
  const checkIn = reservation.check_in_date || reservation.checkInDate || 'Today';
  const checkOut = reservation.check_out_date || reservation.checkOutDate || 'Departure Date';
  const refCode = reservation.payment_reference || `PH-KEY-${reservation.id || Date.now().toString(36).toUpperCase()}`;

  // Floor calculation
  const floorNum = String(roomNum).charAt(0) || '2';
  const doorPin = `${String(reservation.id || 1234).slice(-4).padStart(4, '7')}#`;

  const qrPayload = JSON.stringify({
    hotel: 'Paradise Hotel Debre Markos',
    passId: refCode,
    room: roomNum,
    guest: guest,
    checkIn: checkIn,
    checkOut: checkOut,
    status: 'ACTIVE_KEY',
    valid: true
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayload)}&color=0b1329&bgcolor=ffffff&qzone=2`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 10, 24, 0.88)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #0f1a36 0%, #080d1a 100%)',
          border: '2px solid rgba(212, 175, 55, 0.65)',
          borderRadius: 24,
          maxWidth: 480,
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(212, 175, 55, 0.25)',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Top Metallic Gold Ribbon */}
        <div
          style={{
            background: 'linear-gradient(90deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)',
            height: 6,
            width: '100%',
          }}
        />

        {/* Card Header */}
        <div style={{ padding: '24px 28px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LuxuryLogo size="small" showText={false} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#f0a500', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                PARADISE HOTEL
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 0.8 }}>
                DEBRE MARKOS · 5-STAR PASS
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              borderRadius: '50%',
              width: 34,
              height: 34,
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Key Card Body */}
        <div style={{ padding: '0 28px 24px' }}>
          {/* Room Number & Title */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: 18,
              padding: '16px 20px',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 11, color: '#f0a500', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
              VIP CONTACTLESS ROOM KEY
            </span>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-heading)', margin: '4px 0' }}>
              SUITE #{roomNum}
            </div>
            <div style={{ fontSize: 14, color: '#cbd5e1' }}>
              {roomType} · Floor {floorNum}
            </div>
          </div>

          {/* QR Code Container */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            }}
          >
            <img
              src={qrUrl}
              alt="Room Key QR Code"
              style={{ width: 180, height: 180, display: 'block', borderRadius: 8 }}
              onError={(e) => {
                // Fallback if offline
                e.target.style.display = 'none';
              }}
            />
            <div style={{ fontSize: 11, color: '#1a1a2e', fontWeight: 700, marginTop: 8, letterSpacing: 0.5 }}>
              SCAN AT FRONT DESK OR SUITE SCANNER
            </div>
          </div>

          {/* Guest & Keyless Access Info Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              fontSize: 12,
              marginBottom: 18,
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: 10, textTransform: 'uppercase' }}>Guest Name</span>
              <strong style={{ color: '#ffffff', fontSize: 13 }}>{guest}</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: 10, textTransform: 'uppercase' }}>Keyless PIN Code</span>
              <strong style={{ color: '#f0a500', fontSize: 15, letterSpacing: 1.5 }}>{doorPin}</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: 10, textTransform: 'uppercase' }}>Check-In</span>
              <strong style={{ color: '#ffffff' }}>{checkIn} (12:00 PM)</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: 10, textTransform: 'uppercase' }}>Check-Out</span>
              <strong style={{ color: '#ffffff' }}>{checkOut} (11:00 AM)</strong>
            </div>
          </div>

          {/* Complimentary Fiber WiFi Credentials */}
          <div
            style={{
              background: 'rgba(39, 174, 96, 0.1)',
              border: '1px solid rgba(39, 174, 96, 0.35)',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <div>
              <span style={{ color: '#2ecc71', fontWeight: 800 }}>📶 VIP High-Speed Fiber WiFi</span>
              <div style={{ color: '#cbd5e1', fontSize: 11, marginTop: 2 }}>
                Network: <strong>Paradise_Hotel_VIP_5G</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase' }}>Password</span>
              <div style={{ color: '#ffffff', fontWeight: 700, fontFamily: 'monospace' }}>
                DebreMarkosLuxury!
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #f0a500 0%, #d4920a 100%)',
                color: '#0b1325',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>🖨️ Print / Save Pass</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.06)',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

