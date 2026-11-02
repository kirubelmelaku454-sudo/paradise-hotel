import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';

export default function KitchenDisplayView() {
  const [subView, setSubView] = useState('tickets'); // 'tickets' | 'stock'
  const [tickets, setTickets] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionInProgress, setActionInProgress] = useState(null);

  const fetchKDSTickets = async () => {
    try {
      const res = await api.get('/food/kds/tickets');
      if (res.data?.success) {
        setTickets(res.data.tickets || []);
      }
    } catch (err) {
      console.error('KDS tickets fetch error:', err);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await api.get('/food/menu');
      if (res.data?.success) {
        setMenuItems(res.data.menu || res.data.items || []);
      }
    } catch (err) {
      console.error('Menu items fetch error:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchKDSTickets(), fetchMenuItems()]).finally(() => setLoading(false));

    // Auto-poll tickets every 12 seconds for real-time kitchen operations
    const interval = setInterval(fetchKDSTickets, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderAction = async (orderId, action) => {
    setActionInProgress(orderId);
    try {
      const res = await api.post(`/food/${orderId}/action`, { action });
      if (res.data?.success) {
        toast.success(res.data.message || `Order #${orderId} updated to ${action}`);
        fetchKDSTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update order status');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleToggleStock = async (itemId, currentAvailability) => {
    const nextAvailability = currentAvailability === 'available' ? 'unavailable' : 'available';
    try {
      const res = await api.put(`/food/menu/${itemId}/stock`, { availability: nextAvailability });
      if (res.data?.success) {
        toast.success(res.data.message);
        setMenuItems(prev => prev.map(m => m.id === itemId ? { ...m, availability: nextAvailability } : m));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update stock status');
    }
  };

  const getUrgencyColor = (mins, status) => {
    if (status === 'ready') return '#27ae60';
    if (mins >= 20) return '#e74c3c';
    if (mins >= 10) return '#f39c12';
    return '#3498db';
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="card luxury-card" style={{ padding: '24px', borderRadius: 16 }}>
      {/* KDS Header & Sub-tab navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>👨‍🍳</span> Kitchen Display System (KDS &amp; F&amp;B Operations)
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
            Live chef tickets with urgency timers, cooking lifecycle, and menu stock management.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setSubView('tickets')}
            className={`btn ${subView === 'tickets' ? 'btn-luxury-gold' : 'btn-luxury-outline'}`}
            style={{ fontSize: 13, fontWeight: 700 }}
          >
            📋 Live Kitchen Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setSubView('stock')}
            className={`btn ${subView === 'stock' ? 'btn-luxury-gold' : 'btn-luxury-outline'}`}
            style={{ fontSize: 13, fontWeight: 700 }}
          >
            📦 Menu Stock &amp; Availability
          </button>
          <button
            onClick={() => { fetchKDSTickets(); fetchMenuItems(); }}
            className="btn btn-luxury-outline"
            style={{ fontSize: 13 }}
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      {/* TICKETS VIEW */}
      {subView === 'tickets' && (
        <>
          {/* Status filter bar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {['all', 'pending', 'waiting', 'approved', 'preparing', 'ready'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  background: statusFilter === st ? 'var(--accent, #f0a500)' : 'var(--bg-main)',
                  color: statusFilter === st ? '#1a1a2e' : 'var(--text-dark)',
                  textTransform: 'capitalize'
                }}
              >
                {st === 'all' ? `All Active (${tickets.length})` : `${st} (${tickets.filter(t => t.status === st).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }} />
              <p>Loading live kitchen orders...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🍽️</div>
              <p style={{ margin: 0, fontWeight: 700 }}>Kitchen queue is clear!</p>
              <span style={{ fontSize: 12 }}>No pending dish tickets at the moment.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {filteredTickets.map(ticket => {
                const elapsed = ticket.elapsed_minutes || 0;
                const urgencyColor = getUrgencyColor(elapsed, ticket.status);

                return (
                  <div
                    key={ticket.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: `2px solid ${urgencyColor}`,
                      borderRadius: 14,
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 'var(--shadow-sm)',
                      position: 'relative'
                    }}
                  >
                    {/* Ticket Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 900 }}>
                          Order #{ticket.id}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {ticket.order_type === 'room' ? `🛏️ In-Room #${ticket.room_number || 'N/A'}` :
                           ticket.order_type === 'desk' ? `🍽️ At Desk #${ticket.desk_number || 'N/A'}` :
                           `🛍️ ${String(ticket.order_type).toUpperCase()}`}
                        </div>
                      </div>

                      {/* Elapsed Timer Badge */}
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            background: urgencyColor,
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 800,
                            display: 'inline-block'
                          }}
                        >
                          ⏱️ {elapsed}m ago
                        </span>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: urgencyColor, marginTop: 4 }}>
                          {ticket.status}
                        </div>
                      </div>
                    </div>

                    {/* Customer & Special Instructions */}
                    <div style={{ fontSize: 12, marginBottom: 12 }}>
                      <div><strong>Guest:</strong> {ticket.first_name} {ticket.last_name} {ticket.customer_phone ? `(${ticket.customer_phone})` : ''}</div>
                      {ticket.special_instructions && (
                        <div style={{ background: 'rgba(240, 165, 0, 0.12)', borderLeft: '3px solid var(--accent)', padding: '6px 10px', borderRadius: 4, marginTop: 6, fontStyle: 'italic' }}>
                          <strong>Chef Note:</strong> {ticket.special_instructions}
                        </div>
                      )}
                    </div>

                    {/* Items List */}
                    <div style={{ flex: 1, marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Dishes to Cook:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {ticket.items.map((it, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              background: 'var(--bg-main)',
                              padding: '8px 10px',
                              borderRadius: 8,
                              fontSize: 13
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>
                              {it.quantity} × {it.item_name}
                            </span>
                            {it.preparation_time && (
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                ~{it.preparation_time}m
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Progression Buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                      {ticket.status !== 'preparing' && ticket.status !== 'ready' && (
                        <button
                          disabled={actionInProgress === ticket.id}
                          onClick={() => handleOrderAction(ticket.id, 'preparing')}
                          style={{
                            flex: 1,
                            padding: '10px 8px',
                            background: '#f39c12',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          👨‍🍳 Start Cooking
                        </button>
                      )}

                      {ticket.status !== 'ready' && (
                        <button
                          disabled={actionInProgress === ticket.id}
                          onClick={() => handleOrderAction(ticket.id, 'ready')}
                          style={{
                            flex: 1,
                            padding: '10px 8px',
                            background: '#27ae60',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          🛎️ Food Ready
                        </button>
                      )}

                      {ticket.status === 'ready' && (
                        <button
                          disabled={actionInProgress === ticket.id}
                          onClick={() => handleOrderAction(ticket.id, 'served')}
                          style={{
                            flex: 1,
                            padding: '10px 8px',
                            background: '#2980b9',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          ✅ Mark Served
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* STOCK & MENU AVAILABILITY VIEW */}
      {subView === 'stock' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>Stock &amp; Dish Availability Manager</h3>
            <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
              Quickly toggle dishes in or out of stock. Dishes marked "Sold Out" will be disabled on customer ordering menus immediately.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Dish Name</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Price (ETB)</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Live Availability</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Stock Control Action</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => {
                  const isAvailable = item.availability !== 'unavailable';

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>
                        {item.item_name}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                        {item.category}
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>
                        ETB {Number(item.price || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: isAvailable ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                            color: isAvailable ? '#27ae60' : '#e74c3c'
                          }}
                        >
                          {isAvailable ? '🟢 In Stock (Available)' : '🔴 Sold Out (Unavailable)'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleStock(item.id, item.availability)}
                          className="btn btn-sm"
                          style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            background: isAvailable ? '#e74c3c' : '#27ae60',
                            color: '#fff'
                          }}
                        >
                          {isAvailable ? '🚫 Mark Sold Out' : '✅ Restore to Stock'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

