import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import LuxuryLogo from '../Common/LuxuryLogo';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [localTime, setLocalTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
          timeZone: 'Africa/Addis_Ababa',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        setLocalTime(timeStr);
      } catch (_) {
        setLocalTime(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    const clean = String(email || '').trim().toLowerCase();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return toast.error('Please enter a valid email address');
    }
    toast.success('👑 Welcome to Paradise VIP Connoisseur Club! Exclusive offers will arrive in your inbox.');
    setEmail('');
  };

  return (
    <footer className="luxury-master-footer" style={{
      background: 'linear-gradient(180deg, #121826 0%, #0a0e17 100%)',
      color: '#e2e8f0',
      marginTop: 60,
      borderTop: '2px solid rgba(212, 175, 55, 0.35)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle ambient gold accent light at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #ffd700, #f0a500, transparent)',
        boxShadow: '0 0 24px rgba(240, 165, 0, 0.8)'
      }} />

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '60px 24px 30px' }}>
        {/* Top Tier: VIP Newsletter & Brand Prestige Banner */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: 20,
          padding: '32px 28px',
          marginBottom: 48,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ maxWidth: 540 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212, 175, 55, 0.15)', padding: '4px 12px', borderRadius: 20, color: '#f0a500', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
              <span>★ ★ ★ ★ ★</span> World Luxury Hotel Award 2026
            </div>
            <h3 style={{ margin: 0, fontSize: 22, color: '#ffffff', fontFamily: 'var(--font-heading, "Cinzel", serif)', letterSpacing: '0.5px' }}>
              Join the Paradise Connoisseur Circle
            </h3>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
              Receive bespoke culinary invitations, secret seasonal discounts, and curated weekend escapes in Debre Markos.
            </p>
          </div>

          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: '100%', maxWidth: 440 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your private email address…"
              style={{
                flex: 1,
                minWidth: 220,
                padding: '12px 18px',
                borderRadius: 12,
                background: 'rgba(10, 14, 23, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#ffffff',
                fontSize: 14,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 22px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f0a500 0%, #d4920a 100%)',
                color: '#0a0e17',
                border: 'none',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 16px rgba(240, 165, 0, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Subscribe</span>
              <span>➔</span>
            </button>
          </form>
        </div>

        {/* 4-Column Luxury Navigation Matrix */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 40,
          marginBottom: 48
        }}>
          {/* Column 1: Brand & Philosophy */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <LuxuryLogo size="medium" />
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 18 }}>
              Experience premier Ethiopian hospitality in Debre Markos. Where timeless tradition meets modern 5-star refinement, curated gastronomy, and tranquility.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 16 }}>📍</span>
              <div style={{ fontSize: 11, color: '#cbd5e1' }}>
                <div>Debre Markos Local Time:</div>
                <strong style={{ color: '#f0a500', fontSize: 13 }}>{localTime || 'Loading…'} EAT</strong>
              </div>
            </div>
          </div>

          {/* Column 2: Accommodations & Dining */}
          <div>
            <h4 style={{ fontSize: 15, textTransform: 'uppercase', letterSpacing: '1px', color: '#f0a500', marginBottom: 18, fontWeight: 700 }}>
              Palace & Gastronomy
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <li>
                <Link to="/rooms" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f0a500'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>
                  🛏️ Royal Suites & Deluxe Rooms
                </Link>
              </li>
              <li>
                <Link to="/order-food" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f0a500'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>
                  🍕 Master Chef's Dining Menu
                </Link>
              </li>
              <li>
                <Link to="/reserve-desk" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f0a500'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>
                  🍽️ Executive Desks & Banquets
                </Link>
              </li>
              <li>
                <Link to="/discounts" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f0a500'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>
                  🏷️ Seasonal Offers & Discounts
                </Link>
              </li>
              <li>
                <Link to="/gallery" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f0a500'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>
                  📸 Virtual Tour & Resort Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f0a500'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>
                  🏛️ Our Heritage & Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Guest & Staff Portals */}
          <div>
            <h4 style={{ fontSize: 15, textTransform: 'uppercase', letterSpacing: '1px', color: '#f0a500', marginBottom: 18, fontWeight: 700 }}>
              Staff & Portals
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <li>
                <Link to="/dashboard/receptionist" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f0a500'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>
                  🏨 Front Desk Reception Portal
                </Link>
              </li>
              <li>
                <Link to="/dashboard/housekeeping" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f0a500'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>
                  🧹 Housekeeping Operations Center
                </Link>
              </li>
              <li>
                <Link to="/dashboard/manager" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f0a500'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>
                  📊 General Manager Operations
                </Link>
              </li>
              <li>
                <Link to="/dashboard/admin" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f0a500'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>
                  🛡️ Executive Admin Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/customer" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#f0a500'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>
                  👤 Guest Portal & Live Stepper
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Concierge */}
          <div>
            <h4 style={{ fontSize: 15, textTransform: 'uppercase', letterSpacing: '1px', color: '#f0a500', marginBottom: 18, fontWeight: 700 }}>
              Direct Concierge
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#f0a500', fontSize: 16 }}>📞</span>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600 }}>Front Desk 24/7 Hotline</div>
                  <a href="tel:+251587710000" style={{ color: '#cbd5e1', textDecoration: 'none' }}>+251 58 771 0000</a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#f0a500', fontSize: 16 }}>✉️</span>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600 }}>VIP Inquiries & Events</div>
                  <a href="mailto:concierge@paradisehotel.et" style={{ color: '#cbd5e1', textDecoration: 'none' }}>concierge@paradisehotel.et</a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: '#f0a500', fontSize: 16 }}>📍</span>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600 }}>Location</div>
                  <span>Kebele 04, Debre Markos, Amhara, Ethiopia</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Trust Seal */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: 24,
          paddingBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Secure Payments Accepted:
            </span>
            {['Chapa Gateway', 'Telebirr', 'CBEBirr', 'Visa', 'Mastercard', 'Cash on Arrival'].map((pm, i) => (
              <span key={i} style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 6
              }}>
                💳 {pm}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#27ae60' }}>
            <span>🔒</span>
            <span>256-Bit SSL Encrypted & Verified Booking</span>
          </div>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 12,
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} Paradise Hotel · Debre Markos, Ethiopia. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link to="/about" style={{ color: '#64748b', textDecoration: 'none' }}>About Us</Link>
            <Link to="/contact" style={{ color: '#64748b', textDecoration: 'none' }}>Contact & Map</Link>
            <Link to="/feedback" style={{ color: '#64748b', textDecoration: 'none' }}>Guest Feedback</Link>
            <Link to="/report-problem" style={{ color: '#64748b', textDecoration: 'none' }}>Customer Suggestions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
