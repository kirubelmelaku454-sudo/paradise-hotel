import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';

export default function InvoiceModal({ isOpen, onClose, paymentId, reference, bookingType, bookingId }) {
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const lookup = reference || paymentId || 'by-booking';
    let url = `/payments/receipt/${encodeURIComponent(lookup)}`;
    if (bookingType && bookingId) {
      url += `?type=${bookingType}&id=${bookingId}`;
    }

    api.get(url)
      .then((res) => {
        if (res.data?.success && res.data?.receipt) {
          setReceipt(res.data.receipt);
        } else {
          toast.error('Could not load receipt data');
        }
      })
      .catch((err) => {
        console.error('Invoice fetch error:', err);
        toast.error(err.response?.data?.message || 'Failed to load official receipt');
      })
      .finally(() => setLoading(false));
  }, [isOpen, paymentId, reference, bookingType, bookingId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-modal-backdrop" onClick={onClose}>
      <div className="invoice-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="invoice-modal-actions no-print">
          <button className="btn-print" onClick={handlePrint}>
            🖨️ Print / Save as PDF
          </button>
          <button className="btn-close-modal" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p>Generating official Paradise Hotel tax invoice...</p>
          </div>
        ) : receipt ? (
          <div className="invoice-paper printable-area" id="printable-receipt">
            {/* Header */}
            <div className="invoice-header">
              <div className="hotel-brand">
                <div className="hotel-logo-badge">🏨</div>
                <div>
                  <h1 className="hotel-name">{receipt.hotel.name}</h1>
                  <p className="hotel-tagline">{receipt.hotel.tagline}</p>
                  <p className="hotel-subtext">{receipt.hotel.address}</p>
                  <p className="hotel-subtext">
                    Tel: {receipt.hotel.phone} | Email: {receipt.hotel.email}
                  </p>
                </div>
              </div>
              <div className="invoice-meta">
                <span className="doc-title">OFFICIAL TAX INVOICE</span>
                <span className="doc-folio">GUEST FOLIO #{receipt.invoiceNumber}</span>
                <div className="tax-badge">
                  <span>TIN: {receipt.hotel.tin}</span>
                  <span>VAT Reg: {receipt.hotel.vatRegistration}</span>
                </div>
                <div className="paid-stamp">PAID & VERIFIED</div>
              </div>
            </div>

            <div className="invoice-divider" />

            {/* Bill To & Date info */}
            <div className="invoice-grid-2">
              <div className="info-block">
                <h4>GUEST / BILLED TO</h4>
                <p className="strong-text">{receipt.customer.name}</p>
                {receipt.customer.phone && <p>Phone: {receipt.customer.phone}</p>}
                {receipt.customer.email && <p>Email: {receipt.customer.email}</p>}
                {receipt.customer.address && <p>Address: {receipt.customer.address}</p>}
              </div>
              <div className="info-block align-right">
                <h4>TRANSACTION SUMMARY</h4>
                <p>
                  Date & Time: <strong>{new Date(receipt.date).toLocaleString()}</strong>
                </p>
                <p>
                  Payment Method: <strong>{String(receipt.paymentMethod).toUpperCase()}</strong>
                </p>
                {receipt.transactionId && (
                  <p>
                    Transaction ID: <strong>{receipt.transactionId}</strong>
                  </p>
                )}
                <p>
                  Booking Category: <strong>{String(receipt.bookingType).toUpperCase()}</strong>
                </p>
              </div>
            </div>

            {/* Specific Booking Details Banner */}
            {receipt.bookingDetails && (
              <div className="booking-summary-banner">
                <div className="banner-title">
                  {receipt.bookingDetails.type || 'Booking Details'}
                </div>
                <div className="banner-grid">
                  {receipt.bookingDetails.roomNumber && (
                    <div>
                      <span>Room Number:</span>
                      <strong>
                        #{receipt.bookingDetails.roomNumber} ({receipt.bookingDetails.roomType})
                      </strong>
                    </div>
                  )}
                  {receipt.bookingDetails.checkIn && (
                    <div>
                      <span>Stay Duration:</span>
                      <strong>
                        {receipt.bookingDetails.checkIn} ➔ {receipt.bookingDetails.checkOut} (
                        {receipt.bookingDetails.nights} Night
                        {receipt.bookingDetails.nights > 1 ? 's' : ''})
                      </strong>
                    </div>
                  )}
                  {receipt.bookingDetails.deskNumber && (
                    <div>
                      <span>Desk Assigned:</span>
                      <strong>
                        Desk #{receipt.bookingDetails.deskNumber} ({receipt.bookingDetails.location})
                      </strong>
                    </div>
                  )}
                  {receipt.bookingDetails.date && (
                    <div>
                      <span>Schedule:</span>
                      <strong>
                        {receipt.bookingDetails.date} ({receipt.bookingDetails.time})
                      </strong>
                    </div>
                  )}
                  {receipt.bookingDetails.orderType && (
                    <div>
                      <span>Order Type:</span>
                      <strong>{String(receipt.bookingDetails.orderType).toUpperCase()}</strong>
                    </div>
                  )}
                  {receipt.bookingDetails.deliveryAddress && (
                    <div>
                      <span>Delivery:</span>
                      <strong>{receipt.bookingDetails.deliveryAddress}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items Table */}
            <table className="invoice-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Description</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Unit Price (ETB)</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Total (ETB)</th>
                </tr>
              </thead>
              <tbody>
                {receipt.lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="item-title">{item.description}</div>
                      {item.duration && <div className="item-sub">{item.duration}</div>}
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>
                      {Number(item.unitPrice || 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {Number(item.total || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Section */}
            <div className="invoice-totals-wrapper">
              <div className="qr-security-box">
                <div className="qr-code-graphic">
                  <svg width="68" height="68" viewBox="0 0 24 24" fill="#1a1a2e">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h2v2h-2v-2zm-4 0h2v2h-2v-2zm2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm-4 0h2v2h-2v-2zm-2-2h2v2h-2v-2zm6-2h2v2h-2v-2z" />
                  </svg>
                </div>
                <div>
                  <div className="security-code-label">DIGITAL VERIFICATION SEAL</div>
                  <div className="security-code-text">{receipt.verificationCode}</div>
                  <div className="security-sub">Authorized Paradise Hotel E-Billing Core</div>
                </div>
              </div>

              <div className="totals-table">
                <div className="total-row">
                  <span>Subtotal (Excl. VAT):</span>
                  <strong>ETB {Number(receipt.subtotal).toFixed(2)}</strong>
                </div>
                <div className="total-row">
                  <span>VAT ({receipt.vatRate}):</span>
                  <strong>ETB {Number(receipt.vatAmount).toFixed(2)}</strong>
                </div>
                <div className="total-row grand-total">
                  <span>Total Paid:</span>
                  <span>ETB {Number(receipt.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="invoice-footer">
              <p>
                Thank you for your patronage with <strong>Paradise Hotel Debre Markos</strong>!
              </p>
              <p className="notice-sm">
                This is a computer-generated tax invoice issued under the Ethiopian Commercial Code.
                No physical signature required.
              </p>
            </div>
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: 40 }}>Receipt could not be found.</p>
        )}
      </div>
    </div>
  );
}
