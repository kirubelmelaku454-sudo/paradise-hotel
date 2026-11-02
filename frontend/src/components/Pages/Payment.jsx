import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import { LanguageContext } from '../../context/LanguageContext';
import LuxuryLogo from '../Common/LuxuryLogo';
import audioNotifier from '../../utils/audioNotification';
import api from '../../api';
import toast from 'react-hot-toast';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { formatPrice, currency } = useContext(CurrencyContext);
  const { t } = useContext(LanguageContext);

  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  // Real-world payment options
  // 'telebirr' | 'cbe_birr' | 'card' | 'pay_at_hotel' | 'bank_transfer'
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [isPartialDeposit, setIsPartialDeposit] = useState(false);

  // Form states for methods
  const [payerPhone, setPayerPhone] = useState(user?.phone || '');
  const [transactionRef, setTransactionRef] = useState('');
  const [cardholderName, setCardholderName] = useState(
    `${user?.first_name || user?.firstName || ''} ${user?.last_name || user?.lastName || ''}`.trim() || user?.username || ''
  );
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Fallback hotel bank accounts (if user chooses hotel transfer)
  const [hotelAccounts, setHotelAccounts] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type');
  const id = queryParams.get('id');

  const regFullName = `${user?.first_name || user?.firstName || ''} ${user?.last_name || user?.lastName || ''}`.trim() || user?.username || '';

  const loadData = async () => {
    setFetching(true);
    try {
      const [hotelRes, bookingRes] = await Promise.all([
        api.get('/accounts/hotel').catch(() => ({ data: { accounts: [] } })),
        api.get(`/payments/booking-details?type=${type}&id=${id}`),
      ]);

      const accounts = hotelRes.data.accounts || [];
      setHotelAccounts(accounts);
      if (accounts.length) setSelectedHotelId(String(accounts[0].id));
      setBookingData(bookingRes.data.booking || null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!type || !id) {
      toast.error('No booking selected for payment. Start from a reservation or food order.');
      navigate('/dashboard/customer', { replace: true });
      return;
    }
    loadData();
  }, [user, type, id, navigate]);

  const totalAmount = bookingData ? Number(bookingData.totalPrice || bookingData.amount || 0) : 0;
  const isRoomBooking = type === 'room';
  const depositAmount = isRoomBooking ? Math.round(totalAmount * 0.25 * 100) / 100 : totalAmount;
  const activePayableAmount = isPartialDeposit && isRoomBooking ? depositAmount : totalAmount;

  // Handle Card input formatting
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }
      if (cardExpiry.length < 5) {
        toast.error('Enter card expiry date (MM/YY)');
        return;
      }
      if (cardCvv.length < 3) {
        toast.error('Enter 3-digit security CVV code');
        return;
      }
    }

    if (paymentMethod === 'chapa') {
      setSubmitting(true);
      try {
        const res = await api.post('/payments/chapa-checkout', {
          bookingType: type,
          bookingId: Number(id),
          amount: activePayableAmount
        });
        if (res.data?.success && res.data.checkoutUrl) {
          toast.success('Redirecting to Chapa Digital Gateway...');
          window.location.href = res.data.checkoutUrl;
          return;
        } else {
          toast.error(res.data?.message || 'Could not initiate Chapa checkout');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error connecting to Chapa payment gateway');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (paymentMethod === 'telebirr' && !payerPhone) {
      toast.error('Please enter your mobile phone number for Telebirr settlement');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type,
        id: Number(id),
        paymentMethod,
        isPartialDeposit: Boolean(isPartialDeposit && isRoomBooking),
        transactionReference: transactionRef.trim() || undefined,
        payerPhone: payerPhone.trim() || undefined,
        payerName: regFullName,
        cardDetails: paymentMethod === 'card' ? {
          cardholder: cardholderName,
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiry: cardExpiry,
          cvv: cardCvv,
        } : undefined,
      };

      const res = await api.post('/payments/process-payment', payload);

      if (res.data && res.data.success) {
        const ref = res.data.reference || `PH-REC-${Date.now().toString(36).toUpperCase()}`;
        const amt = res.data.amount || activePayableAmount;

        localStorage.setItem('paymentReference', ref);
        localStorage.setItem('paymentAmount', String(amt));

        if (res.data.smsPreview) {
          localStorage.setItem('lastSMSPreview', JSON.stringify(res.data.smsPreview));
        }

        audioNotifier.playChime();
        toast.success(res.data.message || 'Payment successfully processed!');
        navigate(`/payment-confirmation?type=${type}&id=${id}&ref=${encodeURIComponent(ref)}`);
      } else {
        toast.error(res.data?.message || 'Payment processing failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error communicating with payment gateway');
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="inside" style={{ textAlign: 'center', padding: '90px 20px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-dark)' }}>Connecting to Secure Payment Gateway…</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Encrypting Paradise Hotel reservation details...</p>
      </div>
    );
  }

  return (
    <div className="inside luxury-page-container" style={{ maxWidth: 840, margin: '24px auto', padding: '0 16px 40px' }}>
      {/* 5-Star Luxury Header */}
      <div className="luxury-header-box text-center" style={{ marginBottom: 24, padding: '28px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <LuxuryLogo size="medium" showText={false} />
        </div>
        <div className="luxury-badge">👑 5-STAR SECURE PAYMENT GATEWAY</div>
        <h1 className="page-title" style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', margin: '6px 0 8px' }}>
          Finalize Your Luxury Reservation
        </h1>
        <p className="page-subtitle" style={{ fontSize: 14, maxWidth: 560, margin: '0 auto' }}>
          Debre Markos · 100% Secure SSL Payment · Instant Reservation Guarantee & Paperless QR Check-in.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Left Column: Booking Folio & Tax Breakdown */}
        <div>
          <div className="luxury-card" style={{ padding: '24px 22px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 800, letterSpacing: 0.8 }}>
                  OFFICIAL GUEST FOLIO
                </span>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-dark)', marginTop: 2 }}>
                  {(type || '').toUpperCase()} #{id}
                </div>
              </div>
              <span className="desk-status-pill" style={{ position: 'static' }}>
                ● SECURED INVENTORY
              </span>
            </div>

            {/* Itemized details */}
            <div style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.6, marginBottom: 16 }}>
              {bookingData?.room_number && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Suite Accommodation:</span>
                  <strong>Room #{bookingData.room_number} ({bookingData.room_type || 'Deluxe'})</strong>
                </div>
              )}
              {bookingData?.desk_number && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Dining Table:</span>
                  <strong>Desk #{bookingData.desk_number} ({bookingData.location})</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Guest Name:</span>
                <strong>{regFullName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Hospitality Service (10%):</span>
                <strong style={{ color: '#27ae60' }}>Complimentary / Waived</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>VAT (15%):</span>
                <span>Included in Folio</span>
              </div>
            </div>

            {/* Advance Deposit Option (Only for room reservations) */}
            {isRoomBooking && (
              <div style={{
                background: isPartialDeposit ? 'rgba(212, 175, 55, 0.14)' : 'rgba(0, 0, 0, 0.03)',
                border: isPartialDeposit ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 16,
                transition: 'all 0.2s ease',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={isPartialDeposit}
                    onChange={(e) => setIsPartialDeposit(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dark)' }}>
                      🔒 Pay 25% Advance Lock Deposit ({formatPrice(depositAmount)})
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      Guarantees your suite now. Settle remaining 75% ({formatPrice(totalAmount - depositAmount)}) upon physical check-in.
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* Total Display */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: 12,
              borderTop: '1px dashed var(--border)'
            }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isPartialDeposit ? 'Deposit Payable Now:' : 'Total Amount Payable:'}
                </div>
                {isPartialDeposit && (
                  <div style={{ fontSize: 11, color: 'var(--accent)' }}>
                    Total Suite Folio: {formatPrice(totalAmount)}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>
                {formatPrice(activePayableAmount, { showBoth: true })}
              </span>
            </div>
          </div>

          {/* Security & Guarantee Trust Card */}
          <div className="luxury-card" style={{ padding: '16px 20px', background: 'rgba(39, 174, 96, 0.07)', border: '1px solid rgba(39, 174, 96, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>🛡️</span>
              <strong style={{ fontSize: 13, color: 'var(--text-dark)' }}>Paradise 5-Star Guarantee</strong>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Free cancellation up to 24 hours prior to check-in. Instant SMS booking confirmation sent to your mobile phone.
            </p>
          </div>
        </div>

        {/* Right Column: Multi-Channel Payment Methods Form */}
        <div>
          <div className="luxury-card" style={{ padding: '24px 22px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, margin: '0 0 16px', color: 'var(--text-dark)' }}>
              Select Payment Method
            </h3>

            {/* Channels Switcher Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('chapa')}
                style={{
                  gridColumn: '1 / -1',
                  padding: '12px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 800,
                  border: paymentMethod === 'chapa' ? '2px solid #00c07f' : '1px solid var(--border)',
                  background: paymentMethod === 'chapa' ? 'rgba(0, 192, 127, 0.12)' : 'var(--bg-main)',
                  color: paymentMethod === 'chapa' ? '#00c07f' : 'var(--text-dark)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: paymentMethod === 'chapa' ? '0 0 12px rgba(0, 192, 127, 0.25)' : 'none'
                }}
              >
                <span>⚡</span> Pay with Chapa (Telebirr, CBEBirr, Cards)
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('telebirr')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: paymentMethod === 'telebirr' ? '2px solid #00a859' : '1px solid var(--border)',
                  background: paymentMethod === 'telebirr' ? 'rgba(0, 168, 89, 0.12)' : 'var(--bg-main)',
                  color: paymentMethod === 'telebirr' ? '#00a859' : 'var(--text-dark)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <span>📱</span> Telebirr (ቴሌብር)
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cbe_birr')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: paymentMethod === 'cbe_birr' ? '2px solid #8c1d40' : '1px solid var(--border)',
                  background: paymentMethod === 'cbe_birr' ? 'rgba(140, 29, 64, 0.12)' : 'var(--bg-main)',
                  color: paymentMethod === 'cbe_birr' ? '#8c1d40' : 'var(--text-dark)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <span>🏦</span> CBE / CBE Birr
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: paymentMethod === 'card' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: paymentMethod === 'card' ? 'rgba(212, 175, 55, 0.12)' : 'var(--bg-main)',
                  color: paymentMethod === 'card' ? 'var(--accent)' : 'var(--text-dark)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <span>💳</span> Visa / Mastercard
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('pay_at_hotel')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: paymentMethod === 'pay_at_hotel' ? '2px solid #27ae60' : '1px solid var(--border)',
                  background: paymentMethod === 'pay_at_hotel' ? 'rgba(39, 174, 96, 0.12)' : 'var(--bg-main)',
                  color: paymentMethod === 'pay_at_hotel' ? '#27ae60' : 'var(--text-dark)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <span>🏨</span> Pay at Reception
              </button>
            </div>

            <form onSubmit={handleProcessPayment}>
              {/* Method 0: Chapa Digital Direct Gateway */}
              {paymentMethod === 'chapa' && (
                <div style={{ background: 'var(--bg-main)', padding: 18, borderRadius: 12, marginBottom: 18, border: '1.5px solid #00c07f' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #00c07f 0%, #00875a 100%)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      fontWeight: 800
                    }}>
                      ⚡
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: 14 }}>Chapa Automated Instant Gateway</div>
                      <div style={{ color: '#00c07f', fontWeight: 700, fontSize: 12 }}>Telebirr · CBEBirr · Awash · Visa/Mastercard</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Zero-wait instant verification with automated webhook</div>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-dark)', lineHeight: 1.5, margin: 0 }}>
                    You will be redirected to Chapa's official 256-bit encrypted checkout to complete your transaction with your preferred mobile wallet or bank card.
                  </p>
                </div>
              )}

              {/* Method 1: Telebirr Channel */}
              {paymentMethod === 'telebirr' && (
                <div style={{ background: 'var(--bg-main)', padding: 16, borderRadius: 12, marginBottom: 18, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: 10,
                      background: '#00a859',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      fontWeight: 800
                    }}>
                      T
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: 14 }}>Paradise Hotel Merchant Account</div>
                      <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 13 }}>0920439009 (Telebirr)</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Scan QR in Telebirr SuperApp or dial *127#</div>
                    </div>
                  </div>

                  <div className="form-group-clean" style={{ marginBottom: 12 }}>
                    <label className="clean-label">Your Mobile Phone (for Telebirr &amp; SMS) *</label>
                    <input
                      type="tel"
                      className="clean-input"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      placeholder="09XXXXXXXX or 07XXXXXXXX"
                      required
                    />
                  </div>

                  <div className="form-group-clean">
                    <label className="clean-label">Transaction Reference (Optional if paying now via app)</label>
                    <input
                      type="text"
                      className="clean-input"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="e.g. 78BF921..."
                    />
                  </div>
                </div>
              )}

              {/* Method 2: CBE Channel */}
              {paymentMethod === 'cbe_birr' && (
                <div style={{ background: 'var(--bg-main)', padding: 16, borderRadius: 12, marginBottom: 18, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: 10,
                      background: '#8c1d40',
                      color: '#ffd700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      fontWeight: 800
                    }}>
                      CBE
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: 14 }}>Commercial Bank of Ethiopia</div>
                      <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 13, fontFamily: 'monospace' }}>1000532238122</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Paradise Hotel Debre Markos Branch</div>
                    </div>
                  </div>

                  <div className="form-group-clean" style={{ marginBottom: 12 }}>
                    <label className="clean-label">Payer Account / Phone Number *</label>
                    <input
                      type="text"
                      className="clean-input"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      placeholder="CBE Account or Phone"
                      required
                    />
                  </div>

                  <div className="form-group-clean">
                    <label className="clean-label">CBE Mobile Banking Reference (Optional)</label>
                    <input
                      type="text"
                      className="clean-input"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="e.g. FT263004..."
                    />
                  </div>
                </div>
              )}

              {/* Method 3: Card Channel */}
              {paymentMethod === 'card' && (
                <div style={{ background: 'var(--bg-main)', padding: 16, borderRadius: 12, marginBottom: 18, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>SECURE CARD PROCESSING</span>
                    <span style={{ fontSize: 16 }}>💳 🔒</span>
                  </div>

                  <div className="form-group-clean" style={{ marginBottom: 10 }}>
                    <label className="clean-label">Cardholder Name *</label>
                    <input
                      type="text"
                      className="clean-input"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-clean" style={{ marginBottom: 10 }}>
                    <label className="clean-label">Card Number *</label>
                    <input
                      type="text"
                      className="clean-input"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4000 1234 5678 9010"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group-clean">
                      <label className="clean-label">Expiry (MM/YY) *</label>
                      <input
                        type="text"
                        className="clean-input"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="12/28"
                        required
                      />
                    </div>
                    <div className="form-group-clean">
                      <label className="clean-label">CVV / CVC *</label>
                      <input
                        type="password"
                        maxLength={4}
                        className="clean-input"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Method 4: Pay at Reception */}
              {paymentMethod === 'pay_at_hotel' && (
                <div style={{ background: 'rgba(39, 174, 96, 0.08)', padding: 16, borderRadius: 12, marginBottom: 18, border: '1.5px solid #27ae60' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 24 }}>🛎️</span>
                    <div>
                      <strong style={{ color: '#27ae60', fontSize: 14 }}>Zero Online Advance Payment Required</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-dark)' }}>Settle in Cash or POS upon check-in at reception</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 12px' }}>
                    Your booking code will be generated immediately. Please present your Fayda National ID and SMS confirmation to the front desk cashier upon arrival.
                  </p>
                  <div className="form-group-clean">
                    <label className="clean-label">Mobile Phone for SMS Reservation Code *</label>
                    <input
                      type="tel"
                      className="clean-input"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      placeholder="09XXXXXXXX or 07XXXXXXXX"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="auth-gold-submit-btn"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  cursor: submitting ? 'wait' : 'pointer'
                }}
              >
                {submitting ? (
                  'Securing Folio & Processing…'
                ) : paymentMethod === 'chapa' ? (
                  `⚡ Proceed to Chapa Instant Checkout (${formatPrice(activePayableAmount)}) ➔`
                ) : paymentMethod === 'pay_at_hotel' ? (
                  '🛎️ Guarantee Booking & Pay at Check-In ➔'
                ) : (
                  `👑 Confirm & Pay ${formatPrice(activePayableAmount)} ➔`
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
