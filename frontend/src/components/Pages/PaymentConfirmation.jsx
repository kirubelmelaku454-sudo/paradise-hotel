import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CurrencyContext } from '../../context/CurrencyContext';
import LuxuryLogo from '../Common/LuxuryLogo';
import InvoiceModal from '../Common/InvoiceModal';

const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formatPrice } = useContext(CurrencyContext);

  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState(0);
  const [bookingType, setBookingType] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [smsData, setSmsData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref') || localStorage.getItem('paymentReference') || '';
    const amt = localStorage.getItem('paymentAmount');
    const type = params.get('type') || '';
    const id = params.get('id') || '';

    setReference(ref);
    setAmount(parseFloat(amt) || 0);
    setBookingType(type);
    setBookingId(id);

    // Retrieve simulated SMS preview
    try {
      const rawSMS = localStorage.getItem('lastSMSPreview');
      if (rawSMS) {
        setSmsData(JSON.parse(rawSMS));
      }
    } catch (_) {}
  }, [location.search]);

  return (
    <div className="inside luxury-page-container" style={{ padding: '30px 16px 60px' }}>
      <div
        className="luxury-card"
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <LuxuryLogo size="medium" showText={false} />
        </div>

        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(39, 174, 96, 0.15)',
          border: '2px solid #27ae60',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          margin: '0 auto 16px'
        }}>
          ✓
        </div>

        <div className="luxury-badge" style={{ marginBottom: 8 }}>👑 5-STAR BOOKING GUARANTEED</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-dark)', fontSize: 26, margin: '6px 0 10px' }}>
          Reservation Successfully Confirmed
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 24px' }}>
          Your Paradise Hotel reservation in Debre Markos has been verified and confirmed. An official receipt has been issued under Ethiopian Commercial standards.
        </p>

        {/* Confirmation Folio Box */}
        <div
          style={{
            background: 'var(--bg-main)',
            border: '1.5px solid var(--accent)',
            padding: '20px 24px',
            borderRadius: 14,
            margin: '0 auto 24px',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>
              OFFICIAL RESERVATION REFERENCE
            </span>
            <span style={{ background: '#27ae60', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
              ● CONFIRMED
            </span>
          </div>

          <div style={{ color: 'var(--text-dark)', fontWeight: 800, fontSize: 18, fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {reference || 'PH-CONFIRMED-2026'}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--border)', fontSize: 14 }}>
            <span style={{ color: 'var(--text-muted)' }}>Amount Processed:</span>
            <strong style={{ color: 'var(--accent)', fontSize: 17 }}>{formatPrice(amount)}</strong>
          </div>

          {bookingType && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>Service Category:</span>
              <span style={{ textTransform: 'capitalize', fontWeight: 700, color: 'var(--text-dark)' }}>
                {bookingType} #{bookingId}
              </span>
            </div>
          )}
        </div>

        {/* Real-World SMS Confirmation Simulation Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(11, 19, 41, 0.05) 0%, rgba(212, 175, 55, 0.08) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 24,
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>📱</span>
            <strong style={{ fontSize: 12, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Mobile SMS Notification Dispatched
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-dark)', fontFamily: 'monospace', lineHeight: 1.5 }}>
            {smsData?.content || `[PARADISE HOTEL] Dear Guest, your ${bookingType || 'hotel'} reservation #${bookingId || ''} is CONFIRMED! Reference: ${reference}. Check-in: 2:00 PM. Front desk: +251587712345.`}
          </p>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
            Delivered to registered guest mobile phone number
          </div>
        </div>

        {/* Primary Action: View & Print Official Tax Invoice */}
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setShowInvoice(true)}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #1b2838 0%, #0b1329 100%)',
              color: 'var(--accent)',
              fontWeight: 800,
              fontSize: 15,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
              transition: 'transform 0.2s ease',
            }}
          >
            <span>📄</span> View &amp; Print Official Tax Invoice
          </button>
        </div>

        {/* Navigation Action Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="auth-gold-submit-btn"
            onClick={() => navigate('/dashboard/customer')}
            style={{
              flex: 1,
              minWidth: 160,
              padding: '12px 18px',
              fontSize: 14,
              margin: 0
            }}
          >
            My Bookings Folio ➔
          </button>
          <button
            className="btn btn-luxury-outline"
            onClick={() => navigate('/home')}
            style={{
              flex: 1,
              minWidth: 140,
              padding: '12px 18px',
              fontSize: 14,
            }}
          >
            Hotel Home
          </button>
        </div>
      </div>

      {/* Official Tax Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        reference={reference}
        bookingType={bookingType}
        bookingId={bookingId}
      />
    </div>
  );
};

export default PaymentConfirmation;
