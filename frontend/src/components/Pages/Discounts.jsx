import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CurrencyContext } from '../../context/CurrencyContext';
import { LanguageContext } from '../../context/LanguageContext';
import LuxuryLogo from '../Common/LuxuryLogo';
import api from '../../api';

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useContext(CurrencyContext);
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    api
      .get('/food/discounts/active')
      .then((res) => setDiscounts(res.data.discounts || []))
      .catch(() => setDiscounts([]))
      .finally(() => setLoading(false));
  }, []);

  const actionFor = (d) => {
    const type = (d.discount_type || d.type || '').toLowerCase();
    if (type === 'food') return { to: '/order-food', label: '🍕 Order This Dish Now →' };
    if (type === 'room') return { to: '/rooms', label: '🛏️ Reserve Suite at Discount →' };
    if (type === 'desk') return { to: '/reserve-desk', label: '🍽️ Book Dining Table →' };
    return { to: '/home', label: '✨ Explore Hotel Offers →' };
  };

  return (
    <div className="inside luxury-page-container" style={{ padding: '40px 16px 80px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b1329 0%, #162444 100%)',
          borderRadius: '16px',
          padding: '40px 32px',
          color: '#ffffff',
          marginBottom: '36px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'inline-block', marginBottom: '16px' }}>
          <LuxuryLogo size="medium" />
        </div>
        <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '13px', color: 'var(--accent)', fontWeight: 800, marginBottom: '8px' }}>
          PARADISE 5-STAR EXCLUSIVE PROMOTIONS
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: '32px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
          Special <span style={{ color: 'var(--accent)' }}>Discounts</span> &amp; Privileges
        </h1>
        <p style={{ margin: '0 auto', maxWidth: '650px', color: '#cbd5e1', fontSize: '15px', lineHeight: 1.6 }}>
          Enjoy world-class luxury accommodations, gourmet Ethiopian &amp; international dining, and premium co-working spaces at seasonal promotional rates.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Loading active hotel promotions...</p>
        </div>
      ) : discounts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {discounts.map((d) => {
            const act = actionFor(d);
            const items = d.items || [];
            const pct = Number(d.discount_percentage || d.percentage || 0);

            return (
              <div
                key={d.id}
                className="luxury-card"
                style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '16px',
                  padding: '28px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'var(--transition)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: 10 }}>
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #f0a500 0%, #e67e22 100%)',
                        color: '#0b1329',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontWeight: 800,
                        fontSize: '14px',
                        letterSpacing: '0.5px',
                      }}
                    >
                      🔥 {pct}% OFF
                    </span>
                    <span
                      style={{
                        background: 'rgba(39, 174, 96, 0.15)',
                        color: '#27ae60',
                        border: '1px solid rgba(39, 174, 96, 0.3)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '12px',
                        textTransform: 'uppercase',
                      }}
                    >
                      ✓ Active Now
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 10px', fontSize: '20px', color: 'var(--text-dark)' }}>
                    {pct}% Off {d.discount_type ? d.discount_type.toUpperCase() : 'SPECIAL'}
                  </h3>

                  <div style={{ background: 'var(--bg-main)', padding: '12px 14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Eligible Item / Category:</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {d.target_item_name || d.target_category || d.category || 'All items in this service'}
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    📅 <strong style={{ color: 'var(--text-dark)' }}>Valid Period:</strong>{' '}
                    {d.start_date ? String(d.start_date).slice(0, 10) : ''} {String(d.start_time || '').slice(0, 5)}{' '}
                    → {d.end_date ? String(d.end_date).slice(0, 10) : ''} {String(d.end_time || '').slice(0, 5)}
                  </div>

                  {items.length > 0 && (
                    <div style={{ marginBottom: '18px', maxHeight: '160px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <tbody>
                          {items.map((it) => (
                            <tr key={it.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '6px 4px', fontWeight: 600, color: 'var(--text-dark)' }}>{it.name}</td>
                              <td style={{ padding: '6px 4px', textDecoration: 'line-through', color: 'var(--text-muted)', textAlign: 'right' }}>
                                {formatPrice ? formatPrice(it.normalPrice) : `ETB ${it.normalPrice}`}
                              </td>
                              <td style={{ padding: '6px 4px', color: '#27ae60', fontWeight: 800, textAlign: 'right' }}>
                                {formatPrice ? formatPrice(it.discountedPrice) : `ETB ${it.discountedPrice}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <Link
                  to={act.to}
                  className="btn btn-luxury-gold"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    fontWeight: 800,
                    padding: '12px 18px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    marginTop: '10px',
                  }}
                >
                  {act.label}
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state with luxury hotel hospitality perks */
        <div
          className="luxury-card"
          style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏷️</div>
          <h2 style={{ fontSize: '24px', color: 'var(--text-dark)', margin: '0 0 10px', fontFamily: 'var(--font-heading)' }}>
            No Limited-Time Campaigns Live Right Now
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 28px', fontSize: '15px', lineHeight: 1.6 }}>
            Our seasonal discount events (Holidays, Weekend Getaways &amp; Executive Dining perks) are announced regularly. You can always enjoy our standing VIP complimentary privileges:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              maxWidth: '850px',
              margin: '0 auto 36px',
              textAlign: 'left',
            }}
          >
            <div style={{ background: 'var(--bg-main)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>🍽️</div>
              <strong style={{ display: 'block', color: 'var(--text-dark)', marginBottom: '4px' }}>100% Free Table Reservation</strong>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>When ordering meals or drinks, your desk/table booking is completely complimentary.</span>
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>🛏️</div>
              <strong style={{ display: 'block', color: 'var(--text-dark)', marginBottom: '4px' }}>Flexible 25% Suite Deposit</strong>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Lock your luxury suite with only 25% down payment and settle the rest at check-in.</span>
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>📶</div>
              <strong style={{ display: 'block', color: 'var(--text-dark)', marginBottom: '4px' }}>High-Speed Fiber &amp; Concierge</strong>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>24/7 dedicated support and high-speed enterprise WiFi across all facilities.</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/rooms"
              className="btn btn-luxury-gold"
              style={{ padding: '12px 24px', fontWeight: 700, textDecoration: 'none' }}
            >
              Explore Luxury Rooms
            </Link>
            <Link
              to="/order-food"
              className="btn btn-luxury-outline"
              style={{ padding: '12px 24px', fontWeight: 700, textDecoration: 'none' }}
            >
              Order Gourmet Dining
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
