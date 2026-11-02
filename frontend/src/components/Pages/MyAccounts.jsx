import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import api from '../../api';
import toast from 'react-hot-toast';

const BANK_THEMES = {
  CBE: {
    name: 'Commercial Bank of Ethiopia',
    bg: 'linear-gradient(135deg, #4a154b 0%, #2b0830 100%)',
    border: 'rgba(212, 175, 55, 0.4)',
    accent: '#f0a500',
    icon: '🏦',
    chip: '💳'
  },
  TELEBIRR: {
    name: 'Telebirr SuperApp Wallet',
    bg: 'linear-gradient(135deg, #008751 0%, #004d2c 100%)',
    border: 'rgba(39, 174, 96, 0.4)',
    accent: '#2ecc71',
    icon: '📱',
    chip: '⚡'
  },
  AWASH: {
    name: 'Awash International Bank',
    bg: 'linear-gradient(135deg, #0b2545 0%, #134074 100%)',
    border: 'rgba(19, 64, 116, 0.5)',
    accent: '#f4d06f',
    icon: '🏛️',
    chip: '💳'
  },
  DASHEN: {
    name: 'Dashen Bank A.S.',
    bg: 'linear-gradient(135deg, #1d2d44 0%, #0d1b2a 100%)',
    border: 'rgba(230, 126, 34, 0.5)',
    accent: '#e67e22',
    icon: '🏢',
    chip: '💳'
  },
  BOA: {
    name: 'Bank of Abyssinia',
    bg: 'linear-gradient(135deg, #3d348b 0%, #1e1b4b 100%)',
    border: 'rgba(240, 165, 0, 0.4)',
    accent: '#f0a500',
    icon: '🦁',
    chip: '💳'
  }
};

const MyAccounts = () => {
  const { user } = useContext(AuthContext);
  const { formatPrice } = useContext(CurrencyContext);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryingId, setQueryingId] = useState(null);

  const [form, setForm] = useState({
    bankName: 'Commercial Bank of Ethiopia',
    bankCode: 'CBE',
    accountNumber: '',
    initialBalance: '5000',
  });

  const regName = `${user?.first_name || user?.firstName || ''} ${user?.last_name || user?.lastName || ''}`.trim();
  const accountUsername = user?.username || '';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    load();
  }, [user, navigate]);

  const load = async () => {
    setLoading(true);
    try {
      const [accRes, payRes] = await Promise.all([
        api.get('/accounts/my').catch((e) => {
          console.error(e);
          return { data: { accounts: [] } };
        }),
        api.get('/payments/my-history').catch((e) => {
          console.error('payment history', e.response?.data || e);
          return { data: { payments: [] } };
        }),
      ]);
      setAccounts(accRes.data.accounts || []);
      setPayments(payRes.data.payments || payRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load accounts');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.accountNumber.trim()) {
      toast.error('Account number is required');
      return;
    }
    if (!regName || !accountUsername) {
      toast.error('Registration name and username are required');
      return;
    }
    try {
      const res = await api.post('/accounts/my', {
        bankName: form.bankName,
        bankCode: form.bankCode,
        accountNumber: form.accountNumber.trim(),
        accountUsername,
        accountHolderName: regName,
        initialBalance: Number(form.initialBalance) || 0,
      });
      toast.success(res.data.message || (res.data.updated ? 'Balance updated successfully!' : 'Account linked successfully!'));
      setForm((f) => ({ ...f, accountNumber: '', initialBalance: '5000' }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to link account');
    }
  };

  const queryBalance = async (acc) => {
    setQueryingId(acc.id);
    try {
      const res = await api.post('/accounts/query-balance', {
        fullName: regName,
        accountUsername: acc.account_username || accountUsername,
      });
      toast.success(`Verified Balance: ETB ${Number(res.data.balance).toLocaleString()}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Query failed');
    } finally {
      setQueryingId(null);
    }
  };

  const totalWalletBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  if (!user) return null;

  return (
    <div className="inside luxury-page-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner */}
      <div className="page-header luxury-header-box" style={{ background: 'linear-gradient(135deg, #0b1329 0%, #162444 100%)', color: '#fff', padding: '28px 24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, width: '100%' }}>
          <div>
            <span className="section-eyebrow" style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '12px', letterSpacing: '1.2px' }}>
              VIP GUEST DIGITAL WALLET &amp; BANKING
            </span>
            <h1 className="page-title" style={{ margin: '6px 0 8px', fontSize: '26px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
              💳 My Accounts &amp; Financial Folios
            </h1>
            <p className="page-subtitle" style={{ margin: 0, color: '#cbd5e1', fontSize: '14px' }}>
              Link your Ethiopian bank accounts (CBE, Telebirr, Awash, Dashen, Abyssinia), manage balances, and review settled payments.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: 12, padding: '10px 18px', textAlign: 'right' }}>
              <span style={{ fontSize: 11, color: '#d4af37', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, display: 'block' }}>
                Total Available Balance
              </span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>
                {formatPrice(totalWalletBalance)}
              </span>
            </div>
            <button type="button" onClick={load} className="btn btn-luxury-gold" disabled={loading} style={{ padding: '10px 18px' }}>
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Cards & History) vs Right Column (Add / Top Up Form) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: Visual Bank Cards & Transactions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Linked Cards Shelf */}
          <div className="luxury-section-panel" style={{ padding: '22px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 className="luxury-panel-title" style={{ margin: 0, fontSize: 18 }}>
                <span>🏛️</span> Active Bank Accounts ({accounts.length})
              </h2>
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                Instant Seamless Checkout Enabled
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading verified bank records...
              </div>
            ) : accounts.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', background: 'var(--bg-main)', borderRadius: 14, border: '1.5px dashed var(--border)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>💳</div>
                <h4 style={{ margin: '0 0 6px', color: 'var(--text-dark)' }}>No Bank Accounts Linked Yet</h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                  Use the form on the right to connect your CBE, Telebirr, Awash, or Dashen account.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {accounts.map((a) => {
                  const themeKey = (a.bank_code || a.bank_name || '').toUpperCase().includes('TELEBIRR')
                    ? 'TELEBIRR'
                    : (a.bank_code || a.bank_name || '').toUpperCase().includes('AWASH')
                      ? 'AWASH'
                      : (a.bank_code || a.bank_name || '').toUpperCase().includes('DASHEN')
                        ? 'DASHEN'
                        : (a.bank_code || a.bank_name || '').toUpperCase().includes('ABYSSINIA')
                          ? 'BOA'
                          : 'CBE';
                  const theme = BANK_THEMES[themeKey] || BANK_THEMES.CBE;

                  return (
                    <div
                      key={a.id}
                      style={{
                        background: theme.bg,
                        border: `1.5px solid ${theme.border}`,
                        borderRadius: 18,
                        padding: '20px',
                        color: '#ffffff',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 180,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Decorative Background Circles */}
                      <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

                      {/* Card Top: Bank & Chip */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 20 }}>{theme.icon}</span>
                          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: 0.5 }}>{a.bank_name}</span>
                        </div>
                        <span style={{ fontSize: 24 }}>{theme.chip}</span>
                      </div>

                      {/* Card Number */}
                      <div style={{ fontSize: 16, letterSpacing: 2, fontFamily: 'monospace', fontWeight: 700, margin: '6px 0 12px', color: '#f1f5f9' }}>
                        {a.account_number.length > 8
                          ? `•••• •••• ${a.account_number.slice(-4)}`
                          : a.account_number}
                      </div>

                      {/* Card Bottom: Holder Name, Balance, Query Button */}
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, display: 'block' }}>
                            Account Holder
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>
                            {a.account_holder_name || regName}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 10, textTransform: 'uppercase', color: theme.accent, letterSpacing: 0.5, display: 'block', fontWeight: 700 }}>
                            Balance
                          </span>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                            ETB {Number(a.balance || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => queryBalance(a)}
                          disabled={queryingId === a.id}
                          style={{
                            background: 'rgba(255,255,255,0.15)',
                            color: '#ffffff',
                            border: '1px solid rgba(255,255,255,0.3)',
                            padding: '4px 12px',
                            borderRadius: 14,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <span>{queryingId === a.id ? 'Verifying...' : '🔄 Verify Balance'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment History Table */}
          <div className="luxury-section-panel" style={{ padding: '22px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 className="luxury-panel-title" style={{ margin: 0, fontSize: 18 }}>
                <span>📜</span> Financial Transaction Folio ({payments.length})
              </h2>
            </div>

            {payments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                No transaction records yet. Settled bookings and food payments will be recorded here.
              </p>
            ) : (
              <div className="table-wrapper">
                <table className="table" style={{ width: '100%', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference #</th>
                      <th>Service Type</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {p.transaction_date ? new Date(p.transaction_date).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: 6, fontSize: 11 }}>
                            {p.reference_number || '—'}
                          </code>
                        </td>
                        <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                          {p.reservation_type || p.payment_type || 'General'}
                          {p.reservation_id ? ` #${p.reservation_id}` : ''}
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {p.payment_method?.includes('Telebirr') ? '📱' : '🏦'} {p.payment_method || 'Online'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--accent)' }}>
                          {formatPrice(p.amount || 0)}
                        </td>
                        <td>
                          <span className={`status-badge status-${p.status === 'completed' || p.status === 'paid' ? 'approved' : 'pending'}`}>
                            {p.status?.toUpperCase() || 'PAID'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Link / Top Up Account Form */}
        <div className="luxury-section-panel" style={{ padding: '24px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(240, 165, 0, 0.2) 0%, rgba(212, 175, 55, 0.06) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18
            }}>
              ➕
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, color: 'var(--text-dark)', fontFamily: 'var(--font-heading)' }}>
                Link Account or Top Up
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                Connect an Ethiopian bank or add balance
              </p>
            </div>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-dark)' }}>
                Registered Guest Name:
              </label>
              <input
                className="clean-input"
                style={{ width: '100%', background: 'var(--bg-main)', boxSizing: 'border-box' }}
                value={regName}
                readOnly
                disabled
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-dark)' }}>
                Select Financial Institution:
              </label>
              <select
                className="clean-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={form.bankName}
                onChange={(e) => {
                  const bankName = e.target.value;
                  const code = bankName.includes('Telebirr')
                    ? 'TELEBIRR'
                    : bankName.includes('Abyssinia')
                      ? 'BOA'
                      : bankName.includes('Awash')
                        ? 'AWASH'
                        : bankName.includes('Dashen')
                          ? 'DASHEN'
                          : 'CBE';
                  setForm({ ...form, bankName, bankCode: code });
                }}
              >
                <option>Commercial Bank of Ethiopia</option>
                <option>Telebirr</option>
                <option>Bank of Abyssinia</option>
                <option>Awash Bank</option>
                <option>Dashen Bank</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-dark)' }}>
                Account / Mobile Phone Number:
              </label>
              <input
                className="clean-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g. 1000123456789 or 0911..."
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-dark)' }}>
                Deposit / Initial Balance (ETB):
              </label>
              <input
                className="clean-input"
                type="number"
                min="0"
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={form.initialBalance}
                onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
              />

              {/* Quick Top-up Pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {[1000, 2500, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, initialBalance: String(amt) }))}
                    style={{
                      background: form.initialBalance === String(amt) ? 'var(--accent)' : 'var(--bg-main)',
                      color: form.initialBalance === String(amt) ? '#ffffff' : 'var(--text-dark)',
                      border: '1px solid var(--border)',
                      borderRadius: 14,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    +{amt.toLocaleString()} ETB
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-luxury-gold"
              style={{ width: '100%', padding: '12px', marginTop: 10, fontSize: 14, fontWeight: 800 }}
            >
              🔒 Link &amp; Update Balance
            </button>
          </form>

          {/* Security Notice */}
          <div style={{ marginTop: 20, padding: 14, borderRadius: 12, background: 'rgba(39, 174, 96, 0.08)', border: '1px solid rgba(39, 174, 96, 0.25)', fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ color: '#27ae60', fontWeight: 800 }}>🛡️ 256-Bit SSL Secured:</span> All accounts are verified directly against simulated Ethiopian banking gateways.
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyAccounts;
