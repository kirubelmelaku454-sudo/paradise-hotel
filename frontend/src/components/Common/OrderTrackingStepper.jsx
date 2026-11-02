import React from 'react';

/**
 * OrderTrackingStepper Component
 * Renders an animated luxury progress stepper for food orders and room reservations.
 * Visualizes stage progression with animated golden glow lines and responsive layout.
 */
export default function OrderTrackingStepper({ type = 'food', status = '', paymentStatus = '', isDelivery = false }) {
  const normStatus = String(status || '').toLowerCase();
  const normPay = String(paymentStatus || '').toLowerCase();

  // Cancelled / Rejected override
  if (normStatus === 'cancelled' || normStatus === 'rejected') {
    return (
      <div className="order-stepper-cancelled" style={{
        marginTop: 12,
        padding: '8px 14px',
        borderRadius: 8,
        background: 'rgba(231, 76, 60, 0.1)',
        border: '1px solid rgba(231, 76, 60, 0.3)',
        color: '#e74c3c',
        fontSize: 12,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span>✕</span>
        <span>Order was {normStatus === 'cancelled' ? 'cancelled' : 'declined by front desk'}.</span>
      </div>
    );
  }

  // FOOD ORDER STAGES
  if (type === 'food') {
    // 1: Placed, 2: Preparing, 3: Ready, 4: Served
    let currentStep = 1;
    if (normStatus === 'preparing' || normStatus === 'approved') currentStep = 2;
    if (normStatus === 'ready') currentStep = 3;
    if (normStatus === 'served' || normStatus === 'delivered' || normStatus === 'completed') currentStep = 4;

    const steps = [
      { id: 1, label: 'Order Placed', icon: '📝', desc: 'Received at front desk' },
      { id: 2, label: 'Chef Cooking', icon: '👨‍🍳', desc: 'Kitchen is preparing' },
      { id: 3, label: isDelivery ? 'Out for Delivery' : 'Ready for Pickup', icon: '🛎️', desc: 'Fresh & warm' },
      { id: 4, label: 'Served', icon: '✅', desc: 'Enjoy your meal!' },
    ];

    return (
      <div className="luxury-stepper-wrapper" style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed var(--border)' }}>
        <div className="luxury-stepper-bar">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;

            return (
              <React.Fragment key={s.id}>
                {idx > 0 && (
                  <div
                    className={`stepper-connector ${currentStep >= s.id ? 'active' : ''}`}
                    style={{
                      flex: 1,
                      height: 3,
                      background: currentStep >= s.id
                        ? 'linear-gradient(90deg, #d4af37 0%, #f0a500 100%)'
                        : 'var(--border)',
                      transition: 'all 0.4s ease'
                    }}
                  />
                )}

                <div className="stepper-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: 60 }}>
                  <div
                    className={`stepper-node ${isCurrent ? 'pulse' : ''}`}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: isCompleted
                        ? '#27ae60'
                        : isCurrent
                        ? 'linear-gradient(135deg, #f0a500 0%, #d4af37 100%)'
                        : 'var(--bg-main)',
                      border: `2px solid ${isCompleted ? '#27ae60' : isCurrent ? 'var(--accent)' : 'var(--border)'}`,
                      color: isCompleted || isCurrent ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 800,
                      boxShadow: isCurrent ? '0 0 12px rgba(240, 165, 0, 0.45)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isCompleted ? '✓' : s.icon}
                  </div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? 'var(--accent)' : isCompleted ? 'var(--text-dark)' : 'var(--text-muted)',
                    marginTop: 6
                  }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', display: 'none' }}>
                    {s.desc}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // ROOM RESERVATION STAGES
  let currentStep = 1;
  if (normPay === 'paid' || normStatus === 'approved') currentStep = 2;
  if (normStatus === 'checked_in') currentStep = 3;
  if (normStatus === 'checked_out') currentStep = 4;

  const steps = [
    { id: 1, label: 'Submitted', icon: '📋' },
    { id: 2, label: 'Confirmed & Paid', icon: '💳' },
    { id: 3, label: 'Checked In', icon: '🔑' },
    { id: 4, label: 'Stay Completed', icon: '✨' },
  ];

  return (
    <div className="luxury-stepper-wrapper" style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed var(--border)' }}>
      <div className="luxury-stepper-bar">
        {steps.map((s, idx) => {
          const isCompleted = currentStep > s.id;
          const isCurrent = currentStep === s.id;

          return (
            <React.Fragment key={s.id}>
              {idx > 0 && (
                <div
                  className={`stepper-connector ${currentStep >= s.id ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    height: 3,
                    background: currentStep >= s.id
                      ? 'linear-gradient(90deg, #d4af37 0%, #27ae60 100%)'
                      : 'var(--border)',
                    transition: 'all 0.4s ease'
                  }}
                />
              )}

              <div className="stepper-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: 60 }}>
                <div
                  className={`stepper-node ${isCurrent ? 'pulse' : ''}`}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isCompleted
                      ? '#27ae60'
                      : isCurrent
                      ? 'linear-gradient(135deg, #f0a500 0%, #d4af37 100%)'
                      : 'var(--bg-main)',
                    border: `2px solid ${isCompleted ? '#27ae60' : isCurrent ? 'var(--accent)' : 'var(--border)'}`,
                    color: isCompleted || isCurrent ? '#fff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 800,
                    boxShadow: isCurrent ? '0 0 12px rgba(240, 165, 0, 0.45)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isCompleted ? '✓' : s.icon}
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: isCurrent ? 800 : 600,
                  color: isCurrent ? 'var(--accent)' : isCompleted ? 'var(--text-dark)' : 'var(--text-muted)',
                  marginTop: 6
                }}>
                  {s.label}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
